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

    // 1. Préstamos originados en el rango (Capital Colocado)
    const { data: loans, error: loansError } = await supabase
      .from("loans")
      .select("amount, status, rate_type, total_interest")
      .eq("user_id", user.id)
      .gte("start_date", startParam)
      .lte("start_date", endParam);

    if (loansError) throw loansError;

    const capitalColocado = loans.reduce((acc, loan) => acc + Number(loan.amount), 0);
    const totalInteresProyectado = loans.reduce((acc, loan) => acc + Number(loan.total_interest || 0), 0);
    
    const loansDistribution = [
      { name: "Activos", value: loans.filter(l => l.status === "activo").length },
      { name: "Pagados", value: loans.filter(l => l.status === "pagado").length },
      { name: "Morosos", value: loans.filter(l => l.status === "moroso").length },
    ].filter(d => d.value > 0);

    // 2. Pagos recibidos en el rango (Flujo de Caja y Rendimiento)
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("amount, late_interest, payment_date")
      .eq("user_id", user.id)
      .gte("payment_date", startParam)
      .lte("payment_date", endParam)
      .order("payment_date", { ascending: true });

    if (paymentsError) throw paymentsError;

    const totalRecaudado = payments.reduce((acc, payment) => acc + Number(payment.amount), 0);
    const totalInteresMoraRecaudado = payments.reduce((acc, payment) => acc + Number(payment.late_interest || 0), 0);

    // Agrupar pagos por día o mes para el gráfico de flujo de caja
    const cashFlowMap = new Map<string, number>();
    payments.forEach(payment => {
      // Tomamos solo la parte de fecha, YYYY-MM-DD
      const dateStr = payment.payment_date.split('T')[0]; 
      const current = cashFlowMap.get(dateStr) || 0;
      cashFlowMap.set(dateStr, current + Number(payment.amount));
    });
    
    const cashFlowData = Array.from(cashFlowMap.entries()).map(([date, amount]) => ({
      date,
      amount
    }));

    // 3. Obtener cuotas para discriminar Capital vs Interés recuperado
    // Como las cuotas no tienen user_id directamente, usamos una vista o inner join en frontend
    // Para simplificar, haremos una consulta a installments con filter de paid_date, 
    // pero como installments no tiene user_id, tenemos que usar la tabla préstamos
    const { data: installmentsData, error: installmentsError } = await supabase
      .from("installments")
      .select("capital_amount, interest_amount, loans!inner(user_id)")
      .eq("loans.user_id", user.id)
      .eq("status", "paid")
      .gte("paid_date", startParam)
      .lte("paid_date", endParam);

    if (installmentsError) throw installmentsError;

    const capitalRecuperado = installmentsData.reduce((acc, inst) => acc + Number(inst.capital_amount), 0);
    const interesesRecuperados = installmentsData.reduce((acc, inst) => acc + Number(inst.interest_amount), 0) + totalInteresMoraRecaudado;

    // 4. Mora actual (foto del momento)
    const { data: lateInstallments, error: lateError } = await supabase
      .from("v_late_installments")
      .select("total_amount")
      .eq("user_id", user.id);

    if (lateError) throw lateError;

    const indiceMora = lateInstallments.reduce((acc, inst) => acc + Number(inst.total_amount), 0);

    return NextResponse.json({
      summary: {
        capitalColocado,
        capitalRecuperado,
        interesesRecuperados,
        totalRecaudado,
        totalInteresProyectado,
        indiceMora,
      },
      loansDistribution,
      cashFlowData,
    });

  } catch (error: any) {
    console.error("Error en API de reportes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
