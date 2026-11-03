-- v2026.11.04.1719 — prevent forged or erased fiscal certificates and logs.
-- The web role must not write monetary certification, payouts, bond orders,
-- archived pension configurations, or Treasury evidence directly. Canonical
-- SECURITY DEFINER functions remain the authorized writer; all reads remain.
-- Active Central Bank policy administration uses audited application DML and
-- deliberately remains out of scope until a separately verified DB wrapper.
BEGIN;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE
    public.mint_certificates,
    public.retirement_certificates,
    public.treasury_disbursements,
    public.treasury_bond_coupon_logs,
    public.treasury_bond_orders,
    public.treasury_wealth_tax_assessments,
    public.national_pension_configs
  FROM PUBLIC, moneyverse_app;

-- Donations are written only by their authenticated, ledger-first
-- SECURITY DEFINER workflow. The app never owns their evidence rows.
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.treasury_donations
  FROM PUBLIC, moneyverse_app;

DO $verify$
DECLARE
  v_table text;
  v_privilege text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'public.mint_certificates',
    'public.retirement_certificates',
    'public.treasury_disbursements',
    'public.treasury_bond_coupon_logs',
    'public.treasury_bond_orders',
    'public.treasury_wealth_tax_assessments',
    'public.national_pension_configs',
    'public.treasury_donations'
  ] LOOP
    FOREACH v_privilege IN ARRAY ARRAY[
      'INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'
    ] LOOP
      IF pg_catalog.has_table_privilege('moneyverse_app',v_table,v_privilege) THEN
        RAISE EXCEPTION 'FINANCE_EVIDENCE_APP_DML_STILL_GRANTED: %.%',
          v_table,v_privilege USING ERRCODE='42501';
      END IF;
    END LOOP;
    FOREACH v_privilege IN ARRAY ARRAY['INSERT','UPDATE','REFERENCES'] LOOP
      IF pg_catalog.has_any_column_privilege('moneyverse_app',v_table,v_privilege) THEN
        RAISE EXCEPTION 'FINANCE_EVIDENCE_APP_DML_STILL_GRANTED: %.column-%',
          v_table,v_privilege USING ERRCODE='42501';
      END IF;
    END LOOP;
  END LOOP;
END;
$verify$;

COMMIT;
