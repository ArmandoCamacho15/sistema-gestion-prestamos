import { useQuery } from '@tanstack/react-query';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function useDashboardStats() {
  const supabase = createSupabaseBrowserClient();

  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // 1. Obtener resumen de préstamos desde la vista
      const { data: summary, error: summaryError } = await supabase
        .from('v_loan_summary')
        .select('*')
        .single();

      if (summaryError && summaryError.code !== 'PGRST116') {
        console.error('Summary error:', summaryError);
      }

      // 2. Obtener conteo de clientes
      const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      // 3. Recaudo próximos 30 días:
      //    Primero obtenemos los IDs de los préstamos del usuario (activos)
      const { data: userLoans } = await supabase
        .from('loans')
        .select('id')
        .eq('status', 'activo');

      let estimatedCollection = 0;

      if (userLoans && userLoans.length > 0) {
        const loanIds = userLoans.map((l: any) => l.id);

        // Calculamos el rango de fechas con UTC consistente
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const future = new Date(now);
        future.setDate(future.getDate() + 31); // +31 para incluir el día 30 completo
        const futureStr = future.toISOString().split('T')[0];

        const { data: installments, error: instError } = await supabase
          .from('installments')
          .select('total_amount, due_date, status')
          .in('loan_id', loanIds)
          .eq('status', 'pending')
          .gte('due_date', todayStr)
          .lte('due_date', futureStr);

        if (instError) {
          console.error('Installments error:', instError);
        }

        estimatedCollection = (installments || [])
          .reduce((sum: number, inst: any) => sum + Number(inst.total_amount), 0);
      }

      return {
        totalActiveCapital: summary?.total_active_capital || 0,
        activeLoans: summary?.active_loans || 0,
        totalClients: clientCount || 0,
        estimatedCollection,
      };
    },
  });
}
