-- v2026.11.04.1717 REAL WEB ROLE FINANCIAL E2E. DISPOSABLE CLONE ONLY.
-- Never run against real Test/Production databases. Must use a PostgreSQL 17
-- backup restore with original effective roles, running --network none.
-- Example: psql -X -v ON_ERROR_STOP=1 -v isolated_clone=1 -f this.sql
\set ON_ERROR_STOP on
\if :{?isolated_clone}
\else
\echo 'FAILED: isolated_clone=1 required on disposable network-none restored DB'
SELECT 1/0; -- intentional fail-closed stop when clone flag is missing
\quit
\endif
BEGIN;
SET LOCAL ROLE moneyverse_app;
DO $proof$
DECLARE
 a uuid;
 k1 uuid:=gen_random_uuid();
 k2 uuid:=gen_random_uuid();
 fund record;
 replay record;
 withdrawn record;
 replay_withdraw record;
BEGIN
 SELECT x.owner_user_id INTO a
 FROM public.accounts x JOIN public.account_balances b ON x.id=b.account_id
 JOIN public.users u ON u.id=x.owner_user_id
 WHERE x.account_type='USER_CASH' AND x.status='active' AND x.currency='WLD'
 AND u.status='active' AND b.available_amount>=1000
 ORDER BY b.available_amount DESC LIMIT 1;
 IF a IS NULL THEN RAISE EXCEPTION 'NO_ACTIVE_FUNDED_WALLET'; END IF;
 SELECT * INTO fund FROM public.treasury_core_post(a,k1,'NPS_FUND','1000');
 SELECT * INTO replay FROM public.treasury_core_post(a,k1,'NPS_FUND','1000');
 IF replay.ledger_transaction_id IS DISTINCT FROM fund.ledger_transaction_id
 OR replay.replayed IS DISTINCT FROM true
 OR fund.fund_balance_wld::numeric < 1000
 THEN RAISE EXCEPTION 'PENSION_FUND_REPLAY_FAILED'; END IF;
 SELECT * INTO withdrawn FROM public.treasury_core_post(a,k2,'NPS_WITHDRAW','1000');
 SELECT * INTO replay_withdraw FROM public.treasury_core_post(a,k2,'NPS_WITHDRAW','1000');
 IF replay_withdraw.ledger_transaction_id IS DISTINCT FROM withdrawn.ledger_transaction_id
 OR replay_withdraw.replayed IS DISTINCT FROM true OR
 withdrawn.user_disbursement_wld <> '950' OR
 withdrawn.welfare_fee_wld <> '50'
 THEN RAISE EXCEPTION 'PENSION_WITHDRAWAL_REPLAY_FAILED';END IF;
 RAISE NOTICE 'NPS_APP_ROLE_FUND_WITHDRAW_PASS funded=1000 refund=950 welfare=50 replay_unique=true';
END
$proof$;
RESET ROLE;
ROLLBACK;
SELECT (SELECT count(*) FROM public.ledger_transactions),
       (SELECT count(*) FROM public.finance_integrity_receipts),
       (SELECT count(*) FROM public.treasury_core_receipts);
