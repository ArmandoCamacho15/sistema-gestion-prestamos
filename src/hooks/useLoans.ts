import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { LoanValues } from '@/lib/validations/loanSchema';

export function useLoans() {
  const supabase = createSupabaseBrowserClient();

  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*, clients(full_name, identification)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: LoanValues) => {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al crear el préstamo');
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
