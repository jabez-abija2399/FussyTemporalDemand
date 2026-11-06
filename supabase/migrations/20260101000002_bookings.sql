-- Bookings belong to the signed-in user who made them.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  service text not null,
  starts_at timestamptz not null,
  duration_minutes smallint not null default 30 check (duration_minutes in (30, 60, 90)),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create index bookings_salon_starts_at_idx on public.bookings (salon_id, starts_at);
create index bookings_user_idx on public.bookings (user_id);

alter table public.bookings enable row level security;

create policy "Users can read their own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

create policy "Users can create bookings for themselves"
  on public.bookings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own bookings"
  on public.bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users cannot read other people's bookings, but the booking form needs to
-- know which slots are taken. This function exposes only start times.
create function public.taken_slots(p_salon_id uuid, p_from timestamptz, p_to timestamptz)
returns table (starts_at timestamptz, duration_minutes smallint)
language sql
security definer
set search_path = public
as $$
  select b.starts_at, b.duration_minutes
  from public.bookings b
  where b.salon_id = p_salon_id
    and b.status = 'confirmed'
    and b.starts_at >= p_from
    and b.starts_at < p_to;
$$;
