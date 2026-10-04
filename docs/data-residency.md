# Data residency and the PDPL

Status: **open question for legal counsel before any real users.** This page records what Sotak collects, where it goes, and the plan if data must stay in Saudi Arabia. It is not legal advice; the PDPL and its regulations have been amended since they were issued, so confirm against the current text.

## When this matters

The Personal Data Protection Law applies as soon as the service processes personal data of people in the Kingdom, **whether or not it earns money**. Development with sample data (`supabase/seed.sql`) involves no personal data. The first real sign-up or vote does.

## What we collect and where it goes

| Data | Stored in | Notes |
| --- | --- | --- |
| Account email, sign-in provider | Supabase (`auth.users`, `public.users`) | Managed by Supabase Auth |
| Profile: age band, region, city, gender | Supabase (`public.profiles`) | Optional, self-reported |
| Votes, guesses, reason tags | Supabase (`public.votes`) | Linked to a user ID: pseudonymous, not anonymous. Only aggregates are shown or shared |
| Verification signals: IP country, VPN flag, location yes/no, fingerprint hash | Supabase (`public.vote_signals`) | Deleted automatically after 7 days (`private.purge_vote_signals`, hourly) |
| IP addresses, request logs | Cloudflare, Vercel, Supabase logs | Kept by each provider for their log retention period |
| Suggested topic text | Anthropic (Claude API, Phase 4) | Screening only; never send user identities with it |
| Ad cookies, device data | Google AdSense (Phase 6) | Only after consent |

All three hosting providers process data outside the Kingdom.

## Data minimisation (in place or planned)

- Store "inside Saudi Arabia: yes/no", never raw coordinates or full IP addresses.
- Delete verification signals after a short retention period (done).
- Keep profile fields optional; never infer them.
- Publish aggregates only, with breakdowns above a minimum vote count.

## Questions for counsel

1. Can personal data be stored and processed by Supabase, Vercel, and Cloudflare outside the Kingdom under the transfer regulation, for example with SDAIA's standard contractual clauses and a transfer risk assessment? Or should it stay in the Kingdom?
2. Do votes on social and lifestyle topics count as **sensitive data** (the law's sensitive category includes intellectual belief)? The topic policy already excludes political and religious topics.
3. Does Sotak need to register with SDAIA as a data controller, or appoint a data protection officer?
4. What must the privacy policy and consent screen contain for ad cookies and device fingerprinting?
5. Does any of this change once the service earns ad revenue, or under the Tasweet/Sotak business entity (freelance licence or CR)?

## If data must stay in the Kingdom

The app uses only standard Supabase features (Auth, including anonymous sign-in; Postgres; database functions), so it can move to **self-hosted Supabase** without code changes: point `NEXT_PUBLIC_SUPABASE_URL` and the anon key at the new instance.

**Free option: Oracle Cloud Always Free in Jeddah or Riyadh.**

1. Create an Oracle Cloud account and choose **Jeddah** or **Riyadh** as the home region (Always Free resources live in the home region).
2. Create an Ampere A1 instance (up to 4 OCPUs, 24 GB RAM on Always Free) with Ubuntu. Free A1 capacity is sometimes unavailable; retry or pick the other region.
3. Install Docker and run Supabase's self-hosting stack (Supabase docs: Self-Hosting with Docker). Set strong secrets for the JWT, database password, and dashboard.
4. Put Cloudflare in front for TLS and the Saudi-only rule; expose only the API gateway port.
5. Apply the migrations: `npx supabase db push --db-url postgres://...`.
6. Set up backups yourself: a nightly `pg_dump` to Oracle Object Storage, and test a restore.
7. Switch the app's Supabase URL and anon key, redeploy, and run the end-to-end tests against it.

Trade-offs: no managed backups, upgrades, or support; you are responsible for security patches and uptime, and Oracle may reclaim Always Free instances it considers idle. Paid in-Kingdom alternatives include Google Cloud (Dammam), Oracle Cloud paid tiers, and Alibaba Cloud via the Saudi Cloud Computing Company (Riyadh).

Even with the database in the Kingdom, Vercel and Cloudflare still process web requests abroad. Keeping those in the Kingdom too would mean serving the Next.js app from the same server.
