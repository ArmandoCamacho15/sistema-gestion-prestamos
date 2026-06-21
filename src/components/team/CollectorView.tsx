'use client';

import { useCollectorLoans, useCollectorDailySummary } from '@/hooks/useCollector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Banknote,
  Clock,
  AlertTriangle,
  User,
  Phone,
  CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function CollectorView() {
  const { data: loans, isLoading: loansLoading } = useCollectorLoans();
  const { data: summary, isLoading: summaryLoading } = useCollectorDailySummary();

  if (loansLoading || summaryLoading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Ruta</h1>
          <p className="text-muted-foreground">Cargando préstamos asignados...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[100px] rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[150px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Ruta de Cobro</h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Resumen del día */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="border-emerald-500/20 bg-card shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3">
                <Banknote className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cobrado hoy</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(summary?.collectedToday ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-card shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-3">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cuotas pendientes</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {summary?.pendingInstallments ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-card shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En mora</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {summary?.lateInstallments ?? 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de préstamos asignados */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Préstamos asignados ({loans?.length ?? 0})
        </h2>

        {!loans || loans.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              No tienes préstamos asignados aún. Comunícate con tu supervisor.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {loans.map((loan) => (
              <Card
                key={loan.id}
                className="hover:shadow-md transition-all duration-200 border-muted"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-primary/10 p-2">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {loan.clients?.full_name ?? 'Sin nombre'}
                        </CardTitle>
                        {loan.clients?.phone && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                            <Phone className="h-3 w-3" />
                            <span>{loan.clients.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={
                        loan.status === 'activo'
                          ? 'default'
                          : loan.status === 'moroso'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {loan.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Monto préstamo</p>
                      <p className="font-semibold">{formatCurrency(Number(loan.amount))}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total a pagar</p>
                      <p className="font-semibold">{formatCurrency(Number(loan.total_amount))}</p>
                    </div>
                  </div>
                  <Button asChild size="sm" className="w-full mt-2">
                    <Link href={`/loans/${loan.id}`}>
                      <CalendarCheck className="h-4 w-4 mr-2" />
                      Registrar Pago
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
