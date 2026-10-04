-- Tasweet initial schema: the eight core tables from Product Spec v1.
-- Row-level security enforces one vote per user per topic and keeps
-- individual votes private. Only aggregates are ever public.

create extension if not exists citext;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('voter', 'moderator', 'researcher');
create type public.topic_status as enum ('pending', 'open', 'closed', 'archived', 'rejected');
create type public.topic_category as enum (
  'social', 'entertainment', 'gaming', 'sports', 'economy', 'technology', 'other'
);
create type public.vote_choice as enum ('a', 'b');
create type public.moderator_decision as enum ('approved', 'edited_approved', 'rejected');
create type public.age_band as enum ('18-24', '25-34', '35-44', '45-54', '55+');
create type public.gender as enum ('male', 'female');
create type public.subscription_plan as enum ('peek', 'researcher');
create type public.subscription_status as enum ('active', 'past_due', 'canceled');

-- ---------------------------------------------------------------------------
-- users: app-side record for each Supabase Auth user
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  auth_provider text,
  email citext,
  created_at timestamptz not null default now(),
  trust_score smallint not null default 0 check (trust_score between 0 and 100),
  role public.user_role not null default 'voter'
);

-- Mirror new auth users into public.users.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, auth_provider, email)
  values (new.id, new.raw_app_meta_data ->> 'provider', new.email);
  insert into public.profiles (user_id) values (new.id);
  return new;
end;
$$;

-- Role checks used by policies. Security definer so they can read users
-- without recursing through its own RLS.
create function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'moderator'
  );
$$;

-- ---------------------------------------------------------------------------
-- profiles: optional, self-reported only
-- ---------------------------------------------------------------------------
create table public.profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  age_band public.age_band,
  region text,
  city text,
  gender public.gender,
  language text not null default 'ar' check (language in ('ar', 'en')),
  consent_data boolean not null default false,
  consent_ad_cookies boolean not null default false,
  consented_at timestamptz,
  updated_at timestamptz not null default now()
);

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- topics
-- ---------------------------------------------------------------------------
create table public.topics (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  question_ar text not null,
  question_en text,
  description_ar text,
  description_en text,
  option_a_ar text not null,
  option_a_en text,
  option_b_ar text not null,
  option_b_en text,
  category public.topic_category not null default 'other',
  status public.topic_status not null default 'pending',
  opens_at timestamptz,
  closes_at timestamptz,
  is_sponsored boolean not null default false,
  submitted_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  check (closes_at is null or opens_at is null or closes_at > opens_at)
);

create index topics_status_opens_at_idx on public.topics (status, opens_at desc);
create index topics_category_idx on public.topics (category);

-- ---------------------------------------------------------------------------
-- submissions: moderation log
-- ---------------------------------------------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete cascade,
  ai_screening jsonb,
  moderator_decision public.moderator_decision,
  reason text,
  reviewed_by uuid references public.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (moderator_decision <> 'rejected' or reason is not null)
);

create index submissions_topic_id_idx on public.submissions (topic_id);

-- ---------------------------------------------------------------------------
-- votes: one per user per topic; never readable by anyone but the voter
-- ---------------------------------------------------------------------------
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  topic_id uuid not null references public.topics (id) on delete cascade,
  choice public.vote_choice not null,
  guess_pct_a smallint check (guess_pct_a between 0 and 100),
  reason_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  changed_at timestamptz,
  -- Set server-side from the trust score; only counted votes enter results.
  counted boolean not null default false,
  unique (user_id, topic_id)
);

create index votes_topic_id_idx on public.votes (topic_id);

-- ---------------------------------------------------------------------------
-- vote_signals: short-lived verification data, deleted after checks
-- ---------------------------------------------------------------------------
create table public.vote_signals (
  vote_id uuid primary key references public.votes (id) on delete cascade,
  ip_country char(2),
  is_vpn boolean,
  location_check boolean,
  timezone_match boolean,
  fingerprint_hash text,
  created_at timestamptz not null default now()
);

create index vote_signals_created_at_idx on public.vote_signals (created_at);

-- ---------------------------------------------------------------------------
-- topic_stats: hourly precomputed aggregates of verified votes
-- ---------------------------------------------------------------------------
create table public.topic_stats (
  topic_id uuid not null references public.topics (id) on delete cascade,
  hour timestamptz not null,
  verified_a integer not null default 0,
  verified_b integer not null default 0,
  -- e.g. {"age": {"18-24": {"a": 10, "b": 4}}, "region": {...}, "gender": {...}}
  breakdowns jsonb not null default '{}',
  primary key (topic_id, hour)
);

-- ---------------------------------------------------------------------------
-- subscriptions: added in the monetization phase
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  plan public.subscription_plan not null,
  status public.subscription_status not null default 'active',
  payment_reference text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);

-- ---------------------------------------------------------------------------
-- Row-level security
-- Writes that affect trust, counting, moderation, or aggregates go through
-- the service role on the server, which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.submissions enable row level security;
alter table public.votes enable row level security;
alter table public.vote_signals enable row level security;
alter table public.topic_stats enable row level security;
alter table public.subscriptions enable row level security;

-- users: read your own record only. No client writes (role and trust are server-set).
create policy "users read own" on public.users
  for select to authenticated using (id = (select auth.uid()));

-- profiles: read and edit your own.
create policy "profiles read own" on public.profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "profiles update own" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- topics: live topics are public; submitters see their own; moderators see all.
create policy "topics public read" on public.topics
  for select to anon, authenticated
  using (status in ('open', 'closed', 'archived'));
create policy "topics read own submissions" on public.topics
  for select to authenticated using (submitted_by = (select auth.uid()));
create policy "topics moderators read all" on public.topics
  for select to authenticated using ((select public.is_moderator()));
create policy "topics submit" on public.topics
  for insert to authenticated
  with check (
    submitted_by = (select auth.uid())
    and status = 'pending'
    and is_sponsored = false
  );
create policy "topics moderators update" on public.topics
  for update to authenticated
  using ((select public.is_moderator()))
  with check ((select public.is_moderator()));

-- submissions: submitters see the decision and reason on their own topics.
create policy "submissions read own" on public.submissions
  for select to authenticated
  using (exists (
    select 1 from public.topics t
    where t.id = topic_id and t.submitted_by = (select auth.uid())
  ));
create policy "submissions moderators all" on public.submissions
  for all to authenticated
  using ((select public.is_moderator()))
  with check ((select public.is_moderator()));

-- votes: a voter can see and cast only their own vote, on open topics.
create policy "votes read own" on public.votes
  for select to authenticated using (user_id = (select auth.uid()));
create policy "votes insert own on open topic" on public.votes
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.topics t where t.id = topic_id and t.status = 'open')
  );
create policy "votes update own on open topic" on public.votes
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.topics t where t.id = topic_id and t.status = 'open')
  );

-- Clients may only write these vote columns; `counted` stays server-controlled.
revoke insert, update on public.votes from anon, authenticated;
grant insert (topic_id, user_id, choice, guess_pct_a, reason_tags) on public.votes to authenticated;
grant update (choice, reason_tags, changed_at) on public.votes to authenticated;

-- vote_signals: service role only (no policies).

-- topic_stats: aggregates for live topics are public. Breakdown suppression
-- below the minimum vote count is applied when stats are computed.
create policy "topic_stats public read" on public.topic_stats
  for select to anon, authenticated
  using (exists (
    select 1 from public.topics t
    where t.id = topic_id and t.status in ('open', 'closed', 'archived')
  ));

-- subscriptions: read your own.
create policy "subscriptions read own" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));
