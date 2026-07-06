'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { LoanEditForm } from '@/components/loans/LoanEditForm';
import { LoanValues } from '@/lib/validations/loanSchema';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EditLoanPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: loan, isLoading } = useQuery({
    queryKey: ['loans', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*, clients(*), installments(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (values: LoanValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/loans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || 'Error al actualizar el préstamo');
        return;
      }

      toast.success('Préstamo actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      router.push(`/loans/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Error inesperado');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-muted-foreground">Préstamo no encontrado</h2>
        <Button asChild className="mt-4">
          <Link href="/loans">Volver a la lista</Link>
        </Button>
      </div>
    );
  }

  // Mapear los datos del préstamo al formato del formulario
  const defaultValues: LoanValues = {
    clientId: loan.client_id,
    amount: loan.amount,
    interestRate: loan.interest_rate,
    termMonths: loan.term_months,
    rateType: loan.rate_type,
    paymentFrequency: loan.payment_frequency,
    startDate: loan.start_date,
    firstPaymentDate: loan.first_payment_date,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="-ml-2">
          <Link href={`/loans/${id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver al Préstamo
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar Préstamo</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Solo puedes editar préstamos sin cuotas pagadas. El cronograma se regenerará.
          </p>
        </div>
      </div>

      <LoanEditForm
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        defaultValues={defaultValues}
      />
    </div>
  );
}
