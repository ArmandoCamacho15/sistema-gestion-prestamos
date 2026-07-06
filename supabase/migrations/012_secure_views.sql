-- Asegurar que las vistas se ejecuten con los permisos del invocador (usuario autenticado) 
-- y no con los del creador (bypass RLS).
-- Esto resuelve las alertas críticas de seguridad en Supabase "Vista del definidor de seguridad".

ALTER VIEW public.v_loan_summary SET (security_invoker = true);
ALTER VIEW public.v_upcoming_installments SET (security_invoker = true);
ALTER VIEW public.v_late_installments SET (security_invoker = true);
ALTER VIEW public.v_monthly_cashflow SET (security_invoker = true);

-- Las siguientes vistas fueron creadas en migraciones posteriores
ALTER VIEW public.v_projected_cashflow SET (security_invoker = true);
ALTER VIEW public.v_portfolio_summary SET (security_invoker = true);
ALTER VIEW public.v_capital_summary SET (security_invoker = true);
