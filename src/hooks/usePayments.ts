import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type AnyPayment = Record<string, any>;

function normalizeForApi(values: AnyPayment) {
  // Soportar tanto snake_case como camelCase provenientes de distintos formularios
  const installmentId = values.installment_id || values.installmentId || values.installmentId;
  const loanId = values.loan_id || values.loanId || values.loanId;
  const amount = values.amount;
  const paymentDate = values.paid_date || values.paymentDate || values.payment_date || new Date().toISOString();
  const lateInterest = values.late_interest ?? values.lateInterest ?? 0;
  const notes = values.notes ?? null;

  return {
    installmentId,
    loanId,
    amount,
    paymentDate,
    lateInterest,
    notes,
  };
}

export function useRegisterPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: AnyPayment) => {
      const body = normalizeForApi(values);
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al registrar el pago');
      return result.data;
    },
    onSuccess: (_data, variables: AnyPayment) => {
      const loanId = variables.loan_id || variables.loanId || variables.loanId || variables.loanId;
      // Invalidar el detalle del préstamo (cuotas actualizadas)
      if (loanId) queryClient.invalidateQueries({ queryKey: ['loans', loanId] });
      // Invalidar el listado de préstamos (estado puede haber cambiado)
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      // Invalidar el dashboard (KPIs)
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      // Invalidar pagos
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success('Pago registrado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al registrar el pago');
    },
  });
}

export function usePaymentHistory(loanId?: string) {
  return useQuery({
    queryKey: ['payments', loanId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (loanId) {
        params.append('loanId', loanId);
      }

      const response = await fetch(`/api/payments?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener pagos');
      }

      return result.data || [];
    },
    enabled: !!loanId,
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...values }: any) => {
      // Normalizar a camelCase para API
      const body = {
        amount: values.amount,
        paymentDate: values.paid_date,
        lateInterest: values.late_interest,
        notes: values.notes,
        loanId: values.loanId,
      };
      const response = await fetch(`/api/payments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al actualizar el pago');
      return result.data;
    },
    onSuccess: (data, variables: any) => {
      const loanId = variables.loanId || variables.loan_id;
      
      if (loanId) {
        // Refrescar inmediatamente con los datos nuevos si es posible
        // 1. Refrescar la query específica de este préstamo
        queryClient.invalidateQueries({ 
          queryKey: ['payments', loanId],
          refetchType: 'active'
        });
        
        // 2. Refrescar el detalle del préstamo (para actualizar installments)
        queryClient.invalidateQueries({ 
          queryKey: ['loans', loanId],
          refetchType: 'active'
        });
      }
      
      // 3. Refrescar listado general de pagos y dashboard
      queryClient.invalidateQueries({ 
        queryKey: ['payments'],
        refetchType: 'active'
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dashboard-stats'],
        refetchType: 'active'
      });
      
      toast.success('Pago actualizado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al actualizar el pago');
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al eliminar el pago');
      return result.data;
    },
    onSuccess: (_data, paymentId) => {
      // Invalidar todas las queries de pagos con refetch activo
      queryClient.invalidateQueries({ 
        queryKey: ['payments'],
        refetchType: 'active'
      });
      
      // Invalidar listado de préstamos
      queryClient.invalidateQueries({ 
        queryKey: ['loans'],
        refetchType: 'active'
      });
      
      // Invalidar dashboard
      queryClient.invalidateQueries({ 
        queryKey: ['dashboard-stats'],
        refetchType: 'active'
      });
      
      toast.success('Pago eliminado');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error al eliminar el pago');
    },
  });
}
