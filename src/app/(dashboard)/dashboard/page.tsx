"use client";

import { useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LoansByStatusChart } from "@/components/dashboard/LoansByStatusChart";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { ProjectedRevenueChart } from "@/components/dashboard/ProjectedRevenueChart";
import { GrowthProjectionCard } from "@/components/dashboard/GrowthProjectionCard";
import { CapitalManagerModal } from "@/components/dashboard/CapitalManagerModal";
import { formatCurrency } from "@/lib/formatters";
import {
  Banknote,
  Wallet,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const [period, setPeriod] = useState("all");
  const { data, isLoading, error } = useDashboard(period);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h1>
          <p className="text-muted-foreground">Cargando métricas avanzadas...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="col-span-4 h-[400px] rounded-xl" />
          <Skeleton className="col-span-3 h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "No se pudieron cargar los datos del dashboard."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { summary, upcomingInstallments, monthlyCashflow, projectedCashflow, capitalSummary } = data;

  const capitalPrestado = Number(summary.total_active_capital);
  const prestamosActivos = Number(summary.active_loans);
  const prestamosMorosos = Number(summary.late_loans);
  
  const totalActivosYMorosos = prestamosActivos + prestamosMorosos;
  const tasaMorosidad =
    totalActivosYMorosos > 0
      ? (prestamosMorosos / totalActivosYMorosos) * 100
      : 0;

  // Calculamos el recaudo histórico (Ganancia) para el KPI
  const recaudoTotal = monthlyCashflow.reduce((acc, curr) => acc + Number(curr.total_received), 0);
  const recaudoCapital = monthlyCashflow.reduce((acc, curr) => acc + Number(curr.capital_received || 0), 0);
  const recaudoInteres = monthlyCashflow.reduce(
    (acc, curr) => acc + Number(curr.interest_received || 0) + Number(curr.late_interest_received || 0),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h1>
          <p className="text-muted-foreground">
            Control de inversiones, capital y proyecciones de rentabilidad.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Histórico Total</SelectItem>
              <SelectItem value="month">Este Mes</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Año</SelectItem>
            </SelectContent>
          </Select>
          <CapitalManagerModal />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          title="Capital Disponible"
          value={formatCurrency(Number(capitalSummary.capital_disponible))}
          icon={<Wallet className="h-4 w-4 text-primary opacity-70" />}
          description="Liquidez para nuevos préstamos"
          className="border-primary/20 bg-card hover:shadow-md transition-all shadow-sm"
        />
        <KpiCard
          title="Capital en la Calle"
          value={formatCurrency(Number(capitalSummary.capital_en_calle))}
          icon={<TrendingUp className="h-4 w-4 text-orange-500 opacity-70" />}
          description="Saldo de capital prestado"
          className="border-orange-500/20 bg-card hover:shadow-md transition-all"
        />
        <KpiCard
          title="Intereses Ganados"
          value={formatCurrency(Number(capitalSummary.total_recuperado_intereses))}
          icon={<Banknote className="h-4 w-4 text-emerald-500 opacity-70" />}
          description="Ganancia real obtenida"
          className="border-emerald-500/20 bg-card hover:shadow-md transition-all"
        />
        <KpiCard
          title="Retorno Esperado"
          value={formatCurrency(Number(capitalSummary.interes_esperado))}
          icon={<Banknote className="h-4 w-4 text-blue-400 opacity-70" />}
          description="Intereses por cobrar"
          className="border-blue-400/20 bg-card hover:shadow-md transition-all"
        />
        <KpiCard
          title="Cartera en Riesgo"
          value={`${tasaMorosidad.toFixed(1)}%`}
          icon={<AlertCircle className={`h-4 w-4 ${tasaMorosidad > 10 ? 'text-red-500' : 'text-muted-foreground opacity-70'}`} />}
          description={`${prestamosMorosos} préstamos en mora`}
          className={`bg-card hover:shadow-md transition-all ${tasaMorosidad > 10 ? "border-red-500/50" : "border-primary/10"}`}
        />
      </div>

      {/* Fila 2: Proyecciones */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4 grid gap-4">
          <ProjectedRevenueChart data={projectedCashflow} />
        </div>
        <div className="col-span-1 lg:col-span-3 grid gap-4">
          <GrowthProjectionCard summary={summary} capitalSummary={capitalSummary} />
        </div>
      </div>

      {/* Fila 3: Flujo histórico y estado de cartera */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-1 lg:col-span-4 grid gap-4">
          <CashFlowChart data={monthlyCashflow} />
        </div>
        <div className="col-span-1 lg:col-span-3 grid gap-4">
          <LoansByStatusChart summary={summary} />
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <RecentActivityTable installments={upcomingInstallments} />
      </div>
    </div>
  );
}