-- Disposable isolated PostgreSQL fixture; NEVER execute on shared/live data.
BEGIN;
CREATE TABLE public.in_app_notifications (
 id uuid PRIMARY KEY, user_id uuid NOT NULL, category text NOT NULL,
 title text NOT NULL, body text NOT NULL, link text, dedupe_key text,
 is_read boolean NOT NULL DEFAULT false, read_at timestamptz,
 created_at timestamptz NOT NULL
);
INSERT INTO public.in_app_notifications(id,user_id,category,title,body,created_at,is_read)
SELECT ('00000000-0000-4000-8000-' || lpad(i::text,12,'0'))::uuid,
 '11111111-1111-4111-8111-111111111111'::uuid,
 CASE WHEN i<=55 THEN 'TRANSACTIONAL' ELSE 'SYSTEM' END,
 'synthetic', 'synthetic', '2026-10-28T00:00:00Z'::timestamptz,
 i <= 10
FROM generate_series(1,60) i;
INSERT INTO public.in_app_notifications(id,user_id,category,title,body,created_at,is_read)
SELECT ('00000000-0000-4000-9000-' || lpad(i::text,12,'0'))::uuid,
 '22222222-2222-4222-8222-222222222222'::uuid,
 'TRANSACTIONAL', 'foreign', 'foreign', '2026-10-28T00:00:00Z'::timestamptz, true
FROM generate_series(1,100) i;
PREPARE owner_read_notifications(uuid,text,boolean,boolean,int,int) AS
 SELECT id::text, category, title, body, link, dedupe_key, is_read, read_at, created_at
 FROM public.in_app_notifications
 WHERE user_id = $1
   AND ($2::text IS NULL OR category = $2::text)
   AND ($3::boolean IS NULL OR is_read = FALSE)
   AND ($4::boolean IS NULL OR is_read = TRUE)
 ORDER BY created_at DESC, id DESC
 LIMIT $5 OFFSET $6;
DO $$
DECLARE actual int; first_id text;
BEGIN
 SELECT count(*) INTO actual FROM (
   SELECT id FROM public.in_app_notifications WHERE user_id='11111111-1111-4111-8111-111111111111'::uuid
     AND category='TRANSACTIONAL' AND is_read=TRUE ORDER BY created_at DESC,id DESC LIMIT 20
 ) owner_rows;
 IF actual <> 10 THEN RAISE EXCEPTION 'owner read filter: expected 10, got %', actual; END IF;
 SELECT count(*) INTO actual FROM (
   SELECT id FROM public.in_app_notifications WHERE user_id='11111111-1111-4111-8111-111111111111'::uuid
     AND category='TRANSACTIONAL' AND is_read=FALSE ORDER BY created_at DESC,id DESC LIMIT 20 OFFSET 40
 ) owner_rows;
 IF actual <> 5 THEN RAISE EXCEPTION 'owner unread category-before-pagination expected 5, got %', actual; END IF;
 SELECT id::text INTO first_id FROM public.in_app_notifications
 WHERE user_id='11111111-1111-4111-8111-111111111111'::uuid AND category='TRANSACTIONAL' AND is_read=TRUE
 ORDER BY created_at DESC,id DESC LIMIT 1;
 IF first_id <> '00000000-0000-4000-8000-000000000010' THEN RAISE EXCEPTION 'unstable tie ordering: %',first_id; END IF;
 SELECT count(*) INTO actual FROM public.in_app_notifications
 WHERE user_id='11111111-1111-4111-8111-111111111111'::uuid AND title='foreign';
 IF actual <> 0 THEN RAISE EXCEPTION 'foreign notification leaked'; END IF;
 RAISE NOTICE 'PASS owner read/unread/category-before-page, stable tie order, cross-owner isolation';
END $$;
ROLLBACK;
