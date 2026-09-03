-- Retire a Discord subject from the historical bootstrap administrator list.
--
-- 051 moved the hard-coded subjects from 043 into a protected table. Removing
-- the row here prevents the identity trigger (and later bootstrap replays)
-- from granting administrative roles if this subject links an account in the
-- future. The role deletion also handles databases where it linked already.

BEGIN;

DELETE FROM public.bootstrap_discord_operators
WHERE provider_subject = '1481258930909872239';

DELETE FROM public.user_roles AS role_row
USING public.identities AS identity_row
WHERE identity_row.user_id = role_row.user_id
  AND identity_row.provider = 'discord'::public.identity_provider
  AND identity_row.provider_subject = '1481258930909872239'
  AND role_row.role IN (
    'operator'::public.admin_role,
    'approver'::public.admin_role,
    'server_operator'::public.admin_role
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_roles AS superadmin_row
    WHERE superadmin_row.user_id = role_row.user_id
      AND superadmin_row.role = 'superadmin'::public.admin_role
  );

COMMIT;
