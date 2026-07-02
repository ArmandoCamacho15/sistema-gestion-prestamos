import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get("startDate");
    const endParam = searchParams.get("endDate");

    if (!startParam || !endParam) {
      return NextResponse.json({ error: "Faltan parámetros de fecha" }, { status: 400 });
    }

    // Actualizar estados de mora antes de consultar los KPIs
    await supabase.rpc("update_late_installments", {
      p_user_id: user.id,
    });

    // Ejecutar consultas en paralelo
    const [
      { data: loans, error: loansError },
      { data: payments, error: paymentsError },
      { data: installmentsData, error: installmentsError },
      { data: lateInstallments, error: lateError },
      { data: capitalTransactions, error: capitalError },
    ] = await Promise.all([
      // 1. Préstamos originados en el rango
      supabase
        .from("loans")
        .select("amount, status, rate_type, total_interest")
        .eq("user_id", user.id)
        .gte("start_date", startParam)
        .lte("start_date", endParam),

      // 2. Pagos recibidos en el rango
      supabase
        .from("payments")
        .select("amount, late_interest, payment_date")
        .eq("user_id", user.id)
        .gte("payment_date", startParam)
        .lte("payment_date", endParam)
        .order("payment_date", { ascending: true }),

      // 3. Cuotas pagadas en el rango (para capital vs interés)
      supabase
        .from("installments")
        .select("capital_amount, interest_amount, loans!inner(user_id)")
        .eq("loans.user_id", user.id)
        .eq("status", "paid")
        .gte("paid_date", startParam)
        .lte("paid_date", endParam),

      // 4. Mora actual (foto del momento)
      supabase
        .from("v_late_installments")
        .select("total_amount")
        .eq("user_id", user.id),

      // 5. Movimientos de capital en el rango
      supabase
        .from("capital_transactions")
        .select("amount, type, date, notes")
        .eq("user_id", user.id)
        .gte("date", startParam)
        .lte("date", endParam)
        .order("date", { ascending: true }),
    ]);

    if (loansError) throw loansError;
    if (paymentsError) throw paymentsError;
    if (installmentsError) throw installmentsError;
    if (lateError) throw lateError;
    if (capitalError) throw capitalError;

    // ── Cálculos préstamos ───────────────────────────────────────────────
    const capitalColocado = (loans || []).reduce((acc, loan) => acc + Number(loan.amount), 0);
    const totalInteresProyectado = (loans || []).reduce((acc, loan) => acc + Number(loan.total_interest || 0), 0);

    const loansDistribution = [
      { name: "Activos", value: (loans || []).filter(l => l.status === "activo").length },
      { name: "Pagados", value: (loans || []).filter(l => l.status === "pagado").length },
      { name: "Morosos", value: (loans || []).filter(l => l.status === "moroso").length },
    ].filter(d => d.value > 0);

    // ── Cálculos pagos ───────────────────────────────────────────────────
    const totalRecaudado = (payments || []).reduce((acc, p) => acc + Number(p.amount), 0);
    const totalInteresMoraRecaudado = (payments || []).reduce((acc, p) => acc + Number(p.late_interest || 0), 0);

    const cashFlowMap = new Map<string, number>();
    (payments || []).forEach(payment => {
      const dateStr = payment.payment_date.split('T')[0];
      cashFlowMap.set(dateStr, (cashFlowMap.get(dateStr) || 0) + Number(payment.amount));
    });

    // ── Capital vs interés recuperado ────────────────────────────────────
    const capitalRecuperado = (installmentsData || []).reduce((acc, inst) => acc + Number(inst.capital_amount), 0);
    const interesesRecuperados = (installmentsData || []).reduce((acc, inst) => acc + Number(inst.interest_amount), 0) + totalInteresMoraRecaudado;

    // ── Mora ─────────────────────────────────────────────────────────────
    const indiceMora = (lateInstallments || []).reduce((acc, inst) => acc + Number(inst.total_amount), 0);

    // ── Movimientos de capital ───────────────────────────────────────────
    const txList = capitalTransactions || [];
    const totalInyecciones = txList
      .filter(tx => tx.type === "inyeccion")
      .reduce((acc, tx) => acc + Number(tx.amount), 0);
    const totalRetiros = txList
      .filter(tx => tx.type === "retiro")
      .reduce((acc, tx) => acc + Number(tx.amount), 0);

    // Ganancia neta real = intereses cobrados − retiros registrados en el período
    const gananciaNeta = interesesRecuperados - totalRetiros;

    // Construir mapa de retiros por día para el gráfico de flujo de caja
    const retirosMap = new Map<string, number>();
    txList
      .filter(tx => tx.type === "retiro")
      .forEach(tx => {
        const dateStr = tx.date.split('T')[0];
        retirosMap.set(dateStr, (retirosMap.get(dateStr) || 0) + Number(tx.amount));
      });

    // Combinar recaudo y retiros en un solo array ordenado por fecha
    const allDates = new Set([
      ...Array.from(cashFlowMap.keys()),
      ...Array.from(retirosMap.keys()),
    ]);
    const enrichedCashFlowData = Array.from(allDates)
      .sort()
      .map(date => ({
        date,
        amount: cashFlowMap.get(date) || 0,
        retiro: retirosMap.get(date) || 0,
      }));

    return NextResponse.json({
      summary: {
        capitalColocado,
        capitalRecuperado,
        interesesRecuperados,
        totalRecaudado,
        totalInteresProyectado,
        indiceMora,
        totalInyecciones,
        totalRetiros,
        gananciaNeta,
      },
      loansDistribution,
      cashFlowData: enrichedCashFlowData,
      capitalTransactions: txList,
    });

  } catch (error: any) {
    console.error("Error en API de reportes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
