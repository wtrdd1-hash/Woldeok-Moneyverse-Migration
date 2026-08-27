-- SEC-003 + SEC-006: two independent audit findings converge on the same
-- five SECURITY DEFINER functions. SEC-003 found that each checks its
-- idempotency key with a plain SELECT before taking any lock, so two
-- concurrent identical requests can both see "not found," both run the
-- full side-effecting body, and collide on the receipt table's unique
-- index with a raw 23505 instead of one of them gracefully replaying the
-- other's receipt. SEC-006 found that the same check never verifies the
-- replayed row belongs to the caller, so guessing another user's
-- client-chosen idempotency key returns that user's receipt.
--
-- Fix, applied identically to all five functions below:
--   1. `PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:<fn>:'
--      || p_key::text, 0))` immediately after input validation and before
--      the idempotency check. This serializes every call sharing a key,
--      released at commit or rollback. Copied from economy_claim_daily
--      (005-economy-hardening.sql) and economy_claim_work
--      (021-work-reward.sql) rather than shop_purchase's row-lock-plus-
--      ON-CONFLICT shape (009-shop-hardening.sql): unlike shop_purchase,
--      all five functions here mutate state that is not itself idempotent
--      by key (a stock position accumulator, a one-active-loan-per-user
--      slot, a business ownership row, a points ledger) between the check
--      and the final INSERT, so a loser that is merely allowed to race
--      past the check to that INSERT could double-apply that mutation
--      before losing on the unique index. Serializing the whole critical
--      section with the advisory lock, as the two claim functions already
--      do, prevents a loser from ever entering the side-effecting body in
--      the first place.
--   2. Inside the existing "already recorded" branch, compare the
--      replayed row's owning user to the caller and RAISE (ERRCODE 28000)
--      on mismatch before returning it. Copied from member_board_create
--      (044-member-board.sql), which uses 28000 for this exact
--      caller-vs-row-owner mismatch; economy_claim_work
--      (021-work-reward.sql) raises the same situation as 23505 instead,
--      but 28000 (invalid_authorization_specification) is the more
--      recently established and semantically correct choice, so it is
--      the one standardized on here.
--
-- No table, column, index, signature, or return-shape change. Every
-- function keeps its existing RETURNS TABLE shape, so this migration is a
-- drop-in replacement compatible with the application version already
-- running; it does not need to be sequenced with an application deploy in
-- either direction, and the five CREATE OR REPLACE statements below are
-- independent of each other (none references another). Rollout order:
-- apply this migration by itself, same as any other numbered migration in
-- this directory (test/db/migrate.sh refuses to reapply a changed file, so
-- it is applied exactly once per database).

