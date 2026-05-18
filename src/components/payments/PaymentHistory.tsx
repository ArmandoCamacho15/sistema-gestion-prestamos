'use client';

import React from 'react';
import { usePaymentHistory } from '@/hooks/usePayments';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PaymentEditDialog } from '@/components/payments/PaymentEditDialog';
import { useDeletePayment } from '@/hooks/usePayments';
import { Loader2, DollarSign, Receipt } from 'lucide-react';

interface PaymentHistoryProps {
  loanId: string;
}

export function PaymentHistory({ loanId }: PaymentHistoryProps) {
  const { data: payments, isLoading, error } = usePaymentHistory(loanId);
  const deletePayment = useDeletePayment();
  const [editing, setEditing] = React.useState<any | null>(null);

  if (!loanId) {
    return (
      <Card>
        <CardContent className="pt-12">
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">ID de préstamo no disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-[200px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-12">
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="text-destructive">Error al cargar pagos: {(error as any).message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12">
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No hay pagos registrados para este préstamo</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPagado = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalInteresMoratorio = payments.reduce(
    (sum: number, p: any) => sum + (p.late_interest || 0),
    0
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Historial de Pagos
            </CardTitle>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Pagado</div>
              <div className="text-lg font-bold text-primary">{formatCurrency(totalPagado)}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Fecha Pago</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Interés Moratorio</TableHead>
                  <TableHead>Observaciones</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment: any, index: number) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-center font-medium text-sm">{index + 1}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{formatDate(payment.payment_date)}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      {payment.late_interest > 0 ? (
                        <span className="text-red-600 font-semibold">+{formatCurrency(payment.late_interest)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{payment.notes || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(payment)}>
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (!confirm('Eliminar este pago?')) return;
                            try {
                              await deletePayment.mutateAsync(payment.id);
                            } catch (e: any) {
                              // el hook muestra toast
                            }
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalInteresMoratorio > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Total en intereses moratorios cobrados:{' '}
                <span className="font-bold text-red-600">{formatCurrency(totalInteresMoratorio)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {editing && <PaymentEditDialog open={!!editing} onClose={() => setEditing(null)} payment={editing} />}
    </>
  );
}
