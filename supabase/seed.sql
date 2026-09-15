-- Sample/test data for local development only.
-- Run this against your own Supabase project after 0001 + 0002 —
-- replace it with real content via the admin panel once that's built.

with new_pcm as (
  insert into courses (slug, title, category, description, languages, price_paise, original_price_paise, is_published)
  values (
    'pcm-complete',
    'PCM Complete Course',
    'pcm',
    'Physics, Chemistry and Mathematics — built from five years of board paper analysis.',
    array['hi','en']::language_code[],
    149900,
    199900,
    true
  )
  returning id
)
insert into course_subjects (course_id, name, sort_order)
select id, subject, ord
from new_pcm, (values ('Physics', 1), ('Chemistry', 2), ('Mathematics', 3)) as s(subject, ord);

with new_pcb as (
  insert into courses (slug, title, category, description, languages, price_paise, original_price_paise, is_published)
  values (
    'pcb-complete',
    'PCB Complete Course',
    'pcb',
    'Physics, Chemistry and Biology — built from five years of board paper analysis.',
    array['hi','en']::language_code[],
    149900,
    199900,
    true
  )
  returning id
)
insert into course_subjects (course_id, name, sort_order)
select id, subject, ord
from new_pcb, (values ('Physics', 1), ('Chemistry', 2), ('Biology', 3)) as s(subject, ord);

insert into question_papers (category, subject, class, board, year, language, is_free, price_paise, storage_path)
values
  ('pcm', 'Physics', 'Class 12', 'UP Board (UPMSP)', 2025, 'en', true, null, 'question-papers/pcm/physics-2025-en.pdf'),
  ('pcm', 'Mathematics', 'Class 12', 'UP Board (UPMSP)', 2024, 'hi', false, 4900, 'question-papers/pcm/maths-2024-hi.pdf'),
  ('pcb', 'Biology', 'Class 12', 'UP Board (UPMSP)', 2025, 'en', true, null, 'question-papers/pcb/biology-2025-en.pdf'),
  ('pcb', 'Chemistry', 'Class 12', 'UP Board (UPMSP)', 2024, 'hi', false, 4900, 'question-papers/pcb/chemistry-2024-hi.pdf');

insert into announcements (title, description, status, publish_date)
values (
  'SRIT EDU is now open for enrollment',
  'PCM and PCB courses, five-year board paper analysis, and the ₹17,000 scholarship program are now live.',
  'published',
  now()
);
