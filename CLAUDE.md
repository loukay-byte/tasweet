@AGENTS.md

# Sotak (صوتك) project notes

- Arabic is the default locale and is right-to-left. Every user-facing string goes in both `src/i18n/dictionaries/ar.json` and `en.json`. Use logical Tailwind utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) rather than `left`/`right`, so layouts mirror correctly.
- Individual votes are private. Only aggregates from verified (`counted`) votes may be shown, and breakdowns only above the minimum vote count.
- No paid feature may change a vote or a result.
- Writes that affect trust, counting, moderation, or aggregates run server-side: in security-definer database functions (as voting does) or with the service role. Clients never write `votes` directly. Never expose the service role key to the client.
- Schema changes go in a new file under `supabase/migrations/`; never edit an applied migration.
- Anti-abuse thresholds are private environment settings, never committed.
- Tunable values (cooldowns, trust thresholds) live in `private.settings` in the database, with safe defaults in the functions that read them.
- Pluralize counts with `plural()` from `src/i18n/config.ts`; Arabic has six plural forms.
- After a schema change: add a migration, run `npx supabase db reset`, `npm run db:types`, `npm run test:db`, and `npm run test:e2e`.

## Keep hosting portable (Vercel today, possibly Cloudflare later)

- Scheduled jobs run in the database with `pg_cron`, never Vercel Cron.
- Read the visitor's country from Cloudflare's `CF-IPCountry` header, not `x-vercel-ip-country`.
- No Vercel-only services (KV, Blob, Postgres, Edge Config); store data in Supabase.
- Generate share images with Next's built-in `ImageResponse` (`next/og`).
- Use plain pre-sized images; don't rely on `next/image` optimization.
- Use only standard Supabase features, so the database can move to self-hosted Supabase in the Kingdom if required (see `docs/data-residency.md`).

## Privacy

- Collect the minimum: store "inside KSA: yes/no", never raw coordinates or full IPs. Keep profile fields optional.
- Personal data that is only needed briefly gets an automatic deletion job (see `private.purge_vote_signals`).
- The site is locked pre-launch by `SITE_USERNAME` / `SITE_PASSWORD` (see `src/lib/site-lock.ts`); keep new routes behind the proxy.
