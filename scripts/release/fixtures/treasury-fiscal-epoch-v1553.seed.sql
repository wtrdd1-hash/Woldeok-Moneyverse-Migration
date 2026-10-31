-- v1553 synthetic public tables. No Production data or member identity.
CREATE TYPE public.account_type AS ENUM ('TREASURY','USER_CASH');
CREATE TYPE public.posting_direction AS ENUM ('debit','credit');
CREATE TABLE public.accounts (
  id uuid PRIMARY KEY, account_type public.account_type NOT NULL, system_key text
);
CREATE TABLE public.account_balances (
  account_id uuid PRIMARY KEY REFERENCES public.accounts(id), available_amount numeric NOT NULL
);
CREATE TABLE public.ledger_transactions (
  id uuid PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.ledger_postings (
  id uuid PRIMARY KEY,transaction_id uuid REFERENCES public.ledger_transactions(id),
  account_id uuid REFERENCES public.accounts(id), direction public.posting_direction, amount numeric NOT NULL
);
CREATE TABLE public.system_treasury_vaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text UNIQUE NOT NULL,
  balance_wld text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.system_treasury_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_transaction_id uuid REFERENCES public.ledger_transactions(id),
  created_at timestamptz NOT NULL DEFAULT now(), amount_wld text NOT NULL
);
CREATE TABLE public.state_enterprise_dividend_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),ledger_tx_id uuid,
  dividend_amount_wld numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.accounts VALUES
('00000000-0000-4000-8000-000000000001','TREASURY','treasury'),
('00000000-0000-4000-8000-000000000002','USER_CASH',NULL);
INSERT INTO public.account_balances VALUES
('00000000-0000-4000-8000-000000000001',0),
('00000000-0000-4000-8000-000000000002',100);
INSERT INTO public.system_treasury_vaults(code,balance_wld) VALUES
('VAULT_MAIN','186070444'),
('VAULT_EMERGENCY','34832520'),
('VAULT_WELFARE','20564'),
('VAULT_INFRA','0'),
('VAULT_RESERVE','0');
INSERT INTO public.system_treasury_ledger(amount_wld,created_at)
 SELECT '1',now()-INTERVAL '2 days' FROM generate_series(1,552);
INSERT INTO public.state_enterprise_dividend_logs(ledger_tx_id,created_at)
 SELECT NULL,now()-INTERVAL '2 days' FROM generate_series(1,738);
INSERT INTO public.state_enterprise_dividend_logs(ledger_tx_id,created_at)
 SELECT gen_random_uuid(),now()-INTERVAL '2 days' FROM generate_series(1,6);
