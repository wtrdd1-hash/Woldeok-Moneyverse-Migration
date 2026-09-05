-- AI-proposed market news: five scenarios at a time, kept, chosen by an
-- operator, and published through 124's event function.
--
-- 124 gave the market a seam for news: an event with a direction, a
-- strength and a duration leans a stock or the whole market. This is the
-- desk that writes the news. A model is asked -- with everything it needs
-- to be consistent: every stock's price and mood, the events running and
-- the ones that recently ended, the scenarios already published and when,
-- the macro figures, the clock -- for five scenarios that continue the
-- story rather than restart it. They are stored, so a reload shows the
-- same five; an operator edits the lean, the strength and the hours on the
-- one they choose and publishes it, or asks for five more.
--
-- Nothing here calls the model. The database keeps the settings (the key
-- sealed with the same AES-256-GCM envelope as the TOTP secrets, under the
-- key held only in the environment), builds the context, stores what came
-- back and publishes what was chosen. The application does the calling,
-- and only ever with what these functions hand it.
--
-- A guard on continuity lives here rather than in the prompt: a strength-3
-- event may not reverse an event of the opposite direction on the same
-- scope that is running or ended in the last six hours. The prompt asks
-- the model not to; the function makes sure.

BEGIN;

-- ---------------------------------------------------------------------------
-- Settings: one row
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ai_news_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  -- PostgreSQL caps a regex repetition at 255, so the length is its own check.
  api_base_url text NOT NULL DEFAULT 'https://api.anthropic.com'
    CHECK (api_base_url ~ '^https?://\S+$' AND pg_catalog.char_length(api_base_url) BETWEEN 11 AND 300),
  model text NOT NULL DEFAULT 'claude-opus-5' CHECK (pg_catalog.char_length(model) BETWEEN 1 AND 100),
  -- nonce || tag || ciphertext, base64, as totp.ts seals it. NULL until set.
  api_key_sealed text,
  api_key_key_id text,
  -- The last four characters, so the console can say which key is in use
  -- without ever showing it.
  api_key_hint text NOT NULL DEFAULT '',
  updated_by uuid REFERENCES public.users(id),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

INSERT INTO public.ai_news_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

REVOKE ALL ON public.ai_news_settings FROM PUBLIC, moneyverse_app;

-- ---------------------------------------------------------------------------
-- Batches and scenarios
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ai_news_batches (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  created_by uuid NOT NULL REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  operator_prompt text NOT NULL DEFAULT '' CHECK (pg_catalog.char_length(operator_prompt) <= 2000),
  model text NOT NULL,
  -- What the model was shown, so a scenario can be read against the state
  -- it was written for.
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Set when a newer batch replaces this one.
  superseded_at timestamptz
);

CREATE INDEX IF NOT EXISTS ai_news_batches_live_idx
  ON public.ai_news_batches (created_at DESC)
  WHERE superseded_at IS NULL;

REVOKE ALL ON public.ai_news_batches FROM PUBLIC, moneyverse_app;

CREATE TABLE IF NOT EXISTS public.ai_news_scenarios (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  batch_id uuid NOT NULL REFERENCES public.ai_news_batches(id) ON DELETE CASCADE,
  ordinal integer NOT NULL CHECK (ordinal BETWEEN 1 AND 5),
  -- NULL is the whole market.
  stock_id uuid REFERENCES public.virtual_stocks(id) ON DELETE SET NULL,
  direction text NOT NULL CHECK (direction IN ('up', 'down')),
  strength integer NOT NULL CHECK (strength BETWEEN 1 AND 3),
  hours integer NOT NULL CHECK (hours BETWEEN 1 AND 168),
  headline text NOT NULL CHECK (pg_catalog.char_length(headline) BETWEEN 2 AND 120),
  body text NOT NULL DEFAULT '' CHECK (pg_catalog.char_length(body) <= 2000),
  -- Why the model proposed it, and how it follows what came before. For the
  -- operator; never published.
  rationale text NOT NULL DEFAULT '' CHECK (pg_catalog.char_length(rationale) <= 1000),
  status text NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'published', 'discarded', 'superseded')),
  published_event_id uuid REFERENCES public.virtual_stock_market_events(id),
  decided_by uuid REFERENCES public.users(id),
  decided_at timestamptz,
  UNIQUE (batch_id, ordinal)
);

