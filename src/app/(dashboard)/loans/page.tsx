'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useLoans } from '@/hooks/useLoans';
import { LoanList } from '@/components/loans/LoanList';
import { useTeamRole } from '@/providers/TeamRoleProvider';
import { CollectorView } from '@/components/team/CollectorView';

// ErrorBoundary para capturar errores de renderizado de React en cliente
class LoansErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('[LoansPage] Error capturado por ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold">Error al cargar préstamos</h2>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Ocurrió un error al cargar el módulo. Intenta recargar la página.
          </p>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function LoansPageContent() {
  const { data: loans, isLoading } = useLoans();
  const { role } = useTeamRole();

  // Los cobradores ven su vista dedicada de ruta
  if (role === 'collector') {
    return <CollectorView />;
  }

  // Secretarias y supervisores no pueden eliminar, el owner puede todo
  const canCreate = role === 'owner' || role === 'secretary';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Préstamos</h1>
          <p className="text-muted-foreground">
            Gestiona y supervisa todos los préstamos otorgados.
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/loans/new">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Préstamo
            </Link>
          </Button>
        )}
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
              {canCreate && (
                <Button asChild>
                  <Link href="/loans/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Préstamo
                  </Link>
                </Button>
              )}
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

export default function LoansPage() {
  return (
    <LoansErrorBoundary>
      <LoansPageContent />
    </LoansErrorBoundary>
  );
}
