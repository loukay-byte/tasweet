-- Verification signals are deleted after the retention period.
begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c1', 'signals@test.local');
insert into public.topics (id, slug, question_ar, option_a_ar, option_b_ar, status) values
  ('00000000-0000-0000-0000-0000000002a1', 'signals-topic', 'سؤال؟', 'أ', 'ب', 'open');
insert into public.votes (id, user_id, topic_id, choice) values
  ('00000000-0000-0000-0000-0000000002b1', '00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000002a1', 'a');

insert into public.topics (id, slug, question_ar, option_a_ar, option_b_ar, status) values
  ('00000000-0000-0000-0000-0000000002a2', 'signals-topic-2', 'سؤال؟', 'أ', 'ب', 'open');
insert into public.votes (id, user_id, topic_id, choice) values
  ('00000000-0000-0000-0000-0000000002b2', '00000000-0000-0000-0000-0000000000c1', '00000000-0000-0000-0000-0000000002a2', 'b');

insert into public.vote_signals (vote_id, ip_country, fingerprint_hash, created_at) values
  ('00000000-0000-0000-0000-0000000002b1', 'SA', 'old-hash', now() - interval '8 days'),
  ('00000000-0000-0000-0000-0000000002b2', 'SA', 'new-hash', now() - interval '1 day');

select is(private.purge_vote_signals(), 1, 'signals older than 7 days are deleted');
select is(
  (select fingerprint_hash from public.vote_signals), 'new-hash',
  'recent signals are kept');
select is(
  (select count(*)::int from public.votes where id = '00000000-0000-0000-0000-0000000002b1'), 1,
  'the vote itself is kept');
select is(
  (select schedule from cron.job where jobname = 'purge-vote-signals'), '17 * * * *',
  'the purge runs hourly');

select * from finish();
rollback;
