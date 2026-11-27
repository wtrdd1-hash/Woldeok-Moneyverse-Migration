-- Migration 358: the API no longer writes photos directly.
--
-- 350 kept INSERT and DELETE on public.photos for MemberPhotoController's direct submission and
-- withdrawal SQL. That SQL is gone (2026-11-26): the controller now calls member_submit_photo,
-- member_withdraw_pending_photo and member_my_photo_submissions (098, 297), which run as their
-- owner. The table grant is therefore unneeded, and keeping it would let a compromised API
-- process insert or delete gallery rows outside those functions' owner and state checks.
-- Rollback: GRANT INSERT, DELETE ON TABLE public.photos TO moneyverse_app (with the old code).

BEGIN;

REVOKE INSERT, DELETE ON TABLE public.photos FROM moneyverse_app;

COMMIT;
