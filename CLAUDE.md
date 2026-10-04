@AGENTS.md

# Tasweet project notes

- Arabic is the default locale and is right-to-left. Every user-facing string goes in both `src/i18n/dictionaries/ar.json` and `en.json`. Use logical Tailwind utilities (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) rather than `left`/`right`, so layouts mirror correctly.
- Individual votes are private. Only aggregates from verified (`counted`) votes may be shown, and breakdowns only above the minimum vote count.
- No paid feature may change a vote or a result.
- Writes that affect trust, counting, moderation, or aggregates run server-side with the service role. Never expose the service role key to the client.
- Schema changes go in a new file under `supabase/migrations/`; never edit an applied migration.
- Anti-abuse thresholds are private environment settings, never committed.
