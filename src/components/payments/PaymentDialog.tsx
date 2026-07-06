'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema } from '@/lib/validations/paymentSchema';
import { useRegisterPayment } from '@/hooks/usePayments';
import { formatCurrency, formatLocalYYYYMMDD } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Loader2, CheckCircle2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  installment: {
    id: string;
    installment_number: number;
    total_amount: number;
    due_date: string;
    status: string;
  };
  loanId: string;
}

export function PaymentDialog({ open, onClose, installment, loanId }: PaymentDialogProps) {
  const registerPayment = useRegisterPayment();

  const form = useForm<any>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      installment_id: installment.id,
      loan_id: loanId,
      amount: installment.total_amount,
      paid_date: formatLocalYYYYMMDD(new Date()),
      notes: '',
      late_interest: 0,
    },
  });

  const onSubmit = async (values: any) => {
    try {
      await registerPayment.mutateAsync(values);
      toast.success(`Cuota #${installment.installment_number} registrada exitosamente`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar el pago');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Registrar Pago — Cuota #{installment.installment_number}
          </DialogTitle>
          <DialogDescription>
            Monto esperado: <span className="font-bold text-primary">{formatCurrency(installment.total_amount)}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Recibido</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
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
                  <FormLabel>Fecha de Pago</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="late_interest"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interés por Mora (opcional)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
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
      </DialogContent>
    </Dialog>
  );
}
