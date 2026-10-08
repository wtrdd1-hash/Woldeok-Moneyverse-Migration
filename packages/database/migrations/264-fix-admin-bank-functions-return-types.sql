-- 264-fix-admin-bank-functions-return-types.sql
-- Fix return types for admin_credit_grades and admin_loan_book to match NUMERIC column types in bank_credit_policies and virtual_bank_loans

DROP FUNCTION IF EXISTS public.admin_credit_grades(uuid);
CREATE OR REPLACE FUNCTION public.admin_credit_grades(p_actor uuid)
 RETURNS TABLE(
   grade text,
   minimum_account_days integer,
   minimum_work_completions integer,
   credit_limit numeric,
   interest_bps integer,
   term_days integer,
   minimum_repayment numeric,
   active boolean,
   open_loan_count bigint,
   outstanding_amount numeric,
   overdue_loan_count bigint,
   issued_loan_count bigint,
   issued_principal numeric
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'the bank console requires an administrator';
  END IF;

  RETURN QUERY
  SELECT policy_row.grade,
         policy_row.minimum_account_days,
         policy_row.minimum_work_completions,
         policy_row.credit_limit,
         policy_row.interest_bps,
         policy_row.term_days,
         policy_row.minimum_repayment,
         policy_row.active,
         pg_catalog.count(loan_row.id) FILTER (
           WHERE loan_row.status IN ('active', 'overdue')),
         coalesce(pg_catalog.sum(loan_row.outstanding_amount::numeric) FILTER (
           WHERE loan_row.status IN ('active', 'overdue')), 0),
         pg_catalog.count(loan_row.id) FILTER (WHERE loan_row.status = 'overdue'),
         pg_catalog.count(loan_row.id),
         coalesce(pg_catalog.sum(loan_row.principal_amount::numeric), 0)
  FROM public.bank_credit_policies AS policy_row
  LEFT JOIN public.virtual_bank_loans AS loan_row
    ON loan_row.credit_grade = policy_row.grade
  GROUP BY policy_row.grade
  ORDER BY policy_row.credit_limit, policy_row.grade;
END;
$function$;

DROP FUNCTION IF EXISTS public.admin_loan_book(uuid, integer);
CREATE OR REPLACE FUNCTION public.admin_loan_book(p_actor uuid, p_limit integer DEFAULT 50)
 RETURNS TABLE(
   loan_id uuid,
   user_id uuid,
   display_name text,
   credit_grade text,
   status text,
   principal_amount numeric,
   interest_amount numeric,
   outstanding_amount numeric,
   repaid_amount numeric,
   minimum_repayment numeric,
   issued_at timestamp with time zone,
   maturity_at timestamp with time zone,
   overdue_at timestamp with time zone,
   status_reason text
 )
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 200 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'limit must be between 1 and 200';
  END IF;

  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'the loan book requires an administrator';
  END IF;

  RETURN QUERY
  SELECT loan_row.id,
         loan_row.user_id,
         coalesce(identity.display_name, '사용자'),
         loan_row.credit_grade,
         loan_row.status,
         loan_row.principal_amount,
         loan_row.interest_amount,
         loan_row.outstanding_amount,
         coalesce((
           SELECT pg_catalog.sum(repayment_row.amount::numeric)
           FROM public.virtual_bank_loan_repayments AS repayment_row
           WHERE repayment_row.loan_id = loan_row.id
         ), 0),
         loan_row.minimum_repayment,
         loan_row.issued_at,
         loan_row.maturity_at,
         loan_row.overdue_at,
         loan_row.status_reason
  FROM public.virtual_bank_loans AS loan_row
  LEFT JOIN LATERAL (
    SELECT identity_row.display_name
    FROM public.identities AS identity_row
    WHERE identity_row.user_id = loan_row.user_id
    ORDER BY identity_row.linked_at
    LIMIT 1
  ) AS identity ON true
  WHERE loan_row.status IN ('active', 'overdue')
  ORDER BY (loan_row.status = 'overdue') DESC,
           loan_row.maturity_at NULLS LAST,
           loan_row.issued_at
  LIMIT p_limit;
END;
$function$;