CREATE OR REPLACE FUNCTION public.stock_trade(
  p_key uuid, p_actor uuid, p_stock uuid, p_side text, p_quantity bigint
)
RETURNS TABLE(trade_id uuid, unit_price bigint, gross_amount bigint, tax_amount bigint, current_price bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_price bigint; v_open bigint; v_gross bigint; v_tax bigint := 0;
  v_cash uuid; v_sink uuid; v_treasury uuid; v_position bigint := 0;
  v_trade uuid; v_next bigint; v_wallet_net_worth bigint := 0;
  v_stock_net_worth bigint := 0; v_net_worth_before_tax bigint := 0;
  v_existing_user_id uuid; v_existing_unit_price bigint;
  v_existing_gross_amount bigint; v_existing_tax_amount bigint; v_existing_current_price bigint;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_stock IS NULL
    OR p_side NOT IN ('buy', 'sell') OR p_quantity < 1 OR p_quantity > 1000000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid stock trade';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:stock-trade:' || p_key::text, 0));

  SELECT trade_row.id, trade_row.user_id, trade_row.unit_price, trade_row.gross_amount, trade_row.tax_amount, stock_row.current_price
  INTO v_trade, v_existing_user_id, v_existing_unit_price, v_existing_gross_amount, v_existing_tax_amount, v_existing_current_price
  FROM public.virtual_stock_trades AS trade_row
  JOIN public.virtual_stocks AS stock_row ON stock_row.id = trade_row.stock_id
  WHERE trade_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_existing_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'stock trade receipt belongs to another user';
    END IF;
    RETURN QUERY SELECT v_trade, v_existing_unit_price, v_existing_gross_amount, v_existing_tax_amount, v_existing_current_price;
    RETURN;
  END IF;

  PERFORM position_row.user_id
  FROM public.virtual_stock_positions AS position_row
  JOIN public.virtual_stocks AS position_stock ON position_stock.id = position_row.stock_id
  WHERE position_row.user_id = p_actor
  ORDER BY position_row.stock_id
  FOR UPDATE OF position_row, position_stock;

  SELECT stock_row.current_price, stock_row.day_open_price INTO v_price, v_open
  FROM public.virtual_stocks AS stock_row
  WHERE stock_row.id = p_stock AND stock_row.active
  FOR UPDATE;
  IF v_price IS NULL THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active stock required'; END IF;
  v_gross := v_price * p_quantity;

  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status FOR UPDATE;
  SELECT account_row.id INTO v_sink FROM public.accounts AS account_row
  WHERE account_row.system_key = 'sink' AND account_row.account_type = 'SINK'::public.account_type
    AND account_row.status = 'active'::public.account_status FOR UPDATE;
  SELECT account_row.id INTO v_treasury FROM public.accounts AS account_row
  WHERE account_row.system_key = 'treasury' AND account_row.account_type = 'TREASURY'::public.account_type
    AND account_row.status = 'active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_sink IS NULL OR v_treasury IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active game accounts required';
  END IF;

  SELECT position_row.quantity INTO v_position FROM public.virtual_stock_positions AS position_row
  WHERE position_row.user_id = p_actor AND position_row.stock_id = p_stock FOR UPDATE;
  v_position := coalesce(v_position, 0);
  IF p_side = 'sell' AND v_position < p_quantity THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'insufficient stock position';
  END IF;

  IF p_side = 'sell' THEN
    SELECT coalesce(sum(balance_row.available_amount), 0) INTO v_wallet_net_worth
    FROM public.accounts AS account_row JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
    WHERE account_row.owner_user_id = p_actor AND account_row.status = 'active'::public.account_status
      AND account_row.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type);
    SELECT coalesce(sum(position_row.quantity * stock_row.current_price), 0) INTO v_stock_net_worth
    FROM public.virtual_stock_positions AS position_row JOIN public.virtual_stocks AS stock_row ON stock_row.id = position_row.stock_id
    WHERE position_row.user_id = p_actor;
    v_net_worth_before_tax := v_wallet_net_worth + v_stock_net_worth;
    v_tax := least(floor(v_gross * 0.01)::bigint, greatest(v_net_worth_before_tax - 1000000, 0));
  END IF;

  PERFORM public.economy_post_transaction(
    p_key, 'VIRTUAL_STOCK_' || upper(p_side), p_actor, NULL,
    CASE WHEN p_side = 'buy' THEN jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', v_gross, 'direction', 'credit'),
      jsonb_build_object('accountId', v_sink, 'amount', v_gross, 'direction', 'debit')
    ) WHEN v_tax = 0 THEN jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', v_gross, 'direction', 'debit'),
      jsonb_build_object('accountId', v_sink, 'amount', v_gross, 'direction', 'credit')
    ) ELSE jsonb_build_array(
      jsonb_build_object('accountId', v_cash, 'amount', v_gross - v_tax, 'direction', 'debit'),
      jsonb_build_object('accountId', v_treasury, 'amount', v_tax, 'direction', 'debit'),
      jsonb_build_object('accountId', v_sink, 'amount', v_gross, 'direction', 'credit')
    ) END,
    'stock.trade.completed',
    jsonb_build_object('stockId', p_stock, 'side', p_side, 'quantity', p_quantity, 'tax', v_tax, 'netWorthBeforeTax', v_net_worth_before_tax)
  );

  IF p_side = 'buy' THEN
    INSERT INTO public.virtual_stock_positions(user_id, stock_id, quantity, average_cost)
    VALUES(p_actor, p_stock, p_quantity, v_price)
    ON CONFLICT(user_id, stock_id) DO UPDATE
    SET average_cost = ((virtual_stock_positions.quantity * virtual_stock_positions.average_cost + excluded.quantity * excluded.average_cost) / (virtual_stock_positions.quantity + excluded.quantity)),
        quantity = virtual_stock_positions.quantity + excluded.quantity, updated_at = now();
  ELSE
    UPDATE public.virtual_stock_positions AS position_row
    SET quantity = position_row.quantity - p_quantity, updated_at = now()
    WHERE position_row.user_id = p_actor AND position_row.stock_id = p_stock;
  END IF;

  INSERT INTO public.virtual_stock_trades(idempotency_key, user_id, stock_id, side, quantity, unit_price, gross_amount, tax_amount)
  VALUES(p_key, p_actor, p_stock, p_side, p_quantity, v_price, v_gross, v_tax)
  RETURNING id INTO v_trade;
  v_next := CASE WHEN p_side = 'buy' THEN least((v_price * 101 + 99) / 100, (v_open * 115) / 100)
    ELSE greatest((v_price * 99) / 100, (v_open * 85) / 100, 10) END;
  UPDATE public.virtual_stocks AS stock_row SET current_price = v_next, updated_at = now() WHERE stock_row.id = p_stock;
  RETURN QUERY SELECT v_trade, v_price, v_gross, v_tax, v_next;
