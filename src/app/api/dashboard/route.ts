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
    const period = searchParams.get("period") || "all";

    // Actualizar estados de mora antes de consultar los KPIs
    const { error: rpcError } = await supabase.rpc("update_late_installments", {
      p_user_id: user.id,
    });

    if (rpcError) {
      console.error("Error al actualizar mora:", rpcError);
    }

    let cashflowQuery = supabase
      .from("v_monthly_cashflow")
      .select("*")
      .eq("user_id", user.id)
      .order("month", { ascending: false });

    if (period === "month") {
      cashflowQuery = cashflowQuery.limit(1);
    } else if (period === "quarter") {
      cashflowQuery = cashflowQuery.limit(3);
    } else if (period === "year") {
      cashflowQuery = cashflowQuery.limit(12);
    } else {
      cashflowQuery = cashflowQuery.limit(6); // Default 6 months for 'all'
    }

    // Date format for the first day of the current month (local time)
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const firstDayOfMonthStr = `${yyyy}-${mm}-01`;

    // Ejecutar consultas en paralelo para mayor rapidez
    const [
      { data: summary, error: summaryError },
      { data: upcoming, error: upcomingError },
      { data: late, error: lateError },
      { data: cashflow, error: cashflowError },
      { data: capitalSummary, error: capitalError },
      { data: projectedCashflow, error: projectedError },
      { data: settingsData, error: settingsError },
      { data: topClients, error: topClientsError },
      { data: capitalTransactions, error: txError },
    ] = await Promise.all([
      supabase.from("v_loan_summary").select("*").eq("user_id", user.id).single(),
      supabase
        .from("v_upcoming_installments")
        .select("*")
        .eq("user_id", user.id)
        .order("due_date", { ascending: true })
        .limit(10),
      supabase
        .from("v_late_installments")
        .select("*")
        .eq("user_id", user.id)
        .order("days_overdue", { ascending: false }),
      cashflowQuery,
      supabase.from("v_portfolio_summary").select("*").eq("user_id", user.id).single(),
      supabase
        .from("v_projected_cashflow")
        .select("*")
        .eq("user_id", user.id)
        .order("month", { ascending: true })
        .limit(6),
      supabase.from("settings").select("*").eq("user_id", user.id),
      supabase.rpc("get_top_debt_clients", { p_user_id: user.id }),
      supabase
        .from("capital_transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", firstDayOfMonthStr),
    ]);

    // Parse Settings
    const defaultSettings = {
      operating_expenses: 20,
      provision_mora: 10,
      grace_days: 15,
      max_active_loans: 2,
      min_liquidity_percent: 30,
    };
    const settings = { ...defaultSettings };
    settingsData?.forEach((setting) => {
      if (settings.hasOwnProperty(setting.key)) {
        // @ts-ignore
        settings[setting.key] = Number(setting.value);
      }
    });

    if (summaryError && summaryError.code !== "PGRST116") {
      console.error("Error fetching summary:", summaryError);
      throw summaryError;
    }

    // Pad projectedCashflow to always show 6 months
    const paddedProjectedCashflow = [...(projectedCashflow || [])];
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      // Current month + i
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const monthStr = `${yyyy}-${mm}`; // Postgres format for YYYY-MM
      
      // Check if exists
      const exists = paddedProjectedCashflow.find((p) => p.month && p.month.startsWith(monthStr));
      if (!exists) {
        paddedProjectedCashflow.push({
          month: `${monthStr}-01T00:00:00+00:00`,
          projected_capital: 0,
          projected_interest: 0,
          projected_total: 0,
          user_id: user.id,
        });
      }
    }
    // Sort chronologically
    paddedProjectedCashflow.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Procesar transacciones de capital del mes actual
    const txList = capitalTransactions || [];
    const totalInyeccionesMes = txList
      .filter((tx) => tx.type === "inyeccion")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalRetirosMes = txList
      .filter((tx) => tx.type === "retiro")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    return NextResponse.json({
      summary: summary || {
        active_loans: 0,
        late_loans: 0,
        paid_loans: 0,
        total_active_capital: 0,
        total_active_amount: 0,
      },
      capitalSummary: capitalSummary || {
        net_capital: 0,
        total_prestado_historico: 0,
        total_recuperado_capital: 0,
        total_recuperado_intereses: 0,
        capital_en_calle: 0,
        capital_disponible: 0,
        interes_esperado: 0,
      },
      upcomingInstallments: upcoming || [],
      lateInstallments: late || [],
      monthlyCashflow: cashflow?.reverse() || [],
      projectedCashflow: paddedProjectedCashflow,
      topClients: topClients || [],
      settings,
      capitalMovements: {
        totalInyeccionesMes,
        totalRetirosMes,
        movimientosMes: txList,
      },
    });
  } catch (error: any) {
    console.error("Error en dashboard API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
