-- One story, and what it does to each stock.
--
-- 135 gave a scenario one stock, one direction and one strength, so a batch
-- was five separate pieces of news about five companies. News is not shaped
-- like that: a supply shock lifts the company that sells and squeezes the two
-- that buy, and a rumour about one bank is felt across the sector. The
-- operator asked for the shape news actually has -- one story that says which
-- stocks it helps, which it hurts, and which it only mentions.
--
-- So a scenario gets legs. Each leg names a stock (or the whole market), a
-- direction of up, down or none, and a strength; publishing the scenario
-- publishes one event per leg that moves something, all under the same
-- headline, and records the event against the leg. A leg of `none` is a stock
-- the story mentions without moving -- which is a thing a newsroom does, and
-- which the console can now show as 소식 beside the 호재 and the 악재.
--
-- Scenarios stored before this migration have no legs. `ai_news_batch_latest`
-- reads one out of the scenario's own columns for them, so the batch on the
-- console at the moment of the deploy still draws and still publishes.

BEGIN;

CREATE TABLE IF NOT EXISTS public.ai_news_scenario_effects (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES public.ai_news_scenarios(id) ON DELETE CASCADE,
  ordinal integer NOT NULL CHECK (ordinal BETWEEN 1 AND 4),
  -- NULL is the whole market, as everywhere else in this feature.
  stock_id uuid REFERENCES public.virtual_stocks(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('up', 'down', 'none')),
  strength integer NOT NULL CHECK (strength BETWEEN 1 AND 3),
  published_event_id uuid REFERENCES public.virtual_stock_market_events(id),
  UNIQUE (scenario_id, ordinal)
);

CREATE INDEX IF NOT EXISTS ai_news_scenario_effects_scenario_idx
  ON public.ai_news_scenario_effects (scenario_id);

REVOKE ALL ON public.ai_news_scenario_effects FROM PUBLIC, moneyverse_app;

/**
 * 135's batch writer, with legs.
 *
 * Each scenario may carry `effects`: up to four objects of stock_symbol (or
 * null for the whole market), direction and strength. A scenario without
 * them is read as it was before, as one leg -- so a model, or a caller, that
 * has not been told about legs still stores a batch. At least one leg has to
 * move something: a story that moves nothing is not a scenario, it is a
 * sentence.
 */