END;
$$;

ALTER FUNCTION public.stock_trade(uuid, uuid, uuid, text, bigint) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.stock_trade(uuid, uuid, uuid, text, bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stock_trade(uuid, uuid, uuid, text, bigint) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.bank_borrow(
  p_key uuid, p_actor uuid, p_principal bigint
)
RETURNS TABLE(loan_id uuid, principal_amount bigint, interest_amount bigint, outstanding_amount bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_cash uuid; v_mint uuid; v_loan uuid; v_interest bigint; v_transaction uuid; v_existing_user_id uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_principal < 100 OR p_principal > 500000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid loan amount';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:bank-borrow:' || p_key::text, 0));
  SELECT loan_row.id, loan_row.user_id, loan_row.principal_amount, loan_row.interest_amount, loan_row.outstanding_amount
  INTO v_loan, v_existing_user_id, principal_amount, interest_amount, outstanding_amount
  FROM public.virtual_bank_loans AS loan_row WHERE loan_row.borrow_idempotency_key=p_key;
  IF FOUND THEN
    IF v_existing_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='loan receipt belongs to another user';
    END IF;
    SELECT transaction_row.id INTO transaction_id FROM public.ledger_transactions AS transaction_row WHERE transaction_row.idempotency_key=p_key;
    loan_id:=v_loan; replayed:=true; RETURN NEXT; RETURN;
  END IF;
  PERFORM loan_row.id FROM public.virtual_bank_loans AS loan_row WHERE loan_row.user_id=p_actor AND loan_row.status='active' FOR UPDATE;
  IF FOUND THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='an active loan already exists'; END IF;
  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id=p_actor AND account_row.account_type='USER_CASH'::public.account_type AND account_row.status='active'::public.account_status FOR UPDATE;
  SELECT account_row.id INTO v_mint FROM public.accounts AS account_row
  WHERE account_row.system_key='mint' AND account_row.account_type='MINT'::public.account_type AND account_row.status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_mint IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active loan accounts required'; END IF;
  v_interest := ceil(p_principal * 0.05)::bigint;
  SELECT public.economy_post_transaction(p_key,'BANK_LOAN_ISSUED',p_actor,NULL,
    jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',p_principal,'direction','debit'),jsonb_build_object('accountId',v_mint,'amount',p_principal,'direction','credit')),
    'bank.loan.issued',jsonb_build_object('principal',p_principal,'interest',v_interest)) INTO v_transaction;
  INSERT INTO public.virtual_bank_loans(borrow_idempotency_key,user_id,principal_amount,interest_amount,outstanding_amount,status)
  VALUES(p_key,p_actor,p_principal,v_interest,p_principal+v_interest,'active') RETURNING id INTO v_loan;
  RETURN QUERY SELECT v_loan,p_principal,v_interest,p_principal+v_interest,v_transaction,false;
END;
$$;

