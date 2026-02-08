-- Crea tabla users si no existe (para entornos donde no se aplicó el esquema inicial)
create extension if not exists "pgcrypto";

-- Helper (coincide con mig. inicial)
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'ADMIN';
$$;

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

-- RLS
alter table public.users enable row level security;

create policy "users_select_self_or_admin" on public.users
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "users_update_self_or_admin" on public.users
  for update
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "users_insert_admin" on public.users
  for insert
  to authenticated
  with check (public.is_admin());

create index if not exists idx_users_cedula on public.users (cedula);
create index if not exists idx_users_role on public.users (role);
