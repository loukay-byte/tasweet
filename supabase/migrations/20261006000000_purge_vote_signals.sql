-- Verification signals (IP country, VPN flag, location check, fingerprint
-- hash) are personal data kept only long enough to check a vote. Delete them
-- automatically. Retention is tunable:
--   insert into private.settings values ('vote_signal_retention_days', '3')
--   on conflict (key) do update set value = excluded.value;

create extension if not exists pg_cron;

create function private.purge_vote_signals()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deleted integer;
begin
  delete from public.vote_signals
  where created_at < now() - make_interval(days => private.setting('vote_signal_retention_days', 7)::int);
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function private.purge_vote_signals() from public;

-- Hourly, at a minute past the hour that avoids the busy :00 slot.
select cron.schedule('purge-vote-signals', '17 * * * *', $$select private.purge_vote_signals()$$);
