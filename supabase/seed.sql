-- Sample topics for local development only. Loaded by `supabase db reset`.
-- Real launch topics are submitted and approved through moderation.

insert into public.topics
  (slug, question_ar, question_en, description_ar, description_en,
   option_a_ar, option_a_en, option_b_ar, option_b_en,
   category, status, opens_at, featured_on)
values
  ('weekend-friday-saturday',
   'هل تفضّل أن تكون عطلة نهاية الأسبوع الجمعة والسبت أم السبت والأحد؟',
   'Would you rather the weekend be Friday–Saturday or Saturday–Sunday?',
   'سؤال عن أيام العطلة الأنسب للعمل والعائلة.',
   'Which weekend days suit work and family life better?',
   'الجمعة والسبت', 'Friday–Saturday', 'السبت والأحد', 'Saturday–Sunday',
   'social', 'open', now() - interval '2 days', current_date),

  ('remote-work-hybrid',
   'هل تفضّل العمل من المكتب أم العمل الهجين؟',
   'Do you prefer working from the office or hybrid work?',
   null, null,
   'من المكتب', 'Office', 'هجين', 'Hybrid',
   'economy', 'open', now() - interval '1 day', null),

  ('cinema-or-streaming',
   'أين تفضّل مشاهدة الأفلام الجديدة؟',
   'Where do you prefer to watch new films?',
   null, null,
   'السينما', 'Cinema', 'منصات البث', 'Streaming',
   'entertainment', 'open', now() - interval '5 hours', null),

  ('esports-in-schools',
   'هل تؤيد إدخال الرياضات الإلكترونية كنشاط مدرسي؟',
   'Should esports be offered as a school activity?',
   null, null,
   'نعم', 'Yes', 'لا', 'No',
   'gaming', 'open', now() - interval '3 hours', null),

  ('summer-football-season',
   'هل يجب أن تتوقف مباريات الدوري في ذروة الصيف؟',
   'Should league matches pause during peak summer?',
   null, null,
   'نعم', 'Yes', 'لا', 'No',
   'sports', 'open', now() - interval '1 hour', null),

  ('cashless-payments',
   'هل ما زلت تحمل نقودًا ورقية؟',
   'Do you still carry cash?',
   null, null,
   'نعم', 'Yes', 'لا', 'No',
   'technology', 'closed', now() - interval '10 days', null);

-- A handful of sample votes on the closed topic so its results render.
insert into auth.users (id, email, raw_app_meta_data)
select gen_random_uuid(), 'seed' || g || '@example.com', '{"provider":"email"}'
from generate_series(1, 12) g;

insert into public.votes (user_id, topic_id, choice, counted)
select u.id, t.id, case when row_number() over () % 3 = 0 then 'a' else 'b' end::public.vote_choice, true
from public.users u
cross join public.topics t
where t.slug = 'cashless-payments' and u.email like 'seed%@example.com';
