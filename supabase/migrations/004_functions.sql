create or replace function validate_payment_installment()
returns trigger as $$
begin
  if not exists (
    select 1
    from installments
    where id = new.installment_id
      and loan_id = new.loan_id
  ) then
    raise exception 'La cuota (installment_id: %) no pertenece al préstamo (loan_id: %)',
      new.installment_id, new.loan_id;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists check_payment_installment_belongs_to_loan on payments;
create trigger check_payment_installment_belongs_to_loan
  before insert or update on payments
  for each row
  execute function validate_payment_installment();

create or replace function update_late_installments(p_user_id uuid)
returns void as $$
declare
  v_late_days decimal;
begin
  select value
    into v_late_days
  from settings
  where key = 'late_days'
    and user_id = p_user_id;

  if v_late_days is null then
    v_late_days := 15;
  end if;

  update installments i
  set status = 'late'
  from loans l
  where i.loan_id = l.id
    and l.user_id = p_user_id
    and i.status = 'pending'
    and i.due_date < (current_date - v_late_days * interval '1 day');

  update loans l
  set status = 'moroso'
  where l.user_id = p_user_id
    and l.status = 'activo'
    and exists (
      select 1
      from installments i
      where i.loan_id = l.id
        and i.status = 'late'
    );
end;
$$ language plpgsql;