CREATE OR REPLACE FUNCTION public.ai_news_batch_create(
  p_key uuid,
  p_actor uuid,
  p_prompt text,
  p_model text,
  p_context jsonb,
  p_scenarios jsonb
)
RETURNS TABLE(batch_id uuid, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_existing public.ai_news_batches%ROWTYPE;
  v_batch uuid;
  v_item jsonb;
  v_leg jsonb;
  v_legs jsonb;
  v_ordinal integer := 0;
  v_leg_ordinal integer;
  v_scenario uuid;
  v_stock uuid;
  v_symbol text;
  v_direction text;
  v_strength integer;
  v_lead_direction text;
  v_lead_strength integer;
  v_lead_stock uuid;
  v_movers integer;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  IF p_key IS NULL
     OR pg_catalog.char_length(coalesce(p_prompt, '')) > 2000
     OR pg_catalog.char_length(coalesce(p_model, '')) NOT BETWEEN 1 AND 100
     OR jsonb_typeof(p_scenarios) <> 'array'
     OR jsonb_array_length(p_scenarios) NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid scenario batch';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:ai-news-batch:' || p_key::text, 0));

  SELECT batch.* INTO v_existing FROM public.ai_news_batches AS batch WHERE batch.idempotency_key = p_key;
  IF FOUND THEN
    IF v_existing.created_by IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'scenario batch receipt belongs to another operator';
    END IF;
    RETURN QUERY SELECT v_existing.id, true;
    RETURN;
  END IF;

  UPDATE public.ai_news_batches SET superseded_at = pg_catalog.clock_timestamp() WHERE superseded_at IS NULL;
  UPDATE public.ai_news_scenarios AS scenario SET status = 'superseded'
  WHERE scenario.status = 'proposed';

  INSERT INTO public.ai_news_batches (idempotency_key, created_by, operator_prompt, model, context)
  VALUES (p_key, p_actor, pg_catalog.btrim(coalesce(p_prompt, '')), p_model, coalesce(p_context, '{}'::jsonb))
  RETURNING id INTO v_batch;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_scenarios) LOOP
    v_ordinal := v_ordinal + 1;

    v_legs := v_item->'effects';
    IF jsonb_typeof(v_legs) <> 'array' OR jsonb_array_length(v_legs) = 0 THEN
      -- One leg, out of the scenario's own fields: 135's shape.
      v_legs := jsonb_build_array(jsonb_build_object(
        'stock_symbol', v_item->'stock_symbol',
        'direction', v_item->>'direction',
        'strength', (v_item->>'strength')::integer));
    END IF;
    IF jsonb_array_length(v_legs) > 4 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a scenario moves at most four stocks';
    END IF;

    -- The story's own lean is the first leg that moves something, which is
    -- what the card's badge says before anybody opens it.
    v_lead_direction := NULL;
    v_lead_strength := NULL;
    v_lead_stock := NULL;
    v_movers := 0;
    FOR v_leg IN SELECT value FROM jsonb_array_elements(v_legs) LOOP
      v_direction := v_leg->>'direction';
      IF v_direction IN ('up', 'down') THEN
        v_movers := v_movers + 1;
        IF v_lead_direction IS NULL THEN
          v_lead_direction := v_direction;
          v_lead_strength := (v_leg->>'strength')::integer;
        END IF;
      END IF;
    END LOOP;
    IF v_movers = 0 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a scenario must move at least one stock';
    END IF;
    IF jsonb_array_length(v_legs) = 1 THEN
      v_symbol := nullif(pg_catalog.btrim(coalesce(v_legs->0->>'stock_symbol', '')), '');
      IF v_symbol IS NOT NULL THEN
        SELECT stock.id INTO v_lead_stock FROM public.virtual_stocks AS stock
        WHERE stock.symbol = pg_catalog.upper(v_symbol) AND stock.active;
      END IF;
    END IF;

    INSERT INTO public.ai_news_scenarios
      (batch_id, ordinal, stock_id, direction, strength, hours, headline, body, rationale)
    VALUES (
      v_batch, v_ordinal, v_lead_stock,
      v_lead_direction,
      v_lead_strength,
      (v_item->>'hours')::integer,
      pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'headline', '')), 120),
      pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'body', '')), 2000),
      pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'rationale', '')), 1000)
    )
    RETURNING id INTO v_scenario;

    v_leg_ordinal := 0;
    FOR v_leg IN SELECT value FROM jsonb_array_elements(v_legs) LOOP
      v_leg_ordinal := v_leg_ordinal + 1;
      v_symbol := nullif(pg_catalog.btrim(coalesce(v_leg->>'stock_symbol', '')), '');
      v_stock := NULL;
      IF v_symbol IS NOT NULL THEN
        SELECT stock.id INTO v_stock FROM public.virtual_stocks AS stock
        WHERE stock.symbol = pg_catalog.upper(v_symbol) AND stock.active;
        IF v_stock IS NULL THEN
          RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'scenario names an unknown stock: ' || v_symbol;
        END IF;
      END IF;
      v_direction := v_leg->>'direction';
      v_strength := (v_leg->>'strength')::integer;
      IF v_direction NOT IN ('up', 'down', 'none') OR coalesce(v_strength, 0) NOT BETWEEN 1 AND 3 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid scenario effect';
      END IF;
      INSERT INTO public.ai_news_scenario_effects (scenario_id, ordinal, stock_id, direction, strength)
      VALUES (v_scenario, v_leg_ordinal, v_stock, v_direction, v_strength);
    END LOOP;
  END LOOP;

  PERFORM public.admin_record_audit_event(
    p_actor, 'ai_news.batch.created', v_batch, p_key,
    pg_catalog.jsonb_build_object('model', p_model, 'scenarios', v_ordinal, 'promptLength', pg_catalog.char_length(coalesce(p_prompt, '')))
  );

  RETURN QUERY SELECT v_batch, false;
END;
$$;

