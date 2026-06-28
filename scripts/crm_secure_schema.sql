create extension if not exists pgcrypto;

create table if not exists public.crm_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  full_name text not null,
  role text not null,
  pin_hash text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  banned_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_users_role_check check (role in ('manager', 'owner', 'board_director'))
);

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
  updated_at timestamptz not null default now(),
  constraint crm_leads_city_check check (city in ('Lahore', 'Karachi')),
  constraint crm_leads_stage_check check (stage in ('new', 'contacted', 'in-progress', 'booking-in-process', 'booked', 'lost')),
  constraint crm_leads_org_type_check check (org_type in ('hotel', 'guest-house', 'rent-a-car', 'hospital', 'concierge', 'end-user'))
);

create table if not exists public.crm_interactions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.crm_leads(id) on delete cascade,
  channel text not null,
  summary text not null,
  next_step text,
  next_at timestamptz,
  created_by text,
  created_at timestamptz not null default now(),
  constraint crm_interactions_channel_check check (channel in ('call', 'whatsapp', 'visit', 'email'))
);

create table if not exists public.crm_appointments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  city text not null default 'Lahore',
  scheduled_at timestamptz not null,
  with_whom text,
  lead_id uuid references public.crm_leads(id) on delete set null,
  status text not null default 'scheduled',
  created_by text,
  created_at timestamptz not null default now(),
  constraint crm_appointments_city_check check (city in ('Lahore', 'Karachi')),
  constraint crm_appointments_status_check check (status in ('scheduled', 'completed', 'cancelled'))
);

create table if not exists public.crm_operations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  work_type text not null,
  owner_name text,
  due_date date,
  status text not null default 'todo',
  notes text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_operations_work_type_check check (work_type in ('vehicle-design', 'regulatory', 'partnership', 'admin')),
  constraint crm_operations_status_check check (status in ('todo', 'in-progress', 'blocked', 'done'))
);

create or replace function public.set_crm_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crm_users_set_updated_at on public.crm_users;
create trigger crm_users_set_updated_at
before update on public.crm_users
for each row execute function public.set_crm_updated_at();

drop trigger if exists crm_leads_set_updated_at on public.crm_leads;
create trigger crm_leads_set_updated_at
before update on public.crm_leads
for each row execute function public.set_crm_updated_at();

drop trigger if exists crm_operations_set_updated_at on public.crm_operations;
create trigger crm_operations_set_updated_at
before update on public.crm_operations
for each row execute function public.set_crm_updated_at();

alter table public.crm_users enable row level security;
alter table public.crm_leads enable row level security;
alter table public.crm_interactions enable row level security;
alter table public.crm_appointments enable row level security;
alter table public.crm_operations enable row level security;

drop policy if exists crm_users_no_direct_access on public.crm_users;
create policy crm_users_no_direct_access on public.crm_users for all using (false) with check (false);

drop policy if exists crm_leads_no_direct_access on public.crm_leads;
create policy crm_leads_no_direct_access on public.crm_leads for all using (false) with check (false);

drop policy if exists crm_interactions_no_direct_access on public.crm_interactions;
create policy crm_interactions_no_direct_access on public.crm_interactions for all using (false) with check (false);

drop policy if exists crm_appointments_no_direct_access on public.crm_appointments;
create policy crm_appointments_no_direct_access on public.crm_appointments for all using (false) with check (false);

drop policy if exists crm_operations_no_direct_access on public.crm_operations;
create policy crm_operations_no_direct_access on public.crm_operations for all using (false) with check (false);

create or replace function public.crm_sign_in(p_username text, p_pin_hash text)
returns table (
  id uuid,
  username text,
  full_name text,
  role text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user public.crm_users%rowtype;
  v_failed integer;
begin
  select * into v_user
  from public.crm_users u
  where lower(u.username) = lower(p_username)
  limit 1;

  if not found then
    raise exception 'INVALID_CREDENTIALS';
  end if;

  if v_user.banned_until is not null and v_user.banned_until > now() then
    raise exception 'ACCOUNT_BANNED';
  end if;

  if v_user.locked_until is not null and v_user.locked_until > now() then
    raise exception 'ACCOUNT_LOCKED';
  end if;

  if v_user.pin_hash <> p_pin_hash then
    v_failed := coalesce(v_user.failed_attempts, 0) + 1;

    update public.crm_users
    set
      failed_attempts = v_failed,
      locked_until = case
        when v_failed >= 5 and v_failed < 10 then now() + interval '15 minutes'
        else locked_until
      end,
      banned_until = case
        when v_failed >= 10 then now() + interval '24 hours'
        else banned_until
      end
    where id = v_user.id;

    raise exception 'INVALID_CREDENTIALS';
  end if;

  update public.crm_users
  set failed_attempts = 0,
      locked_until = null,
      banned_until = null
  where id = v_user.id;

  return query
  select v_user.id, v_user.username, v_user.full_name, v_user.role;
end;
$$;

grant execute on function public.crm_sign_in(text, text) to anon, authenticated;

create index if not exists crm_leads_stage_city_idx on public.crm_leads(stage, city, created_at desc);
create index if not exists crm_interactions_lead_created_idx on public.crm_interactions(lead_id, created_at desc);
create index if not exists crm_appointments_scheduled_idx on public.crm_appointments(scheduled_at desc);
create index if not exists crm_operations_status_due_idx on public.crm_operations(status, due_date);
