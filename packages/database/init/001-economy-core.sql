CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE user_status AS ENUM ('active', 'restricted', 'deleted');
CREATE TYPE identity_provider AS ENUM ('discord', 'google');
CREATE TYPE account_type AS ENUM ('USER_CASH', 'USER_BANK', 'TREASURY', 'MINT', 'SINK', 'ESCROW');
CREATE TYPE account_status AS ENUM ('active', 'frozen', 'closed');
CREATE TYPE posting_direction AS ENUM ('debit', 'credit');

CREATE TABLE users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), status user_status NOT NULL DEFAULT 'active', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE identities (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), provider identity_provider NOT NULL, provider_subject text NOT NULL, display_name text NOT NULL, linked_at timestamptz NOT NULL DEFAULT now(), UNIQUE(provider, provider_subject));
CREATE TABLE consent_versions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), terms_version text NOT NULL, privacy_version text NOT NULL, published_at timestamptz NOT NULL, UNIQUE(terms_version, privacy_version));
CREATE TABLE user_consents (user_id uuid NOT NULL REFERENCES users(id), consent_version_id uuid NOT NULL REFERENCES consent_versions(id), agreed_at timestamptz NOT NULL DEFAULT now(), age_confirmed boolean NOT NULL, PRIMARY KEY(user_id, consent_version_id));
CREATE TABLE accounts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account_type account_type NOT NULL, owner_user_id uuid REFERENCES users(id), system_key text UNIQUE, currency char(3) NOT NULL DEFAULT 'WLD', status account_status NOT NULL DEFAULT 'active', allow_negative boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now(), CHECK ((owner_user_id IS NULL) <> (system_key IS NULL)));
CREATE UNIQUE INDEX one_user_account_per_type ON accounts(owner_user_id, account_type) WHERE owner_user_id IS NOT NULL;
CREATE TABLE account_balances (account_id uuid PRIMARY KEY REFERENCES accounts(id), available_amount bigint NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE economy_policies (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version text NOT NULL UNIQUE, effective_at timestamptz NOT NULL, status text NOT NULL CHECK(status IN ('draft','approved','active','rolled_back')), payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE ledger_transactions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), idempotency_key uuid NOT NULL UNIQUE, type text NOT NULL, actor_user_id uuid REFERENCES users(id), policy_version text REFERENCES economy_policies(version), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE ledger_postings (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), transaction_id uuid NOT NULL REFERENCES ledger_transactions(id), account_id uuid NOT NULL REFERENCES accounts(id), amount bigint NOT NULL CHECK(amount > 0), direction posting_direction NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE outbox_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), aggregate_id uuid NOT NULL, type text NOT NULL, payload jsonb NOT NULL, delivered_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE audit_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_user_id uuid REFERENCES users(id), action text NOT NULL, target_id uuid, request_id uuid, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now(), integrity_hash text NOT NULL);
CREATE TABLE economy_metrics (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), engine text NOT NULL, metric_version text NOT NULL, calculated_at timestamptz NOT NULL, payload jsonb NOT NULL, UNIQUE(engine, metric_version, calculated_at));

INSERT INTO accounts(account_type, system_key, allow_negative) VALUES ('TREASURY','treasury',false), ('MINT','mint',true), ('SINK','sink',true), ('ESCROW','escrow',false);
INSERT INTO account_balances(account_id) SELECT id FROM accounts;

CREATE OR REPLACE FUNCTION economy_post_transaction(p_key uuid, p_type text, p_actor uuid, p_policy text, p_postings jsonb, p_event text, p_payload jsonb) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE tx_id uuid; debit_total bigint; credit_total bigint; invalid_balance boolean;
BEGIN
  SELECT id INTO tx_id FROM ledger_transactions WHERE idempotency_key = p_key;
  IF tx_id IS NOT NULL THEN RETURN tx_id; END IF;
  IF jsonb_typeof(p_postings) <> 'array' OR jsonb_array_length(p_postings) < 2 THEN RAISE EXCEPTION 'at least two postings required'; END IF;
  SELECT coalesce(sum((x->>'amount')::bigint) FILTER (WHERE x->>'direction'='debit'),0), coalesce(sum((x->>'amount')::bigint) FILTER (WHERE x->>'direction'='credit'),0) INTO debit_total, credit_total FROM jsonb_array_elements(p_postings) x;
  IF debit_total <> credit_total OR debit_total <= 0 THEN RAISE EXCEPTION 'unbalanced ledger transaction'; END IF;
  PERFORM 1 FROM accounts WHERE id IN (SELECT (x->>'accountId')::uuid FROM jsonb_array_elements(p_postings) x) ORDER BY id FOR UPDATE;
  IF (SELECT count(*) FROM accounts WHERE id IN (SELECT (x->>'accountId')::uuid FROM jsonb_array_elements(p_postings) x)) <> (SELECT count(DISTINCT x->>'accountId') FROM jsonb_array_elements(p_postings) x) THEN RAISE EXCEPTION 'unknown account'; END IF;
  INSERT INTO ledger_transactions(idempotency_key,type,actor_user_id,policy_version) VALUES(p_key,p_type,p_actor,p_policy) RETURNING id INTO tx_id;
  INSERT INTO ledger_postings(transaction_id,account_id,amount,direction) SELECT tx_id,(x->>'accountId')::uuid,(x->>'amount')::bigint,(x->>'direction')::posting_direction FROM jsonb_array_elements(p_postings) x;
  UPDATE account_balances b SET available_amount=b.available_amount+d.delta,updated_at=now() FROM (SELECT (x->>'accountId')::uuid id,sum(CASE WHEN x->>'direction'='debit' THEN (x->>'amount')::bigint ELSE -(x->>'amount')::bigint END) delta FROM jsonb_array_elements(p_postings) x GROUP BY 1) d WHERE b.account_id=d.id;
  SELECT EXISTS(SELECT 1 FROM account_balances b JOIN accounts a ON a.id=b.account_id WHERE b.available_amount < 0 AND NOT a.allow_negative) INTO invalid_balance;
  IF invalid_balance THEN RAISE EXCEPTION 'insufficient balance'; END IF;
  INSERT INTO outbox_events(aggregate_id,type,payload) VALUES(tx_id,p_event,p_payload);
  RETURN tx_id;
END $$;

GRANT USAGE ON SCHEMA public TO moneyverse_app;
GRANT SELECT, INSERT ON users, identities, user_consents, ledger_transactions, ledger_postings, outbox_events, audit_logs TO moneyverse_app;
GRANT SELECT ON accounts, account_balances, consent_versions, economy_policies, economy_metrics TO moneyverse_app;
GRANT EXECUTE ON FUNCTION economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb) TO moneyverse_app;
