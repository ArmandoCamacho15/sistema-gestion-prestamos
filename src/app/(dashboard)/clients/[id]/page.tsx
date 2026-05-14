'use client';

import { useClient } from '@/hooks/useClients';
import { useParams } from 'next/navigation';
import { ChevronLeft, Loader2, User, Phone, Mail, MapPin, CreditCard, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: client, isLoading } = useClient(id);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return <div>Cliente no encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href="/clients">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver al listado
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Datos Personales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Nombre Completo</span>
              <span className="font-semibold text-lg">{client.full_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>{client.identification}</span>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone || 'No registrado'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{client.email || 'No registrado'}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <span>{client.address || 'No registrada'}</span>
              </div>
            </div>
            <Button asChild className="w-full mt-4" variant="outline">
              <Link href={`/clients/${id}/edit`}>Editar Información</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Resumen y Préstamos */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Historial de Préstamos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <CreditCard className="h-12 w-12 mb-4 opacity-20" />
                <p>Aún no hay préstamos registrados para este cliente.</p>
                <Button asChild className="mt-4" variant="secondary">
                  <Link href="/loans/new">Crear primer préstamo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comportamiento de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="px-4 py-1 text-sm font-normal">
                  SIN DATOS SUFICIENTES
                </Badge>
                <p className="text-sm text-muted-foreground">
                  Se requieren pagos registrados para calcular el perfil de riesgo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
