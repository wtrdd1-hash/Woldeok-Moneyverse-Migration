-- v503: P0 #1025. Durable, transaction-ID keyed P2P transfer and notification.
-- Forward-only. No production writes or data backfill in this migration.
BEGIN;

-- Legacy deployments created these feature tables outside the migration chain.
-- CREATE IF NOT EXISTS supports clean isolated PostgreSQL installations.
CREATE TABLE IF NOT EXISTS public.p2p_wire_transfers (
 id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
 sender_id uuid NOT NULL,
 receiver_id uuid NOT NULL,
 receiver_name text NOT NULL,
 amount_wld numeric NOT NULL,
 message text,
 sticker text,
 status text NOT NULL DEFAULT 'completed',
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.in_app_notifications (
 id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
 user_id uuid NOT NULL,
 category text NOT NULL,
 title text NOT NULL,
 body text NOT NULL,
 link text,
 dedupe_key text,
 is_read boolean NOT NULL DEFAULT false,
 read_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.p2p_wire_transfers
 ADD COLUMN IF NOT EXISTS ledger_transaction_id uuid REFERENCES public.ledger_transactions(id),
 ADD COLUMN IF NOT EXISTS idempotency_key uuid;
CREATE UNIQUE INDEX IF NOT EXISTS ux_p2p_wire_ledger_tx
 ON public.p2p_wire_transfers(ledger_transaction_id)
 WHERE ledger_transaction_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_p2p_wire_request_key
 ON public.p2p_wire_transfers(idempotency_key)
 WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS ux_p2p_notification_dedupe
 ON public.in_app_notifications(dedupe_key)
 WHERE dedupe_key IS NOT NULL;

-- Keep the standard transfer API replay-aware, so websocket notices do not
-- fire again for an already committed ledger transfer.
CREATE OR REPLACE FUNCTION public.wallet_transfer_receipt(
 p_key uuid, p_actor uuid, p_recipient uuid, p_amount numeric
) RETURNS TABLE(tx_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_existing uuid; v_tx uuid;
BEGIN
 IF p_key IS NULL THEN
   RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='idempotency key required';
 END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('wallet-transfer:' || p_key::text, 0));
 SELECT id INTO v_existing FROM public.ledger_transactions WHERE idempotency_key=p_key;
 -- economy_transfer verifies actor, recipient, amount and the ledger request
 -- hash even for replays. Never trust a key alone as proof of authorization.
 SELECT public.economy_transfer(p_key,p_actor,p_recipient,p_amount) INTO v_tx;
 RETURN QUERY SELECT v_tx, v_existing IS NOT NULL;
END $$;
ALTER FUNCTION public.wallet_transfer_receipt(uuid,uuid,uuid,numeric) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.wallet_transfer_receipt(uuid,uuid,uuid,numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wallet_transfer_receipt(uuid,uuid,uuid,numeric) TO moneyverse_app;

-- A single SECURITY DEFINER statement owns the ledger, P2P receipt, and
-- recipient notification. Any error rolls back all three together.
CREATE OR REPLACE FUNCTION public.wallet_p2p_transfer(
 p_key uuid, p_actor uuid, p_recipient uuid, p_amount numeric,
 p_message text DEFAULT NULL, p_sticker text DEFAULT NULL
) RETURNS TABLE(tx_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
 v_prior public.p2p_wire_transfers%ROWTYPE;
 v_ledger uuid;
 v_tx uuid;
 v_sender_name text;
 v_recipient_name text;
BEGIN
 IF p_key IS NULL OR p_actor IS NULL OR p_recipient IS NULL
   OR p_actor=p_recipient OR p_amount IS NULL OR p_amount<=0
   OR p_amount<>trunc(p_amount)
   OR char_length(coalesce(p_message,''))>50
   OR char_length(coalesce(p_sticker,''))>20 THEN
   RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid P2P request';
 END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('wallet-transfer:' || p_key::text, 0));
 SELECT * INTO v_prior FROM public.p2p_wire_transfers
 WHERE idempotency_key=p_key FOR UPDATE;
 IF FOUND THEN
   IF v_prior.sender_id IS DISTINCT FROM p_actor
     OR v_prior.receiver_id IS DISTINCT FROM p_recipient
     OR v_prior.amount_wld IS DISTINCT FROM p_amount
     OR v_prior.message IS DISTINCT FROM p_message
     OR v_prior.sticker IS DISTINCT FROM p_sticker
     OR v_prior.ledger_transaction_id IS NULL THEN
     RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='P2P idempotency key payload mismatch';
   END IF;
   RETURN QUERY SELECT v_prior.ledger_transaction_id, true;
   RETURN;
 END IF;
 -- A pre-existing ordinary ledger transfer must never be upgraded into an
 -- unrelated P2P receipt just because its client reused a UUID.
 SELECT id INTO v_ledger FROM public.ledger_transactions WHERE idempotency_key=p_key;
 IF v_ledger IS NOT NULL THEN
   RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='P2P key already used for another operation';
 END IF;

 SELECT public.economy_transfer(p_key,p_actor,p_recipient,p_amount) INTO v_tx;
 SELECT coalesce(profile.display_name,'익명의 머니버스 시민') INTO v_sender_name
 FROM public.member_profiles AS profile WHERE profile.user_id=p_actor;
 SELECT coalesce(profile.display_name,p_recipient::text) INTO v_recipient_name
 FROM public.member_profiles AS profile WHERE profile.user_id=p_recipient;
 INSERT INTO public.p2p_wire_transfers (
   sender_id,receiver_id,receiver_name,amount_wld,message,sticker,
   ledger_transaction_id,idempotency_key
 ) VALUES (
   p_actor,p_recipient,coalesce(v_recipient_name,p_recipient::text),
   p_amount,p_message,p_sticker,v_tx,p_key
 );
 INSERT INTO public.in_app_notifications (
   user_id,category,title,body,link,dedupe_key
 ) VALUES (
   p_recipient,'TRANSACTIONAL',
   '💸 [P2P 송금] ' || coalesce(v_sender_name,'익명의 머니버스 시민') || '님으로부터 ' || p_amount::text || ' WLD가 입금되었습니다!',
   CASE WHEN p_message IS NOT NULL THEN '메모: "' || p_message || '"' ELSE '안전하게 송금되었습니다.' END
     || CASE WHEN p_sticker IS NOT NULL THEN ' (스티커: ' || p_sticker || ')' ELSE '' END,
   '/wallet','wallet:p2p:' || v_tx::text
 );
 RETURN QUERY SELECT v_tx, false;
END $$;
ALTER FUNCTION public.wallet_p2p_transfer(uuid,uuid,uuid,numeric,text,text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.wallet_p2p_transfer(uuid,uuid,uuid,numeric,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wallet_p2p_transfer(uuid,uuid,uuid,numeric,text,text) TO moneyverse_app;

-- Application writes must go through the atomic function; existing historical
-- P2P rows are left untouched and may have NULL transaction references.
REVOKE INSERT, UPDATE, DELETE ON public.p2p_wire_transfers FROM moneyverse_app;
COMMIT;
