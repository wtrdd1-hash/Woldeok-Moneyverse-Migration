-- Restore authenticated club discovery without granting app-role access to users.
-- Minimum member count is applied before LIMIT/OFFSET, never to a truncated page.
BEGIN;

CREATE FUNCTION public.club_directory_list(
  p_actor uuid, p_search text, p_min_members integer, p_limit integer, p_offset integer
)
RETURNS TABLE (
  id uuid, tag text, name text, description text, owner_id uuid, owner_name text,
  join_mode text, status text, level integer, experience text, member_count integer,
  created_at timestamptz, is_my_club boolean, my_role text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR p_actor = '00000000-0000-0000-0000-000000000000'::uuid THEN
    RAISE EXCEPTION 'authenticated club viewer required' USING ERRCODE = '22023';
  END IF;
  IF p_min_members IS NULL OR p_min_members < 0 OR p_min_members > 100000
     OR p_limit IS NULL OR p_limit < 1 OR p_limit > 100
     OR p_offset IS NULL OR p_offset < 0 OR p_offset > 10000
     OR length(coalesce(p_search, '')) > 80 THEN
    RAISE EXCEPTION 'invalid club directory filters' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
    SELECT c.id, c.tag, c.name, c.description, c.owner_id,
           (CASE WHEN p.visibility IN ('public', 'members') THEN coalesce(p.display_name, '클럽장') ELSE '클럽장' END)::text, c.join_mode, c.status,
           c.level, c.experience::text, c.member_count, c.created_at,
           (cm_actor.user_id IS NOT NULL), cm_actor.role
    FROM public.clubs AS c
    LEFT JOIN public.member_profiles AS p ON p.user_id = c.owner_id
    LEFT JOIN public.club_members AS cm_actor
      ON cm_actor.club_id = c.id AND cm_actor.user_id = p_actor
    WHERE c.status = 'active'
      AND c.member_count >= p_min_members
      AND (nullif(btrim(p_search), '') IS NULL OR
           c.name ILIKE ('%' || btrim(p_search) || '%') OR
           c.tag ILIKE ('%' || btrim(p_search) || '%'))
    ORDER BY c.level DESC, c.member_count DESC, c.created_at DESC, c.id DESC
    LIMIT p_limit OFFSET p_offset;
END;
$function$;

ALTER FUNCTION public.club_directory_list(uuid,text,integer,integer,integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.club_directory_list(uuid,text,integer,integer,integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.club_directory_list(uuid,text,integer,integer,integer) TO moneyverse_app;
COMMIT;
