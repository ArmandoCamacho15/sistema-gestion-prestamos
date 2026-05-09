create extension if not exists pgcrypto;

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  identification text unique not null,
  phone text,
  email text,
  address text,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) not null
);

create table if not exists loans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) not null,
  amount decimal(12,2) not null,
  term_months int not null,
  interest_rate decimal(5,2) not null,
  rate_type text not null check (rate_type in ('flat', 'simple')),
  payment_frequency text not null check (payment_frequency in ('mensual', 'quincenal')),
  start_date date not null,
  first_payment_date date not null,
  total_interest decimal(12,2),
  total_amount decimal(12,2),
  installment_amount decimal(12,2),
  status text default 'activo' check (status in ('activo', 'pagado', 'moroso')),
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) not null
);

create table if not exists installments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid references loans(id) on delete cascade,
  installment_number int not null,
  due_date date not null,
  capital_amount decimal(12,2) not null,
  interest_amount decimal(12,2) not null,
  total_amount decimal(12,2) not null,
  balance_after decimal(12,2) not null,
  status text default 'pending' check (status in ('pending', 'paid', 'late')),
  paid_date date,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid references loans(id) not null,
  installment_id uuid references installments(id) not null,
  amount decimal(12,2) not null,
  payment_date date not null,
  notes text,
  late_interest decimal(12,2) default 0,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) not null
);

create table if not exists settings (
  key text primary key,
  value decimal(10,2) not null,
  description text,
  user_id uuid references auth.users(id) not null
);