BEGIN;

CREATE OR REPLACE FUNCTION public.member_engagement_dashboard(p_actor uuid)
RETURNS TABLE(today_tasks jsonb, weekly_goals jsonb, next_unlock jsonb, notifications_enabled boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_day text := (clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date::text;
DECLARE v_week text := date_trunc('week', clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date::text;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_actor AND status = 'active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;
  RETURN QUERY SELECT
    (SELECT coalesce(jsonb_agg(jsonb_build_object('code', c.code, 'title', c.title, 'progress', coalesce(p.progress, 0))), '[]'::jsonb)
     FROM (SELECT * FROM public.engagement_catalog WHERE active AND kind IN ('quest','daily','npc_order') ORDER BY code LIMIT 3) c
     LEFT JOIN public.engagement_progress p ON p.catalog_id = c.id AND p.user_id = p_actor AND p.period_key = v_day),
    (SELECT coalesce(jsonb_agg(jsonb_build_object('code', c.code, 'title', c.title, 'progress', coalesce(p.progress, 0))), '[]'::jsonb)
     FROM (SELECT * FROM public.engagement_catalog WHERE active AND kind = 'weekly' ORDER BY code LIMIT 3) c
     LEFT JOIN public.engagement_progress p ON p.catalog_id = c.id AND p.user_id = p_actor AND p.period_key = v_week),
    (SELECT jsonb_build_object('stage', n.code, 'requirements', n.unlock_requirements) FROM public.user_progression up
      JOIN public.progression_stages s ON s.code = up.stage_code LEFT JOIN public.progression_stages n ON n.ordinal = s.ordinal + 1 WHERE up.user_id = p_actor),
    coalesce((SELECT notifications_enabled FROM public.member_engagement_preferences WHERE user_id = p_actor), true);
END;
$$;

CREATE OR REPLACE FUNCTION public.season_close_due()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_count integer;
BEGIN
  UPDATE public.virtual_seasons SET active = false, lifecycle_state = 'closed', closed_at = clock_timestamp()
  WHERE active AND ends_at <= clock_timestamp();
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

ALTER FUNCTION public.member_engagement_dashboard(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.season_close_due() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_engagement_dashboard(uuid), public.season_close_due() FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_engagement_dashboard(uuid), public.season_close_due() TO moneyverse_app;

COMMIT;
