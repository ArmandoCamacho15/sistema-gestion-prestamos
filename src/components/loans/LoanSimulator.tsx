'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateSchedule, ScheduleInstallment } from '@/lib/calculations/schedule';
import { formatCurrency, formatDate, parseLocalDate, formatLocalYYYYMMDD } from '@/lib/formatters';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface LoanSimulatorProps {
  amount: number;
  interestRate: number;
  termMonths: number;
  rateType: 'flat' | 'simple';
  paymentFrequency: 'mensual' | 'quincenal';
  firstPaymentDate: string;
}

export function LoanSimulator({
  amount,
  interestRate,
  termMonths,
  rateType,
  paymentFrequency,
  firstPaymentDate,
}: LoanSimulatorProps) {
  if (!amount || !interestRate || !termMonths || !firstPaymentDate) {
    return (
      <Card className="h-full border-dashed">
        <CardContent className="flex h-[400px] flex-col items-center justify-center text-center text-muted-foreground">
          <Info className="mb-4 h-12 w-12 opacity-20" />
          <p>Completa los datos del préstamo para ver la simulación de cuotas.</p>
        </CardContent>
      </Card>
    );
  }

  const schedule: ScheduleInstallment[] = generateSchedule({
    capital: amount,
    monthlyRate: interestRate / 100,
    termMonths,
    rateType,
    frequency: paymentFrequency,
    firstPaymentDate: parseLocalDate(firstPaymentDate),
  });

  const totalPaid = schedule.reduce((sum, inst) => sum + inst.totalAmount, 0);
  const totalInterest = totalPaid - amount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Cuota Estimada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(schedule[0]?.totalAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {schedule.length} cuotas {paymentFrequency}es
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Interés Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInterest)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tasa: {interestRate}% mensual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Total a Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Capital + Intereses
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cronograma de Pagos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Capital</TableHead>
                  <TableHead className="text-right">Interés</TableHead>
                  <TableHead className="text-right font-bold text-primary">Total</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedule.map((inst) => (
                  <TableRow key={inst.installmentNumber}>
                    <TableCell className="text-center font-medium">{inst.installmentNumber}</TableCell>
                    <TableCell>{formatDate(formatLocalYYYYMMDD(inst.dueDate))}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inst.capitalAmount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(inst.interestAmount)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{formatCurrency(inst.totalAmount)}</TableCell>
                    <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                      {formatCurrency(inst.balanceAfter)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
