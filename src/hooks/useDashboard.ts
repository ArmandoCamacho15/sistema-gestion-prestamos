import { useQuery } from "@tanstack/react-query";

export interface DashboardSummary {
  active_loans: number;
  late_loans: number;
  paid_loans: number;
  total_active_capital: number;
  total_active_amount: number;
}

export interface UpcomingInstallment {
  id: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  capital_amount: number;
  interest_amount: number;
  total_amount: number;
  balance_after: number;
  status: string;
  user_id: string;
  client_name: string;
  loan_amount: number;
}

export interface LateInstallment extends UpcomingInstallment {
  days_overdue: number;
}

export interface MonthlyCashflow {
  user_id: string;
  month: string;
  total_received: number;
  payment_count: number;
}

export interface ProjectedCashflow {
  month: string;
  projected_capital: number;
  projected_interest: number;
  projected_total: number;
}

export interface CapitalSummary {
  total_injected: number;
  total_withdrawn: number;
  net_capital: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  upcomingInstallments: UpcomingInstallment[];
  lateInstallments: LateInstallment[];
  monthlyCashflow: MonthlyCashflow[];
  projectedCashflow: ProjectedCashflow[];
  capitalSummary: CapitalSummary;
}

async function fetchDashboardData(period: string): Promise<DashboardData> {
  const res = await fetch(`/api/dashboard?period=${period}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Error al cargar los datos del dashboard");
  }
  return res.json();
}

export function useDashboard(period: string = "all") {
  return useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => fetchDashboardData(period),
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
  });
}
