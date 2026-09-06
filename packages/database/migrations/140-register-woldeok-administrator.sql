BEGIN;

-- This is the existing Woldeok operator account shown by the member directory.
-- Register it explicitly so every browser session, including mobile OAuth
-- sessions, receives administrator roles from admin_current_roles().
INSERT INTO public.user_roles (user_id, role)
SELECT target.id, requested.role
FROM public.users AS target
CROSS JOIN (
  VALUES
    ('superadmin'::public.admin_role),
    ('operator'::public.admin_role),
    ('approver'::public.admin_role),
    ('server_operator'::public.admin_role)
) AS requested(role)
WHERE target.id = '23b1ece3-1c38-4f96-a4fe-061a8b44a457'::uuid
  AND target.status = 'active'::public.user_status
ON CONFLICT (user_id, role) DO NOTHING;

COMMIT;
