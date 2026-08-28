-- A role that may record service status, and two more things to record.
--
-- 013 ends with
--
--   REVOKE ALL PRIVILEGES ON FUNCTION public.content_record_server_status(...)
--     FROM PUBLIC, moneyverse_app;
--
-- on purpose: /status is a public claim about whether the service is working,
-- and the web application is the last thing that should be able to assert it.
-- Nothing was ever granted the write, so nothing ever recorded a snapshot, and
-- every source has read 확인 중 since the port.
--
-- The fix is the one 018 already established for the reconciler: a role of its
-- own that can do exactly one thing. `moneyverse_status_collector` may execute
-- content_record_server_status and has no other privilege in this database --
-- it cannot read a balance, a session or an identity. A SQL injection through
-- the application still cannot claim the service is healthy, which is the
-- property the REVOKE was protecting.
--
-- Created NOLOGIN here, as 018 creates the reconciler. A deployment grants it
-- LOGIN and a password out of band (deploy/seed.sh), so the credential is
-- never in a migration and never in this repository.

BEGIN;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'moneyverse_status_collector'
  ) THEN
    CREATE ROLE moneyverse_status_collector
      NOLOGIN
      NOINHERIT
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOREPLICATION
      NOBYPASSRLS;
  END IF;
END;
$do$;

-- CONNECT is granted by deploy/seed.sh, which knows the database's name; a
-- migration cannot name it without hard-coding one deployment's choice.
GRANT USAGE ON SCHEMA public TO moneyverse_status_collector;
GRANT EXECUTE ON FUNCTION
  public.content_record_server_status(text, text, text, timestamptz)
TO moneyverse_status_collector;

-- 013 seeded `web` and `minecraft`. The Minecraft source was retired in 049;
-- these are the two the deployment can actually observe about itself, and
-- naming them here rather than letting the collector create sources keeps the
-- public page's rows a deliberate list rather than whatever a worker invented.
--
-- sort_order leaves room: web at 10, then these, so a later source can be
-- placed without renumbering.
INSERT INTO public.content_status_sources (
  source_key, display_name, public_visible, active, stale_after_seconds, sort_order
) VALUES
  ('api', '경제 API', true, true, 180, 30),
  ('database', '경제 원장 데이터베이스', true, true, 180, 40)
ON CONFLICT (source_key) DO NOTHING;

COMMIT;
