-- Synthetic isolated fixture only. NEVER apply to a Moneyverse database.
CREATE TYPE public.posting_direction AS ENUM ('debit', 'credit');
CREATE TABLE public.ledger_transactions (id uuid PRIMARY KEY, type text NOT NULL, created_at timestamptz NOT NULL);
CREATE TABLE public.accounts (id uuid PRIMARY KEY, owner_user_id uuid, account_type text NOT NULL);
CREATE TABLE public.member_profiles (user_id uuid PRIMARY KEY, display_name text NOT NULL);
CREATE TABLE public.ledger_postings (id uuid PRIMARY KEY, transaction_id uuid NOT NULL, account_id uuid NOT NULL, amount numeric NOT NULL, direction public.posting_direction NOT NULL);
INSERT INTO public.accounts VALUES ('00000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000021', 'USER_CASH');
INSERT INTO public.member_profiles VALUES ('00000000-0000-4000-8000-000000000021', '홍길동');
INSERT INTO public.ledger_transactions VALUES
 ('00000000-0000-4000-8000-000000000011','MINT_TO_USER','2026-10-27 06:00:00.123456+00'),
 ('00000000-0000-4000-8000-000000000010','MINT_TO_USER','2026-10-27 06:00:00.123455+00');
INSERT INTO public.ledger_postings VALUES
 ('00000000-0000-4000-8000-000000000033','00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000041',9007199254740993,'credit'),
 ('00000000-0000-4000-8000-000000000032','00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000041',10,'debit'),
 ('00000000-0000-4000-8000-000000000031','00000000-0000-4000-8000-000000000011','00000000-0000-4000-8000-000000000041',20,'credit'),
 ('00000000-0000-4000-8000-000000000030','00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000041',30,'debit');
CREATE ROLE mv_v573_reader LOGIN;
REVOKE ALL ON public.ledger_transactions, public.accounts, public.member_profiles, public.ledger_postings FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO mv_v573_reader;
GRANT SELECT ON public.ledger_transactions, public.accounts, public.member_profiles, public.ledger_postings TO mv_v573_reader;
