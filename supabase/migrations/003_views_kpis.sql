create or replace view v_loan_summary as
select
  user_id,
  count(*) filter (where status = 'activo') as active_loans,
  count(*) filter (where status = 'moroso') as late_loans,
  count(*) filter (where status = 'pagado') as paid_loans,
  coalesce(sum(amount) filter (where status = 'activo'), 0) as total_active_capital,
  coalesce(sum(total_amount) filter (where status = 'activo'), 0) as total_active_amount
from loans
group by user_id;

create or replace view v_upcoming_installments as
select
  i.*,
  l.user_id,
  c.full_name as client_name,
  l.amount as loan_amount
from installments i
join loans l on i.loan_id = l.id
join clients c on l.client_id = c.id
where i.status = 'pending'
  and i.due_date between current_date and current_date + interval '7 days';

create or replace view v_late_installments as
select
  i.*,
  l.user_id,
  c.full_name as client_name,
  current_date - i.due_date as days_overdue
from installments i
join loans l on i.loan_id = l.id
join clients c on l.client_id = c.id
where i.status in ('pending', 'late')
  and i.due_date < current_date;

create or replace view v_monthly_cashflow as
select
  l.user_id,
  date_trunc('month', p.payment_date) as month,
  coalesce(sum(p.amount), 0) as total_received,
  coalesce(sum(
    CASE 
      WHEN i.total_amount > 0 THEN p.amount * (i.capital_amount / i.total_amount)
      ELSE 0
    END
  ), 0) as capital_received,
  coalesce(sum(
    CASE 
      WHEN i.total_amount > 0 THEN p.amount * (i.interest_amount / i.total_amount)
      ELSE 0
    END
  ), 0) as interest_received,
  coalesce(sum(p.late_interest), 0) as late_interest_received,
  count(*) as payment_count
from payments p
join loans l on p.loan_id = l.id
join installments i on p.installment_id = i.id
group by l.user_id, date_trunc('month', p.payment_date)
order by month desc;