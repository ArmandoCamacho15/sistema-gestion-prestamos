'use client';

import { useClient } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Calendar, User, DollarSign, Clock, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export default function LoanDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const supabase = createSupabaseBrowserClient();

  // Fetch loan with installments
  const { data: loan, isLoading } = useQuery({
    queryKey: ['loans', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*, clients(*), installments(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Ordenar cuotas por número
      if (data.installments) {
        data.installments.sort((a: any, b: any) => a.installment_number - b.installment_number);
      }
      
      return data;
    },
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="-ml-2">
            <Link href="/loans">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Detalles del Préstamo</h1>
          <Badge variant={loan.status === 'activo' ? 'default' : 'secondary'}>
            {loan.status.toUpperCase()}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Recibo
          </Button>
        </div>
      </div>

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
            <div className="text-sm text-muted-foreground">Tel: {loan.clients?.phone}</div>
            <div className="text-sm text-muted-foreground">{loan.clients?.email}</div>
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
              <span className="text-muted-foreground">Cuota Mensual:</span>
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
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Fecha Vencimiento</TableHead>
                <TableHead className="text-right">Monto Cuota</TableHead>
                <TableHead className="text-right">Capital</TableHead>
                <TableHead className="text-right">Interés</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loan.installments?.map((inst: any) => (
                <TableRow key={inst.id}>
                  <TableCell className="text-center font-medium">{inst.installment_number}</TableCell>
                  <TableCell>{formatDate(inst.due_date)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(inst.total_amount)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(inst.capital_amount)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{formatCurrency(inst.interest_amount)}</TableCell>
                  <TableCell>
                    {inst.status === 'paid' ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Pagada
                      </Badge>
                    ) : inst.status === 'late' ? (
                      <Badge variant="destructive">
                        <AlertCircle className="mr-1 h-3 w-3" /> Atrasada
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {inst.status !== 'paid' && (
                      <Button size="sm" variant="outline">
                        Cobrar
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