REVOKE ALL ON public.ai_news_scenarios FROM PUBLIC, moneyverse_app;

-- ---------------------------------------------------------------------------
-- Settings: read and write
-- ---------------------------------------------------------------------------

/** What the console shows: never the key. */
CREATE OR REPLACE FUNCTION public.ai_news_settings_get(p_actor uuid)
RETURNS TABLE(api_base_url text, model text, has_key boolean, api_key_hint text, updated_at timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  RETURN QUERY
  SELECT settings.api_base_url, settings.model, settings.api_key_sealed IS NOT NULL,
         settings.api_key_hint, settings.updated_at
  FROM public.ai_news_settings AS settings
  WHERE settings.id = 1;
END;
$$;

/** What the application needs to call the model: the sealed key and the key id it was sealed under. */
CREATE OR REPLACE FUNCTION public.ai_news_settings_credential(p_actor uuid)
RETURNS TABLE(api_base_url text, model text, api_key_sealed text, api_key_key_id text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  RETURN QUERY
  SELECT settings.api_base_url, settings.model, settings.api_key_sealed, settings.api_key_key_id
  FROM public.ai_news_settings AS settings
  WHERE settings.id = 1;
END;
$$;

/**
 * Sets the address, the model and -- when given -- the key. A NULL sealed
 * key keeps the one already stored, so the address can be changed without
 * retyping the key. Audited without the key or its hint.
 */
CREATE OR REPLACE FUNCTION public.ai_news_settings_set(
  p_key uuid,
  p_actor uuid,
  p_api_base_url text,
  p_model text,
  p_api_key_sealed text,
  p_api_key_key_id text,
  p_api_key_hint text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_url text := pg_catalog.btrim(coalesce(p_api_base_url, ''));
  v_model text := pg_catalog.btrim(coalesce(p_model, ''));
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  IF p_key IS NULL
     OR v_url !~ '^https?://\S+$'
     OR pg_catalog.char_length(v_url) NOT BETWEEN 11 AND 300
     OR pg_catalog.char_length(v_model) NOT BETWEEN 1 AND 100
     OR (p_api_key_sealed IS NOT NULL AND coalesce(p_api_key_key_id, '') = '') THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid AI news settings';
  END IF;

  UPDATE public.ai_news_settings
  SET api_base_url = v_url,
      model = v_model,
      api_key_sealed = coalesce(p_api_key_sealed, api_key_sealed),
      api_key_key_id = CASE WHEN p_api_key_sealed IS NULL THEN api_key_key_id ELSE p_api_key_key_id END,
      api_key_hint = CASE WHEN p_api_key_sealed IS NULL THEN api_key_hint ELSE coalesce(p_api_key_hint, '') END,
      updated_by = p_actor,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = 1;

  PERFORM public.admin_record_audit_event(
    p_actor, 'ai_news.settings.updated', NULL, p_key,
    pg_catalog.jsonb_build_object('apiBaseUrl', v_url, 'model', v_model, 'keyChanged', p_api_key_sealed IS NOT NULL)
  );
  RETURN true;
END;
$$;

-- ---------------------------------------------------------------------------
-- The context the model is given
-- ---------------------------------------------------------------------------

/**
 * Everything a scenario has to be consistent with, in one document.
 *
 * Every stock with its price, today's and the week's move, its mood (124);
 * the events running and the ones that ended in the last week, with their
 * times; the scenarios already published, with when; the macro figures 117
 * reports; and the clock in Seoul. The model is told all of it so that what
 * it proposes follows from it -- which is requirement one of this feature,
 * and the reason this is a function rather than a few queries in the
 * application.
 */
CREATE OR REPLACE FUNCTION public.ai_news_context(p_actor uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_stocks jsonb;
  v_live jsonb;
  v_recent jsonb;
  v_published jsonb;
  v_macro jsonb;
  v_market_trend numeric;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);

  SELECT coalesce(jsonb_agg(item ORDER BY item->>'symbol'), '[]'::jsonb) INTO v_stocks
  FROM (
    SELECT jsonb_build_object(
      'id', stock.id,
      'symbol', stock.symbol,
      'name', stock.name,
      'description', stock.description,
      'current_price', stock.current_price,
      'day_open_price', stock.day_open_price,
      'day_change_pct', round((stock.current_price::numeric / greatest(stock.day_open_price, 1) - 1) * 100, 2),
      'week_change_pct', (
        SELECT round((stock.current_price::numeric / greatest(candle.close_price, 1) - 1) * 100, 2)
        FROM public.virtual_stock_daily_candles AS candle
        WHERE candle.stock_id = stock.id
          AND candle.trade_date <= (pg_catalog.timezone('Asia/Seoul', v_now))::date - 7
        ORDER BY candle.trade_date DESC
        LIMIT 1),
      'fair_value', round(dynamics.fair_value),
      'trend_pct_per_day', round(dynamics.trend_bps / 100, 2),
      'volatility_pct_per_day', round(dynamics.vol_bps / 100, 2),
      'shares_outstanding', stock.shares_outstanding
    ) AS item
    FROM public.virtual_stocks AS stock
    LEFT JOIN public.virtual_stock_dynamics AS dynamics ON dynamics.stock_id = stock.id
    WHERE stock.active
  ) AS rows;

  SELECT regime.market_trend_bps INTO v_market_trend
  FROM public.virtual_stock_market_regime AS regime WHERE regime.id = 1;

  SELECT coalesce(jsonb_agg(item ORDER BY item->>'starts_at' DESC), '[]'::jsonb) INTO v_live
  FROM (
    SELECT jsonb_build_object(
      'id', event.id, 'symbol', stock.symbol, 'name', stock.name,
      'direction', event.direction, 'strength', event.strength, 'headline', event.headline,
      'body', event.body, 'source', event.source, 'starts_at', event.starts_at, 'ends_at', event.ends_at
    ) AS item
    FROM public.virtual_stock_market_events AS event
    LEFT JOIN public.virtual_stocks AS stock ON stock.id = event.stock_id
    WHERE event.cancelled_at IS NULL AND event.starts_at <= v_now AND event.ends_at > v_now
  ) AS rows;

  SELECT coalesce(jsonb_agg(item ORDER BY item->>'ends_at' DESC), '[]'::jsonb) INTO v_recent
  FROM (
    SELECT jsonb_build_object(
      'id', event.id, 'symbol', stock.symbol, 'name', stock.name,
      'direction', event.direction, 'strength', event.strength, 'headline', event.headline,
      'source', event.source, 'starts_at', event.starts_at,
      'ends_at', coalesce(event.cancelled_at, event.ends_at), 'cancelled', event.cancelled_at IS NOT NULL
    ) AS item
    FROM public.virtual_stock_market_events AS event
    LEFT JOIN public.virtual_stocks AS stock ON stock.id = event.stock_id
    WHERE coalesce(event.cancelled_at, event.ends_at) <= v_now
      AND coalesce(event.cancelled_at, event.ends_at) > v_now - interval '7 days'
    ORDER BY coalesce(event.cancelled_at, event.ends_at) DESC
    LIMIT 20
  ) AS rows;

  SELECT coalesce(jsonb_agg(item ORDER BY item->>'published_at' DESC), '[]'::jsonb) INTO v_published
  FROM (
    SELECT jsonb_build_object(
      'headline', scenario.headline, 'symbol', stock.symbol, 'direction', scenario.direction,
      'strength', scenario.strength, 'hours', scenario.hours, 'rationale', scenario.rationale,
      'published_at', scenario.decided_at
    ) AS item
    FROM public.ai_news_scenarios AS scenario
    LEFT JOIN public.virtual_stocks AS stock ON stock.id = scenario.stock_id
    WHERE scenario.status = 'published'
    ORDER BY scenario.decided_at DESC
    LIMIT 15
  ) AS rows;

  -- 117's figures, trimmed to what a newsroom would read.
  BEGIN
    SELECT jsonb_build_object(
      'm2_supply', macro->'m2_supply', 'inflation_ratio', macro->'inflation_ratio',
      'inflation_alert', macro->'inflation_alert', 'faucet_today', macro->'faucet_today',
      'sink_today', macro->'sink_today')
    INTO v_macro
    FROM public.admin_get_macro_economy_v2() AS macro;
  EXCEPTION WHEN OTHERS THEN
    v_macro := '{}'::jsonb;
  END;

  RETURN jsonb_build_object(
    'now_seoul', to_char(pg_catalog.timezone('Asia/Seoul', v_now), 'YYYY-MM-DD HH24:MI'),
    'market_trend_pct_per_day', round(coalesce(v_market_trend, 0) / 100, 2),
    'stocks', v_stocks,
    'live_events', v_live,
    'recent_events', v_recent,
    'published_scenarios', v_published,
    'macro', coalesce(v_macro, '{}'::jsonb)
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- Storing a batch, and reading the current one
-- ---------------------------------------------------------------------------

/**
 * Stores what the model proposed: one batch and its scenarios, in 045's
 * order. The previous batch is superseded and its unpublished scenarios
 * with it, so "regenerate" is a new batch and the old one is history.
 *
 * `p_scenarios` is a JSON array of up to five objects with stock_symbol
 * (or null), direction, strength, hours, headline, body and rationale. The
 * symbol is resolved here and an unknown one is refused rather than dropped,
 * because a scenario that silently became market-wide is a different story.
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
  v_ordinal integer := 0;
  v_stock uuid;
  v_symbol text;
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
    v_symbol := nullif(pg_catalog.btrim(coalesce(v_item->>'stock_symbol', '')), '');
    v_stock := NULL;
    IF v_symbol IS NOT NULL THEN
      SELECT stock.id INTO v_stock FROM public.virtual_stocks AS stock
      WHERE stock.symbol = pg_catalog.upper(v_symbol) AND stock.active;
      IF v_stock IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'scenario names an unknown stock: ' || v_symbol;
      END IF;
    END IF;
    INSERT INTO public.ai_news_scenarios
      (batch_id, ordinal, stock_id, direction, strength, hours, headline, body, rationale)
    VALUES (
      v_batch, v_ordinal, v_stock,
      v_item->>'direction',
      (v_item->>'strength')::integer,
      (v_item->>'hours')::integer,
      pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'headline', '')), 120),
      pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'body', '')), 2000),
      pg_catalog.left(pg_catalog.btrim(coalesce(v_item->>'rationale', '')), 1000)
    );
  END LOOP;

  PERFORM public.admin_record_audit_event(
    p_actor, 'ai_news.batch.created', v_batch, p_key,
    pg_catalog.jsonb_build_object('model', p_model, 'scenarios', v_ordinal, 'promptLength', pg_catalog.char_length(coalesce(p_prompt, '')))
  );

  RETURN QUERY SELECT v_batch, false;
END;
$$;

/** The current batch with its scenarios, or nothing. What survives a reload. */
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
            'decided_at', scenario.decided_at
          ) ORDER BY scenario.ordinal), '[]'::jsonb)
          FROM public.ai_news_scenarios AS scenario
          LEFT JOIN public.virtual_stocks AS stock ON stock.id = scenario.stock_id
          WHERE scenario.batch_id = batch.id)
  FROM public.ai_news_batches AS batch
  ORDER BY batch.created_at DESC
  LIMIT 1;
