import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { ClientValues } from '@/lib/validations/clientSchema';

export function useClients() {
  const supabase = createSupabaseBrowserClient();

  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useClient(id: string) {
  const supabase = createSupabaseBrowserClient();

  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const supabase = createSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (values: ClientValues) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([{
          full_name: values.fullName,
          identification: values.identification,
          phone: values.phone || null,
          email: values.email || null,
          address: values.address || null,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient(id: string) {
  const queryClient = useQueryClient();
  const supabase = createSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (values: ClientValues) => {
      const { data, error } = await supabase
        .from('clients')
        .update({
          full_name: values.fullName,
          identification: values.identification,
          phone: values.phone || null,
          email: values.email || null,
          address: values.address || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', id] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const supabase = createSupabaseBrowserClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
