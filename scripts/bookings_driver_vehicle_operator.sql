alter table public.bookings
  add column if not exists driver_name text,
  add column if not exists vehicle_name text,
  add column if not exists operator_name text;

alter table public.bookings
  alter column driver_name set default 'Kaabish',
  alter column vehicle_name set default '2019 Nissan Clipper WAV',
  alter column operator_name set default 'New Pak Surgical';

update public.bookings
set
  driver_name = coalesce(nullif(trim(driver_name), ''), 'Kaabish'),
  vehicle_name = coalesce(nullif(trim(vehicle_name), ''), '2019 Nissan Clipper WAV'),
  operator_name = coalesce(nullif(trim(operator_name), ''), 'New Pak Surgical');

create index if not exists bookings_passenger_phone_status_created_idx
  on public.bookings (passenger_phone, status, created_at desc);
