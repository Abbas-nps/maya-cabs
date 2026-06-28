create extension if not exists pgcrypto;

create table if not exists public.customer_profiles (
  id uuid primary key default gen_random_uuid(),
  phone text not null unique,
  pin_hash text not null,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  banned_until timestamptz,
  full_name text,
  wheelchair_type text,
  pickup text,
  destination text,
  estimated_distance_km integer,
  trip_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_profiles_phone_pk_format check (phone ~ '^\+92[0-9]{10}$')
);

create or replace function public.set_customer_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customer_profiles_set_updated_at on public.customer_profiles;
create trigger customer_profiles_set_updated_at
before update on public.customer_profiles
for each row
execute function public.set_customer_profiles_updated_at();

alter table public.customer_profiles enable row level security;

drop policy if exists customer_profiles_no_direct_access on public.customer_profiles;
create policy customer_profiles_no_direct_access
on public.customer_profiles
for all
using (false)
with check (false);

create or replace function public.customer_profile_sign_in(p_phone text, p_pin_hash text)
returns table (
  id uuid,
  phone text,
  full_name text,
  wheelchair_type text,
  pickup text,
  destination text,
  estimated_distance_km integer,
  trip_type text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_phone text;
  v_full_name text;
  v_wheelchair_type text;
  v_pickup text;
  v_destination text;
  v_estimated_distance_km integer;
  v_trip_type text;
  v_updated_at timestamptz;
  v_pin_hash text;
  v_failed_attempts integer;
  v_locked_until timestamptz;
  v_banned_until timestamptz;
begin
  select
    cp_row.id,
    cp_row.phone,
    cp_row.full_name,
    cp_row.wheelchair_type,
    cp_row.pickup,
    cp_row.destination,
    cp_row.estimated_distance_km,
    cp_row.trip_type,
    cp_row.updated_at,
    cp_row.pin_hash,
    cp_row.failed_attempts,
    cp_row.locked_until,
    cp_row.banned_until
  into
    v_profile_id,
    v_phone,
    v_full_name,
    v_wheelchair_type,
    v_pickup,
    v_destination,
    v_estimated_distance_km,
    v_trip_type,
    v_updated_at,
    v_pin_hash,
    v_failed_attempts,
    v_locked_until,
    v_banned_until
  from public.customer_profiles cp_row
  where cp_row.phone = p_phone
  limit 1;

  if not found then
    raise exception 'PROFILE_NOT_FOUND';
  end if;

  if v_banned_until is not null and v_banned_until > now() then
    raise exception 'ACCOUNT_BANNED';
  end if;

  if v_locked_until is not null and v_locked_until > now() then
    raise exception 'ACCOUNT_LOCKED';
  end if;

  if v_pin_hash <> p_pin_hash then
    update public.customer_profiles as cp_upd
    set
      failed_attempts = coalesce(cp_upd.failed_attempts, 0) + 1,
      locked_until = case
        when coalesce(cp_upd.failed_attempts, 0) + 1 >= 5 and coalesce(cp_upd.failed_attempts, 0) + 1 < 10
          then now() + interval '15 minutes'
        else cp_upd.locked_until
      end,
      banned_until = case
        when coalesce(cp_upd.failed_attempts, 0) + 1 >= 10
          then now() + interval '24 hours'
        else cp_upd.banned_until
      end
    where cp_upd.id = v_profile_id;

    raise exception 'INVALID_CREDENTIALS';
  end if;

  update public.customer_profiles as cp_upd
  set
    failed_attempts = 0,
    locked_until = null,
    banned_until = null
  where cp_upd.id = v_profile_id;

  return query
  select
    v_profile_id,
    v_phone,
    v_full_name,
    v_wheelchair_type,
    v_pickup,
    v_destination,
    v_estimated_distance_km,
    v_trip_type,
    v_updated_at;
end;
$$;

create or replace function public.customer_profile_upsert(
  p_phone text,
  p_pin_hash text,
  p_full_name text default null,
  p_wheelchair_type text default null,
  p_pickup text default null,
  p_destination text default null,
  p_estimated_distance_km integer default null,
  p_trip_type text default null,
  p_create_only boolean default false
)
returns table (
  id uuid,
  phone text,
  full_name text,
  wheelchair_type text,
  pickup text,
  destination text,
  estimated_distance_km integer,
  trip_type text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_row public.customer_profiles%rowtype;
begin
  if p_phone !~ '^\+92[0-9]{10}$' then
    raise exception 'PHONE_MUST_START_WITH_+92';
  end if;

  select * into existing_row
  from public.customer_profiles cp_row
  where cp_row.phone = p_phone;

  if found and p_create_only then
    raise exception 'PROFILE_EXISTS';
  end if;

  if found and existing_row.pin_hash <> p_pin_hash then
    raise exception 'PROFILE_EXISTS';
  end if;

  return query
  insert into public.customer_profiles as cp_tbl (
    phone,
    pin_hash,
    full_name,
    wheelchair_type,
    pickup,
    destination,
    estimated_distance_km,
    trip_type
  )
  values (
    p_phone,
    p_pin_hash,
    p_full_name,
    p_wheelchair_type,
    p_pickup,
    p_destination,
    p_estimated_distance_km,
    p_trip_type
  )
  on conflict on constraint customer_profiles_phone_key do update
  set
    pin_hash = excluded.pin_hash,
    full_name = coalesce(excluded.full_name, cp_tbl.full_name),
    wheelchair_type = coalesce(excluded.wheelchair_type, cp_tbl.wheelchair_type),
    pickup = coalesce(excluded.pickup, cp_tbl.pickup),
    destination = coalesce(excluded.destination, cp_tbl.destination),
    estimated_distance_km = coalesce(excluded.estimated_distance_km, cp_tbl.estimated_distance_km),
    trip_type = coalesce(excluded.trip_type, cp_tbl.trip_type)
  returning
    cp_tbl.id,
    cp_tbl.phone,
    cp_tbl.full_name,
    cp_tbl.wheelchair_type,
    cp_tbl.pickup,
    cp_tbl.destination,
    cp_tbl.estimated_distance_km,
    cp_tbl.trip_type,
    cp_tbl.updated_at;
end;
$$;

grant execute on function public.customer_profile_sign_in(text, text) to anon, authenticated;
grant execute on function public.customer_profile_upsert(text, text, text, text, text, text, integer, text, boolean) to anon, authenticated;