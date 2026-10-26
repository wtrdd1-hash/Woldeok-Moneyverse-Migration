-- v2026.10.26.557: P0 club charter settlement must be ledger-first and replay-safe.
-- Migration 222 is applied and immutable. Its direct balance writes and ignored
-- ledger conflict cannot be repaired by editing the original migration.
BEGIN;

CREATE TABLE public.club_charter_receipts (
  idempotency_key uuid PRIMARY KEY,
  actor_id uuid NOT NULL REFERENCES public.users(id),
  payload jsonb NOT NULL,
  club_id uuid NOT NULL UNIQUE REFERENCES public.clubs(id) ON DELETE RESTRICT,
  ledger_transaction_id uuid NOT NULL UNIQUE REFERENCES public.ledger_transactions(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE OR REPLACE FUNCTION public.club_charter_receipt_immutable()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $immutable$
BEGIN
  RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='club charter receipts are immutable';
END;
$immutable$;
ALTER FUNCTION public.club_charter_receipt_immutable() OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.club_charter_receipt_immutable() FROM PUBLIC, moneyverse_app;
CREATE TRIGGER club_charter_receipt_immutable
  BEFORE UPDATE OR DELETE ON public.club_charter_receipts
  FOR EACH ROW EXECUTE FUNCTION public.club_charter_receipt_immutable();
REVOKE ALL ON TABLE public.club_charter_receipts FROM PUBLIC, moneyverse_app;

-- Migration 222 also granted the web role direct club creation and project
-- funding writes. Those paths bypass the charter ledger function entirely.
-- Preserve only the member-count maintenance used by join/leave routes.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.clubs FROM moneyverse_app;
GRANT UPDATE(member_count) ON TABLE public.clubs TO moneyverse_app;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.club_projects,
  public.club_project_contributions FROM moneyverse_app;

CREATE OR REPLACE FUNCTION public.club_create(
  p_actor uuid, p_tag text, p_name text, p_description text,
  p_charter text, p_join_mode text, p_idempotency_key uuid
) RETURNS TABLE(club_id uuid, tag text, name text, status text, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp AS $club_create$
DECLARE
  v_tag text := upper(btrim(p_tag));
  v_name text := btrim(p_name);
  v_description text := coalesce(btrim(p_description), '');
  v_charter text := coalesce(btrim(p_charter), '');
  v_join_mode text := coalesce(p_join_mode, 'public');
  v_payload jsonb;
  v_receipt public.club_charter_receipts%ROWTYPE;
  v_existing_tx_id uuid;
  v_cash_id uuid;
  v_sink_id uuid;
  v_tx_id uuid;
  v_club_id uuid;
  v_tag_out text;
  v_name_out text;
  v_status_out text;
  v_created_at timestamptz;
BEGIN
  IF p_actor IS NULL OR p_idempotency_key IS NULL
     OR v_tag IS NULL OR v_tag !~ '^[A-Z0-9]{2,8}$'
     OR v_name IS NULL OR char_length(v_name) NOT BETWEEN 2 AND 30
     OR char_length(v_description) > 500 OR char_length(v_charter) > 2000
     OR v_join_mode NOT IN ('public','invite','request') THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid club charter parameters';
  END IF;

  v_payload := pg_catalog.jsonb_build_object(
    'tag',v_tag,'name',v_name,'description',v_description,
    'charter',v_charter,'joinMode',v_join_mode
  );
  -- The key lock precedes every replay read, so concurrent identical requests
  -- cannot both miss a receipt. Do not serialize on the actor instead.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:club_create:' || p_idempotency_key::text, 0)
  );
  SELECT r.* INTO v_receipt FROM public.club_charter_receipts r
  WHERE r.idempotency_key=p_idempotency_key;
  IF FOUND THEN
    IF v_receipt.actor_id <> p_actor THEN
      RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='club charter key belongs to another actor';
    END IF;
    IF v_receipt.payload <> v_payload THEN
      RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='club charter key reused with different parameters';
    END IF;
    SELECT c.id,c.tag,c.name,c.status,c.created_at
      INTO v_club_id,v_tag_out,v_name_out,v_status_out,v_created_at
      FROM public.clubs c WHERE c.id=v_receipt.club_id;
    IF v_club_id IS NULL THEN
      RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='club charter receipt requires reconciliation';
    END IF;
    RETURN QUERY SELECT v_club_id,v_tag_out,v_name_out,v_status_out,v_created_at;
    RETURN;
  END IF;

  -- Legacy unposted rows from migration 222 cannot be treated as successful
  -- receipts or charged a second time. Reconciliation is an operator task.
  SELECT t.id INTO v_existing_tx_id FROM public.ledger_transactions t
  WHERE t.idempotency_key=p_idempotency_key;
  IF FOUND THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='legacy club charter key requires reconciliation';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id=p_actor AND u.status='active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='active club owner required';
  END IF;
  SELECT a.id INTO v_cash_id FROM public.accounts a
  WHERE a.owner_user_id=p_actor AND a.account_type='USER_CASH'::public.account_type
    AND a.status='active'::public.account_status ORDER BY a.id LIMIT 1;
  SELECT a.id INTO v_sink_id FROM public.accounts a
  WHERE a.account_type='SINK'::public.account_type AND a.system_key='sink'
    AND a.status='active'::public.account_status ORDER BY a.id LIMIT 1;
  IF v_cash_id IS NULL OR v_sink_id IS NULL OR v_cash_id=v_sink_id THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='club charter ledger accounts unavailable';
  END IF;

  -- The canonical primitive performs locked, balanced two-sided settlement.
  -- CREDIT decreases USER_CASH; DEBIT increases SINK in this ledger model.
  SELECT public.economy_post_transaction(
    p_idempotency_key,'SINK_CLUB_CHARTER',p_actor,NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId',v_cash_id,'amount','10000','direction','credit'),
      pg_catalog.jsonb_build_object('accountId',v_sink_id,'amount','10000','direction','debit')
    ),'club.charter.paid',
    pg_catalog.jsonb_build_object('actorId',p_actor,'feeWld','10000')
  ) INTO v_tx_id;

  INSERT INTO public.clubs(tag,name,description,charter,owner_id,join_mode)
  VALUES(v_tag,v_name,v_description,v_charter,p_actor,v_join_mode)
  RETURNING id,clubs.tag,clubs.name,clubs.status,clubs.created_at
    INTO v_club_id,v_tag_out,v_name_out,v_status_out,v_created_at;
  INSERT INTO public.club_members(club_id,user_id,role)
  VALUES(v_club_id,p_actor,'owner');
  INSERT INTO public.club_projects(club_id,title,description,target_wld,reward_badge)
  VALUES(v_club_id,'클럽하우스 1호 거점 구축',
    '클럽원들의 협동 펀딩으로 첫 번째 공동 클럽하우스 거점을 마련합니다.',
    '50000','CLUB_PIONEER');
  INSERT INTO public.club_charter_receipts(
    idempotency_key,actor_id,payload,club_id,ledger_transaction_id
  ) VALUES(p_idempotency_key,p_actor,v_payload,v_club_id,v_tx_id);
  RETURN QUERY SELECT v_club_id,v_tag_out,v_name_out,v_status_out,v_created_at;
END;
$club_create$;
ALTER FUNCTION public.club_create(uuid,text,text,text,text,text,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.club_create(uuid, text, text, text, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.club_create(uuid, text, text, text, text, text, uuid) TO moneyverse_app;

-- The sibling funding function from 222 has the same unposted balance-update
-- defect. Fail closed instead of leaving a second direct debit path exposed.
CREATE OR REPLACE FUNCTION public.club_contribute_project(
  p_actor uuid,p_club_id uuid,p_project_id uuid,p_amount numeric,p_idempotency_key uuid
) RETURNS TABLE(contribution_id uuid,accepted_amount numeric,project_current_wld text,project_status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $club_contribute_guard$
BEGIN
  RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='club project contribution is disabled until ledger settlement is verified';
END;
$club_contribute_guard$;
ALTER FUNCTION public.club_contribute_project(uuid,uuid,uuid,numeric,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.club_contribute_project(uuid,uuid,uuid,numeric,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.club_contribute_project(uuid,uuid,uuid,numeric,uuid) TO moneyverse_app;

COMMIT;
