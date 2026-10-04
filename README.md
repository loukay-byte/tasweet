# Tasweet · تصويت

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

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL and anon key
npm run dev                  # http://localhost:3000 → redirects to /ar
```

The app runs without Supabase configured; `/api/health` reports `"supabase": "not_configured"` until it is.

```bash
npm run lint
npm run build
```

## Project layout

```
src/
  app/[lang]/        Pages, one tree per locale (/ar, /en)
  app/api/health/    Deployment and database health check
  i18n/              Locale config and ar/en dictionaries
  lib/supabase/      Browser, server, and proxy Supabase clients
  proxy.ts           Locale redirect + Supabase session refresh
supabase/migrations/ Database schema and RLS policies
docs/                Setup and deployment guides
```

## Build phases

- [x] **1. Foundation:** Next.js, Arabic and English layout, Supabase connected, Vercel + Cloudflare ([setup guide](docs/setup.md))
- [ ] **2. Topics and voting:** topic pages, tap and swipe voting, guess-the-result, live results, homepage, "voting now" counter
- [ ] **3. Accounts and trust:** Google, Apple, and email sign-in; profile; consent; trust signals and score; verified-only results
- [ ] **4. Moderation:** submission form, AI pre-screening, admin dashboard, topic lifecycle, moderation log
- [ ] **5. Growth:** shareable result cards, Public Opinion Case trigger, opinion-over-time charts, streaks, embeddable widget, methodology page
- [ ] **6. Monetization:** AdSense, Peek, researcher tier with Excel exports, sponsored topics

Secrets, API keys, and anti-abuse thresholds live in environment settings, never in this repository.
