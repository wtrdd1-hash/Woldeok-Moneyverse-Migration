-- Migration 293: restore the least-privilege read contract after migration 264.
-- 106 granted EXECUTE to moneyverse_app, but 264 DROPs/recreates these
-- SECURITY DEFINER functions to fix NUMERIC return types, discarding their ACL.
-- The bank console calls both as moneyverse_app; without these grants, its
-- otherwise valid GET /api/v1/admin/bank returns PostgreSQL 42501.
-- No table grants, schema shape, financial rows, or existing function bodies change.
REVOKE ALL ON FUNCTION public.admin_credit_grades(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_loan_book(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_credit_grades(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_loan_book(uuid, integer) TO moneyverse_app;
