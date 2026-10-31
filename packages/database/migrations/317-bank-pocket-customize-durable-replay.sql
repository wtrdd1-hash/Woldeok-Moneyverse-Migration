-- P0 #2070: durable actor+intent binding for WLD-charging bank pocket customization.
-- Forward-only after 313 (#2058). #2069 provides the separate caller UUIDv4 boundary.
-- The historical DEV function charges 100 WLD regardless of selection, while the
-- current UI advertises 100/300/400; this preserves legacy DB price but MUST NOT
-- be released until a DB-authoritative quote/UX contract is independently approved.
BEGIN;

-- Fresh 002..313 did not contain the pocket table. Recreate the observed DEV
-- shape without rewriting existing DEV rows or broadening application privileges.
CREATE TABLE IF NOT EXISTS public.bank_saving_pockets (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name varchar(64) NOT NULL CHECK (pg_catalog.char_length(pg_catalog.btrim(name)) >= 1),
  balance bigint NOT NULL DEFAULT 0 CHECK (balance >= 0),
  target_amount bigint CHECK (target_amount IS NULL OR target_amount > 0),
  target_date date,
  theme_color varchar(32) NOT NULL DEFAULT 'sky',
  icon_code varchar(32) NOT NULL DEFAULT 'piggy-bank',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bank_saving_pockets_user
  ON public.bank_saving_pockets(user_id, is_archived, created_at DESC);

-- Receipt is committed atomically with the double-entry ledger transaction and
-- style update. It is not a mutable cache; it is the original response contract.
CREATE TABLE public.bank_pocket_customization_intents (
  idempotency_key uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id),
  pocket_id uuid NOT NULL REFERENCES public.bank_saving_pockets(id),
  theme_color varchar(32) NOT NULL,
  icon_code varchar(32) NOT NULL,
  cost_wld bigint NOT NULL CHECK (cost_wld > 0),
  transaction_id uuid NOT NULL UNIQUE REFERENCES public.ledger_transactions(id),
  remaining_cash bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL PRIVILEGES ON TABLE public.bank_saving_pockets FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.bank_pocket_customization_intents FROM PUBLIC, moneyverse_app;
-- SECURITY DEFINER owner can operate even when a legacy DEV table is owned by postgres.
GRANT SELECT, UPDATE ON TABLE public.bank_saving_pockets TO moneyverse_migrator;
GRANT SELECT, INSERT ON TABLE public.bank_pocket_customization_intents TO moneyverse_migrator;

CREATE OR REPLACE FUNCTION public.bank_customize_pocket(
  p_key uuid, p_user_id uuid, p_pocket_id uuid, p_theme_color text, p_icon_code text
)
RETURNS TABLE (pocket_id uuid, theme_color text, icon_code text, cost_wld bigint, remaining_cash bigint)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE
  c_cost CONSTANT bigint := 100; -- legacy DB contract, NOT approved UI quote
  v_theme text;
  v_icon text;
  v_receipt public.bank_pocket_customization_intents%ROWTYPE;
  v_owner uuid;
  v_cash_id uuid;
  v_sink_id uuid;
  v_tx_id uuid;
  v_remaining bigint;
BEGIN
  IF p_key IS NULL OR p_key = '00000000-0000-0000-0000-000000000000'::uuid
    OR p_user_id IS NULL OR p_pocket_id IS NULL THEN
    RAISE EXCEPTION 'key, user and pocket are required' USING ERRCODE = '22023';
  END IF;

  v_theme := coalesce(nullif(pg_catalog.btrim(p_theme_color), ''), 'sky');
  v_icon := coalesce(nullif(pg_catalog.btrim(p_icon_code), ''), 'piggy-bank');
  IF pg_catalog.char_length(v_theme) > 32 OR pg_catalog.char_length(v_icon) > 32
    OR v_theme ~ '[[:cntrl:]]' OR v_icon ~ '[[:cntrl:]]' THEN
    RAISE EXCEPTION 'invalid pocket appearance' USING ERRCODE = '22023';
  END IF;

  -- Lock key BEFORE looking up any receipt. Same-key concurrent calls serialize.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:bank_customize_pocket:' || p_key::text, 0)
  );

  SELECT * INTO v_receipt
  FROM public.bank_pocket_customization_intents AS r
  WHERE r.idempotency_key = p_key;
  IF FOUND THEN
    IF v_receipt.user_id IS DISTINCT FROM p_user_id THEN
      RAISE EXCEPTION 'receipt belongs to another user' USING ERRCODE = '28000';
    END IF;
    IF v_receipt.pocket_id IS DISTINCT FROM p_pocket_id
      OR v_receipt.theme_color IS DISTINCT FROM v_theme
      OR v_receipt.icon_code IS DISTINCT FROM v_icon THEN
      RAISE EXCEPTION 'idempotency key reused with a different appearance' USING ERRCODE = '22023';
    END IF;
    RETURN QUERY SELECT v_receipt.pocket_id, v_receipt.theme_color::text,
      v_receipt.icon_code::text, v_receipt.cost_wld, v_receipt.remaining_cash;
    RETURN;
  END IF;

  -- A pre-migration charge has no durable appearance receipt. NEVER reapply its
  -- styling or charge under an untracked key, even if ledger hash happens to match.
  IF EXISTS (SELECT 1 FROM public.ledger_transactions AS t WHERE t.idempotency_key = p_key) THEN
    RAISE EXCEPTION 'legacy ledger key lacks verified appearance receipt' USING ERRCODE = '22023';
  END IF;

  SELECT p.user_id INTO v_owner
  FROM public.bank_saving_pockets AS p
  WHERE p.id = p_pocket_id AND NOT p.is_archived
  FOR UPDATE;
  IF NOT FOUND OR v_owner IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'active pocket is not owned by actor' USING ERRCODE = '28000';
  END IF;

  SELECT a.id INTO v_cash_id FROM public.accounts AS a
  WHERE a.owner_user_id = p_user_id
    AND a.account_type = 'USER_CASH'::public.account_type
    AND a.status = 'active'::public.account_status;
  SELECT a.id INTO v_sink_id FROM public.accounts AS a
  WHERE a.system_key = 'sink'
    AND a.account_type = 'SINK'::public.account_type
    AND a.status = 'active'::public.account_status;
  IF v_cash_id IS NULL OR v_sink_id IS NULL THEN
    RAISE EXCEPTION 'bank ledger accounts unavailable' USING ERRCODE = '55000';
  END IF;

  -- economy_post_transaction is the only money writer. It locks ledger accounts
  -- in canonical order and rejects negative user balances; no direct balance DML.
  SELECT public.economy_post_transaction(
    p_key, 'SINK_BANK_POCKET_CUSTOMIZE', p_user_id, NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash_id, 'amount', c_cost, 'direction', 'credit'),
      pg_catalog.jsonb_build_object('accountId', v_sink_id, 'amount', c_cost, 'direction', 'debit')
    ),
    'bank.pocket.customized',
    pg_catalog.jsonb_build_object('pocketId', p_pocket_id, 'themeColor', v_theme,
      'iconCode', v_icon, 'cost', c_cost)
  ) INTO v_tx_id;

  UPDATE public.bank_saving_pockets AS p
  SET theme_color = v_theme, icon_code = v_icon, updated_at = now()
  WHERE p.id = p_pocket_id AND p.user_id = p_user_id AND NOT p.is_archived;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'pocket changed during customization' USING ERRCODE = '55000';
  END IF;

  SELECT b.available_amount INTO v_remaining
  FROM public.account_balances AS b WHERE b.account_id = v_cash_id;
  IF v_remaining IS NULL THEN
    RAISE EXCEPTION 'missing canonical cash balance' USING ERRCODE = '55000';
  END IF;

  INSERT INTO public.bank_pocket_customization_intents
    (idempotency_key, user_id, pocket_id, theme_color, icon_code,
     cost_wld, transaction_id, remaining_cash)
  VALUES (p_key, p_user_id, p_pocket_id, v_theme, v_icon,
          c_cost, v_tx_id, v_remaining);

  RETURN QUERY SELECT p_pocket_id, v_theme, v_icon, c_cost, v_remaining;
