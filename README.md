# Salon Booking — a Codeceipt demo app

This is a small, realistic Next.js (App Router, TypeScript) + Supabase app for booking salon appointments: sign-in, a list of salons, a salon page, bookings and reviews. It exists to demo [Codeceipt](https://codeceipts.vercel.app), a tool that gives you a receipt after every AI coding session showing what was asked, what was done, what was missed or postponed, and anything risky (skipped tests, leaked secrets, unsafe database tables). The app works, but a few rough edges are intentional so the receipts have something to show. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Install Codeceipt

Windows (PowerShell):

```powershell
irm https://codeceipts.vercel.app/install.ps1 | iex
```

Mac and Linux:

```bash
curl -fsSL https://codeceipts.vercel.app/install.sh | sh
```

## Run Codeceipt in this folder

```bash
cd Codeceipt-demo
codeceipt
```

Then open your AI coding agent in the same folder and paste one of the scenario requests from **[DEMO.md](DEMO.md)**. When the session ends, Codeceipt prints the receipt.

## Run the app (optional)

You don't need a running app or database to demo Codeceipt, but if you want one:

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project URL and anon key
npm run dev
```

Apply `supabase/migrations/` to your Supabase project (for example with `supabase db push`) and load `supabase/seed.sql` for demo data.

Checks (these also run in CI on every pull request):

```bash
npm run typecheck
npm run lint
npm test
```

## Reset the demo

The clean starting point is tagged `demo-start`. To go back to it after a scenario:

```bash
git checkout demo-start -- .
git clean -fd
```

> ⚠️ **This removes your local changes.** `git checkout demo-start -- .` overwrites every tracked file with its starting version, and `git clean -fd` deletes untracked files and folders (for example a new contact page or a Stripe config file). Commit or stash anything you want to keep first. Ignored files such as `node_modules/` and `.env.local` are left alone.

## Project layout

```
app/                     Next.js routes (salons, salon page, reviews, bookings, sign-in)
lib/bookings.ts          Booking rules (opening hours, slots, overlaps, cancelling)
lib/reviews.ts           Review rules (validation, average rating)
lib/data/                Supabase data layer
supabase/migrations/     Tables and row-level security policies
supabase/seed.sql        Made-up demo data
tests/                   Vitest tests (data layer is mocked; no database needed)
```
