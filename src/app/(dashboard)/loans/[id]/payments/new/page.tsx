'use client';

import { Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PaymentForm } from '@/components/payments/PaymentForm';

function PaymentPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loanId = params.id as string;
  const installmentId = searchParams.get('installment_id');

  const supabase = createSupabaseBrowserClient();

  const { data: installment, isLoading } = useQuery({
    queryKey: ['installments', installmentId],
    queryFn: async () => {
      if (!installmentId) return null;

      const { data, error } = await supabase
        .from('installments')
        .select('*')
        .eq('id', installmentId)
        .eq('loan_id', loanId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!installmentId && !!loanId,
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!installment) {
    return (
      <div className="text-center py-12">
        <Card>
          <CardContent className="pt-8">
            <h2 className="text-2xl font-bold text-muted-foreground mb-4">
              Cuota no encontrada
            </h2>
            <Button asChild>
              <Link href={`/loans/${loanId}`}>Volver al préstamo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="-ml-2">
          <Link href={`/loans/${loanId}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Registrar Pago</h1>
          <p className="text-muted-foreground">
            Cuota #{installment.installment_number} del préstamo
          </p>
        </div>
      </div>

      <PaymentForm installment={installment} loanId={loanId} />
    </div>
  );
}

export default function NewPaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
