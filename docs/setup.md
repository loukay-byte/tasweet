# Phase 1 setup: Supabase, Vercel, Cloudflare

All three run on free tiers. Do them in this order.

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com). Pick a region close to KSA (e.g. `eu-central-1` Frankfurt or `me-central-1` if offered).
2. Apply the schema, using either option:
   - **CLI:** `npx supabase login`, `npx supabase link --project-ref <ref>`, `npx supabase db push`
   - **Dashboard:** open SQL Editor, paste `supabase/migrations/20261004000000_initial_schema.sql`, run it.
3. From **Project Settings → API**, copy the project URL and the `anon` public key into `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
   Never put the `service_role` key in a `NEXT_PUBLIC_` variable or commit it.
4. Under **Authentication → Sign In / Providers**, turn on **Allow anonymous sign-ins**. Phase 2 gives each voter an anonymous session on their first vote; Phase 3 adds Google, Apple, and email sign-in. Also enable CAPTCHA protection with Cloudflare Turnstile there before any public launch.
5. Run `npm run dev` and open `/api/health`. It should return `{"ok":true,"supabase":"connected"}`.

Do not run `supabase/seed.sql` against production; it contains sample topics and fake users for local development.

To make yourself a moderator after signing up (Phase 3+), run in SQL Editor:
```sql
update public.users set role = 'moderator' where email = 'you@example.com';
```

## 2. Vercel

1. Import the GitHub repository at [vercel.com/new](https://vercel.com/new). The framework is detected as Next.js; no build settings need changing.
2. Under **Settings → Environment Variables**, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Production and Preview.
3. Deploy, then check `https://<project>.vercel.app/api/health`.
4. Under **Settings → Domains**, add `tasweet.com` (or the chosen domain) and `www`.

## 3. Cloudflare

1. Add the domain to Cloudflare (free plan) and switch the registrar's nameservers to Cloudflare's.
2. **DNS:** point the domain at Vercel as Vercel's domain screen instructs (`A 76.76.21.21` for the apex, `CNAME cname.vercel-dns.com` for `www`), with the proxy (orange cloud) **on**.
3. **SSL/TLS:** set encryption mode to **Full (strict)**.
4. **Security → WAF → Custom rules**, to block non-KSA traffic:
   - Expression: `(ip.src.country ne "SA" and not cf.client.bot and not starts_with(http.request.uri.path, "/api/health"))`
   - Action: **Block**

   `cf.client.bot` keeps verified search-engine crawlers allowed, so topic pages can be indexed.
5. **Security → WAF → Rate limiting rules**: add one rule for `/api/*` (e.g. 60 requests per minute per IP, action Block for 1 minute). Tune it once real traffic exists; keep exact values private.
6. **Turnstile:** create a widget now for the domain and keep the site and secret keys. It is wired into sign-up in Phase 3.

### Note on Vercel behind Cloudflare

Vercel recommends against proxying through Cloudflare because it can interfere with Vercel's own edge caching. Tasweet needs the Cloudflare country block, so keep the proxy on. If you see caching or certificate issues, check that SSL mode is Full (strict) and that Cloudflare caching is not overriding Vercel's `Cache-Control` headers.
