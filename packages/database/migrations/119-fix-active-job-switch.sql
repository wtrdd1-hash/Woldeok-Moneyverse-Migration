-- Repair the active-job switch introduced by 115.
-- The OUT parameter named job_type made the unqualified conflict target
-- ambiguous inside PL/pgSQL. Naming the existing primary-key constraint avoids
-- that collision while preserving the function signature and response shape.

BEGIN;

CREATE OR REPLACE FUNCTION public.job_switch_active(
  p_actor uuid,
  p_job_type text
)
RETURNS TABLE(
  job_type text,
  level integer,
  experience bigint,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_job_enum public.work_job_type;
BEGIN
  BEGIN
    v_job_enum := p_job_type::public.work_job_type;
  EXCEPTION WHEN invalid_text_representation THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid job type';
  END;

  UPDATE public.user_job_progress AS progress_row
  SET is_active = false
  WHERE progress_row.user_id = p_actor;

  INSERT INTO public.user_job_progress (
    user_id, job_type, experience, level, is_active, selected_at, changed_at
  ) VALUES (
    p_actor, v_job_enum, 0, 1, true,
    pg_catalog.clock_timestamp(), pg_catalog.clock_timestamp()
  )
  ON CONFLICT ON CONSTRAINT user_job_progress_pkey DO UPDATE SET
    is_active = true,
    selected_at = pg_catalog.clock_timestamp(),
    changed_at = pg_catalog.clock_timestamp();

  RETURN QUERY
  SELECT progress_row.job_type::text,
         progress_row.level,
         progress_row.experience,
         progress_row.is_active
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = p_actor
    AND progress_row.job_type = v_job_enum;
END;
$$;

ALTER FUNCTION public.job_switch_active(uuid, text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.job_switch_active(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.job_switch_active(uuid, text) TO moneyverse_app;

COMMIT;
