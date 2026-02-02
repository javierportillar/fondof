-- Fondo Fortuna - esquema inicial para Supabase
-- Fecha: 2026-02-02
-- Nota: usa UUIDs generados desde el cliente o con gen_random_uuid().

-- Extensiones útiles
create extension if not exists "pgcrypto";

-- Helpers
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'ADMIN';
$$;

-------------------------------------------------------------------------------
-- Tablas
-------------------------------------------------------------------------------
create table if not exists public.users (
  id              uuid primary key default gen_random_uuid(),
  cedula          text not null unique,
  name            text not null,
  email           text not null,
  phone_number    text not null,
  role            text not null check (role in ('ADMIN','USER')),
  credit_limit    numeric default 0,
  created_at      timestamptz not null default now()
);

create table if not exists public.savings_accounts (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references public.users(id) on delete cascade,
  balance                numeric default 0,
  monthly_contribution   numeric default 0,
  last_contribution_date date,
  interest_earned        numeric default 0,
  created_at             timestamptz not null default now()
);

create table if not exists public.savings_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  date       date not null default current_date,
  amount     numeric not null,
  type       text not null check (type in ('DEPOSIT','WITHDRAWAL','INTEREST')),
  created_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references public.users(id) on delete cascade,
  name          text not null,
  target_amount numeric not null,
  created_at    timestamptz not null default now()
);

create table if not exists public.loans (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  amount            numeric not null,
  remaining_amount  numeric not null,
  interest_rate     numeric not null,
  term_months       integer not null,
  start_date        date not null,
  next_payment_date date not null,
  monthly_payment   numeric not null,
  status            text not null check (status in ('Activo','Pendiente','Pagado')),
  payments_made     integer default 0,
  created_at        timestamptz not null default now()
);

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,
  price       numeric not null,
  image       text default 'https://placehold.co/400x400',
  stock       integer default 0,
  rating      numeric default 5.0 check (rating >= 0 and rating <= 5),
  description text,
  is_golden   boolean default false,
  created_at  timestamptz not null default now()
);

-------------------------------------------------------------------------------
-- Índices
-------------------------------------------------------------------------------
create index if not exists idx_users_cedula on public.users (cedula);
create index if not exists idx_users_role on public.users (role);
create index if not exists idx_savings_user on public.savings_accounts (user_id);
create index if not exists idx_savings_history_user on public.savings_history (user_id);
create index if not exists idx_savings_history_date on public.savings_history (date desc);
create index if not exists idx_savings_goals_user on public.savings_goals (user_id);
create index if not exists idx_loans_user on public.loans (user_id);
create index if not exists idx_loans_status on public.loans (status);
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_golden on public.products (is_golden);

-------------------------------------------------------------------------------
-- Row Level Security
-------------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.savings_accounts enable row level security;
alter table public.savings_history enable row level security;
alter table public.savings_goals enable row level security;
alter table public.loans enable row level security;
alter table public.products enable row level security;

-- Policies: usuarios estándar (USER) solo ven/modifican lo suyo; admin todo.

-- USERS
create policy if not exists users_select_self_or_admin
  on public.users for select
  using (id = auth.uid() or is_admin());

create policy if not exists users_update_self_or_admin
  on public.users for update
  using (id = auth.uid() or is_admin());

-- Opcional: inserts suelen venir desde servicio/función; permitir admin o servicio.
create policy if not exists users_insert_admin_only
  on public.users for insert
  with check (is_admin());

-- SAVINGS_ACCOUNTS
create policy if not exists savings_accounts_select_owner_or_admin
  on public.savings_accounts for select
  using (user_id = auth.uid() or is_admin());

create policy if not exists savings_accounts_modify_owner_or_admin
  on public.savings_accounts for insert, update, delete
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- SAVINGS_HISTORY
create policy if not exists savings_history_select_owner_or_admin
  on public.savings_history for select
  using (user_id = auth.uid() or is_admin());

create policy if not exists savings_history_modify_owner_or_admin
  on public.savings_history for insert, update, delete
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- SAVINGS_GOALS
create policy if not exists savings_goals_select_owner_or_admin
  on public.savings_goals for select
  using (user_id = auth.uid() or is_admin());

create policy if not exists savings_goals_modify_owner_or_admin
  on public.savings_goals for insert, update, delete
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- LOANS
create policy if not exists loans_select_owner_or_admin
  on public.loans for select
  using (user_id = auth.uid() or is_admin());

create policy if not exists loans_modify_owner_or_admin
  on public.loans for insert, update, delete
  using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- PRODUCTS (lectura pública; escritura solo admin)
create policy if not exists products_select_public
  on public.products for select
  using (true);

create policy if not exists products_modify_admin_only
  on public.products for insert, update, delete
  using (is_admin())
  with check (is_admin());

-------------------------------------------------------------------------------
-- Tips de sincronización con auth.users (opcional, no automático aquí)
-- Puedes crear un trigger que copie auth.users.id -> public.users.id en registros nuevos,
-- o manejar el alta vía RPC con la claim `role` en el JWT.
-------------------------------------------------------------------------------
