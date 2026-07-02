'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editPaymentSchema } from '@/lib/validations/paymentSchema';
import { useUpdatePayment, useDeletePayment } from '@/hooks/usePayments';
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
import { Loader2, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentEditDialogProps {
  open: boolean;
  onClose: () => void;
  payment: any;
}

export function PaymentEditDialog({ open, onClose, payment }: PaymentEditDialogProps) {
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();

  const form = useForm<any>({
    resolver: zodResolver(editPaymentSchema),
    defaultValues: {
      amount: payment.amount,
      paid_date: payment.payment_date?.split('T')[0] || payment.payment_date || formatLocalYYYYMMDD(new Date()),
      late_interest: payment.late_interest ?? 0,
      notes: payment.notes || '',
    },
  });

  const onSubmit = async (values: any) => {
    try {
      // Enviar la fecha directamente sin conversión a ISO (evita problemas de zona horaria)
      const normalized = {
        amount: values.amount,
        paid_date: values.paid_date || undefined, // Ya viene en formato YYYY-MM-DD del input type="date"
        late_interest: values.late_interest,
        notes: values.notes,
      };
      await updatePayment.mutateAsync({ id: payment.id, loanId: payment.loan_id, ...normalized });
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Eliminar este pago? Esta acción es irreversible')) return;
    try {
      await deletePayment.mutateAsync(payment.id);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5 text-primary" />
            Editar Pago
          </DialogTitle>
          <DialogDescription>
            Pago registrado: <span className="font-bold">{formatCurrency(payment.amount)}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
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
                  <FormLabel>Fecha de pago</FormLabel>
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
                  <FormLabel>Interés por mora</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
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
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between items-center gap-3 pt-2">
              <Button variant="destructive" onClick={handleDelete} disabled={deletePayment.isPending}>
                {deletePayment.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Eliminar
              </Button>

              <div className="flex items-center gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updatePayment.isPending}>
                  {updatePayment.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Edit2 className="mr-2 h-4 w-4" />
                  )}
                  Guardar
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

