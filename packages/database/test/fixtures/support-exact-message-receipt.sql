-- Execute ONLY on a disposable PostgreSQL cluster after migration 295.
-- The synthetic schema intentionally has no production or member data.
CREATE ROLE moneyverse_migrator NOLOGIN;
CREATE ROLE moneyverse_app NOLOGIN;
CREATE ROLE support_public_probe NOLOGIN;
GRANT USAGE ON SCHEMA public TO moneyverse_app, support_public_probe;
GRANT CREATE ON SCHEMA public TO moneyverse_migrator;
SET ROLE moneyverse_migrator;
CREATE TABLE public.support_threads(id uuid PRIMARY KEY, user_id uuid NOT NULL);
CREATE TABLE public.support_messages(
  id uuid PRIMARY KEY, thread_id uuid NOT NULL, sender_kind text NOT NULL,
  body text NOT NULL, created_at timestamptz NOT NULL
);
INSERT INTO public.support_threads VALUES
  ('00000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000002');
INSERT INTO public.support_messages(id,thread_id,sender_kind,body,created_at)
SELECT ('00000000-0000-4000-8000-' || lpad(i::text,12,'0'))::uuid,
  '00000000-0000-4000-8000-000000000010'::uuid,
  CASE WHEN i%2=0 THEN 'admin' ELSE 'user' END,
  'same body', '2026-10-29T00:00:00Z'::timestamptz + i * interval '1 second'
FROM generate_series(101,305) i;
RESET ROLE;
\echo 'fixture: 205 same-body support messages ready'
