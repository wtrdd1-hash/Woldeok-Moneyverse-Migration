-- The name a member chose, on every screen that names them.
--
-- 079 gave `member_profiles.display_name` and 080 lets a member set it. One
-- function reads it: `member_profile_view` (080:175), which serves the
-- profile screen and nothing else. Every other place this application names
-- somebody reads `identities.display_name` — the name that arrived from
-- Discord or Google:
--
--   member_board_author_name   048:59   posts, comments, and both writes
--   season_event_leaderboard   046      the consumption-event rankings
--
-- So a member opens 내 프로필, types a name, saves it, is told it saved, and
-- nothing anywhere on the site changes. It was reported as "프로필 적용 안
-- 되는 버그" and that is exactly what it is: the write works, the read never
-- happens.
--
-- ONE FUNCTION, NOT TWO EDITS. `member_public_name` is the single place that
-- answers "what is this member called", and the two readers delegate to it.
-- Writing the coalesce twice is how the two got to disagree in the first
-- place -- 046 had to fix the same soft-deleted-member bug in three separate
-- copies of the same subquery, which is what led 048 to extract
-- `member_board_author_name`. This finishes that extraction rather than
-- adding a third copy.
--
-- WHAT IT DOES NOT CHANGE. The chosen name is NOT gated by
-- `field_visibility`: `member_profile_view` returns it unconditionally
-- (080:175 has no `member_field_visible` wrapper around it, unlike the four
-- fields below it), because a profile with no name is not anonymous, it is
-- broken. So showing it on a post is not a disclosure the member did not
-- already make. `identities.display_name` remains the fallback and remains
-- what the administrator console shows (026) -- an operator looking at an
-- abuse report needs the account behind the alias, not the alias.
--
-- The soft-delete rule 046 established is preserved exactly: a name is
-- answered only for an `active` user, and a deleted member falls back to the
-- placeholder each caller already used. A member who deletes their account
-- does not leave their chosen name behind either.

BEGIN;

-- What this member is called, for a reader who is not an operator.
--
-- The profile name first, the OAuth name second, and NULL for a member who is
-- not active -- so each caller keeps its own placeholder ('사용자' on the
-- board, '참여자' on a leaderboard) rather than having one imposed here.
CREATE OR REPLACE FUNCTION public.member_public_name(p_user uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT coalesce(
    (SELECT profile_row.display_name
     FROM public.member_profiles AS profile_row
     WHERE profile_row.user_id = named.id),
    (SELECT identity_row.display_name
     FROM public.identities AS identity_row
     WHERE identity_row.user_id = named.id
     ORDER BY identity_row.linked_at
     LIMIT 1)
  )
  FROM public.users AS named
  WHERE named.id = p_user
    AND named.status = 'active'::public.user_status
$$;

-- 048's body, delegating. The signature and the placeholder are unchanged, so
-- the five callers in 048 need no edit.
CREATE OR REPLACE FUNCTION public.member_board_author_name(p_user uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT coalesce(public.member_public_name(p_user), '사용자')
$$;

-- 046's body, with the LATERAL replaced by the same call.
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
  SELECT ranked.rank, ranked.points, ranked.entries,
         coalesce(public.member_public_name(ranked.user_id), '참여자')
  FROM ranked
  ORDER BY ranked.rank
  LIMIT greatest(1, least(p_limit, 50))
$$;

ALTER FUNCTION public.member_public_name(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_board_author_name(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.season_event_leaderboard(uuid, integer) OWNER TO moneyverse_migrator;

-- `member_public_name` is called only from inside other SECURITY DEFINER
-- functions, which run as the owner -- the application never needs it
-- directly, and granting it would hand the role a way to enumerate names by
-- user id.
REVOKE ALL PRIVILEGES ON FUNCTION public.member_public_name(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_board_author_name(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.season_event_leaderboard(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.season_event_leaderboard(uuid, integer) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.member_profiles, public.identities
  FROM PUBLIC, moneyverse_app;

COMMIT;
