-- Club directory reads must not JOIN revoked users/identities tables as moneyverse_app.
-- The authenticated Nest session supplies p_actor; this function does not grant table access.
BEGIN;

CREATE FUNCTION public.club_directory_page(
  p_actor uuid,
  p_search text,
  p_limit integer,
  p_offset integer
)
RETURNS TABLE (
  id uuid,
  tag text,
  name text,
  description text,
  owner_id uuid,
  owner_name text,
  join_mode text,
  status text,
  level integer,
  experience text,
  member_count integer,
  created_at timestamptz,
  is_my_club boolean,
  my_role text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT
    c.id, c.tag, c.name, c.description, c.owner_id,
    COALESCE((
      SELECT i.display_name
      FROM public.identities AS i
      WHERE i.user_id = c.owner_id
      ORDER BY i.linked_at DESC, i.id DESC
      LIMIT 1
    ), '클럽장') AS owner_name,
    c.join_mode, c.status, c.level, c.experience::text,
    c.member_count, c.created_at,
    (cm_actor.user_id IS NOT NULL) AS is_my_club,
    cm_actor.role AS my_role
  FROM public.clubs AS c
  LEFT JOIN public.club_members AS cm_actor
    ON cm_actor.club_id = c.id AND cm_actor.user_id = p_actor
  WHERE p_actor IS NOT NULL
    AND p_limit BETWEEN 1 AND 100
    AND p_offset BETWEEN 0 AND 10000
    AND c.status = 'active'
    AND (NULLIF(pg_catalog.btrim(p_search), '') IS NULL
      OR c.name ILIKE ('%' || pg_catalog.btrim(p_search) || '%')
      OR c.tag ILIKE ('%' || pg_catalog.btrim(p_search) || '%'))
  ORDER BY c.level DESC, c.member_count DESC, c.created_at DESC, c.id
  LIMIT p_limit OFFSET p_offset;
$$;

REVOKE ALL ON FUNCTION public.club_directory_page(uuid, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.club_directory_page(uuid, text, integer, integer) TO moneyverse_app;

COMMIT;
