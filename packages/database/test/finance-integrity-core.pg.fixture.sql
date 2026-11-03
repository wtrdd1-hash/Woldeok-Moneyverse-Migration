-- Disposable PostgreSQL 17 fixture, never apply to a live Moneyverse database.
-- Minimal canonical schema reproducing the columns consumed by migration 329.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
DO $roles$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='moneyverse_app') THEN
    CREATE ROLE moneyverse_app NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='moneyverse_reconciler') THEN
    CREATE ROLE moneyverse_reconciler NOLOGIN;
  END IF;
END $roles$;
CREATE TYPE public.account_type AS ENUM('USER_CASH','USER_BANK','TREASURY','MINT','SINK','ESCROW');
CREATE TYPE public.account_status AS ENUM('active','frozen','closed');
CREATE TYPE public.posting_direction AS ENUM('debit','credit');
CREATE TABLE public.accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), account_type public.account_type NOT NULL,
 owner_user_id uuid, system_key text, currency char(3) NOT NULL DEFAULT 'WLD',
 status public.account_status NOT NULL DEFAULT 'active', allow_negative boolean NOT NULL DEFAULT false
);
CREATE TABLE public.account_balances (
 account_id uuid PRIMARY KEY REFERENCES public.accounts(id),
 available_amount numeric NOT NULL DEFAULT 0, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.ledger_transactions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), idempotency_key uuid NOT NULL UNIQUE,
 type text NOT NULL, actor_user_id uuid NOT NULL, policy_version text,
 request_hash bytea NOT NULL, request_hash_version smallint NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.ledger_postings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 transaction_id uuid NOT NULL REFERENCES public.ledger_transactions(id),
 account_id uuid NOT NULL REFERENCES public.accounts(id),
 amount numeric NOT NULL CHECK(amount>0), direction public.posting_direction NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.outbox_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),aggregate_id uuid NOT NULL,
 type text NOT NULL,payload jsonb NOT NULL
);
CREATE INDEX idx_ledger_postings_transaction_id ON public.ledger_postings(transaction_id);
CREATE INDEX idx_ledger_postings_account_id ON public.ledger_postings(account_id);
GRANT USAGE ON SCHEMA public TO moneyverse_app,moneyverse_reconciler;
GRANT SELECT ON public.accounts,public.account_balances,public.ledger_transactions,
 public.ledger_postings TO moneyverse_app;
-- Existing canonical function is replaced by migration 329.
CREATE FUNCTION public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb)
RETURNS uuid LANGUAGE sql AS 'SELECT NULL::uuid';
GRANT EXECUTE ON FUNCTION public.economy_post_transaction(uuid,text,uuid,text,jsonb,text,jsonb)
TO moneyverse_app;
