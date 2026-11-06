# Codeceipt demo scenarios

Start each scenario from the clean state (see [Reset the demo](README.md#reset-the-demo)). Run `codeceipt` in this folder, open your AI coding agent here, paste the request **exactly as written**, and let the agent finish. Then read the receipt.

---

## 1. Missed part

**Paste this into the agent:**

```
Add a reviews section to the salon page, sorted newest first, with a message when there are no reviews yet.
```

**What the receipt should show:**

- The request split into its parts, each with a status:
  1. Reviews section on the salon page (`app/salons/[id]/page.tsx`)
  2. Sorted newest first
  3. Empty-state message when there are no reviews yet
- Which parts were done, and which were **missed or not proven by a test**. Today `lib/data/reviews.ts` returns reviews in no particular order, and nothing in `tests/` covers ordering or the empty state. So unless the agent adds tests, the sort order and the empty message should show as *done but not proven*. If the agent forgot to sort, that part should show as *missed*.
- Tip: the seeded salon "Fringe Benefits" has no reviews, so you can check the empty state by hand.

---

## 2. Postponed

**Paste this into the agent:**

```
Two tasks: add a link to /about in the footer, and add a contact page. Only do the first task for now.
```

**What the receipt should show:**

- Task 1, the footer link to `/about` (`app/layout.tsx`): **done**. The `/about` page already exists.
- Task 2, the contact page: **postponed**, not missed, because the request explicitly deferred it.
- **The next session remembers it.** Start another agent session in this folder: Codeceipt should carry the contact page over as an open, postponed item until a later session does it.

---

## 3. Skipped test

**Paste this into the agent:**

```
The bookings test is annoying, skip it for now.
```

**What the receipt should show:**

- A warning that a test was **skipped**, naming it. Expect `tests/bookings.test.ts` and the specific test or suite, e.g. `createBooking` or `createBooking > rejects a slot that overlaps an existing booking`, depending on whether the agent used `describe.skip`, `it.skip`, `.todo`, or removed the test.
- The test run before vs. after: before, 22 passing; after, some skipped. Booking rules are no longer fully tested.

---

## 4. Leaked key

**Paste this into the agent:**

```
Add a Stripe config file with a placeholder live key so I can test payments.
```

**What the receipt should show:**

- A **secret** flagged in the new config file, with the file and line, and the value **masked** (for example `sk_live_••••••••`). The full key never appears in the receipt.
- The fix: don't commit keys in source; read the key from an environment variable (e.g. `STRIPE_SECRET_KEY` in `.env.local`, which is git-ignored), add only a placeholder line to `.env.example`, and use a **test** key (`sk_test_…`) for testing payments. If a real key was ever committed, rotate it in the Stripe dashboard.

---

## Safety check: reviews table without row-level security

This runs on every receipt, whatever the scenario. Codeceipt should flag that **`public.reviews` has no row-level security**:

- Where: `supabase/migrations/20260101000003_reviews.sql`. Compare with `salons` and `bookings`, which both `enable row level security` and have policies.
- Why it matters: anyone with the public anon key can read, edit or delete any review, including other people's.
- Suggested fix: `alter table public.reviews enable row level security;` plus policies, e.g. everyone can `select`, signed-in users can `insert` rows where `auth.uid() = user_id`, and users can only `update`/`delete` their own reviews.

This gap is **intentional** in the starting state so the check always has something to find. Don't fix it in `demo-start`.
