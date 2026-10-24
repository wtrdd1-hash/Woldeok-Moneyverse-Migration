-- Owner-scoped work shortlist. No assignment, WLD or reward mutation.
BEGIN;

CREATE TABLE public.work_task_favorites (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.work_task_catalog(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  PRIMARY KEY (user_id, task_id)
);
REVOKE ALL PRIVILEGES ON TABLE public.work_task_favorites FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.work_favorites_list(p_actor uuid)
RETURNS TABLE(task_id uuid)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS u
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;
  RETURN QUERY
  SELECT f.task_id FROM public.work_task_favorites AS f
  JOIN public.work_task_catalog AS t ON t.id = f.task_id
  WHERE f.user_id = p_actor AND t.active
  ORDER BY f.created_at DESC, f.task_id
  LIMIT 50;
END;
$$;
ALTER FUNCTION public.work_favorites_list(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_favorites_list(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_favorites_list(uuid) TO moneyverse_app;

CREATE FUNCTION public.work_favorite_set(p_actor uuid, p_task uuid, p_saved boolean)
RETURNS TABLE(saved boolean, replayed boolean)
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing boolean;
  v_count integer;
BEGIN
  IF p_actor IS NULL OR p_task IS NULL OR p_saved IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'favorite arguments required';
  END IF;
  -- Serialize all shortlist writes for the actor. The owner row is never exposed to app DML.
  PERFORM 1 FROM public.users AS u
  WHERE u.id = p_actor AND u.status = 'active'::public.user_status FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.work_task_favorites AS f
    WHERE f.user_id = p_actor AND f.task_id = p_task
  ) INTO v_existing;

  IF p_saved THEN
    IF NOT EXISTS (SELECT 1 FROM public.work_task_catalog AS t WHERE t.id = p_task AND t.active) THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'task is not available';
    END IF;
    IF v_existing THEN
      RETURN QUERY SELECT true, true;
      RETURN;
    END IF;
    SELECT count(*)::integer INTO v_count FROM public.work_task_favorites AS f WHERE f.user_id = p_actor;
    IF v_count >= 50 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'favorite limit reached';
    END IF;
    INSERT INTO public.work_task_favorites (user_id, task_id) VALUES (p_actor, p_task);
    RETURN QUERY SELECT true, false;
  ELSE
    IF v_existing THEN
      DELETE FROM public.work_task_favorites AS f WHERE f.user_id = p_actor AND f.task_id = p_task;
    END IF;
    RETURN QUERY SELECT false, NOT v_existing;
  END IF;
END;
$$;
ALTER FUNCTION public.work_favorite_set(uuid, uuid, boolean) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_favorite_set(uuid, uuid, boolean) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_favorite_set(uuid, uuid, boolean) TO moneyverse_app;
COMMIT;
