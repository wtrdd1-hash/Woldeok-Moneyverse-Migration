BEGIN;

CREATE OR REPLACE FUNCTION public.member_profile_view(p_actor uuid, p_subject uuid)
RETURNS TABLE(display_name text, image_url text, joined_at timestamptz, job_type public.work_job_type,
  job_level integer, work_completions bigint, visibility public.profile_visibility, featured_title text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_subject IS NULL THEN RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'profile subject required'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.member_profiles p WHERE p.user_id = p_subject
    AND (p.visibility = 'public' OR (p.visibility = 'members' AND p_actor IS NOT NULL) OR p_actor = p_subject)) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'profile is not available';
  END IF;
  RETURN QUERY
  SELECT coalesce(p.display_name, i.display_name), p.image_url, u.created_at, j.job_type, j.level,
    (SELECT count(*) FROM public.work_reward_receipts r WHERE r.user_id = u.id), p.visibility, p.featured_title
  FROM public.users u JOIN public.member_profiles p ON p.user_id = u.id
  LEFT JOIN LATERAL (SELECT display_name FROM public.identities WHERE user_id = u.id ORDER BY linked_at LIMIT 1) i ON true
  LEFT JOIN LATERAL (SELECT job_type, level FROM public.user_job_progress WHERE user_id = u.id ORDER BY level DESC, job_type LIMIT 1) j ON true
  WHERE u.id = p_subject;
END;
$$;

CREATE OR REPLACE FUNCTION public.member_set_casino_self_limit(p_actor uuid, p_daily_bet bigint, p_daily_loss bigint, p_lock_until timestamptz)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_actor IS NULL OR p_daily_bet < 0 OR p_daily_loss < 0 OR (p_lock_until IS NOT NULL AND p_lock_until <= clock_timestamp()) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid casino self limit';
  END IF;
  IF EXISTS (SELECT 1 FROM public.casino_self_limits WHERE user_id = p_actor AND locked_until > clock_timestamp()) THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'casino self limit is locked';
  END IF;
  INSERT INTO public.casino_self_limits(user_id, daily_bet_limit, daily_loss_limit, locked_until)
  VALUES (p_actor, p_daily_bet, p_daily_loss, p_lock_until)
  ON CONFLICT (user_id) DO UPDATE SET daily_bet_limit = excluded.daily_bet_limit, daily_loss_limit = excluded.daily_loss_limit,
    locked_until = excluded.locked_until, updated_at = clock_timestamp();
END;
$$;

ALTER FUNCTION public.member_profile_view(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_set_casino_self_limit(uuid, bigint, bigint, timestamptz) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_profile_view(uuid, uuid), public.member_set_casino_self_limit(uuid, bigint, bigint, timestamptz) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_profile_view(uuid, uuid), public.member_set_casino_self_limit(uuid, bigint, bigint, timestamptz) TO moneyverse_app;

COMMIT;
