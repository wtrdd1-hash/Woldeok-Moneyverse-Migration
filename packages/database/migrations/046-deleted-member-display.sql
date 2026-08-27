-- SEC-005: a soft-deleted member's OAuth display name kept appearing on
-- board posts and season leaderboards indefinitely. `account_soft_delete()`
-- (010) leaves `identities.display_name` intact ON PURPOSE, to reserve the
-- OAuth subject against re-registration under a deleted member's name — do
-- not anonymise it here. The bug is entirely in the READ path: 044's
-- `member_board_list`/`member_board_create` and 037's
-- `season_event_leaderboard` join `identities` for a name with no filter on
-- `users.status`. Recreate all three so the identity lookup only returns a
-- name for an `active` user, falling back to the placeholder each query
-- already uses for a missing identity row ('사용자' / '참여자').
BEGIN;

CREATE OR REPLACE FUNCTION public.member_board_list(p_actor uuid, p_limit integer)
RETURNS TABLE(post_id uuid, title text, body text, author_name text, created_at timestamptz, mine boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR p_limit NOT BETWEEN 1 AND 50
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id = p_actor AND status = 'active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE = '28000';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.body,
    coalesce(
      (SELECT i.display_name
       FROM public.identities i
       JOIN public.users au ON au.id = i.user_id
       WHERE i.user_id = p.author_user_id AND au.status = 'active'::public.user_status
       ORDER BY i.linked_at LIMIT 1),
      '사용자'
    ),
    p.created_at,
    p.author_user_id = p_actor
  FROM public.member_board_posts p
  WHERE p.deleted_at IS NULL
  ORDER BY p.created_at DESC, p.id DESC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.member_board_create(p_actor uuid, p_title text, p_body text, p_key uuid)
RETURNS TABLE(post_id uuid, title text, body text, author_name text, created_at timestamptz, mine boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_id uuid;
  v_author uuid;
BEGIN
  IF p_actor IS NULL OR p_key IS NULL OR p_title IS NULL OR p_body IS NULL
    OR char_length(p_title) NOT BETWEEN 1 AND 120
    OR char_length(p_body) NOT BETWEEN 1 AND 5000
    OR p_title ~ '[<>[:cntrl:]]' OR p_body ~ '[<>[:cntrl:]]'
    OR NOT EXISTS(SELECT 1 FROM public.users WHERE id = p_actor AND status = 'active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE = '22023';
  END IF;

  SELECT id, author_user_id INTO v_id, v_author FROM public.member_board_posts WHERE idempotency_key = p_key;
  IF FOUND THEN
    IF v_author <> p_actor THEN RAISE EXCEPTION USING ERRCODE = '28000'; END IF;
  ELSE
    INSERT INTO public.member_board_posts(author_user_id, idempotency_key, title, body)
    VALUES (p_actor, p_key, p_title, p_body)
    RETURNING id INTO v_id;
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.body,
    coalesce(
      (SELECT i.display_name
       FROM public.identities i
       JOIN public.users au ON au.id = i.user_id
       WHERE i.user_id = p.author_user_id AND au.status = 'active'::public.user_status
       ORDER BY i.linked_at LIMIT 1),
      '사용자'
    ),
    p.created_at,
    true
  FROM public.member_board_posts p
  WHERE p.id = v_id;
END;
$$;

ALTER FUNCTION public.member_board_list(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_create(uuid, text, text, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.member_board_list(uuid, integer), public.member_board_create(uuid, text, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.member_board_list(uuid, integer), public.member_board_create(uuid, text, text, uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.season_event_leaderboard(p_event uuid, p_limit integer DEFAULT 20)
RETURNS TABLE(rank bigint, points bigint, entries bigint, display_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  WITH totals AS (
    SELECT entry.user_id, sum(entry.points_earned)::bigint AS points, count(*)::bigint AS entries
    FROM public.virtual_consumption_event_entries AS entry
    WHERE entry.event_id = p_event
    GROUP BY entry.user_id
  ), ranked AS (
    SELECT totals.*, dense_rank() OVER (ORDER BY totals.points DESC, totals.entries ASC, totals.user_id) AS rank
    FROM totals
  )
  SELECT ranked.rank, ranked.points, ranked.entries, coalesce(identity.display_name, '참여자')
  FROM ranked
  LEFT JOIN LATERAL (
    SELECT i.display_name
    FROM public.identities i
    JOIN public.users AS entrant ON entrant.id = i.user_id
    WHERE i.user_id = ranked.user_id AND entrant.status = 'active'::public.user_status
    ORDER BY i.linked_at LIMIT 1
  ) AS identity ON true
  ORDER BY ranked.rank
  LIMIT greatest(1, least(p_limit, 50))
$$;

ALTER FUNCTION public.season_event_leaderboard(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.season_event_leaderboard(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.season_event_leaderboard(uuid, integer) TO moneyverse_app;

COMMIT;
