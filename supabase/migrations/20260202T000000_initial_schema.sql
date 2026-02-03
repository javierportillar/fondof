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
  password_hash   text not null default '',
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

-- Compras (cabecera) y detalle
create table if not exists public.purchases (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  total_amount numeric not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.purchase_items (
  id             uuid primary key default gen_random_uuid(),
  purchase_id    uuid not null references public.purchases(id) on delete cascade,
  product_id     uuid not null references public.products(id) on delete restrict,
  quantity       integer not null,
  unit_price     numeric not null,
  subtotal       numeric not null,
  created_at     timestamptz not null default now()
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
create index if not exists idx_purchases_user on public.purchases (user_id);
create index if not exists idx_purchase_items_purchase on public.purchase_items (purchase_id);
create index if not exists idx_purchase_items_product on public.purchase_items (product_id);

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

-- USERS (sin dependencia de auth.uid, abierto a todas las filas)
drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_all
  on public.users for select
  using (true);

drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_all
  on public.users for update
  using (true)
  with check (true);

drop policy if exists users_insert_admin_only on public.users;
create policy users_insert_all
  on public.users
  for insert
  with check (true);

-- SAVINGS_ACCOUNTS
drop policy if exists savings_accounts_select_owner_or_admin on public.savings_accounts;
create policy savings_accounts_select_owner_or_admin
  on public.savings_accounts for select
  using (true);

drop policy if exists savings_accounts_modify_owner_or_admin on public.savings_accounts;
create policy savings_accounts_modify_owner_or_admin
  on public.savings_accounts for all
  using (true)
  with check (true);

-- SAVINGS_HISTORY
drop policy if exists savings_history_select_owner_or_admin on public.savings_history;
create policy savings_history_select_owner_or_admin
  on public.savings_history for select
  using (true);

drop policy if exists savings_history_modify_owner_or_admin on public.savings_history;
create policy savings_history_modify_owner_or_admin
  on public.savings_history for all
  using (true)
  with check (true);

-- SAVINGS_GOALS
drop policy if exists savings_goals_select_owner_or_admin on public.savings_goals;
create policy savings_goals_select_owner_or_admin
  on public.savings_goals for select
  using (true);

drop policy if exists savings_goals_modify_owner_or_admin on public.savings_goals;
create policy savings_goals_modify_owner_or_admin
  on public.savings_goals for all
  using (true)
  with check (true);

-- LOANS
drop policy if exists loans_select_owner_or_admin on public.loans;
create policy loans_select_owner_or_admin
  on public.loans for select
  using (true);

drop policy if exists loans_modify_owner_or_admin on public.loans;
create policy loans_modify_owner_or_admin
  on public.loans for all
  using (true)
  with check (true);

-- PRODUCTS (lectura pública; escritura solo admin)
drop policy if exists products_select_public on public.products;
create policy products_select_public
  on public.products for select
  using (true);

drop policy if exists products_modify_admin_only on public.products;
create policy products_modify_admin_only
  on public.products for all
  using (true)
  with check (true);

-- PURCHASES
drop policy if exists purchases_select_all on public.purchases;
create policy purchases_select_all
  on public.purchases for select
  using (true);

drop policy if exists purchases_modify_all on public.purchases;
create policy purchases_modify_all
  on public.purchases for all
  using (true)
  with check (true);

-- PURCHASE_ITEMS
drop policy if exists purchase_items_select_all on public.purchase_items;
create policy purchase_items_select_all
  on public.purchase_items for select
  using (true);

drop policy if exists purchase_items_modify_all on public.purchase_items;
create policy purchase_items_modify_all
  on public.purchase_items for all
  using (true)
  with check (true);


create table if not exists public.password_resets (
  token uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '30 minutes',
  used boolean not null default false,
  created_at timestamptz not null default now()
);


-------------------------------------------------------------------------------
-- Tips de sincronización con auth.users (opcional, no automático aquí)
-- Puedes crear un trigger que copie auth.users.id -> public.users.id en registros nuevos,
-- o manejar el alta vía RPC con la claim `role` en el JWT.
-------------------------------------------------------------------------------
-- Eliminado: ya no sincronizamos automáticamente desde auth.users
