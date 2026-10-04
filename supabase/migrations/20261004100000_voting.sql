-- Phase 2: topics and voting.
--
-- All vote writes go through security-definer functions, which enforce the
-- rules (open topic, change cooldown, counted flag) in one place. Clients can
-- no longer write to public.votes directly. Results are exposed only as
-- aggregates, and only to people who have voted while a topic is open.

-- ---------------------------------------------------------------------------
-- Question of the Day
-- ---------------------------------------------------------------------------
alter table public.topics add column featured_on date unique;

-- ---------------------------------------------------------------------------
-- Private settings: tunable values kept out of the public repository.
-- Defaults live in public.setting() calls; production overrides go here.
--   insert into private.settings values ('vote_change_cooldown_minutes', '30')
--   on conflict (key) do update set value = excluded.value;
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.settings (
  key text primary key,
  value text not null
);

create function private.setting(p_key text, p_default numeric)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select value::numeric from private.settings where key = p_key),
    p_default
  );
$$;

-- ---------------------------------------------------------------------------
-- Whether a user's votes count in official results. Phase 3 fills in trust
-- scores; until then every account meets the default threshold of 0.
-- ---------------------------------------------------------------------------
create function private.vote_is_counted(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select u.trust_score >= private.setting('min_trust_score', 0)
     from public.users u where u.id = p_user_id),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- Votes: replace direct client writes with functions.
-- ---------------------------------------------------------------------------
drop policy "votes insert own on open topic" on public.votes;
drop policy "votes update own on open topic" on public.votes;
revoke insert, update, delete on public.votes from anon, authenticated;

alter table public.votes
  add constraint votes_reason_tags_allowed check (
    reason_tags <@ array['cost', 'culture', 'safety', 'quality', 'convenience', 'experience']
  );

create function private.topic_is_open(t public.topics)
returns boolean
language sql
stable
set search_path = ''
as $$
  select t.status = 'open'
    and (t.opens_at is null or t.opens_at <= now())
    and (t.closes_at is null or t.closes_at > now());
$$;

-- Cast or change a vote. Returns the caller's vote.
create function public.cast_vote(p_topic_id uuid, p_choice public.vote_choice)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_topic public.topics;
  v_vote public.votes;
  v_cooldown interval :=
    make_interval(mins => private.setting('vote_change_cooldown_minutes', 10)::int);
begin
  if v_user is null then
    raise exception 'not_signed_in' using errcode = 'P0001';
  end if;

  select * into v_topic from public.topics where id = p_topic_id;
  if not found or not private.topic_is_open(v_topic) then
    raise exception 'topic_not_open' using errcode = 'P0001';
  end if;

  select * into v_vote from public.votes
  where user_id = v_user and topic_id = p_topic_id
  for update;

  if not found then
    insert into public.votes (user_id, topic_id, choice, counted)
    values (v_user, p_topic_id, p_choice, private.vote_is_counted(v_user))
    returning * into v_vote;
  elsif v_vote.choice <> p_choice then
    if coalesce(v_vote.changed_at, v_vote.created_at) + v_cooldown > now() then
      raise exception 'change_cooldown' using errcode = 'P0001',
        detail = (coalesce(v_vote.changed_at, v_vote.created_at) + v_cooldown)::text;
    end if;
    update public.votes
    set choice = p_choice,
        changed_at = now(),
        counted = private.vote_is_counted(v_user)
    where id = v_vote.id
    returning * into v_vote;
  end if;

  return jsonb_build_object(
    'choice', v_vote.choice,
    'guess_pct_a', v_vote.guess_pct_a,
    'reason_tags', to_jsonb(v_vote.reason_tags),
    'can_change_at', coalesce(v_vote.changed_at, v_vote.created_at) + v_cooldown
  );
end;
$$;

-- Record the "what % chose A?" guess (once) and optional reason tags.
create function public.submit_guess(
  p_topic_id uuid,
  p_guess_pct_a smallint,
  p_reason_tags text[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'not_signed_in' using errcode = 'P0001';
  end if;

  update public.votes
  set guess_pct_a = coalesce(guess_pct_a, p_guess_pct_a),
      reason_tags = coalesce(p_reason_tags, '{}')
  where user_id = v_user and topic_id = p_topic_id;

  if not found then
    raise exception 'no_vote' using errcode = 'P0001';
  end if;
end;
$$;

-- Aggregate results for a topic, plus the caller's own vote.
-- The split is hidden on open topics until the caller has voted.
create function public.topic_results(p_topic_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_topic public.topics;
  v_vote public.votes;
  v_a bigint;
  v_b bigint;
  v_visible boolean;
  v_cooldown interval :=
    make_interval(mins => private.setting('vote_change_cooldown_minutes', 10)::int);
begin
  select * into v_topic from public.topics
  where id = p_topic_id and status in ('open', 'closed', 'archived');
  if not found then
    return null;
  end if;

  if v_user is not null then
    select * into v_vote from public.votes
    where user_id = v_user and topic_id = p_topic_id;
  end if;

  select count(*) filter (where choice = 'a'), count(*) filter (where choice = 'b')
  into v_a, v_b
  from public.votes
  where topic_id = p_topic_id and counted;

  v_visible := v_vote.id is not null or not private.topic_is_open(v_topic);

  return jsonb_build_object(
    'is_open', private.topic_is_open(v_topic),
    'total', v_a + v_b,
    'a', case when v_visible then v_a end,
    'b', case when v_visible then v_b end,
    'my_vote', case when v_vote.id is null then null else jsonb_build_object(
      'choice', v_vote.choice,
      'guess_pct_a', v_vote.guess_pct_a,
      'reason_tags', to_jsonb(v_vote.reason_tags),
      'can_change_at', coalesce(v_vote.changed_at, v_vote.created_at) + v_cooldown
    ) end
  );
end;
$$;

-- People who voted or changed a vote in the last 15 minutes.
create function public.voting_now()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(distinct user_id)
  from public.votes
  where greatest(created_at, changed_at) > now() - interval '15 minutes';
$$;

-- Open topics ranked by counted votes in the last 24 hours.
create function public.trending_topics(p_limit int default 10)
returns table (topic_id uuid, recent_votes bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select t.id, count(v.id) as recent_votes
  from public.topics t
  left join public.votes v
    on v.topic_id = t.id
   and v.counted
   and v.created_at > now() - interval '24 hours'
  where private.topic_is_open(t)
  group by t.id
  order by recent_votes desc, t.opens_at desc nulls last, t.created_at desc
  limit least(greatest(p_limit, 1), 50);
$$;

-- Function access. Supabase grants EXECUTE to anon and authenticated by
-- default, so restrict the ones that need a signed-in user.
revoke execute on function public.cast_vote(uuid, public.vote_choice) from public, anon;
revoke execute on function public.submit_guess(uuid, smallint, text[]) from public, anon;
grant execute on function public.cast_vote(uuid, public.vote_choice) to authenticated;
grant execute on function public.submit_guess(uuid, smallint, text[]) to authenticated;
grant execute on function public.topic_results(uuid) to anon, authenticated;
grant execute on function public.voting_now() to anon, authenticated;
grant execute on function public.trending_topics(int) to anon, authenticated;
