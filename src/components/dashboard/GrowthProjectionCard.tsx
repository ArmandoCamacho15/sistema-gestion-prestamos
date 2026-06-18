"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardSummary, PortfolioSummary } from "@/hooks/useDashboard";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, Info } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

interface GrowthProjectionCardProps {
  summary: DashboardSummary;
  capitalSummary: PortfolioSummary;
}

export function GrowthProjectionCard({ summary, capitalSummary }: GrowthProjectionCardProps) {
  const activeCapital = Number(summary.total_active_capital);
  const activeAmount = Number(summary.total_active_amount); // Capital + expected interest
  const netInjected = Number(capitalSummary.net_capital);

  // Rendimiento de la cartera activa
  const expectedProfit = activeAmount - activeCapital;
  
  // Tasa de retorno aproximada de la cartera actual (muy simplificada para el periodo de los préstamos activos)
  const portfolioYield = activeCapital > 0 ? expectedProfit / activeCapital : 0;
  const portfolioYieldPercentage = portfolioYield * 100;

  // Calculadora básica de interés compuesto asumiendo que esa rentabilidad se puede reinvertir cada mes (12 periodos)
  // asumiendo que la tasa calculada fuera mensual promedio.
  // Como no tenemos la duración promedio exacta aquí, usaremos la rentabilidad como una tasa global de "ciclo de préstamo"
  // y proyectaremos a 6 y 12 ciclos (meses/quincenas dependiendo del negocio).
  // Para hacerlo más real asuminos que el portfolioYield es el retorno anual.
  
  const annualYield = portfolioYield; // Asumiremos que el retorno calculado es de 1 año para ser conservadores
  const projected12Months = activeAmount * Math.pow((1 + annualYield), 1);
  const projected24Months = activeAmount * Math.pow((1 + annualYield), 2);

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Proyección de Crecimiento</CardTitle>
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <CardDescription>Basado en rendimiento actual (Interés compuesto)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              Rendimiento Cartera
              <Tooltip content={
                <p className="w-[200px] text-xs">
                  Rentabilidad esperada de los préstamos actualmente activos (Interés Esperado / Capital Prestado).
                </p>
              }>
                <Info className="h-3 w-3" />
              </Tooltip>
            </p>
            <p className="text-2xl font-bold">{portfolioYieldPercentage.toFixed(1)}%</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Capital Invertido</p>
            <p className="text-xl font-semibold">{formatCurrency(netInjected)}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium">Si reinviertes el 100% de las ganancias:</h4>
          
          <div className="bg-card rounded-lg p-3 border shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">En 1 ciclo (Año)</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(projected12Months)}
              </span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full" 
                style={{ width: '60%' }} 
              />
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-3 border shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm">En 2 ciclos (Años)</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {formatCurrency(projected24Months)}
              </span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full" 
                style={{ width: '85%' }} 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
