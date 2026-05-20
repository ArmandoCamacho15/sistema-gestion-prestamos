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

    // Ejecutar consultas en paralelo para mayor rapidez
    const [
      { data: summary, error: summaryError },
      { data: upcoming, error: upcomingError },
      { data: late, error: lateError },
      { data: cashflow, error: cashflowError },
      { data: capitalSummary, error: capitalError },
      { data: projectedCashflow, error: projectedError },
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
      supabase.from("v_capital_summary").select("*").eq("user_id", user.id).single(),
      supabase
        .from("v_projected_cashflow")
        .select("*")
        .eq("user_id", user.id)
        .order("month", { ascending: true })
        .limit(6),
    ]);

    if (summaryError && summaryError.code !== "PGRST116") {
      console.error("Error fetching summary:", summaryError);
      throw summaryError;
    }

    return NextResponse.json({
      summary: summary || {
        active_loans: 0,
        late_loans: 0,
        paid_loans: 0,
        total_active_capital: 0,
        total_active_amount: 0,
      },
      capitalSummary: capitalSummary || {
        total_injected: 0,
        total_withdrawn: 0,
        net_capital: 0,
      },
      upcomingInstallments: upcoming || [],
      lateInstallments: late || [],
      monthlyCashflow: cashflow?.reverse() || [],
      projectedCashflow: projectedCashflow || [],
    });
  } catch (error: any) {
    console.error("Error en dashboard API:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
