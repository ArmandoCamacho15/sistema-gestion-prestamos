import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Installment {
  id: string;
  loan_id: string;
  installment_number: number;
  due_date: string;
  total_amount: number;
  capital_amount: number;
  interest_amount: number;
  status: 'pending' | 'paid' | 'late';
  paid_date?: string;
  created_at: string;
}

export function useInstallments(loanId?: string) {
  const supabase = createSupabaseBrowserClient();
  const queryClient = useQueryClient();

  // Obtener cuotas de un préstamo específico
  const installmentsQuery = useQuery({
    queryKey: ['installments', loanId],
    queryFn: async () => {
      if (!loanId) return [];

      const { data, error } = await supabase
        .from('installments')
        .select('*')
        .eq('loan_id', loanId)
        .order('installment_number', { ascending: true });

      if (error) throw error;
      return data as Installment[];
    },
    enabled: !!loanId,
  });

  // Obtener cuotas pendientes de pago
  const pendingInstallmentsQuery = useQuery({
    queryKey: ['installments', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installments')
        .select('*, loans(client_id)')
        .in('status', ['pending', 'late'])
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as Installment[];
    },
  });

  // Obtener cuotas vencidas
  const lateInstallmentsQuery = useQuery({
    queryKey: ['installments', 'late'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installments')
        .select('*')
        .eq('status', 'late')
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as Installment[];
    },
  });

  // Actualizar estado de cuotas atrasadas
  const updateLateInstallmentsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('update_late_installments');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      toast.success('Estados actualizados');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar estados');
    },
  });

  return {
    installments: installmentsQuery.data || [],
    installmentsLoading: installmentsQuery.isLoading,
    installmentsError: installmentsQuery.error,

    pendingInstallments: pendingInstallmentsQuery.data || [],
    pendingLoading: pendingInstallmentsQuery.isLoading,

    lateInstallments: lateInstallmentsQuery.data || [],
    lateLoading: lateInstallmentsQuery.isLoading,

    updateLateInstallments: updateLateInstallmentsMutation.mutate,
    isUpdatingLate: updateLateInstallmentsMutation.isPending,

    refetch: installmentsQuery.refetch,
  };
}