CREATE OR REPLACE FUNCTION public.bank_repay(
  p_key uuid, p_actor uuid, p_loan uuid, p_amount bigint
)
RETURNS TABLE(loan_id uuid, paid_amount bigint, outstanding_amount bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_cash uuid; v_mint uuid; v_outstanding bigint; v_paid bigint; v_transaction uuid; v_existing_user_id uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_loan IS NULL OR p_amount < 1 OR p_amount > 1000000000 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid loan repayment';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:bank-repay:' || p_key::text, 0));
  SELECT repayment.loan_id, loan_row.user_id, repayment.amount, loan_row.outstanding_amount, repayment.transaction_id
  INTO loan_id, v_existing_user_id, paid_amount, outstanding_amount, transaction_id
  FROM public.virtual_bank_loan_repayments AS repayment JOIN public.virtual_bank_loans AS loan_row ON loan_row.id=repayment.loan_id
  WHERE repayment.idempotency_key=p_key;
  IF FOUND THEN
    IF v_existing_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='loan repayment receipt belongs to another user';
    END IF;
    replayed:=true; RETURN NEXT; RETURN;
  END IF;
  SELECT loan_row.outstanding_amount INTO v_outstanding FROM public.virtual_bank_loans AS loan_row
  WHERE loan_row.id=p_loan AND loan_row.user_id=p_actor AND loan_row.status='active' FOR UPDATE;
  IF v_outstanding IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active loan required'; END IF;
  v_paid := least(p_amount,v_outstanding);
  SELECT account_row.id INTO v_cash FROM public.accounts AS account_row
  WHERE account_row.owner_user_id=p_actor AND account_row.account_type='USER_CASH'::public.account_type AND account_row.status='active'::public.account_status FOR UPDATE;
  SELECT account_row.id INTO v_mint FROM public.accounts AS account_row
  WHERE account_row.system_key='mint' AND account_row.account_type='MINT'::public.account_type AND account_row.status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_mint IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active loan accounts required'; END IF;
  SELECT public.economy_post_transaction(p_key,'BANK_LOAN_REPAYMENT',p_actor,NULL,
    jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',v_paid,'direction','credit'),jsonb_build_object('accountId',v_mint,'amount',v_paid,'direction','debit')),
    'bank.loan.repaid',jsonb_build_object('loanId',p_loan,'amount',v_paid)) INTO v_transaction;
  UPDATE public.virtual_bank_loans AS loan_row SET outstanding_amount=v_outstanding-v_paid,
    status=CASE WHEN v_outstanding=v_paid THEN 'repaid' ELSE 'active' END,
    repaid_at=CASE WHEN v_outstanding=v_paid THEN clock_timestamp() ELSE NULL END WHERE loan_row.id=p_loan;
  INSERT INTO public.virtual_bank_loan_repayments(idempotency_key,loan_id,amount,transaction_id) VALUES(p_key,p_loan,v_paid,v_transaction);
  RETURN QUERY SELECT p_loan,v_paid,v_outstanding-v_paid,v_transaction,false;
END;
$$;

