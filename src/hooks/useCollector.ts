import { useQuery } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Obtiene los préstamos asignados al cobrador autenticado.
 * Se filtra a través de la tabla loan_assignments.
 */
export function useCollectorLoans() {
  const supabase = createSupabaseBrowserClient();

  return useQuery({
    queryKey: ['collector-loans'],
    queryFn: async () => {
      // 1. Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      // 2. Obtener loan_ids asignados a este cobrador
      const { data: assignments, error: assignmentError } = await supabase
        .from('loan_assignments')
        .select('loan_id')
        .eq('collector_id', user.id);

      if (assignmentError) throw assignmentError;

      if (!assignments || assignments.length === 0) return [];

      const loanIds = assignments.map((a) => a.loan_id);

      // 3. Obtener los préstamos con esos IDs
      const { data, error } = await supabase
        .from('loans')
        .select('*, clients(full_name, identification, phone)')
        .in('id', loanIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

/**
 * Obtiene el resumen del día para el cobrador:
 * cuántas cuotas tiene pendientes y cuánto ya cobró hoy.
 */
export function useCollectorDailySummary() {
  const supabase = createSupabaseBrowserClient();

  return useQuery({
    queryKey: ['collector-daily-summary'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const today = new Date().toISOString().split('T')[0];

      // Cuotas pendientes en los préstamos asignados
      const { data: assignments } = await supabase
        .from('loan_assignments')
        .select('loan_id')
        .eq('collector_id', user.id);

      if (!assignments || assignments.length === 0) {
        return { pendingInstallments: 0, collectedToday: 0, lateInstallments: 0 };
      }

      const loanIds = assignments.map((a) => a.loan_id);

      const { data: pending } = await supabase
        .from('installments')
        .select('id, due_date, total_amount, status')
        .in('loan_id', loanIds)
        .eq('status', 'pending');

      const { data: late } = await supabase
        .from('installments')
        .select('id')
        .in('loan_id', loanIds)
        .eq('status', 'late');

      // Pagos registrados hoy por este cobrador
      const { data: todayPayments } = await supabase
        .from('payments')
        .select('amount')
        .in('loan_id', loanIds)
        .eq('payment_date', today);

      const collectedToday = (todayPayments || []).reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      return {
        pendingInstallments: pending?.length ?? 0,
        lateInstallments: late?.length ?? 0,
        collectedToday,
      };
    },
  });
}
