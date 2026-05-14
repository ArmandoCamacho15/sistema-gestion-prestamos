'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Banknote, 
  Users, 
  TrendingUp, 
  Clock, 
  Loader2 
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/formatters';

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const kpis = [
    {
      title: 'Capital Prestado',
      value: formatCurrency(stats?.totalActiveCapital || 0),
      description: 'Capital en préstamos activos',
      icon: Banknote,
    },
    {
      title: 'Clientes Activos',
      value: stats?.totalClients || 0,
      description: 'Clientes registrados',
      icon: Users,
    },
    {
      title: 'Préstamos Activos',
      value: stats?.activeLoans || 0,
      description: 'En curso actualmente',
      icon: TrendingUp,
    },
    {
      title: 'Recaudo Próximos 30 Días',
      value: formatCurrency(stats?.estimatedCollection || 0),
      description: 'Basado en cronogramas',
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al sistema de gestión de préstamos. Aquí tienes un resumen de hoy.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="hover:shadow-md transition-all border-primary/10 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-primary opacity-70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50">
          <CardHeader>
            <CardTitle>Flujo de Caja</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-dashed bg-muted/10">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Gráfico de flujo de caja próximamente...</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-card/50">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-dashed bg-muted/10">
            <div className="text-center text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Sin actividad reciente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}