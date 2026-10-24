-- v503 P0 P2P exact-once acceptance. RUN ONLY on fresh, isolated scratch PG.
\set ON_ERROR_STOP on
INSERT INTO public.users(id,status) VALUES
 ('11111111-1111-4111-8111-111111111111','active'),
 ('22222222-2222-4222-8222-222222222222','active'),
 ('55555555-5555-4555-8555-555555555555','active');
INSERT INTO public.member_profiles(user_id,display_name) VALUES
 ('11111111-1111-4111-8111-111111111111','Sender'),
 ('22222222-2222-4222-8222-222222222222','Receiver');
INSERT INTO public.accounts(owner_user_id,account_type)
 VALUES ('11111111-1111-4111-8111-111111111111','USER_CASH'),
 ('22222222-2222-4222-8222-222222222222','USER_CASH'),
 ('55555555-5555-4555-8555-555555555555','USER_CASH');
INSERT INTO public.account_balances(account_id,available_amount)
 SELECT id, CASE WHEN owner_user_id='11111111-1111-4111-8111-111111111111'
   THEN 100000000000000000000000000::numeric ELSE 0 END FROM public.accounts
 WHERE owner_user_id IS NOT NULL;
SET ROLE moneyverse_app;
SELECT * FROM public.wallet_p2p_transfer(
 '33333333-3333-4333-8333-333333333333',
 '11111111-1111-4111-8111-111111111111',
 '22222222-2222-4222-8222-222222222222',
 900719925474099312345::numeric,'hello','heart');
SELECT * FROM public.wallet_p2p_transfer(
 '33333333-3333-4333-8333-333333333333',
 '11111111-1111-4111-8111-111111111111',
 '22222222-2222-4222-8222-222222222222',
 900719925474099312345::numeric,'hello','heart');
RESET ROLE;
DO $$
DECLARE v_tx uuid; v_count int; v_amount numeric;
BEGIN
 SELECT ledger_transaction_id INTO v_tx FROM public.p2p_wire_transfers
 WHERE idempotency_key='33333333-3333-4333-8333-333333333333';
 SELECT count(*) INTO v_count FROM public.p2p_wire_transfers WHERE ledger_transaction_id=v_tx;
 IF v_count<>1 THEN RAISE EXCEPTION 'duplicate P2P record'; END IF;
 SELECT count(*) INTO v_count FROM public.in_app_notifications
 WHERE dedupe_key='wallet:p2p:'||v_tx::text;
 IF v_count<>1 THEN RAISE EXCEPTION 'duplicate notification'; END IF;
 SELECT available_amount INTO v_amount FROM public.account_balances b
 JOIN public.accounts a ON a.id=b.account_id
 WHERE a.owner_user_id='22222222-2222-4222-8222-222222222222';
 IF v_amount<>900719925474099312345::numeric THEN RAISE EXCEPTION 'incorrect recipient balance %',v_amount; END IF;
 IF has_table_privilege('moneyverse_app','public.p2p_wire_transfers','INSERT') THEN
   RAISE EXCEPTION 'app still has P2P INSERT'; END IF;
END $$;
SET ROLE moneyverse_app;
DO $$
BEGIN
 BEGIN
  PERFORM public.wallet_p2p_transfer('33333333-3333-4333-8333-333333333333',
   '55555555-5555-4555-8555-555555555555','22222222-2222-4222-8222-222222222222',
   900719925474099312345::numeric,'hello','heart');
  RAISE EXCEPTION 'wrong actor replay accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN
  PERFORM public.wallet_p2p_transfer('33333333-3333-4333-8333-333333333333',
   '11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222',
   900719925474099312345::numeric,'changed','heart');
  RAISE EXCEPTION 'payload change accepted';
 EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN
  INSERT INTO public.p2p_wire_transfers(sender_id,receiver_id,receiver_name,amount_wld)
  VALUES('11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222','x',1);
  RAISE EXCEPTION 'direct P2P INSERT allowed';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
RESET ROLE;
-- Force the notification step to fail after ledger and P2P INSERT, and verify
-- that neither ledger nor metadata nor balances persist.
CREATE FUNCTION public.v503_reject_notification() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW.dedupe_key LIKE 'wallet:p2p:%' THEN
   RAISE EXCEPTION 'v503 forced notification failure';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER v503_notification_failure BEFORE INSERT ON public.in_app_notifications
 FOR EACH ROW EXECUTE FUNCTION public.v503_reject_notification();
SET ROLE moneyverse_app;
DO $$
BEGIN
 BEGIN
  PERFORM public.wallet_p2p_transfer('66666666-6666-4666-8666-666666666666',
   '11111111-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222',
   5,'rollback','star');
  RAISE EXCEPTION 'injected failure did not abort';
 EXCEPTION WHEN raise_exception THEN
  IF SQLERRM<>'v503 forced notification failure' THEN RAISE; END IF;
 END;
END $$;
RESET ROLE;
DO $$
BEGIN
 IF EXISTS(SELECT 1 FROM public.ledger_transactions WHERE idempotency_key='66666666-6666-4666-8666-666666666666')
   OR EXISTS(SELECT 1 FROM public.p2p_wire_transfers WHERE idempotency_key='66666666-6666-4666-8666-666666666666')
 THEN RAISE EXCEPTION 'partial ledger/P2P record survived rollback'; END IF;
END $$;
DROP TRIGGER v503_notification_failure ON public.in_app_notifications;
DROP FUNCTION public.v503_reject_notification();
-- Seed for 100 concurrent same-key attempts. Sender balance has sufficient funds.