END;
$function$;

ALTER FUNCTION public.bank_customize_pocket(uuid,uuid,uuid,text,text)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_customize_pocket(uuid,uuid,uuid,text,text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bank_customize_pocket(uuid,uuid,uuid,text,text)
  TO moneyverse_app;

-- A receipt is financial evidence: no UPDATE/DELETE/TRUNCATE, even for an
-- accidental privileged maintenance query. A correction is a new receipt.
CREATE FUNCTION public.bank_pocket_customization_receipt_immutable()
RETURNS trigger LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $trigger$
BEGIN
  RAISE EXCEPTION 'bank pocket customization receipts are append-only'
    USING ERRCODE = '55000';
END;
$trigger$;
ALTER FUNCTION public.bank_pocket_customization_receipt_immutable()
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bank_pocket_customization_receipt_immutable()
  FROM PUBLIC, moneyverse_app;
CREATE TRIGGER bank_pocket_customization_intents_immutable
  BEFORE UPDATE OR DELETE ON public.bank_pocket_customization_intents
  FOR EACH ROW EXECUTE FUNCTION public.bank_pocket_customization_receipt_immutable();
CREATE TRIGGER bank_pocket_customization_intents_no_truncate
  BEFORE TRUNCATE ON public.bank_pocket_customization_intents
  FOR EACH STATEMENT EXECUTE FUNCTION public.bank_pocket_customization_receipt_immutable();

COMMIT;
