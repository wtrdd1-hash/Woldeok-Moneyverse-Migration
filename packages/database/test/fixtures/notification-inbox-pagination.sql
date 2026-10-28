-- Disposable PostgreSQL-only fixture. NEVER run against a shared/live DB.
BEGIN;
CREATE TABLE public.in_app_notifications(
 id uuid PRIMARY KEY, user_id uuid NOT NULL, category text NOT NULL,
 title text NOT NULL, body text NOT NULL, link text,
 dedupe_key text, is_read boolean NOT NULL DEFAULT false,
 read_at timestamptz, created_at timestamptz NOT NULL
);
INSERT INTO public.in_app_notifications(id,user_id,category,title,body,created_at)
SELECT ('00000000-0000-4000-8000-' || lpad(i::text,12,'0'))::uuid,
 '11111111-1111-4111-8111-111111111111'::uuid,
 CASE WHEN i<=55 THEN 'TRANSACTIONAL' ELSE 'SYSTEM' END,
 'synthetic', 'synthetic', '2026-10-28T00:00:00Z'::timestamptz
FROM generate_series(1,60) i;
INSERT INTO public.in_app_notifications(id,user_id,category,title,body,created_at)
SELECT ('00000000-0000-4000-9000-' || lpad(i::text,12,'0'))::uuid,
 '22222222-2222-4222-8222-222222222222'::uuid,
 'TRANSACTIONAL', 'foreign', 'foreign', '2026-10-28T00:00:00Z'::timestamptz
FROM generate_series(1,100) i;
PREPARE notification_owner_list(uuid,text,boolean,int,int) AS
 SELECT id::text, category, title, body, link, dedupe_key, is_read, read_at, created_at
 FROM public.in_app_notifications
 WHERE user_id = $1
   AND ($2::text IS NULL OR category = $2::text)
   AND ($3::boolean IS NULL OR is_read = FALSE)
 ORDER BY created_at DESC, id DESC
 LIMIT $4 OFFSET $5;
DO $$
DECLARE
  v_count int;
  v_top text;
  v_page text;
  v_foreign int;
BEGIN
 SELECT count(*) INTO v_count FROM (
  SELECT id FROM public.in_app_notifications
  WHERE user_id='11111111-1111-4111-8111-111111111111'::uuid
    AND category='TRANSACTIONAL' ORDER BY created_at DESC,id DESC LIMIT 20 OFFSET 40
 ) s;
 IF v_count<>15 THEN RAISE EXCEPTION 'category-before-pagination expected 15, got %',v_count; END IF;
 SELECT id::text INTO v_top FROM public.in_app_notifications
 WHERE user_id='11111111-1111-4111-8111-111111111111'::uuid
 AND category='TRANSACTIONAL' ORDER BY created_at DESC,id DESC LIMIT 1;
 IF v_top<>'00000000-0000-4000-8000-000000000055' THEN RAISE EXCEPTION 'unstable top order %',v_top; END IF;
 SELECT id::text INTO v_page FROM public.in_app_notifications
 WHERE user_id='11111111-1111-4111-8111-111111111111'::uuid
 AND category='TRANSACTIONAL' ORDER BY created_at DESC,id DESC LIMIT 1 OFFSET 40;
 IF v_page<>'00000000-0000-4000-8000-000000000015' THEN RAISE EXCEPTION 'unstable page %',v_page; END IF;
 SELECT count(*) INTO v_foreign FROM public.in_app_notifications
 WHERE user_id='11111111-1111-4111-8111-111111111111'::uuid AND title='foreign';
 IF v_foreign<>0 THEN RAISE EXCEPTION 'foreign owner data leaked'; END IF;
 RAISE NOTICE 'PASS synthetic PG owner category-before-limit and tie ordering';
END $$;
ROLLBACK;
