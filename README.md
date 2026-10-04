# Sotak · صوتك

A moderated public opinion platform where people in Saudi Arabia vote on current topics and see where the public stands. Arabic-first, English second.

**Principles:** credibility over volume · no pay to sway · open by default · privacy first · moderated, not censored.

## Stack

| Layer | Choice |
| --- | --- |
| Frontend | Next.js (App Router), RTL Arabic + English, Tailwind CSS, installable PWA |
| Hosting | Vercel |
| Database, auth, realtime | Supabase (Postgres with row-level security) |
| Edge protection | Cloudflare (country filtering, Turnstile, rate limits) |

## Local development

Needs Node 20+ and Docker (for a local Supabase).

```bash
npm install
npx supabase start           # local Postgres, auth, and API; applies migrations and seed data
cp .env.example .env.local   # then paste the API URL and anon key that `supabase start` printed
npm run dev                  # http://localhost:3000 → redirects to /ar or /en
```

The app also runs without Supabase configured; `/api/health` then reports `"supabase": "not_configured"`.

### Checks

```bash
npm run lint
npm run typecheck
npm run test:db              # database rules (pgTAP), needs `supabase start`
npm run test:e2e             # end-to-end: resets the local DB, clears cached data, runs Playwright
npm run db:types             # regenerate TypeScript types after a schema change
npx supabase db reset        # wipe the local database and reapply migrations + seed
```

## Project layout

```
src/
  app/[lang]/        Pages, one tree per locale (/ar, /en); topics at /[lang]/t/[slug]
  app/api/health/    Deployment and database health check
  components/        Voting panel, topic cards, live counters
  i18n/              Locale config, plural/number helpers, ar/en dictionaries
  lib/               Topic queries, vote types, Supabase clients
  proxy.ts           Locale redirect + Supabase session refresh
supabase/migrations/ Database schema, RLS policies, and voting functions
supabase/tests/      Database tests (pgTAP)
supabase/seed.sql    Sample topics for local development
tests/e2e/           Browser tests (Playwright)
docs/                Setup and deployment guides
```

## Build phases

- [x] **1. Foundation:** Next.js, Arabic and English layout, Supabase connected, Vercel + Cloudflare ([setup guide](docs/setup.md))
- [x] **2. Topics and voting:** topic pages, tap and swipe voting, guess-the-result, live results, homepage, "voting now" counter ([how voting works](docs/voting.md)). Also: topic suggestions (pending review), Explore with Arabic-aware search, Results archive, bottom tab bar
- [ ] **3. Accounts and trust:** Google, Apple, and email sign-in; profile; consent; trust signals and score; verified-only results
- [ ] **4. Moderation:** submission form, AI pre-screening, admin dashboard, topic lifecycle, moderation log
- [ ] **5. Growth:** shareable result cards, Public Opinion Case trigger, opinion-over-time charts, streaks, embeddable widget, methodology page
- [ ] **6. Monetization:** AdSense, Peek, researcher tier with Excel exports, sponsored topics

Secrets, API keys, and anti-abuse thresholds live in environment settings, never in this repository.
