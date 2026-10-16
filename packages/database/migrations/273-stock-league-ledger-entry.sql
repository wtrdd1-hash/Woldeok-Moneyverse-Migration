-- v2026.10.17.754 - stock league entry is an economic ledger transfer.
-- Idempotent one-fee-per-(season, user), never debit account_balances directly.
-- Preserve already settled seasons/participants and all historical records.
BEGIN;

CREATE OR REPLACE FUNCTION public.stock_league_settle_entry_fee(
  p_actor uuid,
  p_season_id uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $settlement$
DECLARE
  v_fee numeric;
  v_cash uuid;
  v_escrow uuid;
  v_key uuid;
  v_tx uuid;
BEGIN
  IF p_actor IS NULL OR p_season_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='member and season are required';
  END IF;
  SELECT s.entry_fee INTO v_fee
  FROM public.stock_league_seasons s
  WHERE s.id=p_season_id AND s.status='active'
  FOR SHARE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active league season required';
  END IF;
  IF v_fee IS NULL OR v_fee < 0 OR v_fee <> trunc(v_fee)
    OR v_fee > 1000000000000000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='unsupported league entry fee';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.stock_league_participants p
    WHERE p.season_id=p_season_id AND p.user_id=p_actor
  ) THEN
    RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='member already joined league';
  END IF;
  -- A free league has no currency movement and creates no false journal.
  IF v_fee = 0 THEN RETURN NULL; END IF;

  SELECT a.id INTO v_cash FROM public.accounts a
  WHERE a.owner_user_id=p_actor
    AND a.account_type='USER_CASH'::public.account_type
    AND a.status='active'::public.account_status
  ORDER BY a.id LIMIT 1;
  SELECT a.id INTO v_escrow FROM public.accounts a
  WHERE a.account_type='ESCROW'::public.account_type
    AND a.status='active'::public.account_status
  ORDER BY a.id LIMIT 1;
  IF v_cash IS NULL OR v_escrow IS NULL OR v_cash = v_escrow THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='required live cash or escrow account missing';
  END IF;

  -- Deterministic, feature-scoped key: retrying the same season and member
  -- calls the canonical primitive's existing unique idempotency ledger entry.
  v_key := md5('stock-league-entry-v754:'||p_actor::text||':'||p_season_id::text)::uuid;
  SELECT public.economy_post_transaction(
    v_key, 'STOCK_LEAGUE_ENTRY', p_actor, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_cash,'amount',v_fee::bigint::text,'direction','credit'),
      pg_catalog.jsonb_build_object('accountId',v_escrow,'amount',v_fee::bigint::text,'direction','debit')
    ),
    'stock.league.entry.recorded',
    pg_catalog.jsonb_build_object('memberId',p_actor,'seasonId',p_season_id,'amountWld',v_fee::text)
  ) INTO v_tx;
  RETURN v_tx;
END;
$settlement$;

REVOKE ALL ON FUNCTION public.stock_league_settle_entry_fee(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stock_league_settle_entry_fee(uuid, uuid) TO moneyverse_app;
COMMIT;
