-- Demo data only. All names are made up; no real people or email addresses.
insert into public.salons (id, name, city, address, description, opens_at, closes_at) values
  ('11111111-1111-4111-8111-111111111111', 'Copper & Comb', 'Riverton', '12 Mill Lane',
   'Cuts, colour and beard trims in a converted print shop.', 9, 18),
  ('22222222-2222-4222-8222-222222222222', 'The Quiet Chair', 'Riverton', '4 Orchard Row',
   'Calm, appointment-only salon. No music, no small talk unless you want it.', 10, 19),
  ('33333333-3333-4333-8333-333333333333', 'Fringe Benefits', 'Lakeside', '88 Harbour Street',
   'Walk-ins welcome for fringe trims. Everything else by booking.', 8, 16);

insert into public.reviews (salon_id, author_name, rating, comment, created_at) values
  ('11111111-1111-4111-8111-111111111111', 'Demo Customer A', 5,
   'Great fade, booked in under a minute.', '2026-09-02 10:15:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'Demo Customer B', 4,
   'Good cut, ran ten minutes late.', '2026-09-20 16:40:00+00'),
  ('11111111-1111-4111-8111-111111111111', 'Demo Customer C', 3,
   'Fine, but pricier than listed.', '2026-10-05 12:00:00+00'),
  ('22222222-2222-4222-8222-222222222222', 'Demo Customer D', 5,
   'Exactly as quiet as promised.', '2026-08-28 09:30:00+00');
-- Fringe Benefits intentionally has no reviews (useful for the "no reviews yet" state).
