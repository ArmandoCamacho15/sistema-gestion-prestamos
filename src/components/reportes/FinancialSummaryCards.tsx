'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { Landmark, TrendingUp, HandCoins, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

interface FinancialSummaryCardsProps {
  summary: {
    capitalColocado: number;
    capitalRecuperado: number;
    interesesRecuperados: number;
    totalRecaudado: number;
    totalInteresProyectado: number;
    indiceMora: number;
    totalInyecciones: number;
    totalRetiros: number;
    gananciaNeta: number;
  };
}

export function FinancialSummaryCards({ summary }: FinancialSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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

      <Card className="hover:shadow-md transition-shadow border-green-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia Neta Real</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-500">
            {formatCurrency(summary.gananciaNeta)}
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-green-600/80">
            Intereses brutos: {formatCurrency(summary.interesesRecuperados)}
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
          <CardTitle className="text-sm font-medium">Inyecciones Capital</CardTitle>
          <ArrowDownToLine className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(summary.totalInyecciones || 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Capital añadido al negocio
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Retiros (Gastos)</CardTitle>
          <ArrowUpFromLine className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(summary.totalRetiros || 0)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Descontados de la ganancia
          </p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow border-red-500/10">
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
