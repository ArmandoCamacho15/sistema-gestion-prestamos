'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ReportFilters } from '@/components/reportes/ReportFilters';
import { FinancialSummaryCards } from '@/components/reportes/FinancialSummaryCards';
import { CashFlowChart } from '@/components/reportes/CashFlowChart';
import { LoansDistributionChart } from '@/components/reportes/LoansDistributionChart';
import { ExportButtons } from '@/components/reportes/ExportButtons';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ReportesPage() {
  const [startDate, setStartDate] = useState(() => format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(() => format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reports', startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await fetch(`/api/reports?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Error al cargar los reportes');
      }
      return res.json();
    },
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reportes Financieros</h2>
          <p className="text-muted-foreground mt-1">
            Analiza el rendimiento y flujo de caja de tu cartera
          </p>
        </div>
        {data && (
          <ExportButtons 
            summary={data.summary}
            cashFlowData={data.cashFlowData}
            loansDistribution={data.loansDistribution}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </div>

      <ReportFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Calculando métricas y procesando datos...</p>
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Hubo un problema al cargar los reportes: {(error as Error).message}
          </AlertDescription>
        </Alert>
      ) : data ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <FinancialSummaryCards summary={data.summary} />
          <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
            <CashFlowChart data={data.cashFlowData} />
            <LoansDistributionChart data={data.loansDistribution} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
