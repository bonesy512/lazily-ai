This file captures the minimal, high-value knowledge an automated coding agent needs to be productive in the Lazily.AI repo.

1) Big picture — architecture & flows
- Next.js (App Router, Server Actions) frontend + server runtime. Server logic lives alongside pages in `app/` and uses "use server" server actions.
- Postgres + Drizzle ORM for persistence. Schema lives in `lib/db/schema.ts`. Database access and queries are in `lib/db/drizzle.ts` and `lib/db/queries.ts`.
- Payments: Stripe integration in `lib/payments/stripe.ts` and webhook handler at `app/api/stripe/webhook/route.ts`.
- CSV → JSON → validated contract → DB → PDF flow:
  - CSV template: `public/templates/lazily-ai-template.csv`.
  - Parse/transform: `lib/contracts/transformation.ts` (maps CSV row → contract JSON).
  - Validate: `lib/contracts/validation.ts` (Zod schemas — canonical source of contract shape).
  - Persist: `app/(login)/actions.ts` (legacy) and the current bulk/single handlers in `app/(dashboard)/dashboard/contracts/actions.ts`.
  - Generate PDF: `generateContractAction` in `app/(dashboard)/dashboard/contracts/actions.ts` uses `pdf-lib` and the template `lib/templates/TREC-20-18-automated-v1.pdf`.

2) Developer workflows & commands (exact)
- Install: `pnpm install` (repository uses pnpm).  
- Local dev: `pnpm run dev` (Next dev with turbopack).  
- Build: `pnpm run build` and `pnpm run start`.  
- DB setup (interactive): `pnpm run db:setup` — this script may prompt for Docker vs remote Postgres and requires the Stripe CLI for webhook generation (see `lib/db/setup.ts`).
- DB helpers: `pnpm run db:seed`, `pnpm run db:generate` (drizzle-kit), `pnpm run db:migrate`, `pnpm run db:studio`.

3) Important environment variables (used across repo)
- `.env` keys produced/expected by `lib/db/setup.ts`: POSTGRES_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, BASE_URL, AUTH_SECRET.
- Stripe mapping keys referenced in code: STRIPE_CREDITS_PRICE_ID_100, STRIPE_CREDITS_PRICE_ID_500 (used by `lib/payments/stripe.ts`).

4) Project-specific conventions & patterns
- Path alias: `@/` is configured in `tsconfig.json` and used pervasively (import `@/lib/...`). Always prefer the alias.
- Zod-first contract model: The Zod schema in `lib/contracts/validation.ts` is authoritative. When adding/renaming contract fields update:
  1. `lib/contracts/validation.ts` (Zod schema)
  2. `lib/contracts/transformation.ts` (CSV → shape)
  3. `lib/db/schema.ts` (if you need DB-level columns or new tables) and run drizzle migrations
  4. PDF mapping in `app/(dashboard)/dashboard/contracts/actions.ts` (look for `fillText`/`check` helper patterns)
- Transactions & credits: Credit checks and deduction are done inside DB transactions and lock the team row FOR UPDATE (see `handleSingleContractSubmission`). Maintain atomicity when changing this flow.
- PDF field mapping tolerates missing fields — the code wraps `form.getTextField(...).setText(...)` and `form.getCheckBox(...).check()` in try/catch to skip absent fields. Follow the same defensive pattern.

5) Integration gotchas & external tools
- Stripe CLI: `lib/db/setup.ts` runs `stripe listen --print-secret` and expects the CLI to be installed and authenticated. On Windows run the Stripe CLI with appropriate privileges.  
- Docker: `db:setup` may spawn a local Postgres container (requires Docker). The default local DB URL used in scripts: `postgres://postgres:postgres@localhost:54322/postgres`.
- Drizzle ORM + migrations: Use `drizzle-kit` commands provided in package.json for generating and applying migrations.

6) Typical change recipe (example: add a new party field)
 - Add field to `lib/contracts/validation.ts` (Zod).  
 - Update CSV mapper `lib/contracts/transformation.ts`.  
 - If persistence shape changes, add column(s) in `lib/db/schema.ts`, run `pnpm run db:generate` and `pnpm run db:migrate`.  
 - Wire the field into PDF mapping in `app/(dashboard)/dashboard/contracts/actions.ts` using the `fillText` helper pattern.  
 - Re-run dev server and test locally with the `public/templates/lazily-ai-template.csv` sample.

7) Files to inspect first for any task
- Contract shape & validation: `lib/contracts/validation.ts` and `lib/contracts/transformation.ts`.  
- PDF generation & mapping: `app/(dashboard)/dashboard/contracts/actions.ts` (search for `fillText` / `check`).  
- Database schema and credits: `lib/db/schema.ts` and `lib/db/queries.ts`.  
- Stripe & billing: `lib/payments/stripe.ts` and `app/api/stripe/webhook/route.ts`.  
- Local setup script (interactive): `lib/db/setup.ts` (shows required env vars and external deps).

8) Safety & non-goals for an automated agent
- Don’t change the shape of the TREC template file `lib/templates/TREC-20-18-automated-v1.pdf` — only change mapping code.  
- Avoid changing core auth/session logic (`lib/auth/*`) without explicit tests or manual verification.  
- Database migrations must be generated with `drizzle-kit` and applied; avoid manual SQL schema edits.

If anything here is unclear or you want more examples (e.g., a canonical PR that adds a field end-to-end), tell me which area to expand and I will iterate.