/** The current batch, its scenarios and each scenario's legs. */
CREATE OR REPLACE FUNCTION public.ai_news_batch_latest(p_actor uuid)
RETURNS TABLE(
  batch_id uuid,
  created_at timestamptz,
  operator_prompt text,
  model text,
  scenarios jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  RETURN QUERY
  SELECT batch.id, batch.created_at, batch.operator_prompt, batch.model,
         (SELECT coalesce(jsonb_agg(jsonb_build_object(
            'id', scenario.id, 'ordinal', scenario.ordinal,
            'stock_id', scenario.stock_id, 'symbol', stock.symbol, 'name', stock.name,
            'direction', scenario.direction, 'strength', scenario.strength, 'hours', scenario.hours,
            'headline', scenario.headline, 'body', scenario.body, 'rationale', scenario.rationale,
            'status', scenario.status, 'published_event_id', scenario.published_event_id,
            'decided_at', scenario.decided_at,
            'effects', coalesce(
              (SELECT jsonb_agg(jsonb_build_object(
                 'id', effect.id, 'ordinal', effect.ordinal, 'stock_id', effect.stock_id,
                 'symbol', touched.symbol, 'name', touched.name,
                 'direction', effect.direction, 'strength', effect.strength,
                 'published_event_id', effect.published_event_id
               ) ORDER BY effect.ordinal)
               FROM public.ai_news_scenario_effects AS effect
               LEFT JOIN public.virtual_stocks AS touched ON touched.id = effect.stock_id
               WHERE effect.scenario_id = scenario.id),
              -- Stored before 153: the scenario's own columns are its one leg.
              jsonb_build_array(jsonb_build_object(
                'id', scenario.id, 'ordinal', 1, 'stock_id', scenario.stock_id,
                'symbol', stock.symbol, 'name', stock.name,
                'direction', scenario.direction, 'strength', scenario.strength,
                'published_event_id', scenario.published_event_id))
            )
          ) ORDER BY scenario.ordinal), '[]'::jsonb)
          FROM public.ai_news_scenarios AS scenario
          LEFT JOIN public.virtual_stocks AS stock ON stock.id = scenario.stock_id
          WHERE scenario.batch_id = batch.id)
  FROM public.ai_news_batches AS batch
  ORDER BY batch.created_at DESC
  LIMIT 1;
END;
$$;

-- 135's publisher took one lean for one stock. The operator now settles a
-- lean per stock, so the arguments change and the old signature goes rather
-- than lingering as a second way to publish the same thing.
DROP FUNCTION IF EXISTS public.ai_news_scenario_publish(uuid, uuid, uuid, text, integer, integer, text, text);

/**
 * Publishes a scenario: one market event per leg that moves something, all
 * under the same headline and hours, each recorded against its leg.
 *
 * Every leg is checked before any is published, so a batch of legs is
 * refused whole rather than half-published: 135's guard against a strength-3
 * reversal within six hours applies to each leg's own scope.
 */
CREATE OR REPLACE FUNCTION public.ai_news_scenario_publish(
  p_key uuid,
  p_actor uuid,
  p_scenario uuid,
  p_hours integer,
  p_headline text,
  p_body text,
  p_effects jsonb
)
RETURNS TABLE(event_id uuid, published integer, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_scenario public.ai_news_scenarios%ROWTYPE;
  v_headline text;
  v_body text;
  v_leg jsonb;
  v_ordinal integer := 0;
  v_stock uuid;
  v_direction text;
  v_strength integer;
  v_opposite text;
  v_movers integer := 0;
  v_first uuid;
  v_event uuid;
  v_lead_direction text;
  v_lead_strength integer;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  v_headline := pg_catalog.btrim(coalesce(p_headline, ''));
  v_body := pg_catalog.btrim(coalesce(p_body, ''));
  IF p_key IS NULL OR p_scenario IS NULL
     OR coalesce(p_hours, 0) NOT BETWEEN 1 AND 168
     OR pg_catalog.char_length(v_headline) NOT BETWEEN 2 AND 120
     OR pg_catalog.char_length(v_body) > 2000
     OR jsonb_typeof(p_effects) <> 'array'
     OR jsonb_array_length(p_effects) NOT BETWEEN 1 AND 4 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid scenario publication';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:ai-news-publish:' || p_key::text, 0));

  SELECT scenario.* INTO v_scenario FROM public.ai_news_scenarios AS scenario
  WHERE scenario.id = p_scenario FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'scenario not found';
  END IF;
  IF v_scenario.status = 'published' AND v_scenario.published_event_id IS NOT NULL THEN
    RETURN QUERY SELECT v_scenario.published_event_id,
      (SELECT count(*)::integer FROM public.ai_news_scenario_effects AS effect
       WHERE effect.scenario_id = p_scenario AND effect.published_event_id IS NOT NULL),
      true;
    RETURN;
  END IF;
  IF v_scenario.status <> 'proposed' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'scenario is no longer open';
  END IF;

  -- Every leg, before any of them moves a price.
  FOR v_leg IN SELECT value FROM jsonb_array_elements(p_effects) LOOP
    v_stock := nullif(v_leg->>'stock_id', '')::uuid;
    v_direction := v_leg->>'direction';
    v_strength := (v_leg->>'strength')::integer;
    IF v_direction NOT IN ('up', 'down', 'none') OR coalesce(v_strength, 0) NOT BETWEEN 1 AND 3 THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid scenario effect';
    END IF;
    IF v_stock IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM public.virtual_stocks AS stock WHERE stock.id = v_stock AND stock.active
    ) THEN
      RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active stock required';
    END IF;
    IF v_direction <> 'none' THEN
      v_movers := v_movers + 1;
      v_opposite := CASE v_direction WHEN 'up' THEN 'down' ELSE 'up' END;
      IF v_strength = 3 AND EXISTS (
        SELECT 1 FROM public.virtual_stock_market_events AS event
        WHERE event.direction = v_opposite
          AND event.stock_id IS NOT DISTINCT FROM v_stock
          AND event.starts_at <= pg_catalog.clock_timestamp()
          AND coalesce(event.cancelled_at, event.ends_at) > pg_catalog.clock_timestamp() - interval '6 hours'
      ) THEN
        RAISE EXCEPTION USING ERRCODE = '22023',
          MESSAGE = 'a strong reversal cannot follow the opposite news within six hours';
      END IF;
    END IF;
  END LOOP;
  IF v_movers = 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'at least one stock must move';
  END IF;

  -- What the operator settled on replaces what the model proposed.
  DELETE FROM public.ai_news_scenario_effects WHERE scenario_id = p_scenario;

  FOR v_leg IN SELECT value FROM jsonb_array_elements(p_effects) LOOP
    v_ordinal := v_ordinal + 1;
    v_stock := nullif(v_leg->>'stock_id', '')::uuid;
    v_direction := v_leg->>'direction';
    v_strength := (v_leg->>'strength')::integer;
    v_event := NULL;
    IF v_direction <> 'none' THEN
      -- One receipt per leg, derived from the scenario's own, so a replay of
      -- the publication is a replay of every event in it.
      SELECT published.event_id INTO v_event
      FROM public.stock_market_event_publish(
        (pg_catalog.md5(p_key::text || ':' || v_ordinal::text))::uuid,
        p_actor, v_stock, v_direction, v_strength, p_hours, v_headline, v_body, 'ai'
      ) AS published;
      v_first := coalesce(v_first, v_event);
      IF v_lead_direction IS NULL THEN
        v_lead_direction := v_direction;
        v_lead_strength := v_strength;
      END IF;
    END IF;
    INSERT INTO public.ai_news_scenario_effects
      (scenario_id, ordinal, stock_id, direction, strength, published_event_id)
    VALUES (p_scenario, v_ordinal, v_stock, v_direction, v_strength, v_event);
  END LOOP;

  UPDATE public.ai_news_scenarios
  SET status = 'published',
      published_event_id = v_first,
      direction = v_lead_direction,
      strength = v_lead_strength,
      hours = p_hours,
      headline = v_headline,
      body = v_body,
      decided_by = p_actor,
      decided_at = pg_catalog.clock_timestamp()
  WHERE id = p_scenario;

  RETURN QUERY SELECT v_first, v_movers, false;
END;
$$;

ALTER FUNCTION public.ai_news_batch_create(uuid, uuid, text, text, jsonb, jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.ai_news_batch_latest(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.ai_news_scenario_publish(uuid, uuid, uuid, integer, text, text, jsonb) OWNER TO moneyverse_migrator;

REVOKE ALL ON FUNCTION
  public.ai_news_batch_create(uuid, uuid, text, text, jsonb, jsonb),
  public.ai_news_batch_latest(uuid),
  public.ai_news_scenario_publish(uuid, uuid, uuid, integer, text, text, jsonb)
FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION
  public.ai_news_batch_create(uuid, uuid, text, text, jsonb, jsonb),
  public.ai_news_batch_latest(uuid),
  public.ai_news_scenario_publish(uuid, uuid, uuid, integer, text, text, jsonb)
TO moneyverse_app;

COMMIT;
