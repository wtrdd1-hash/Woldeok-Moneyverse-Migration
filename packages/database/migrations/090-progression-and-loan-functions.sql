BEGIN;

CREATE OR REPLACE FUNCTION public.progression_refresh(p_actor uuid)
RETURNS TABLE(stage_code text, next_stage_code text, requirements jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_stage text;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_actor AND status = 'active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;
  SELECT s.code INTO v_stage FROM public.progression_stages s
  WHERE coalesce((s.unlock_requirements ->> 'workCompletions')::integer, 0) <=
    (SELECT count(*) FROM public.work_reward_receipts WHERE user_id = p_actor)
  ORDER BY s.ordinal DESC LIMIT 1;
  v_stage := coalesce(v_stage, 'starter');
  INSERT INTO public.user_progression(user_id, stage_code) VALUES (p_actor, v_stage)
  ON CONFLICT (user_id) DO UPDATE SET stage_code = excluded.stage_code, updated_at = clock_timestamp();
  RETURN QUERY SELECT s.code, n.code, n.unlock_requirements
  FROM public.progression_stages s
  LEFT JOIN public.progression_stages n ON n.ordinal = s.ordinal + 1
  WHERE s.code = v_stage;
END;
$$;

CREATE OR REPLACE FUNCTION public.bank_credit_grade(p_actor uuid)
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT p.grade FROM public.bank_credit_policies p CROSS JOIN public.users u
  WHERE p.active
    AND u.id = p_actor AND u.status = 'active'::public.user_status
    AND p.minimum_account_days <= (clock_timestamp()::date - u.created_at::date)
    AND p.minimum_work_completions <= (SELECT count(*) FROM public.work_reward_receipts r WHERE r.user_id = p_actor)
  ORDER BY p.credit_limit DESC LIMIT 1
$$;

ALTER FUNCTION public.progression_refresh(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_credit_grade(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.progression_refresh(uuid), public.bank_credit_grade(uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.progression_refresh(uuid), public.bank_credit_grade(uuid)
  TO moneyverse_app;

COMMIT;
