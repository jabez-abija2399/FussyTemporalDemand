-- Salons are public listings: anyone can read them, only the service role edits them.
create table public.salons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  address text not null,
  description text not null default '',
  opens_at smallint not null default 9 check (opens_at between 0 and 23),
  closes_at smallint not null default 18 check (closes_at between 1 and 24),
  created_at timestamptz not null default now(),
  check (opens_at < closes_at)
);

alter table public.salons enable row level security;

create policy "Salons are readable by everyone"
  on public.salons for select
  using (true);
