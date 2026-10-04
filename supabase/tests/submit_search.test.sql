-- Topic suggestions, search, and closed results. Run with: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000b1', 'suggester@test.local');

insert into public.topics (id, slug, question_ar, question_en, option_a_ar, option_b_ar, status, category) values
  ('00000000-0000-0000-0000-0000000001a1', 'search-hamza', 'هل تفضّل القهوة العربية أم الإسبريسو؟', 'Arabic coffee or espresso?', 'قهوة', 'إسبريسو', 'open', 'social'),
  ('00000000-0000-0000-0000-0000000001a2', 'search-pending', 'موضوع قهوة قيد المراجعة', null, 'أ', 'ب', 'pending', 'social'),
  ('00000000-0000-0000-0000-0000000001a3', 'search-closed', 'هل تحب المدرسة؟', null, 'نعم', 'لا', 'closed', 'other');

insert into public.votes (user_id, topic_id, choice, counted) values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000001a3', 'a', true),
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000001a1', 'b', true);

create function pg_temp.login(p_user uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
$$;

-- Search ---------------------------------------------------------------------
set local role anon;
select is(
  (select count(*)::int from public.search_topics('اسبريسو')), 1,
  'hamza-less query matches إسبريسو');
select is(
  (select count(*)::int from public.search_topics('تفضل القهوه')), 1,
  'no shadda and ه for ة still match تفضّل القهوة');
select is(
  (select count(*)::int from public.search_topics('ESPRESSO')), 1,
  'English search is case-insensitive');
select is(
  (select count(*)::int from public.search_topics('قهوة إسبريسو')), 1,
  'every word must match');
select is(
  (select count(*)::int from public.search_topics('قهوة')), 1,
  'pending topics are never returned');
select is(
  (select count(*)::int from public.search_topics('', 'other')), 1,
  'category filter works with an empty query');
select is(
  (select count(*)::int from public.search_topics('100%')), 0,
  'LIKE wildcards in the query are treated literally');

-- Closed results ---------------------------------------------------------------
select is(
  (select a::int from public.closed_results(array['00000000-0000-0000-0000-0000000001a3'::uuid])), 1,
  'closed topics return their counts');
select is_empty(
  $$ select * from public.closed_results(array['00000000-0000-0000-0000-0000000001a1'::uuid]) $$,
  'open topics never return a split');

-- Suggesting a topic ---------------------------------------------------------------
select throws_ok(
  $$ select public.submit_topic('ar', 'سؤال طويل بما يكفي؟', 'نعم', 'لا', 'social') $$,
  '42501', null, 'anon cannot suggest topics');
select throws_ok(
  $$ insert into public.topics (slug, question_ar, option_a_ar, option_b_ar) values ('x', 'q', 'a', 'b') $$,
  '42501', null, 'anon cannot insert topics directly');
reset role;

select pg_temp.login('00000000-0000-0000-0000-0000000000b1');
select throws_ok(
  $$ select public.submit_topic('ar', 'قصير', 'نعم', 'لا', 'social') $$,
  'P0001', 'invalid_question', 'too-short questions are rejected');
select throws_ok(
  $$ select public.submit_topic('ar', 'سؤال طويل بما يكفي؟', 'نعم', 'نَعم', 'social') $$,
  'P0001', 'invalid_options', 'identical options are rejected');
select lives_ok(
  $$ select public.submit_topic('en', 'Should malls open later on weekends?', 'Yes', 'No', 'economy') $$,
  'a signed-in user can suggest a topic in English');
select is(
  (select status::text || ':' || coalesce(question_ar, '-') from public.topics where question_en = 'Should malls open later on weekends?'),
  'pending:-',
  'the suggestion is pending and stored in its own language');
select is(
  (select count(*)::int from public.submissions s join public.topics t on t.id = s.topic_id
   where t.question_en = 'Should malls open later on weekends?'),
  1, 'a moderation log entry is created');
select lives_ok(
  $$ select public.submit_topic('ar', 'سؤال ثانٍ طويل بما يكفي؟', 'أ', 'ب', 'social'),
            public.submit_topic('ar', 'سؤال ثالث طويل بما يكفي؟', 'أ', 'ب', 'social') $$,
  'up to three pending suggestions are allowed');
select throws_ok(
  $$ select public.submit_topic('ar', 'سؤال رابع طويل بما يكفي؟', 'أ', 'ب', 'social') $$,
  'P0001', 'too_many_pending', 'a fourth pending suggestion is rejected');
reset role;

select * from finish();
rollback;
