-- Migration 367: revoke application-role table privileges that no API path uses any more (AR02).
--
-- 350 kept table DML for the Spring API's then-direct writes. As of the 2026-11-28 integration
-- candidate the API registers chat and board images through chat_media_register (295) and
-- member_board_register_image_upload (176), which run as their owner and also check the key shape
-- and an active account; it no longer writes treasury_swf_events (SWF valuation answers 503) or
-- user_progression. Each unused grant would let a compromised API process write those rows outside
-- the functions' checks. Not revoked here: SELECT on black_market_bid_logs, which the Spring API no
-- longer reads but the legacy NestJS gateway still does (marketplace/black-market.repository.ts);
-- revoke it in a later migration once that gateway is retired.
--
-- Release order: apply ONLY after the Spring application that uses the functions is live; an older
-- jar still writes chat_media_registry / member_board_image_uploads directly. The legacy NestJS
-- gateway registers images through the same functions and does not execute these INSERTs.
-- Rollback (with the old jar): GRANT INSERT ON TABLE public.chat_media_registry,
-- public.member_board_image_uploads, public.treasury_swf_events, public.user_progression TO
-- moneyverse_app.

BEGIN;

DO $revoke$
DECLARE
    stmt text;
BEGIN
    FOREACH stmt IN ARRAY ARRAY[
        'REVOKE INSERT ON TABLE public.chat_media_registry FROM moneyverse_app',
        'REVOKE INSERT ON TABLE public.member_board_image_uploads FROM moneyverse_app',
        'REVOKE INSERT ON TABLE public.treasury_swf_events FROM moneyverse_app',
        'REVOKE INSERT ON TABLE public.user_progression FROM moneyverse_app'
    ] LOOP
        BEGIN
            EXECUTE stmt;
        EXCEPTION WHEN undefined_table THEN
            -- Fresh CI databases do not carry every legacy table (same rule as 350).
            RAISE NOTICE 'skipped (absent): %', stmt;
        END;
    END LOOP;
END
$revoke$;

COMMIT;
