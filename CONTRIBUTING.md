# Contributing

Thanks for helping! A few things in this repo look like mistakes but are on purpose, because it's a demo app for [Codeceipt](https://codeceipts.vercel.app):

- **The `reviews` table has no row-level security** (`supabase/migrations/20260101000003_reviews.sql`). This is intentional so Codeceipt's safety check has something to flag. Please don't add RLS to it in the starting state.
- **The scenario requests in [DEMO.md](DEMO.md) are intentional**, including the ones that ask an agent to skip a test or add a "live" Stripe key. They exist to show what a receipt catches. Don't merge the results of running them.
- The salon page deliberately has no reviews list and the footer has no `/about` link yet. Those are what scenarios 1 and 2 ask for.

If you change the starting state, run `npm run typecheck && npm run lint && npm test`, then move the `demo-start` tag to the new commit:

```bash
git tag -f demo-start
git push -f origin demo-start
```

Never commit real secrets. Use `.env.local`, which is git-ignored, and keep placeholder values only in `.env.example`.
