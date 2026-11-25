-- Forward-only least-privilege repair (security review 2026-11-25).
-- These functions move money without double-entry postings, or (pocket archive) turn a
-- pocket balance that no ledger posting backs into cash. The Spring API no longer calls any
-- of them: marketplace and pocket transfer/archive routes answer 503 until journaled paths
-- exist. Removing EXECUTE from the application role means a future code path cannot quietly
-- call them again; nothing is dropped, so a journaled replacement can still reuse the names.
BEGIN;

DO $revoke$
DECLARE
    fn text;
BEGIN
    FOREACH fn IN ARRAY ARRAY[
        'public.marketplace_buy_listing(uuid,uuid,text)',
        'public.marketplace_create_listing(uuid,text,integer,text,text,text)',
        'public.marketplace_bid_auction(uuid,text,uuid,text)',
        'public.marketplace_cancel_listing(uuid,uuid)',
        'public.bank_transfer_pocket(uuid,uuid,uuid,text,bigint)',
        'public.bank_transfer_pocket(text,uuid,uuid,bigint,text)',
        'public.bank_archive_pocket(uuid,uuid,uuid)',
        'public.bank_archive_pocket(text,uuid,uuid)'
    ] LOOP
        IF to_regprocedure(fn) IS NOT NULL THEN
            EXECUTE format('REVOKE ALL PRIVILEGES ON FUNCTION %s FROM PUBLIC, moneyverse_app', fn);
        ELSE
            RAISE NOTICE 'skipped (absent): %', fn;
        END IF;
    END LOOP;
END
$revoke$;

COMMIT;