END;
$$;

-- ---------------------------------------------------------------------------
-- Choosing one
-- ---------------------------------------------------------------------------

/**
 * Publishes a scenario as an event, with the lean, strength, hours and
 * text the operator settled on. Refuses a strength-3 reversal of an event
 * on the same scope that is running or ended within six hours: the story
 * may turn, but not on a dime.
 */
CREATE OR REPLACE FUNCTION public.ai_news_scenario_publish(
  p_key uuid,
  p_actor uuid,
  p_scenario uuid,
  p_direction text,
  p_strength integer,
  p_hours integer,
  p_headline text,
  p_body text
)
RETURNS TABLE(event_id uuid, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_scenario public.ai_news_scenarios%ROWTYPE;
  v_event uuid;
  v_replayed boolean;
  v_opposite text;
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  IF p_key IS NULL OR p_scenario IS NULL THEN
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
    RETURN QUERY SELECT v_scenario.published_event_id, true;
    RETURN;
  END IF;
  IF v_scenario.status <> 'proposed' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'scenario is no longer open';
  END IF;

  v_opposite := CASE p_direction WHEN 'up' THEN 'down' WHEN 'down' THEN 'up' ELSE NULL END;
  IF v_opposite IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid market event';
  END IF;
  IF p_strength = 3 AND EXISTS (
    SELECT 1 FROM public.virtual_stock_market_events AS event
    WHERE event.direction = v_opposite
      AND event.stock_id IS NOT DISTINCT FROM v_scenario.stock_id
      AND event.starts_at <= pg_catalog.clock_timestamp()
      AND coalesce(event.cancelled_at, event.ends_at) > pg_catalog.clock_timestamp() - interval '6 hours'
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'a strong reversal cannot follow the opposite news within six hours';
  END IF;

  SELECT published.event_id, published.replayed INTO v_event, v_replayed
  FROM public.stock_market_event_publish(
    p_key, p_actor, v_scenario.stock_id, p_direction, p_strength, p_hours, p_headline, p_body, 'ai'
  ) AS published;

  UPDATE public.ai_news_scenarios
  SET status = 'published',
      published_event_id = v_event,
      direction = p_direction,
      strength = p_strength,
      hours = p_hours,
      headline = pg_catalog.btrim(p_headline),
      body = pg_catalog.btrim(coalesce(p_body, '')),
      decided_by = p_actor,
      decided_at = pg_catalog.clock_timestamp()
  WHERE id = p_scenario;

  RETURN QUERY SELECT v_event, v_replayed;
END;
$$;

/** Sets a scenario aside. True once; false when it was already decided. */
CREATE OR REPLACE FUNCTION public.ai_news_scenario_discard(p_key uuid, p_actor uuid, p_scenario uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  PERFORM public.game_catalog_operator(p_actor);
  IF p_key IS NULL OR p_scenario IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid scenario';
  END IF;
  UPDATE public.ai_news_scenarios
  SET status = 'discarded', decided_by = p_actor, decided_at = pg_catalog.clock_timestamp()
  WHERE id = p_scenario AND status = 'proposed';
  RETURN FOUND;
END;
$$;

-- ---------------------------------------------------------------------------
-- Ownership and grants
-- ---------------------------------------------------------------------------

ALTER FUNCTION public.ai_news_settings_get(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.ai_news_settings_credential(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.ai_news_settings_set(uuid, uuid, text, text, text, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.ai_news_context(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.ai_news_batch_create(uuid, uuid, text, text, jsonb, jsonb) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.ai_news_batch_latest(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.ai_news_scenario_publish(uuid, uuid, uuid, text, integer, integer, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.ai_news_scenario_discard(uuid, uuid, uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION
  public.ai_news_settings_get(uuid),
  public.ai_news_settings_credential(uuid),
  public.ai_news_settings_set(uuid, uuid, text, text, text, text, text),
  public.ai_news_context(uuid),
  public.ai_news_batch_create(uuid, uuid, text, text, jsonb, jsonb),
  public.ai_news_batch_latest(uuid),
  public.ai_news_scenario_publish(uuid, uuid, uuid, text, integer, integer, text, text),
  public.ai_news_scenario_discard(uuid, uuid, uuid)
FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION
  public.ai_news_settings_get(uuid),
  public.ai_news_settings_credential(uuid),
  public.ai_news_settings_set(uuid, uuid, text, text, text, text, text),
  public.ai_news_context(uuid),
  public.ai_news_batch_create(uuid, uuid, text, text, jsonb, jsonb),
  public.ai_news_batch_latest(uuid),
  public.ai_news_scenario_publish(uuid, uuid, uuid, text, integer, integer, text, text),
  public.ai_news_scenario_discard(uuid, uuid, uuid)
TO moneyverse_app;

COMMIT;
