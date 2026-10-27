-- Synthetic fixture only: apply to disposable localhost:55483/mv_b_v583_synthetic.
-- No real member data, finance migration, or Production-connected database.
CREATE TABLE public.protected_bank_balance (balance numeric NOT NULL);
INSERT INTO public.protected_bank_balance VALUES (12345678901234567890);
CREATE ROLE moneyverse_app_v583 LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
REVOKE ALL ON TABLE public.protected_bank_balance FROM PUBLIC;
CREATE FUNCTION public.admin_bank_overview(p_actor uuid)
RETURNS TABLE(
  deposit_amount numeric, depositor_count bigint, open_loan_count bigint,
  outstanding_amount numeric, overdue_loan_count bigint, overdue_amount numeric,
  maturing_7d_count bigint, issued_24h_count bigint, issued_24h_amount numeric,
  repaid_24h_amount numeric, borrower_count bigint
) LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
  IF p_actor = '00000000-0000-4000-8000-000000000002'::uuid THEN
    RAISE EXCEPTION 'simulated overview outage';
  END IF;
  RETURN QUERY SELECT balance, 1::bigint, 1::bigint, 23::numeric,
    0::bigint, 0::numeric, 0::bigint, 0::bigint, 0::numeric, 0::numeric, 1::bigint
    FROM public.protected_bank_balance;
END;
$$;
CREATE FUNCTION public.admin_credit_grades(p_actor uuid)
RETURNS TABLE(
  grade text, minimum_account_days integer, minimum_work_completions integer,
  credit_limit numeric, interest_bps integer, term_days integer,
  minimum_repayment numeric, active boolean, open_loan_count bigint,
  outstanding_amount numeric, overdue_loan_count bigint, issued_loan_count bigint,
  issued_principal numeric
) LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
  IF p_actor = '00000000-0000-4000-8000-000000000003'::uuid THEN
    RAISE EXCEPTION 'simulated credit grades outage';
  END IF;
  RETURN QUERY SELECT 'A'::text, 30, 1, 1000::numeric, 100, 30,
    10::numeric, true, 1::bigint, 23::numeric, 0::bigint, 1::bigint, 23::numeric;
END;
$$;
CREATE FUNCTION public.admin_loan_book(p_actor uuid, p_limit integer)
RETURNS TABLE(
  loan_id uuid, user_id uuid, display_name text, credit_grade text, status text,
  principal_amount numeric, interest_amount numeric, outstanding_amount numeric,
  repaid_amount numeric, minimum_repayment numeric, issued_at timestamptz,
  maturity_at timestamptz, overdue_at timestamptz, status_reason text
) LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,public AS $$
BEGIN
  IF p_actor = '00000000-0000-4000-8000-000000000004'::uuid THEN
    RAISE EXCEPTION 'simulated loan book outage';
  END IF;
  RETURN QUERY SELECT '00000000-0000-4000-8000-000000000005'::uuid,
    '00000000-0000-4000-8000-000000000001'::uuid, 'synthetic'::text,
    'A'::text, 'active'::text, 23::numeric, 0::numeric, 23::numeric,
    0::numeric, 1::numeric, now(), now() + interval '1 day',
    null::timestamptz, null::text;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_bank_overview(uuid),
  public.admin_credit_grades(uuid), public.admin_loan_book(uuid, integer)
  FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO moneyverse_app_v583;
GRANT EXECUTE ON FUNCTION public.admin_bank_overview(uuid),
  public.admin_credit_grades(uuid), public.admin_loan_book(uuid, integer)
  TO moneyverse_app_v583;
REVOKE ALL ON TABLE public.protected_bank_balance FROM moneyverse_app_v583;
