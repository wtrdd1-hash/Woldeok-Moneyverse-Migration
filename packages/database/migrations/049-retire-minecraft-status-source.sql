-- Stop publishing the Minecraft server's status.
--
-- 013 seeds two status sources, `web` and `minecraft`, and
-- content_public_status() returns a source when `active AND public_visible`.
-- The Minecraft integration is out of scope for this rebuild -- its control
-- plane, its sidecars and its screens are gone -- so the row that puts
-- "마인크래프트 서버" on the public /status page goes with them.
--
-- Flipped rather than deleted, for two reasons. content_status_snapshots
-- references source_key, so any recorded history would have to be destroyed
-- first; and 013's INSERT is `ON CONFLICT DO NOTHING`, so a row deleted here
-- would come back the next time a database is built from scratch. Setting
-- the flags is the state 013 itself offers for a source that exists and is
-- not shown, and it is one UPDATE away from being reversed.
--
-- `active` as well as `public_visible`: a collector should not keep recording
-- snapshots for a source nothing displays.

BEGIN;

UPDATE public.content_status_sources
SET public_visible = false, active = false
WHERE source_key = 'minecraft';

COMMIT;
