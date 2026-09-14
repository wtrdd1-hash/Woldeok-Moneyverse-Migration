-- 185-mobile-profile-account-read.sql
-- Update version: v2026.09.14.76
-- Expose the signed-in member's own verified local-email address without
-- granting the application role direct access to auth_local_credentials.

BEGIN;

CREATE OR REPLACE FUNCTION public.member_own_account_email(p_actor uuid)
RETURNS TABLE(email text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    WHERE user_row.id = p_actor
      AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  RETURN QUERY
  SELECT credential.email
  FROM (SELECT 1) AS one
  LEFT JOIN public.auth_local_credentials AS credential
    ON credential.user_id = p_actor
   AND credential.disabled_at IS NULL;
END;
$$;

ALTER FUNCTION public.member_own_account_email(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.member_own_account_email(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.member_own_account_email(uuid) TO moneyverse_app;

COMMIT;
