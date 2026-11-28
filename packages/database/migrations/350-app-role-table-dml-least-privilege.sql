-- Forward-only least-privilege repair for the application role's table DML.
-- Security review 2026-11-25: moneyverse_app held INSERT/UPDATE/DELETE/TRUNCATE on every
-- public table (Production: 282 grants), including ledger_postings, account_balances and
-- audit_logs. Money moves only through SECURITY DEFINER functions, which run as their owner,
-- so the application needs table DML only where the Spring API still writes directly.
-- SELECT is unchanged. Function EXECUTE grants are unchanged (see 347).
-- The kept grants mirror the direct DML found in spring-backend (2026-11-25 inventory);
-- paths that were retired or refused that day (marketplace, PvP, secret auction, bonds,
-- legacy pension, pocket transfers) get no table DML.
BEGIN;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
    ON ALL TABLES IN SCHEMA public FROM moneyverse_app;

DO $grants$
DECLARE
    stmt text;
BEGIN
    FOREACH stmt IN ARRAY ARRAY[
        -- sessions: login, logout, reauthentication, admin close, pre-login consent;
        -- INSERT ... ON CONFLICT DO UPDATE touches several columns, so table-level.
        'GRANT INSERT, UPDATE ON TABLE public.auth_sessions TO moneyverse_app',
        'GRANT UPDATE (password_verifier, changed_at, disabled_at) ON TABLE public.auth_local_credentials TO moneyverse_app',
        -- account settings and self-deletion
        'GRANT UPDATE (display_name, status, updated_at) ON TABLE public.users TO moneyverse_app',
        'GRANT UPDATE (display_name, bio, image_url, updated_at) ON TABLE public.profiles TO moneyverse_app',
        'GRANT UPDATE (status) ON TABLE public.accounts TO moneyverse_app',
        -- media and logs
        'GRANT INSERT ON TABLE public.chat_media_registry TO moneyverse_app',
        'GRANT INSERT ON TABLE public.member_board_image_uploads TO moneyverse_app',
        'GRANT INSERT, DELETE ON TABLE public.photos TO moneyverse_app',
        'GRANT INSERT ON TABLE public.seo_crawler_logs TO moneyverse_app',
        'GRANT INSERT ON TABLE public.system_audit_logs TO moneyverse_app',
        'GRANT INSERT ON TABLE public.user_activity_logs TO moneyverse_app',
        'GRANT INSERT ON TABLE public.user_progression TO moneyverse_app',
        -- saving pockets: create and cosmetic customization only (transfers are refused)
        'GRANT INSERT ON TABLE public.bank_saving_pockets TO moneyverse_app',
        'GRANT UPDATE (theme_color, icon_code, updated_at) ON TABLE public.bank_saving_pockets TO moneyverse_app',
        -- stock league
        'GRANT INSERT, UPDATE ON TABLE public.stock_league_participants TO moneyverse_app',
        'GRANT UPDATE (status, updated_at) ON TABLE public.copy_trading_subscriptions TO moneyverse_app',
        -- administrator consoles (behind AdminApiBoundaryFilter)
        'GRANT UPDATE (halt_status, halted_at, updated_at) ON TABLE public.virtual_stocks TO moneyverse_app',
        'GRANT UPDATE (last_executed_at, updated_at) ON TABLE public.treasury_swf_configs TO moneyverse_app',
        'GRANT INSERT ON TABLE public.treasury_swf_events TO moneyverse_app',
        'GRANT UPDATE (current_valuation_wld, total_invested_wld, unrealized_pnl_wld, updated_at) ON TABLE public.treasury_swf_portfolios TO moneyverse_app'
    ] LOOP
        BEGIN
            EXECUTE stmt;
        EXCEPTION WHEN undefined_table OR undefined_column THEN
            -- Fresh CI databases do not carry every legacy table; skip what is absent.
            RAISE NOTICE 'skipped (absent): %', stmt;
        END;
    END LOOP;
END
$grants$;

COMMIT;
