# How voting works (Phase 2)

## Flow

1. A visitor opens a topic page (`/ar/t/<slug>`). The page is public and cached for 60 seconds, so search engines can index it.
2. On an open topic they see the two options and the total vote count, but **not the split** until they vote. (Seeing results without voting is the planned paid "Peek" feature.)
3. They tap an option, or swipe the card toward it. Option A is on the start side: right in Arabic, left in English.
4. On their first vote they get an anonymous Supabase session. Phase 3 replaces this with Google, Apple, or email sign-in.
5. Before seeing results they guess what percentage chose option A, and can pick optional reason tags. Both can be skipped.
6. Results update every 5 seconds while on screen. Their guess is compared to the actual result.
7. They can change their vote for free, after a cooldown (10 minutes by default).

Closed and archived topics show final results to everyone.

## Where the rules live

All rules are enforced in the database (`supabase/migrations/20261004100000_voting.sql`), not in the browser:

| Function | Who can call it | What it does |
| --- | --- | --- |
| `cast_vote(topic, choice)` | signed-in users | Casts or changes a vote. Rejects closed topics and changes inside the cooldown. Sets `counted`. |
| `submit_guess(topic, guess, tags)` | signed-in users | Saves the first guess (later guesses are ignored) and the reason tags. |
| `topic_results(topic)` | anyone | Total count, plus the A/B split only if the caller voted or the topic is closed. Counts only `counted` votes. |
| `voting_now()` | anyone | Distinct voters in the last 15 minutes. |
| `trending_topics(limit)` | anyone | Open topics ranked by counted votes in the last 24 hours. |

Clients cannot insert or update `votes` directly, and can never read anyone else's vote.

## Settings

Stored in `private.settings` (not readable through the API). Change them in the Supabase SQL editor:

```sql
insert into private.settings (key, value) values ('vote_change_cooldown_minutes', '30')
on conflict (key) do update set value = excluded.value;
```

| Key | Default | Meaning |
| --- | --- | --- |
| `vote_change_cooldown_minutes` | 10 | Wait before a vote can be changed again |
| `min_trust_score` | 0 | Trust score a voter needs for their votes to count. Phase 3 raises this once trust scoring exists. |

## Known gaps until Phase 3

- **Anyone can vote many times** by clearing cookies, because sessions are anonymous and there are no trust signals yet. Phase 3 adds sign-in, geo checks, device fingerprinting, and trust scores. Do not launch publicly before then.
- Every vote counts (`min_trust_score` is 0).
- No Question of the Day admin screen yet. Set it in SQL: `update topics set featured_on = '2026-10-05' where slug = '...';`
