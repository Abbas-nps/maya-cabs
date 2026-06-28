-- Enables shared CRM leads for the current frontend.
-- Run in Supabase SQL Editor.
-- This keeps the existing crm_leads table shape and allows the frontend anon key
-- to read/write leads. The app stores newer lead fields inside notes metadata.

create extension if not exists pgcrypto;

create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'New Pak Surgical',
  org_type text not null,
  org_name text not null,
  contact_name text not null,
  contact_role text,
  phone text,
  city text not null default 'Lahore',
  stage text not null default 'new',
  owner_name text not null default 'Asad',
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_crm_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crm_leads_set_updated_at on public.crm_leads;
create trigger crm_leads_set_updated_at
before update on public.crm_leads
for each row execute function public.set_crm_leads_updated_at();

alter table public.crm_leads enable row level security;

drop policy if exists crm_leads_no_direct_access on public.crm_leads;
drop policy if exists crm_leads_public_select on public.crm_leads;
drop policy if exists crm_leads_public_insert on public.crm_leads;
drop policy if exists crm_leads_public_update on public.crm_leads;
drop policy if exists crm_leads_public_delete on public.crm_leads;

create policy crm_leads_public_select
on public.crm_leads
for select
using (true);

create policy crm_leads_public_insert
on public.crm_leads
for insert
with check (true);

create policy crm_leads_public_update
on public.crm_leads
for update
using (true)
with check (true);

create policy crm_leads_public_delete
on public.crm_leads
for delete
using (true);
