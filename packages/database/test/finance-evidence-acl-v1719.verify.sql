-- v1719 postmigration finance record least-privilege read-only proof.
-- Works on restored Production clone or the official segregated Test database.
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
DO $proof$
DECLARE
  v_table text;
  v_privilege text;
  v_discrepancies bigint;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'public.mint_certificates', 'public.retirement_certificates',
    'public.treasury_disbursements', 'public.treasury_bond_coupon_logs',
    'public.treasury_bond_orders', 'public.treasury_wealth_tax_assessments',
    'public.national_pension_configs', 'public.treasury_donations'
  ] LOOP
    -- Some official Test tables intentionally have no web-role SELECT.
    -- The migration must not grant it; this verifier checks DML only.
    FOREACH v_privilege IN ARRAY ARRAY[
      'INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'
    ] LOOP
      IF has_table_privilege('moneyverse_app',v_table,v_privilege) THEN
        RAISE EXCEPTION 'FINANCE_EVIDENCE_RAW_TABLE_WRITE: %.%',v_table,v_privilege;
      END IF;
    END LOOP;
    FOREACH v_privilege IN ARRAY ARRAY['INSERT','UPDATE','REFERENCES'] LOOP
      IF has_any_column_privilege('moneyverse_app',v_table,v_privilege) THEN
        RAISE EXCEPTION 'FINANCE_EVIDENCE_RAW_COLUMN_WRITE: %.%',v_table,v_privilege;
      END IF;
    END LOOP;
  END LOOP;
  SELECT COUNT(*) INTO v_discrepancies
  FROM public.account_balances b
  LEFT JOIN (
    SELECT account_id,
           SUM(CASE WHEN direction::text='debit' THEN amount ELSE -amount END) AS net
    FROM public.ledger_postings GROUP BY account_id
  ) p ON p.account_id=b.account_id
  WHERE b.available_amount IS DISTINCT FROM COALESCE(p.net,0);
  IF v_discrepancies <> 0 THEN
    RAISE EXCEPTION 'FINANCE_EVIDENCE_ACL_LEDGER_DRIFT: %',v_discrepancies;
  END IF;
  RAISE NOTICE 'FINANCE_EVIDENCE_ACL_V1719_PASS protected_tables=8 account_drift=0';
END;
$proof$;
ROLLBACK;
