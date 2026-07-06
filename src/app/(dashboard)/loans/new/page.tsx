'use client';

import { LoanForm } from '@/components/loans/LoanForm';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useCreateLoan } from '@/hooks/useLoans';
import { toast } from 'sonner';

export default function NewLoanPage() {
  const router = useRouter();
  const createLoan = useCreateLoan();

  const onSubmit = async (values: any) => {
    try {
      await createLoan.mutateAsync(values);
      toast.success('Préstamo creado exitosamente');
      router.push('/loans');
    } catch (error) {
      console.error(error);
      toast.error('Error al crear el préstamo. Verifica los datos.');
    }
  };

  const isLoading = createLoan.isPending;


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild className="-ml-2">
          <Link href="/loans">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver a Préstamos
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo Préstamo</h1>
      </div>

      <LoanForm onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
}