ALTER FUNCTION public.bank_borrow(uuid,uuid,bigint) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_repay(uuid,uuid,uuid,bigint) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.bank_borrow(uuid,uuid,bigint), public.bank_repay(uuid,uuid,uuid,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bank_borrow(uuid,uuid,bigint), public.bank_repay(uuid,uuid,uuid,bigint) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.business_purchase(p_key uuid, p_actor uuid, p_business_type uuid)
RETURNS TABLE(ownership_id uuid, business_type_id uuid, purchase_cost bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_cash uuid; v_sink uuid; v_cost bigint; v_transaction uuid; v_ownership uuid; v_existing_user_id uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_business_type IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='business purchase identity is required'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:business-purchase:' || p_key::text, 0));
  SELECT ownership.id, ownership.user_id, ownership.business_type_id, business.purchase_cost, ownership.purchase_transaction_id
  INTO v_ownership, v_existing_user_id, business_type_id, purchase_cost, transaction_id
  FROM public.virtual_business_ownerships AS ownership JOIN public.virtual_business_types AS business ON business.id=ownership.business_type_id
  WHERE ownership.purchase_idempotency_key=p_key;
  IF FOUND THEN
    IF v_existing_user_id IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='business purchase receipt belongs to another user';
    END IF;
    ownership_id:=v_ownership; replayed:=true; RETURN NEXT; RETURN;
  END IF;
  SELECT business.purchase_cost INTO v_cost FROM public.virtual_business_types AS business WHERE business.id=p_business_type AND business.active FOR KEY SHARE;
  IF v_cost IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='business is unavailable'; END IF;
  PERFORM ownership.id FROM public.virtual_business_ownerships AS ownership WHERE ownership.user_id=p_actor AND ownership.business_type_id=p_business_type FOR UPDATE;
  IF FOUND THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='business is already owned'; END IF;
  SELECT account.id INTO v_cash FROM public.accounts AS account WHERE account.owner_user_id=p_actor AND account.account_type='USER_CASH'::public.account_type AND account.status='active'::public.account_status FOR UPDATE;
  SELECT account.id INTO v_sink FROM public.accounts AS account WHERE account.system_key='sink' AND account.account_type='SINK'::public.account_type AND account.status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_sink IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active business accounts required'; END IF;
  SELECT public.economy_post_transaction(p_key,'BUSINESS_PURCHASE',p_actor,NULL,
    jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',v_cost,'direction','credit'),jsonb_build_object('accountId',v_sink,'amount',v_cost,'direction','debit')),
    'business.purchased',jsonb_build_object('businessTypeId',p_business_type,'cost',v_cost)) INTO v_transaction;
  INSERT INTO public.virtual_business_ownerships(user_id,business_type_id,purchase_idempotency_key,purchase_transaction_id)
    VALUES(p_actor,p_business_type,p_key,v_transaction) RETURNING id INTO v_ownership;
  RETURN QUERY SELECT v_ownership,p_business_type,v_cost,v_transaction,false;
END;
$$;

ALTER FUNCTION public.business_purchase(uuid,uuid,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.business_purchase(uuid,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.business_purchase(uuid,uuid,uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.season_consume(p_key uuid,p_actor uuid,p_event uuid,p_quantity integer)
RETURNS TABLE(event_id uuid, points_earned bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE v_cost bigint; v_points integer; v_cash uuid; v_sink uuid; v_tx uuid; v_existing_user_id uuid;
BEGIN
 IF p_key IS NULL OR p_actor IS NULL OR p_event IS NULL OR p_quantity < 1 OR p_quantity > 100 THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='invalid event entry'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:season-consume:' || p_key::text, 0));
 SELECT entry.event_id,entry.user_id,entry.points_earned,entry.transaction_id INTO event_id,v_existing_user_id,points_earned,transaction_id FROM public.virtual_consumption_event_entries AS entry WHERE entry.idempotency_key=p_key;
 IF FOUND THEN
   IF v_existing_user_id IS DISTINCT FROM p_actor THEN RAISE EXCEPTION USING ERRCODE='28000',MESSAGE='event entry receipt belongs to another user'; END IF;
   replayed:=true; RETURN NEXT; RETURN;
 END IF;
 SELECT event.cost_wld,event.points_per_entry INTO v_cost,v_points FROM public.virtual_consumption_events AS event JOIN public.virtual_seasons AS season ON season.id=event.season_id WHERE event.id=p_event AND event.active AND season.active AND season.starts_at<=clock_timestamp() AND season.ends_at>clock_timestamp() FOR KEY SHARE OF event,season;
 IF v_cost IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='event is unavailable'; END IF;
 SELECT id INTO v_cash FROM public.accounts WHERE owner_user_id=p_actor AND account_type='USER_CASH'::public.account_type AND status='active'::public.account_status FOR UPDATE;
 SELECT id INTO v_sink FROM public.accounts WHERE system_key='sink' AND account_type='SINK'::public.account_type AND status='active'::public.account_status FOR UPDATE;
 IF v_cash IS NULL OR v_sink IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='active event accounts required'; END IF;
 SELECT public.economy_post_transaction(p_key,'CONSUMPTION_EVENT',p_actor,NULL,jsonb_build_array(jsonb_build_object('accountId',v_cash,'amount',v_cost*p_quantity,'direction','credit'),jsonb_build_object('accountId',v_sink,'amount',v_cost*p_quantity,'direction','debit')),'season.event.consumed',jsonb_build_object('eventId',p_event,'quantity',p_quantity,'points',v_points*p_quantity)) INTO v_tx;
 INSERT INTO public.virtual_consumption_event_entries(idempotency_key,event_id,user_id,quantity,points_earned,transaction_id) VALUES(p_key,p_event,p_actor,p_quantity,v_points*p_quantity,v_tx);
 RETURN QUERY SELECT p_event,(v_points*p_quantity)::bigint,v_tx,false;
END;
$$;

ALTER FUNCTION public.season_consume(uuid,uuid,uuid,integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.season_consume(uuid,uuid,uuid,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.season_consume(uuid,uuid,uuid,integer) TO moneyverse_app;
