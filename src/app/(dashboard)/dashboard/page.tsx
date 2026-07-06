"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import { useTeamRole } from "@/providers/TeamRoleProvider";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { LoansByStatusChart } from "@/components/dashboard/LoansByStatusChart";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { RecentActivityTable } from "@/components/dashboard/RecentActivityTable";
import { ProjectedRevenueChart } from "@/components/dashboard/ProjectedRevenueChart";
import { GrowthProjectionCard } from "@/components/dashboard/GrowthProjectionCard";
import { CapitalManagerModal } from "@/components/dashboard/CapitalManagerModal";
import { CapitalMovementsCard } from "@/components/dashboard/CapitalMovementsCard";
import { LiquidityAlert } from "@/components/dashboard/LiquidityAlert";
import { TopClientsTable } from "@/components/dashboard/TopClientsTable";
import { LateLoansTable } from "@/components/dashboard/LateLoansTable";
import { NetProfitCard } from "@/components/dashboard/NetProfitCard";
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
  const { role } = useTeamRole();
  const router = useRouter();

  // Los cobradores y secretarias no tienen acceso al dashboard financiero
  useEffect(() => {
    if (role === 'collector' || role === 'secretary') {
      router.replace('/loans');
    }
  }, [role, router]);

  if (role === 'collector' || role === 'secretary') {
    return null; // Esperar la redirección
  }

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

  const { summary, upcomingInstallments, lateInstallments, monthlyCashflow, projectedCashflow, capitalSummary, settings, topClients } = data;

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

  // Calcular ganancias netas del mes actual (o último mes con datos)
  const interesesDelMesActual = 
    monthlyCashflow.length > 0 
      ? Number(monthlyCashflow[monthlyCashflow.length - 1]?.interest_received || 0) + Number(monthlyCashflow[monthlyCashflow.length - 1]?.late_interest_received || 0)
      : 0;
      
  const { totalInyeccionesMes, totalRetirosMes } = data.capitalMovements || { totalInyeccionesMes: 0, totalRetirosMes: 0 };
  const gananciasNetasMes = interesesDelMesActual - totalRetirosMes;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <LiquidityAlert 
        capitalDisponible={Number(capitalSummary.capital_disponible)} 
        capitalInvertido={Number(capitalSummary.capital_en_calle)}
        minLiquidityPercent={settings?.min_liquidity_percent ?? 30}
      />

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

      {/* Fila KPI A: Estado General del Capital */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Estado General del Capital</p>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Capital Disponible"
            value={formatCurrency(Number(capitalSummary.capital_disponible))}
            description="Liquidez para nuevos préstamos"
            className="border-primary/20 bg-card hover:shadow-md transition-all shadow-sm"
            infoNode={
              <div className="space-y-2">
                <h4 className="font-medium text-primary">¿De dónde sale?</h4>
                <p className="text-muted-foreground">
                  Es la suma de todas tus <b>Inyecciones de Capital</b>, restando los <b>Retiros</b> y restando el <b>Capital prestado que aún no vuelve</b>.
                </p>
                <p className="text-xs mt-2 bg-muted p-2 rounded">
                  <b>Fórmula:</b> (Inyecciones - Retiros) - Capital en la calle + Capital ya cobrado en cuotas.
                </p>
              </div>
            }
          />
          <KpiCard
            title="Capital en la Calle"
            value={formatCurrency(Number(capitalSummary.capital_en_calle))}
            description="Saldo de capital prestado"
            className="border-orange-500/20 bg-card hover:shadow-md transition-all"
            infoNode={
              <div className="space-y-2">
                <h4 className="font-medium text-orange-500">¿Qué significa?</h4>
                <p className="text-muted-foreground">
                  Es el <b>capital neto (sin intereses)</b> que tus clientes tienen en este momento. Este dinero volverá a ti poco a poco con el pago de cada cuota.
                </p>
              </div>
            }
          />
          <KpiCard
            title="Intereses Ganados"
            value={formatCurrency(Number(capitalSummary.total_recuperado_intereses))}
            description="Ganancia total histórica"
            className="border-emerald-500/20 bg-card hover:shadow-md transition-all"
            infoNode={
              <div className="space-y-2">
                <h4 className="font-medium text-emerald-500">¿Qué incluye?</h4>
                <p className="text-muted-foreground">
                  Es la suma total de la parte de <b>interés</b> y los <b>intereses por mora</b> de todas las cuotas que ya han sido <b>pagadas</b>.
                </p>
                <p className="text-xs mt-2 bg-muted p-2 rounded">
                  Este valor es bruto histórico, no descuenta gastos operativos.
                </p>
              </div>
            }
          />
          <KpiCard
            title="Retorno Esperado"
            value={formatCurrency(Number(capitalSummary.interes_esperado))}
            description="Intereses por cobrar"
            className="border-blue-400/20 bg-card hover:shadow-md transition-all"
            infoNode={
              <div className="space-y-2">
                <h4 className="font-medium text-blue-400">Proyección</h4>
                <p className="text-muted-foreground">
                  Son todos los <b>intereses que aún faltan por cobrar</b> de los préstamos activos y morosos. Es la ganancia futura asegurada si todos pagan.
                </p>
              </div>
            }
          />
        </div>
      </div>

      {/* Fila KPI B: Rendimiento del Mes y Riesgo */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Rendimiento del Mes y Riesgo</p>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <NetProfitCard
            interesesBrutos={interesesDelMesActual}
            retirosReales={totalRetirosMes}
            gananciaNetaReal={gananciasNetasMes}
          />
          <CapitalMovementsCard
            inyeccionesMes={totalInyeccionesMes}
            retirosMes={totalRetirosMes}
          />
          <KpiCard
            title="Cartera en Riesgo"
            value={`${tasaMorosidad.toFixed(1)}%`}
            description={`${prestamosMorosos} préstamos en mora`}
            className={`bg-card hover:shadow-md transition-all ${tasaMorosidad > 10 ? "border-red-500/50" : "border-primary/10"}`}
            infoNode={
              <div className="space-y-2">
                <h4 className="font-medium text-red-500">Nivel de Riesgo</h4>
                <p className="text-muted-foreground">
                  Porcentaje de tus préstamos que están clasificados como morosos (superaron los días de gracia permitidos).
                </p>
                <p className="text-xs mt-2 bg-muted p-2 rounded">
                  <b>Fórmula:</b> Préstamos morosos / Total de préstamos activos y morosos.
                </p>
              </div>
            }
          />
        </div>
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
        <TopClientsTable clients={topClients} />
        <LateLoansTable installments={lateInstallments} />
      </div>

      <div className="grid gap-4 grid-cols-1">
        <RecentActivityTable installments={upcomingInstallments} />
      </div>
    </div>
  );
}