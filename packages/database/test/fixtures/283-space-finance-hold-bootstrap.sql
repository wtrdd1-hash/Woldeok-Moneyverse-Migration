-- Synthetic, disposable PostgreSQL 17 fixture; never run against a live DB.
CREATE ROLE moneyverse_app NOLOGIN;
CREATE ROLE outsider NOLOGIN;
GRANT USAGE ON SCHEMA public TO moneyverse_app, outsider;

CREATE TABLE public.user_spaces (
  id uuid PRIMARY KEY, user_id uuid NOT NULL, layout jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);
CREATE TABLE public.city_projects (id uuid PRIMARY KEY);
CREATE TABLE public.city_project_contributions (id uuid PRIMARY KEY);
CREATE TABLE public.space_property_tax_payments (id uuid PRIMARY KEY);
CREATE TABLE public.account_balances (account_id uuid PRIMARY KEY, balance numeric NOT NULL);
CREATE TABLE public.ledger_transactions (id uuid PRIMARY KEY);
CREATE TABLE public.ledger_postings (id uuid PRIMARY KEY);
INSERT INTO public.user_spaces (id,user_id,layout)
VALUES ('22222222-3333-4444-8555-666666666666', '11111111-2222-4333-8444-555555555555', '{"theme":"original"}');
INSERT INTO public.account_balances VALUES ('11111111-2222-4333-8444-555555555555', 100000);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_spaces, public.city_projects,
  public.city_project_contributions, public.space_property_tax_payments TO moneyverse_app;

CREATE FUNCTION public.space_purchase(uuid,text,text,uuid)
RETURNS TABLE(space_id uuid,space_type text,name text,created_at timestamptz)
LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'unsafe legacy'; END; $$;
CREATE FUNCTION public.city_project_contribute(uuid,uuid,numeric,uuid)
RETURNS TABLE(contribution_id uuid,accepted_amount numeric,project_current_wld text,project_status text)
LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'unsafe legacy'; END; $$;
CREATE FUNCTION public.space_pay_property_tax(uuid,uuid,integer,uuid)
RETURNS TABLE(receipt_id uuid,space_id uuid,days_paid integer,total_wld numeric,new_paid_until timestamptz,paid_at timestamptz)
LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'unsafe legacy'; END; $$;
GRANT EXECUTE ON FUNCTION public.space_purchase(uuid,text,text,uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.city_project_contribute(uuid,uuid,numeric,uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.space_pay_property_tax(uuid,uuid,integer,uuid) TO moneyverse_app;
