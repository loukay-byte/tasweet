-- Topic suggestions, Arabic-aware search, and batch results for closed topics.

-- ---------------------------------------------------------------------------
-- Topics can be suggested in either language. Arabic is required before a
-- topic goes live; moderators add the translation during review.
-- ---------------------------------------------------------------------------
alter table public.topics
  alter column question_ar drop not null,
  alter column option_a_ar drop not null,
  alter column option_b_ar drop not null,
  add constraint topics_has_text check (
    coalesce(question_ar, question_en) is not null
    and coalesce(option_a_ar, option_a_en) is not null
    and coalesce(option_b_ar, option_b_en) is not null
  ),
  add constraint topics_live_needs_arabic check (
    status in ('pending', 'rejected')
    or (question_ar is not null and option_a_ar is not null and option_b_ar is not null)
  );

-- Suggestions go through submit_topic() only.
drop policy "topics submit" on public.topics;
revoke insert on public.topics from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Search. Arabic text is normalized so spelling variants match:
-- أ إ آ ٱ → ا, ى → ي, ة → ه, and diacritics and tatweel are removed.
-- ---------------------------------------------------------------------------
create extension if not exists pg_trgm with schema extensions;

create function private.normalize_search(p_text text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(regexp_replace(
    translate(coalesce(p_text, ''), 'أإآٱىةـ', 'اااايه'),
    '[ً-ٰٟ]', '', 'g'
  ));
$$;

alter table public.topics add column search_text text generated always as (
  private.normalize_search(
    coalesce(question_ar, '') || ' ' || coalesce(question_en, '') || ' ' ||
    coalesce(option_a_ar, '') || ' ' || coalesce(option_a_en, '') || ' ' ||
    coalesce(option_b_ar, '') || ' ' || coalesce(option_b_en, '') || ' ' ||
    coalesce(description_ar, '') || ' ' || coalesce(description_en, '')
  )
) stored;

create index topics_search_text_trgm_idx
  on public.topics using gin (search_text extensions.gin_trgm_ops);

-- Public topics matching every word of the query, optionally in one category.
-- Security definer so it can use private.normalize_search; it only ever
-- returns live, closed, or archived topics, the same rows anyone can read.
create function public.search_topics(
  p_query text default '',
  p_category public.topic_category default null,
  p_limit int default 30
)
returns setof public.topics
language sql
stable
security definer
set search_path = ''
as $$
  with words as (
    select replace(replace(replace(w, '\', '\\'), '%', '\%'), '_', '\_') as w
    from unnest(regexp_split_to_array(private.normalize_search(trim(p_query)), '\s+')) as w
    where w <> ''
  )
  select t.*
  from public.topics t
  where t.status in ('open', 'closed', 'archived')
    and (p_category is null or t.category = p_category)
    and not exists (select 1 from words where t.search_text not like '%' || words.w || '%')
  order by (t.status = 'open') desc, coalesce(t.opens_at, t.created_at) desc
  limit least(greatest(p_limit, 1), 50);
$$;

grant execute on function public.search_topics(text, public.topic_category, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Final results for several closed or archived topics at once (for lists).
-- Open topics are skipped, so this never reveals a live split.
-- ---------------------------------------------------------------------------
create function public.closed_results(p_topic_ids uuid[])
returns table (topic_id uuid, a bigint, b bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select t.id,
         count(v.id) filter (where v.choice = 'a'),
         count(v.id) filter (where v.choice = 'b')
  from public.topics t
  left join public.votes v on v.topic_id = t.id and v.counted
  where t.id = any (p_topic_ids[1:50])
    and t.status in ('closed', 'archived')
  group by t.id;
$$;

grant execute on function public.closed_results(uuid[]) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Suggest a topic. Creates a pending topic and a moderation log entry.
-- ---------------------------------------------------------------------------
create function public.submit_topic(
  p_lang text,
  p_question text,
  p_option_a text,
  p_option_b text,
  p_category public.topic_category,
  p_description text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_question text := nullif(trim(p_question), '');
  v_a text := nullif(trim(p_option_a), '');
  v_b text := nullif(trim(p_option_b), '');
  v_description text := nullif(trim(p_description), '');
  v_ar boolean := p_lang = 'ar';
  v_topic_id uuid;
begin
  if v_user is null then
    raise exception 'not_signed_in' using errcode = 'P0001';
  end if;
  if p_lang not in ('ar', 'en') then
    raise exception 'invalid_language' using errcode = 'P0001';
  end if;
  if v_question is null or char_length(v_question) not between 10 and 200 then
    raise exception 'invalid_question' using errcode = 'P0001';
  end if;
  if v_a is null or v_b is null
     or char_length(v_a) > 60 or char_length(v_b) > 60
     or private.normalize_search(v_a) = private.normalize_search(v_b) then
    raise exception 'invalid_options' using errcode = 'P0001';
  end if;
  if char_length(coalesce(v_description, '')) > 500 then
    raise exception 'invalid_description' using errcode = 'P0001';
  end if;

  if (select count(*) from public.topics
      where submitted_by = v_user and status = 'pending')
     >= private.setting('max_pending_submissions', 3) then
    raise exception 'too_many_pending' using errcode = 'P0001';
  end if;

  insert into public.topics (
    slug, category, status, submitted_by,
    question_ar, option_a_ar, option_b_ar, description_ar,
    question_en, option_a_en, option_b_en, description_en
  ) values (
    's-' || substr(md5(gen_random_uuid()::text), 1, 10), p_category, 'pending', v_user,
    case when v_ar then v_question end, case when v_ar then v_a end,
    case when v_ar then v_b end, case when v_ar then v_description end,
    case when not v_ar then v_question end, case when not v_ar then v_a end,
    case when not v_ar then v_b end, case when not v_ar then v_description end
  )
  returning id into v_topic_id;

  insert into public.submissions (topic_id) values (v_topic_id);

  return jsonb_build_object('topic_id', v_topic_id);
end;
$$;

revoke execute on function public.submit_topic(text, text, text, text, public.topic_category, text) from public, anon;
grant execute on function public.submit_topic(text, text, text, text, public.topic_category, text) to authenticated;
