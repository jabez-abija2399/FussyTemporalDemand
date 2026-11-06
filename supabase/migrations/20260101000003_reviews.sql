create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salons (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  author_name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '' check (char_length(comment) <= 500),
  created_at timestamptz not null default now()
);

create index reviews_salon_idx on public.reviews (salon_id);

-- INTENTIONAL FOR THE CODECEIPT DEMO: row-level security is NOT enabled on
-- this table. Anyone with the anon key can read, edit and delete any review.
-- Codeceipt's safety check should flag this. Do not "fix" it in the starting
-- state; see DEMO.md and CONTRIBUTING.md.
