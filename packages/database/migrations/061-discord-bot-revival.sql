-- The Discord bot, switched back on.
--
-- Three things kept it off, and each of them is a row rather than a comment
-- from here on.
--
-- The rate limiter was a Map in one process. `config.ts` refused to enable the
-- public interaction endpoint at all while that was the only limiter, because
-- the endpoint is reachable by anyone and a per-process budget is N times
-- weaker than it claims on any scale-out. The counter belongs where every
-- process already agrees, so it is a row updated in one atomic statement.
--
-- The outbox had no terminal state. `delivery_attempts` counted up forever and
-- `outbox_release_claim` cleared the lease unconditionally, so an event
-- Discord rejects permanently -- a deleted channel, a revoked token, a message
-- that will never be accepted -- was retried every two minutes for the life of
-- the deployment, and `admin_recent_discord_outbox_events` could only ever
-- call it `retry_pending`.
--
-- And every event was announced. `economy_post_transaction` writes an outbox
-- row for every ledger transaction, so starting the worker as it stood would
-- have posted one line per member action into a Discord channel. Routing is
-- therefore an allowlist: a type with no enabled route is parked as
-- `suppressed` instead of delivered, which also means a later migration adding
-- an event type does not silently start broadcasting it.

BEGIN;

-- ---------------------------------------------------------------------------
-- A rate limit every process shares
-- ---------------------------------------------------------------------------

-- One row per (guild, member) window. The table is the shared state; the
-- function below is the only thing allowed to touch it, so a SQL injection
-- through some other path cannot reset a throttle by writing this table.
CREATE TABLE IF NOT EXISTS public.discord_rate_limit_buckets (
  bucket_key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL,
  consumed integer NOT NULL
);

CREATE INDEX IF NOT EXISTS discord_rate_limit_buckets_window_idx
  ON public.discord_rate_limit_buckets (window_started_at);

REVOKE ALL PRIVILEGES ON TABLE public.discord_rate_limit_buckets FROM PUBLIC, moneyverse_app;

