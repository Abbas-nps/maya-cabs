alter table public.bookings
  add column if not exists city text;

update public.bookings
set city = coalesce(nullif(trim(city), ''), 'Lahore')
where city is null or nullif(trim(city), '') is null;

alter table public.bookings
  alter column city set default 'Lahore';

alter table public.bookings
  alter column city set not null;

alter table public.bookings
  drop constraint if exists bookings_city_allowed;

alter table public.bookings
  add constraint bookings_city_allowed
  check (city in ('Lahore', 'Karachi'));

create index if not exists bookings_city_created_idx
  on public.bookings (city, created_at desc);
