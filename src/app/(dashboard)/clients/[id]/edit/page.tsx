'use client';

import { useClient, useUpdateClient } from '@/hooks/useClients';
import { ClientForm } from '@/components/clients/ClientForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: client, isLoading: isFetching } = useClient(id);
  const updateMutation = useUpdateClient(id);

  const onSubmit = async (values: any) => {
    try {
      await updateMutation.mutateAsync(values);
      router.push('/clients');
    } catch (error) {
      console.error(error);
      alert('Error al actualizar el cliente.');
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const initialData = {
    fullName: client?.full_name || '',
    identification: client?.identification || '',
    phone: client?.phone || '',
    email: client?.email || '',
    address: client?.address || '',
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
          <CardTitle className="text-2xl">Editar Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientForm 
            initialData={initialData}
            onSubmit={onSubmit} 
            isLoading={updateMutation.isPending} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
