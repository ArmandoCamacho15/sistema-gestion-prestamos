alter table clients enable row level security;
alter table loans enable row level security;
alter table installments enable row level security;
alter table payments enable row level security;
alter table settings enable row level security;

drop policy if exists "Usuarios solo ven sus propios clientes" on clients;
create policy "Usuarios solo ven sus propios clientes"
  on clients for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Usuarios solo ven sus propios préstamos" on loans;
create policy "Usuarios solo ven sus propios préstamos"
  on loans for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Usuarios solo ven cuotas de sus préstamos" on installments;
create policy "Usuarios solo ven cuotas de sus préstamos"
  on installments for all
  using (
    loan_id in (
      select id from loans where user_id = auth.uid()
    )
  );

drop policy if exists "Usuarios solo ven sus propios pagos" on payments;
create policy "Usuarios solo ven sus propios pagos"
  on payments for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Usuarios solo ven su propia configuración" on settings;
create policy "Usuarios solo ven su propia configuración"
  on settings for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());