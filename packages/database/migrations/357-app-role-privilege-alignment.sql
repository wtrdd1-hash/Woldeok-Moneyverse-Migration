-- Migration 357: align the application role's privileges with the migration chain.
--
-- A database that was set up or restored outside this chain can carry privileges for
-- moneyverse_app that no migration grants (function EXECUTE, table SELECT, and default
-- privileges on future functions). This migration removes such privileges where no live caller
-- needs them, so every environment converges on what the chain defines. Reads that live code
-- still performs without a chain grant need replacement functions first and are not touched.
-- In a clean chain every statement is a no-op. Each revoke tolerates objects owned by another
-- role (insufficient_privilege) and reports it, so a partial result is visible, not silent.
-- Rollback: GRANT the same privileges back (none of them is part of the migration chain).

BEGIN;

DO $revoke$
DECLARE
  fn regprocedure;
  tbl text;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure FROM pg_catalog.pg_proc AS p
    JOIN pg_catalog.pg_namespace AS n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = ANY (ARRAY[
    'activity_list_logs',
    'admin_account_merge_events_immutable',
    'admin_append_audit_event',
    'admin_merge_forked_member_account',
    'apply_bootstrap_discord_operators',
    'apply_bootstrap_google_operators',
    'audit_active_retention_policy',
    'audit_assert_context',
    'audit_columns_match_context',
    'audit_event_digest',
    'audit_event_digest_v1',
    'audit_first_sensitive_key',
    'audit_masked_context',
    'audit_masked_ip',
    'audit_normalize_text',
    'audit_reject_log_mutation',
    'audit_reject_retention_mutation',
    'audit_reject_verification_mutation',
    'audit_retention_category',
    'audit_verify_chain_window',
    'auth_bind_bootstrap_google_admin',
    'auth_member_session_long_lifetime',
    'bank_accrue_daily_interest',
    'bank_borrow_policy_v210',
    'bank_pocket_customization_receipt_immutable',
    'bank_repay_policy_v210',
    'blog_editorial_draft_append',
    'blog_editorial_reject_mutation',
    'blog_editorial_review_record',
    'blog_editorial_source_record',
    'blog_editorial_topic_create',
    'business_refuse_without_equity',
    'casino_catalog_game_win_odds',
    'casino_catalog_win_probability_ppm',
    'casino_daily_usage',
    'casino_enforce_self_limit',
    'casino_gem5_face_for_byte',
    'casino_gem5_is_win',
    'casino_hilo20_face_for_byte',
    'casino_hilo20_is_win',
    'casino_refuse_while_in_debt',
    'casino_reject_activation_without_trial',
    'casino_reject_dice_trial_mutation',
    'casino_reject_distribution_trial_mutation',
    'casino_reject_payout_that_is_not_a_sink',
    'casino_roll_die',
    'casino_roll_gem5',
    'casino_roll_hilo20',
    'casino_roll_treasure4',
    'casino_roll_wheel20',
    'casino_treasure4_face_for_byte',
    'casino_treasure4_is_win',
    'casino_wheel20_class_for_segment',
    'casino_wheel20_is_win',
    'casino_wheel20_multiplier_ppm',
    'casino_wheel20_segment_for_byte',
    'casino_worst_case_loss',
    'content_configure_image_host',
    'content_configure_status_source',
    'content_normalize_image_host',
    'content_normalize_plain_text',
    'content_normalize_storage_key',
    'content_require_operator',
    'content_validate_external_image_url',
    'crypt',
    'dearmor',
    'decrypt_iv',
    'early_collection_entry_unlocked_at',
    'early_event_draw',
    'early_game_note_collection_completion',
    'early_game_refuse_locked_business',
    'economic_command_claim',
    'economic_command_complete',
    'economic_command_immutability_guard',
    'economy_apply_activated_policy',
    'economy_apply_policy_values',
    'economy_clamp_knob',
    'economy_minimum_active_sample',
    'economy_policy_proposal_hash',
    'economy_post_transaction',
    'economy_profession_limit_adjustments',
    'economy_propose_policy_adjustment_v181',
    'economy_record_reconciliation_snapshot',
    'economy_reject_reconciliation_snapshot_mutation',
    'economy_reject_trip_mutation',
    'economy_transaction_dependents',
    'encrypt_iv',
    'engagement_note_purchase_signal',
    'engagement_note_work_signal',
    'engagement_npc_receipt_immutable',
    'engagement_period_key',
    'execute_treasury_burn_draw',
    'finance_currency_alias_receipt_immutable',
    'finance_integrity_assert_and_record',
    'finance_integrity_immutable',
    'finance_integrity_ledger_link_only',
    'finance_integrity_scan',
    'finance_integrity_verify_replay',
    'finance_legacy_reset_v1626',
    'gen_random_bytes',
    'gen_salt',
    'grant_bootstrap_discord_administrator',
    'grant_bootstrap_google_administrator',
    'help_admin_check',
    'help_guard_revision_mutation',
    'help_reject_event_mutation',
    'hmac',
    'job_certify_qualification',
    'job_level_for_experience',
    'jobs_apply_assignment_limit_knob',
    'ledger_capture_reconciliation',
    'member_profile_image_path',
    'member_public_name',
    'minecraft_claim_next_approved_operation',
    'minecraft_complete_approved_operation',
    'minecraft_reject_approved_operation_event_mutation',
    'notification_publish_in_app',
    'pgp_armor_headers',
    'pgp_key_id',
    'pgp_pub_decrypt',
    'pgp_pub_decrypt_bytea',
    'pgp_pub_encrypt',
    'pgp_pub_encrypt_bytea',
    'pgp_sym_decrypt',
    'pgp_sym_decrypt_bytea',
    'pgp_sym_encrypt',
    'pgp_sym_encrypt_bytea',
    'privacy_normalize_request_detail',
    'safety_update_age_state',
    'schedule_period_key',
    'shop_assert_purchase_limit',
    'shop_effect_is_permitted',
    'shop_effective_unit_price',
    'shop_purchase_catalog_policy_v215',
    'shop_stamp_item_term',
    'shop_upkeep_grace_weeks',
    'stock_halt_and_settle',
    'stock_market_apply_event_jump',
    'stock_market_gaussian',
    'stock_market_halted',
    'stock_record_price_tick',
    'treasury_core_receipt_immutable',
    'treasury_deposit_donation',
    'treasury_epoch_attestation_correction_immutable',
    'treasury_fiscal_guard_event',
    'treasury_fiscal_guard_vault',
    'treasury_fund_stock_halt',
    'trigger_casino_pigouvian_welfare_tax',
    'verify_economy_supply_invariant',
    'work_capture_daily_limit_baseline',
    'work_verify_and_reward_policy_delegate'
    ])
  LOOP
    BEGIN
      EXECUTE pg_catalog.format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, moneyverse_app', fn);
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE NOTICE 'not revoked (owned by another role): %', fn;
    END;
  END LOOP;

  FOREACH tbl IN ARRAY ARRAY[
    'auth_local_credentials','auth_local_password_resets','audit_chain_verifications',
    'audit_destruction_records','audit_retention_policies','seo_gsc_credentials',
    'oauth_mobile_handoffs','user_consents','admin_role_designations','blog_editorial_audit',
    'blog_verified_audit','ledger_reconciliation_cases','ledger_reconciliation_runs']
  LOOP
    BEGIN
      EXECUTE pg_catalog.format('REVOKE SELECT ON TABLE public.%I FROM moneyverse_app', tbl);
    EXCEPTION WHEN undefined_table THEN
      RAISE NOTICE 'absent: %', tbl;
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'not revoked (owned by another role): %', tbl;
    END;
  END LOOP;

  -- New functions must be granted explicitly (the function template does); stop the default.
  BEGIN
    ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator IN SCHEMA public
      REVOKE EXECUTE ON FUNCTIONS FROM moneyverse_app;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'default privileges for moneyverse_migrator not changed';
  END;
END
$revoke$;

COMMIT;
