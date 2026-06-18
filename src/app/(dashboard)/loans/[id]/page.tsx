'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  User,
  DollarSign,
  Clock,
  FileDown,
  Trash2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/formatters';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { PaymentDialog } from '@/components/payments/PaymentDialog';
import { PaymentHistory } from '@/components/payments/PaymentHistory';
import { useState } from 'react';
import { useDeleteLoan } from '@/hooks/useLoans';
import { toast } from 'sonner';
import { LoanStatusBadge } from '@/components/loans/LoanStatusBadge';
import { InstallmentTable } from '@/components/installments/InstallmentTable';

export default function LoanDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const deleteLoan = useDeleteLoan();
  const [selectedInstallment, setSelectedInstallment] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data: loan, isLoading } = useQuery({
    queryKey: ['loans', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*, clients(*), installments(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data.installments) {
        data.installments.sort((a: any, b: any) => a.installment_number - b.installment_number);
      }
      return data;
    },
  });

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este préstamo? Esta acción es irreversible.')) return;
    try {
      await deleteLoan.mutateAsync(id);
      toast.success('Préstamo eliminado exitosamente');
      router.push('/loans');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el préstamo');
    }
  };

  const handleExportPdf = async () => {
    if (!loan) return;
    setIsExporting(true);
    try {
      const { exportLoanPdf } = await import('@/lib/exportPdf');
      await exportLoanPdf(loan);
      toast.success('PDF generado exitosamente');
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  const paidCount = loan.installments?.filter((i: any) => i.status === 'paid').length || 0;
  const totalCount = loan.installments?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="-ml-2">
            <Link href="/loans">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Detalles del Préstamo</h1>
          <LoanStatusBadge status={loan.status} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPdf} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            {isExporting ? 'Generando...' : 'Exportar PDF'}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteLoan.isPending}
          >
            {deleteLoan.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Eliminar
          </Button>
        </div>
      </div>

      {/* Barra de progreso */}
      <Card className="border-primary/20">
        <CardContent className="pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progreso de pago</span>
            <span className="font-bold">{paidCount}/{totalCount} cuotas ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-primary rounded-full h-3 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info del Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <User className="h-4 w-4" />
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-lg font-bold">{loan.clients?.full_name}</div>
            <div className="text-sm text-muted-foreground">ID: {loan.clients?.identification}</div>
            {loan.clients?.phone && (
              <div className="text-sm text-muted-foreground">Tel: {loan.clients.phone}</div>
            )}
            {loan.clients?.email && (
              <div className="text-sm text-muted-foreground">{loan.clients.email}</div>
            )}
          </CardContent>
        </Card>

        {/* Resumen Financiero */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Resumen Financiero
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Capital</div>
              <div className="font-bold">{formatCurrency(loan.amount)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Intereses</div>
              <div className="font-bold text-primary">+{formatCurrency(loan.total_interest)}</div>
            </div>
            <div className="col-span-2 pt-2 border-t">
              <div className="text-xs text-muted-foreground">Total a Pagar</div>
              <div className="text-xl font-bold text-primary">{formatCurrency(loan.total_amount)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles del Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Plan de Pagos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frecuencia:</span>
              <span className="font-medium capitalize">{loan.payment_frequency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tasa:</span>
              <span className="font-medium">{loan.interest_rate}% ({loan.rate_type})</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Plazo:</span>
              <span className="font-medium">{loan.term_months} meses</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cuota:</span>
              <span className="font-bold text-primary">{formatCurrency(loan.installment_amount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Cuotas */}
      <Card>
        <CardHeader>
          <CardTitle>Cronograma de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          <InstallmentTable
            installments={loan.installments || []}
            loanId={id}
            showActions={true}
          />
        </CardContent>
      </Card>

      {/* Historial de pagos (editar / eliminar) */}
      <div>
        <PaymentHistory loanId={id} />
      </div>

      {/* Diálogo de Pago (deprecated - usar página de pagos) */}
      {selectedInstallment && (
        <PaymentDialog
          open={!!selectedInstallment}
          onClose={() => setSelectedInstallment(null)}
          installment={selectedInstallment}
          loanId={id}
        />
      )}
    </div>
  );
}
