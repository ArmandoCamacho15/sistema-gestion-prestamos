'use client';

import { useClients, useDeleteClient } from '@/hooks/useClients';
import { ClientList } from '@/components/clients/ClientList';
import { Button } from '@/components/ui/button';
import { Plus, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ClientsPage() {
  const { data: clients, isLoading, isError } = useClients();
  const deleteMutation = useDeleteClient();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive">
        Error al cargar los clientes. Por favor intenta de nuevo.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">Gestiona la base de datos de tus prestatarios.</p>
          </div>
        </div>
        <Button asChild>
          <Link href="/clients/new">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientList 
            clients={clients || []} 
            onDelete={(id) => deleteMutation.mutate(id, {
              onSuccess: () => toast.success('Cliente eliminado exitosamente'),
              onError: (error) => toast.error('Error al eliminar cliente. Puede que tenga préstamos activos.')
            })} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
