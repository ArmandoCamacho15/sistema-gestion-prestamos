'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';
import Link from 'next/link';
import { useLoans } from '@/hooks/useLoans';
import { LoanList } from '@/components/loans/LoanList';

export default function LoansPage() {
  const { data: loans, isLoading } = useLoans();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Préstamos</h1>
          <p className="text-muted-foreground">
            Gestiona y supervisa todos los préstamos otorgados.
          </p>
        </div>
        <Button asChild>
          <Link href="/loans/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Préstamo
          </Link>
        </Button>
      </div>

      {!isLoading && (!loans || loans.length === 0) ? (
        <Card>
          <CardContent className="pt-12">
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No hay préstamos registrados</h2>
              <p className="text-muted-foreground mb-4">
                Comienza registrando tu primer préstamo en el sistema.
              </p>
              <Button asChild>
                <Link href="/loans/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Préstamo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Todos los Préstamos</CardTitle>
          </CardHeader>
          <CardContent>
            <LoanList loans={loans || []} isLoading={isLoading} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
