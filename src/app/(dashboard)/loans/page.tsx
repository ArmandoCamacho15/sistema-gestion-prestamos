'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, FileText, Loader2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useLoans } from '@/hooks/useLoans';
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Todos los Préstamos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar por cliente o identificación..." className="pl-10" />
            </div>
          </div>

          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !loans || loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg bg-muted/30">
              <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-semibold">No hay préstamos registrados</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                Aún no has creado ningún préstamo. Comienza por crear uno nuevo para ver el listado y los estados de pago.
              </p>
              <Button variant="outline" asChild className="mt-6">
                <Link href="/loans/new">
                  Crear mi primer préstamo
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead className="hidden md:table-cell">Plazo / Tasa</TableHead>
                    <TableHead className="hidden lg:table-cell">Fecha Inicio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map((loan: any) => (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div className="font-medium">{loan.clients?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{loan.clients?.identification}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-bold">{formatCurrency(loan.amount)}</div>
                        <div className="text-xs text-primary">{formatCurrency(loan.installment_amount)} / cuota</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>{loan.term_months} meses</div>
                        <div className="text-xs text-muted-foreground">{loan.interest_rate}% ({loan.rate_type})</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center text-xs">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(loan.start_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={loan.status === 'activo' ? 'default' : 'secondary'}>
                          {loan.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/loans/${loan.id}`}>Ver detalles</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
