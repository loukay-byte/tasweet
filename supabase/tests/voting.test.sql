-- Voting rules. Run with: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(19);

-- Fixtures ------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'voter1@test.local'),
  ('00000000-0000-0000-0000-0000000000a2', 'voter2@test.local');

insert into public.topics (id, slug, question_ar, option_a_ar, option_b_ar, status, closes_at) values
  ('00000000-0000-0000-0000-00000000000f', 'test-open', 'س', 'أ', 'ب', 'open', null),
  ('00000000-0000-0000-0000-0000000000c1', 'test-pending', 'س', 'أ', 'ب', 'pending', null),
  ('00000000-0000-0000-0000-0000000000c2', 'test-expired', 'س', 'أ', 'ب', 'open', now() - interval '1 minute');

create function pg_temp.login(p_user uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
$$;

-- Anonymous visitors ----------------------------------------------------------
set local role anon;
select throws_ok(
  $$ select public.cast_vote('00000000-0000-0000-0000-00000000000f', 'a') $$,
  '42501', null, 'anon cannot call cast_vote');
select is(
  (public.topic_results('00000000-0000-0000-0000-00000000000f') ->> 'total')::int, 0,
  'anon sees the total vote count');
select is(
  public.topic_results('00000000-0000-0000-0000-0000000000c1'), null,
  'pending topics have no public results');
select is_empty($$ select * from public.votes $$, 'anon cannot read votes');
reset role;

-- Voter 1 ----------------------------------------------------------------------
select pg_temp.login('00000000-0000-0000-0000-0000000000a1');

select is(
  public.topic_results('00000000-0000-0000-0000-00000000000f') ->> 'a', null,
  'split is hidden before voting on an open topic');
select is(
  public.cast_vote('00000000-0000-0000-0000-00000000000f', 'a') ->> 'choice', 'a',
  'voter can cast a vote');
select is(
  (public.topic_results('00000000-0000-0000-0000-00000000000f') ->> 'a')::int, 1,
  'split is visible after voting');
select throws_ok(
  $$ select public.cast_vote('00000000-0000-0000-0000-00000000000f', 'b') $$,
  'P0001', 'change_cooldown', 'changing a vote within the cooldown fails');
select is(
  public.cast_vote('00000000-0000-0000-0000-00000000000f', 'a') ->> 'choice', 'a',
  're-casting the same choice is a no-op');
select throws_ok(
  $$ select public.cast_vote('00000000-0000-0000-0000-0000000000c1', 'a') $$,
  'P0001', 'topic_not_open', 'cannot vote on a pending topic');
select throws_ok(
  $$ select public.cast_vote('00000000-0000-0000-0000-0000000000c2', 'a') $$,
  'P0001', 'topic_not_open', 'cannot vote after closes_at');
select throws_ok(
  $$ insert into public.votes (user_id, topic_id, choice, counted)
     values ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-0000000000c1', 'a', true) $$,
  '42501', null, 'direct inserts into votes are blocked');
select throws_ok(
  $$ update public.votes set counted = true $$,
  '42501', null, 'direct updates to votes are blocked');

select lives_ok(
  $$ select public.submit_guess('00000000-0000-0000-0000-00000000000f', 70::smallint, array['cost']) $$,
  'voter can submit a guess and reason tags');
select lives_ok(
  $$ select public.submit_guess('00000000-0000-0000-0000-00000000000f', 10::smallint, array['safety']) $$,
  'submitting again succeeds');
select is(
  public.topic_results('00000000-0000-0000-0000-00000000000f') -> 'my_vote' ->> 'guess_pct_a', '70',
  'the first guess is kept');
select throws_ok(
  $$ select public.submit_guess('00000000-0000-0000-0000-00000000000f', 50::smallint, array['made-up']) $$,
  '23514', null, 'unknown reason tags are rejected');
reset role;

-- Voter 2 ----------------------------------------------------------------------
select pg_temp.login('00000000-0000-0000-0000-0000000000a2');
select is_empty($$ select * from public.votes $$, 'voters cannot see other people''s votes');
reset role;

-- Cooldown expiry ----------------------------------------------------------------
update public.votes set created_at = now() - interval '1 day'
where user_id = '00000000-0000-0000-0000-0000000000a1';
select pg_temp.login('00000000-0000-0000-0000-0000000000a1');
select is(
  public.cast_vote('00000000-0000-0000-0000-00000000000f', 'b') ->> 'choice', 'b',
  'vote can change after the cooldown');
reset role;

select * from finish();
rollback;
