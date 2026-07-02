'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema } from '@/lib/validations/paymentSchema';
import { useRegisterPayment } from '@/hooks/usePayments';
import { formatCurrency, formatDate, formatLocalYYYYMMDD } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface PaymentFormProps {
  installment: {
    id: string;
    installment_number: number;
    total_amount: number;
    due_date: string;
    status: 'pending' | 'paid' | 'late';
    paid_date?: string;
  };
  loanId: string;
}

export function PaymentForm({ installment, loanId }: PaymentFormProps) {
  const router = useRouter();
  const registerPayment = useRegisterPayment();

  const today = new Date();
  const dueDate = new Date(installment.due_date);
  const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  const isLate = daysLate > 0;

  const form = useForm({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      installment_id: installment.id,
      loan_id: loanId,
      amount: installment.total_amount,
      paid_date: formatLocalYYYYMMDD(new Date()),
      late_interest: 0,
      notes: '',
    },
  });

  const onSubmit = async (values: any) => {
    try {
      await registerPayment.mutateAsync(values);
      toast.success('Pago registrado exitosamente');
      router.back();
    } catch (error) {
      console.error(error);
      toast.error('Error al registrar el pago. Verifica los datos.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información de la Cuota</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Número de Cuota</p>
            <p className="text-2xl font-bold">#{installment.installment_number}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monto</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(installment.total_amount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
            <p className="text-lg font-semibold">{formatDate(installment.due_date)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Estado</p>
            <p
              className={`text-lg font-semibold ${
                isLate ? 'text-red-500' : 'text-amber-600'
              }`}
            >
              {isLate ? `Atrasada (${daysLate} días)` : 'Pendiente'}
            </p>
          </div>
        </CardContent>
      </Card>

      {isLate && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Esta cuota está <strong>{daysLate} día(s) atrasada</strong>. Considere cobrar interés moratorio.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registrar Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Recibido <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paid_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Pago <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isLate && (
                <FormField
                  control={form.control}
                  name="late_interest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interés por Mora (opcional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: Pago en efectivo, recibo #123..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={registerPayment.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={registerPayment.isPending}>
                  {registerPayment.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  Confirmar Pago
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
