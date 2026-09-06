-- Asking the model is a run, not a request.
--
-- 135 wrote the batch inside the request that asked for it, and 143 kept that
-- shape: the console posted, the process called the model, and the answer
-- came back in the same response. In front of this deployment sit an nginx
-- that stops reading after sixty seconds and a Cloudflare tunnel that gives
-- up at about a hundred, and a model writing five Korean scenarios from the
-- whole market's state routinely takes longer than either. What the operator
-- saw was the browser's own "the page could not be loaded" -- never one of
-- the console's six sentences, because by then nothing was left to render
-- them.
--
-- So the asking becomes a row. The console starts a run and is answered at
-- once; the process goes on talking to the model and writes the outcome --
-- the batch, or why there is none -- against that row; the console reads the
-- row every few seconds and draws what it says. One run at a time, because
-- the second would only supersede the first's batch. A run whose process
-- stopped mid-call leaves a row nothing will ever finish, so a run still
-- open after ten minutes is abandoned rather than waited on.

BEGIN;

CREATE TABLE IF NOT EXISTS public.ai_news_runs (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  started_by uuid NOT NULL REFERENCES public.users(id),
  started_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  operator_prompt text NOT NULL DEFAULT '' CHECK (pg_catalog.char_length(operator_prompt) <= 2000),
  finished_at timestamptz,
  -- What the run produced, when it produced one.
  batch_id uuid REFERENCES public.ai_news_batches(id) ON DELETE SET NULL,
  -- Why it did not, in the vocabulary the console already has a sentence for.
  failure_code text CHECK (failure_code IS NULL OR pg_catalog.char_length(failure_code) BETWEEN 1 AND 64),
  failure_detail text NOT NULL DEFAULT '' CHECK (pg_catalog.char_length(failure_detail) <= 500)
);

CREATE INDEX IF NOT EXISTS ai_news_runs_recent_idx ON public.ai_news_runs (started_at DESC);

REVOKE ALL ON public.ai_news_runs FROM PUBLIC, moneyverse_app;

/**
 * Starts a run, or hands back the one already going. `started` says which,
 * so the caller knows whether it is the one that must now call the model.
 */
CREATE OR REPLACE FUNCTION public.ai_news_run_begin(p_key uuid, p_actor uuid, p_prompt text)
RETURNS TABLE(run_id uuid, started boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_prompt text := pg_catalog.btrim(coalesce(p_prompt, ''));
  v_id uuid;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  IF p_key IS NULL OR pg_catalog.char_length(v_prompt) > 2000 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid AI news run';
  END IF;

  -- Nothing is going to finish a run whose process is gone.
  UPDATE public.ai_news_runs
  SET finished_at = pg_catalog.clock_timestamp(),
      failure_code = 'ai_news_run_abandoned',
      failure_detail = 'the run stopped before the model answered'
  WHERE finished_at IS NULL
    AND started_at < pg_catalog.clock_timestamp() - interval '10 minutes';

  -- The same key is the same run, however many times it arrives.
  SELECT run.id INTO v_id FROM public.ai_news_runs AS run WHERE run.idempotency_key = p_key;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, false;
    RETURN;
  END IF;

  -- One at a time: a second run would only supersede the first's batch.
  SELECT run.id INTO v_id
  FROM public.ai_news_runs AS run
  WHERE run.finished_at IS NULL
  ORDER BY run.started_at DESC
  LIMIT 1;
  IF v_id IS NOT NULL THEN
    RETURN QUERY SELECT v_id, false;
    RETURN;
  END IF;

  INSERT INTO public.ai_news_runs (idempotency_key, started_by, operator_prompt)
  VALUES (p_key, p_actor, v_prompt)
  RETURNING id INTO v_id;

  PERFORM public.admin_record_audit_event(
    p_actor, 'ai_news.run.started', NULL, p_key,
    pg_catalog.jsonb_build_object('promptLength', pg_catalog.char_length(v_prompt))
  );
  RETURN QUERY SELECT v_id, true;
END;
$$;

/** Closes a run with what it produced, or with why it produced nothing. */
CREATE OR REPLACE FUNCTION public.ai_news_run_finish(
  p_actor uuid,
  p_run uuid,
  p_batch uuid,
  p_failure_code text,
  p_failure_detail text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  UPDATE public.ai_news_runs
  SET finished_at = pg_catalog.clock_timestamp(),
      batch_id = p_batch,
      failure_code = pg_catalog.left(nullif(pg_catalog.btrim(coalesce(p_failure_code, '')), ''), 64),
      failure_detail = pg_catalog.left(coalesce(p_failure_detail, ''), 500)
  WHERE id = p_run AND finished_at IS NULL;
  -- False when the run was already closed, which is what a replay looks like.
  RETURN FOUND;
END;
$$;

/**
 * The last run, and whether it is still going. `running` is the row's own
 * answer rather than the reader's arithmetic: a run past the ten minutes is
 * over, whatever its `finished_at` says.
 */
CREATE OR REPLACE FUNCTION public.ai_news_run_latest(p_actor uuid)
RETURNS TABLE(
  run_id uuid,
  started_at timestamptz,
  finished_at timestamptz,
  operator_prompt text,
  batch_id uuid,
  failure_code text,
  failure_detail text,
  running boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  RETURN QUERY
  SELECT run.id, run.started_at, run.finished_at, run.operator_prompt, run.batch_id,
         run.failure_code, run.failure_detail,
         run.finished_at IS NULL AND run.started_at > pg_catalog.clock_timestamp() - interval '10 minutes'
  FROM public.ai_news_runs AS run
  ORDER BY run.started_at DESC
  LIMIT 1;
END;
$$;

ALTER FUNCTION public.ai_news_run_begin(uuid, uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.ai_news_run_finish(uuid, uuid, uuid, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.ai_news_run_latest(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION
  public.ai_news_run_begin(uuid, uuid, text),
  public.ai_news_run_finish(uuid, uuid, uuid, text, text),
  public.ai_news_run_latest(uuid)
FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION
  public.ai_news_run_begin(uuid, uuid, text),
  public.ai_news_run_finish(uuid, uuid, uuid, text, text),
  public.ai_news_run_latest(uuid)
TO moneyverse_app;

COMMIT;
