-- Disposable PostgreSQL only: do not apply to any shared database.
CREATE TABLE public.accounts (id uuid PRIMARY KEY, owner_user_id uuid, account_type text NOT NULL);
CREATE TABLE public.ledger_transactions (id uuid PRIMARY KEY, idempotency_key uuid UNIQUE NOT NULL, type text NOT NULL, actor_user_id uuid);
CREATE TABLE public.ledger_postings (id uuid PRIMARY KEY, transaction_id uuid REFERENCES public.ledger_transactions(id), account_id uuid REFERENCES public.accounts(id), amount numeric NOT NULL, direction text NOT NULL);
INSERT INTO public.accounts VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','USER_CASH'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','USER_CASH'),
('cccccccc-cccc-4ccc-8ccc-cccccccccccc','33333333-3333-4333-8333-333333333333','USER_CASH');
INSERT INTO public.ledger_transactions VALUES
('55555555-5555-4555-8555-555555555555','44444444-4444-4444-8444-444444444444','USER_TO_USER','11111111-1111-4111-8111-111111111111'),
('77777777-7777-4777-8777-777777777777','66666666-6666-4666-8666-666666666666','USER_TO_USER','33333333-3333-4333-8333-333333333333'),
('99999999-9999-4999-8999-999999999999','88888888-8888-4888-8888-888888888888','USER_TO_USER','11111111-1111-4111-8111-111111111111');
INSERT INTO public.ledger_postings VALUES
('00000000-0000-4000-8000-000000000001','55555555-5555-4555-8555-555555555555','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',900719925474099312345678901234567890,'credit'),
('00000000-0000-4000-8000-000000000002','55555555-5555-4555-8555-555555555555','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',900719925474099312345678901234567890,'debit'),
('00000000-0000-4000-8000-000000000003','77777777-7777-4777-8777-777777777777','cccccccc-cccc-4ccc-8ccc-cccccccccccc',50,'credit'),
('00000000-0000-4000-8000-000000000004','77777777-7777-4777-8777-777777777777','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',50,'debit'),
('00000000-0000-4000-8000-000000000005','99999999-9999-4999-8999-999999999999','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',50,'credit');
CREATE ROLE wallet_receipt_reader LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
REVOKE ALL ON public.accounts, public.ledger_transactions, public.ledger_postings FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO wallet_receipt_reader;
GRANT SELECT ON public.accounts, public.ledger_transactions, public.ledger_postings TO wallet_receipt_reader;
