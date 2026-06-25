'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { Landmark, TrendingUp, HandCoins, AlertTriangle } from 'lucide-react';

interface FinancialSummaryCardsProps {
  summary: {
    capitalColocado: number;
    capitalRecuperado: number;
    interesesRecuperados: number;
    totalRecaudado: number;
    totalInteresProyectado: number;
    indiceMora: number;
  };
}

export function FinancialSummaryCards({ summary }: FinancialSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Prestado</CardTitle>
          <Landmark className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.capitalColocado)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            En el rango seleccionado
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Intereses Recaudados</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">
            {formatCurrency(summary.interesesRecuperados)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Proyectado: {formatCurrency(summary.totalInteresProyectado)}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Capital Recuperado</CardTitle>
          <HandCoins className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.capitalRecuperado)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Total recaudado: {formatCurrency(summary.totalRecaudado)}
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Índice de Mora</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(summary.indiceMora)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Monto total en riesgo
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