-- Consume one token from a fixed window, atomically.
--
-- `INSERT ... ON CONFLICT DO UPDATE` takes the row lock itself, so two
-- application instances racing on the same member cannot both read 4 and both
-- write 5. That single property is what the in-process limiter could not
-- offer and what the production block existed to wait for.
--
-- The key shape is checked rather than trusted: the caller builds it from a
-- guild and a member snowflake it has already validated, and pinning the shape
-- here means no other caller can invent unbounded keys and grow this table.
CREATE OR REPLACE FUNCTION public.discord_rate_limit_consume(
  p_bucket_key text,
  p_limit integer DEFAULT 5,
  p_window_seconds integer DEFAULT 10
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_limit integer := least(greatest(coalesce(p_limit, 5), 1), 100);
  v_window interval := make_interval(secs => least(greatest(coalesce(p_window_seconds, 10), 1), 3600));
  v_consumed integer;
BEGIN
  IF p_bucket_key IS NULL OR p_bucket_key !~ '^[0-9]{16,22}:[0-9]{16,22}$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid rate limit bucket key';
  END IF;

  -- Two hours, not one window: the window is clamped to an hour above, and a
  -- bucket deleted while its window is still open would hand the member a
  -- fresh budget. A sweeper job would be the alternative, and this deployment
  -- has no scheduler to hang one on.
  --
  -- SKIP LOCKED, and bounded, for a reason that is not performance: without it
  -- this statement can wait on a row another session is upserting while that
  -- session waits on a row this one has already deleted, which is a deadlock
  -- between two members who happen to spend a command at the same moment. A
  -- prune that never waits cannot be half of a cycle.
  DELETE FROM public.discord_rate_limit_buckets AS bucket
   WHERE bucket.bucket_key IN (
     SELECT stale.bucket_key
     FROM public.discord_rate_limit_buckets AS stale
     WHERE stale.window_started_at < clock_timestamp() - interval '2 hours'
     ORDER BY stale.window_started_at
     LIMIT 100
     FOR UPDATE SKIP LOCKED
   );

  INSERT INTO public.discord_rate_limit_buckets AS bucket (bucket_key, window_started_at, consumed)
  VALUES (p_bucket_key, clock_timestamp(), 1)
  ON CONFLICT (bucket_key) DO UPDATE
    SET window_started_at = CASE
          WHEN bucket.window_started_at + v_window <= clock_timestamp() THEN clock_timestamp()
          ELSE bucket.window_started_at
        END,
        -- Stop counting one past the limit. A member who keeps spamming a
        -- refused command must not be able to overflow the counter.
        consumed = CASE
          WHEN bucket.window_started_at + v_window <= clock_timestamp() THEN 1
          ELSE least(bucket.consumed + 1, v_limit + 1)
        END
  RETURNING bucket.consumed INTO v_consumed;

  RETURN v_consumed <= v_limit;
END;
$$;

ALTER FUNCTION public.discord_rate_limit_consume(text, integer, integer)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.discord_rate_limit_consume(text, integer, integer)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.discord_rate_limit_consume(text, integer, integer)
  TO moneyverse_app;

-- ---------------------------------------------------------------------------
-- Dead-letter state and per-type routing for the outbox
-- ---------------------------------------------------------------------------

ALTER TABLE public.outbox_events
  ADD COLUMN IF NOT EXISTS delivery_failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivery_outcome text,
  ADD COLUMN IF NOT EXISTS last_delivery_error text;

ALTER TABLE public.outbox_events
  DROP CONSTRAINT IF EXISTS outbox_events_delivery_outcome_check;
ALTER TABLE public.outbox_events
  ADD CONSTRAINT outbox_events_delivery_outcome_check
  CHECK (delivery_outcome IS NULL OR delivery_outcome IN ('dead_letter', 'suppressed'));

-- The claim index has to exclude the parked rows too, or a deployment that has
-- suppressed a year of casino events walks all of them on every tick.
DROP INDEX IF EXISTS public.outbox_events_pending_delivery_idx;
CREATE INDEX IF NOT EXISTS outbox_events_pending_delivery_idx
  ON public.outbox_events (created_at)
  WHERE delivered_at IS NULL AND delivery_failed_at IS NULL;

-- Which event types are announced, and where.
--
-- `channel_key` is a symbolic name, never a Discord channel id: a channel id
-- belongs to one deployment and a migration reaches every database, so the
-- test stack and production would end up sharing a channel. The deployment
-- maps the key to an id in its own environment.
CREATE TABLE IF NOT EXISTS public.discord_outbox_routes (
  event_type text PRIMARY KEY CHECK (event_type ~ '^[a-z][a-z0-9_.]{2,79}$'),
  channel_key text NOT NULL CHECK (channel_key ~ '^[a-z][a-z0-9_-]{1,31}$'),
  enabled boolean NOT NULL DEFAULT true,
  note text
);

REVOKE ALL PRIVILEGES ON TABLE public.discord_outbox_routes FROM PUBLIC, moneyverse_app;

-- Every event type economy_post_transaction writes today, with a decision
-- attached. The rule is volume, not secrecy: nothing here carries a member, an
-- amount or a payload into Discord (039 refuses payloads even to an approver,
-- and the worker is not handed one). A type that fires once per member per
-- action is announced; one that fires in bulk from a background job, or on
-- every trade, is off until somebody asks for it.
INSERT INTO public.discord_outbox_routes (event_type, channel_key, enabled, note) VALUES
  ('wallet.transfer.completed', 'default', true,  'one member action'),
  ('game.daily_reward.claimed', 'default', true,  'one member action, once a day'),
  ('game.work_reward.claimed',  'default', true,  'one member action'),
  ('shop.purchase.completed',   'default', true,  'one member action'),
  ('business.purchased',        'default', true,  'one member action'),
  ('bank.loan.issued',          'default', true,  'one member action'),
  ('bank.loan.repaid',          'default', true,  'one member action'),
  ('season.event.consumed',     'default', true,  'one member action'),
  ('bank.balance.moved',        'default', false, 'deposit and withdrawal churn'),
  ('stock.trade.completed',     'default', false, 'every trade, and the market ticks every second'),
  ('casino.coin.played',        'default', false, 'every round; announcing gambling outcomes is a product decision'),
  ('bank.interest.accrued',     'default', false, 'one row per depositor per day, from a background job'),
  ('business.daily_settled',    'default', false, 'one row per business per day, from a background job')
ON CONFLICT (event_type) DO NOTHING;

-- Claim a batch to deliver, and park what will never be delivered.
--
-- Rewritten rather than replaced in place because the result gains
-- `channel_key`, and CREATE OR REPLACE cannot change a function's return type.
-- The payload is deliberately dropped from the result: the worker builds its
-- message from the type alone, and what it is never handed it can never leak
-- into a Discord channel.
DROP FUNCTION IF EXISTS public.outbox_claim_pending(integer);
CREATE FUNCTION public.outbox_claim_pending(p_limit integer DEFAULT 20)
RETURNS TABLE(id uuid, event_type text, channel_key text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN QUERY
  -- MATERIALIZED so the lease is taken exactly once: this CTE is referenced
  -- once, which is the case the planner is otherwise free to inline.
  WITH candidates AS MATERIALIZED (
    SELECT event.id
    FROM public.outbox_events AS event
    WHERE event.delivered_at IS NULL
      AND event.delivery_failed_at IS NULL
      AND (event.delivery_locked_until IS NULL OR event.delivery_locked_until < clock_timestamp())
    ORDER BY event.created_at
    FOR UPDATE SKIP LOCKED
    LIMIT greatest(1, least(p_limit, 100))
  ), resolved AS (
    SELECT event.id,
           event.type,
           (SELECT route.channel_key
              FROM public.discord_outbox_routes AS route
             WHERE route.event_type = event.type
               AND route.enabled) AS channel_key
    FROM public.outbox_events AS event
    JOIN candidates ON candidates.id = event.id
  ), suppressed AS (
    -- Not a failure: an event nobody asked Discord to announce. Parking it is
    -- what keeps the pending index from growing without bound, and what stops
    -- the next tick from reconsidering the same rows forever.
    UPDATE public.outbox_events AS event
    SET delivery_failed_at = clock_timestamp(),
        delivery_outcome = 'suppressed',
        delivery_locked_until = NULL
    FROM resolved
    WHERE event.id = resolved.id AND resolved.channel_key IS NULL
    RETURNING event.id
  ), claimed AS (
    UPDATE public.outbox_events AS event
    SET delivery_attempts = event.delivery_attempts + 1,
        delivery_locked_until = clock_timestamp() + interval '2 minutes'
    FROM resolved
    WHERE event.id = resolved.id AND resolved.channel_key IS NOT NULL
    RETURNING event.id, event.type
  )
  SELECT claimed.id, claimed.type, resolved.channel_key
  FROM claimed
  JOIN resolved ON resolved.id = claimed.id;
END;
$$;

ALTER FUNCTION public.outbox_claim_pending(integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.outbox_claim_pending(integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.outbox_claim_pending(integer) TO moneyverse_app;

-- Record a delivery that did not happen, and decide whether to try again.
--
-- `p_permanent` is for a refusal that repeating cannot fix -- Discord
-- answering 403 or 404 -- and the attempt ceiling is for everything else. A
-- returned 'dead_letter' means the event will never be claimed again; an
-- operator reads it out of admin_recent_discord_outbox_events.
CREATE OR REPLACE FUNCTION public.outbox_record_delivery_failure(
  p_id uuid,
  p_reason text,
  p_permanent boolean DEFAULT false,
  p_max_attempts integer DEFAULT 8
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_max integer := least(greatest(coalesce(p_max_attempts, 8), 1), 50);
  -- Bounded and stripped of newlines: this text is read back in an operator
  -- console, and an upstream error body is not a place to trust formatting.
  v_reason text := left(regexp_replace(coalesce(p_reason, 'delivery failed'), '[\r\n\t]+', ' ', 'g'), 500);
  v_attempts integer;
  v_state text;
BEGIN
  IF p_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'outbox event id is required';
  END IF;

  SELECT event.delivery_attempts INTO v_attempts
  FROM public.outbox_events AS event
  WHERE event.id = p_id AND event.delivered_at IS NULL AND event.delivery_failed_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN 'settled';
  END IF;

  v_state := CASE
    WHEN coalesce(p_permanent, false) OR v_attempts >= v_max THEN 'dead_letter'
    ELSE 'retry'
  END;

  UPDATE public.outbox_events AS event
  SET delivery_locked_until = NULL,
      last_delivery_error = v_reason,
      delivery_failed_at = CASE WHEN v_state = 'dead_letter' THEN clock_timestamp() END,
      delivery_outcome = CASE WHEN v_state = 'dead_letter' THEN 'dead_letter' END
  WHERE event.id = p_id;

  RETURN v_state;
END;
$$;

ALTER FUNCTION public.outbox_record_delivery_failure(uuid, text, boolean, integer)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.outbox_record_delivery_failure(uuid, text, boolean, integer)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.outbox_record_delivery_failure(uuid, text, boolean, integer)
  TO moneyverse_app;

-- Give back a lease for an event the worker never actually sent.
--
-- The claim counts the attempt, so a batch abandoned after the first network
-- error would burn the ceiling on events nobody tried -- and dead-letter them
-- without a single delivery. Handing the attempt back keeps `delivery_attempts`
-- meaning "times Discord was asked", which is what the ceiling is counting.
CREATE OR REPLACE FUNCTION public.outbox_release_claim_untried(p_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  UPDATE public.outbox_events
  SET delivery_locked_until = NULL,
      delivery_attempts = greatest(delivery_attempts - 1, 0)
  WHERE id = p_id AND delivered_at IS NULL AND delivery_failed_at IS NULL
  RETURNING true
$$;

ALTER FUNCTION public.outbox_release_claim_untried(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.outbox_release_claim_untried(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.outbox_release_claim_untried(uuid) TO moneyverse_app;

-- The operator console can finally distinguish "will retry" from "gave up".
-- Same signature and same columns as 039; only the derived status changes.
CREATE OR REPLACE FUNCTION public.admin_recent_discord_outbox_events(
  p_actor uuid,
  p_limit integer DEFAULT 30
)
RETURNS TABLE(
  event_id uuid,
  event_type text,
  created_at timestamptz,
  delivered_at timestamptz,
  delivery_attempts integer,
  delivery_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'limit must be between 1 and 100';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_roles AS role
    JOIN public.users AS user_row ON user_row.id = role.user_id
    WHERE role.user_id = p_actor
      AND role.role = 'approver'::public.admin_role
      AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'approver role required';
  END IF;

  RETURN QUERY
  SELECT event.id,
         event.type,
         event.created_at,
         event.delivered_at,
         event.delivery_attempts,
         CASE
           WHEN event.delivered_at IS NOT NULL THEN 'delivered'
           WHEN event.delivery_outcome IS NOT NULL THEN event.delivery_outcome
           WHEN event.delivery_locked_until IS NOT NULL
                AND event.delivery_locked_until >= clock_timestamp() THEN 'delivering'
           WHEN event.delivery_attempts > 0 THEN 'retry_pending'
           ELSE 'pending'
         END
  FROM public.outbox_events AS event
  ORDER BY event.created_at DESC
  LIMIT p_limit;
END;
$$;

ALTER FUNCTION public.admin_recent_discord_outbox_events(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_recent_discord_outbox_events(uuid, integer)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_recent_discord_outbox_events(uuid, integer) TO moneyverse_app;

-- ---------------------------------------------------------------------------
-- One audit row per slash command
-- ---------------------------------------------------------------------------

-- A second, narrower door onto the same hash chain.
--
-- `admin_record_audit_event` is the app-facing wrapper and it demands the
-- actor hold an administrator role, which is right for the console and wrong
-- here: the members running /daily and /send hold no role at all, so every
-- command would have failed with 42501 and gone unrecorded. This appends
-- through the same primitive, `admin_append_audit_event`, and replaces that
-- role gate with a shape gate -- a fixed command vocabulary, a fixed action
-- prefix, an active member, an exact guild snowflake -- so the widest row the
-- application role can write here is `discord.command.<one of four>` for
-- somebody who exists.
--
-- The idempotency key is the request id, not a metadata field: it is the
-- identity of the request, and a retried interaction derives the same key, so
-- the duplicate rows a Discord retry produces are recognisable as one request.
CREATE OR REPLACE FUNCTION public.discord_record_command_audit(
  p_actor uuid,
  p_command text,
  p_guild_id text,
  p_target uuid,
  p_idempotency_key uuid,
  p_outcome text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_audit_id uuid;
BEGIN
  IF p_actor IS NULL
    OR p_command IS NULL
    OR p_command !~ '^(balance|history|daily|send)$'
    OR p_guild_id IS NULL
    OR p_guild_id !~ '^[0-9]{16,22}$'
    OR p_outcome IS NULL
    OR p_outcome !~ '^(completed|rejected|failed)$' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid Discord command audit event';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    WHERE user_row.id = p_actor
      AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'active member required';
  END IF;

  v_audit_id := public.admin_append_audit_event(
    p_actor,
    'discord.command.' || p_command,
    p_target,
    p_idempotency_key,
    jsonb_build_object('surface', 'discord', 'guildId', p_guild_id, 'outcome', p_outcome)
  );

  RETURN v_audit_id;
END;
$$;

ALTER FUNCTION public.discord_record_command_audit(uuid, text, text, uuid, uuid, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.discord_record_command_audit(uuid, text, text, uuid, uuid, text)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.discord_record_command_audit(uuid, text, text, uuid, uuid, text)
  TO moneyverse_app;

COMMIT;
