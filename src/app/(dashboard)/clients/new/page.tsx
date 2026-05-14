'use client';

import { useCreateClient } from '@/hooks/useClients';
import { ClientForm } from '@/components/clients/ClientForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const createMutation = useCreateClient();

  const onSubmit = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      router.push('/clients');
    } catch (error) {
      console.error(error);
      alert('Error al crear el cliente. Verifica los datos.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" asChild className="-ml-2">
        <Link href="/clients">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver al listado
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Nuevo Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm 
            onSubmit={onSubmit} 
            isLoading={createMutation.isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
