BEGIN;

-- The platform no longer imposes a reachable daily casino ceiling. Per-play
-- bounds and wallet balance still apply; members may opt into their own daily
-- stake/loss limits below. The two distinct sentinels preserve the historical
-- policy constraint while remaining far beyond the total WLD supply.
UPDATE public.casino_policy
SET daily_stake_limit = 9000000000000000000,
    daily_loss_limit = 8999999999999999999,
    updated_at = pg_catalog.clock_timestamp()
WHERE singleton;

-- Zero means "not limited", consistently with the public form. Older rows
-- containing zero previously blocked every play, so enforcement must test a
-- positive opt-in limit only.
CREATE OR REPLACE FUNCTION public.casino_enforce_self_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_bet_limit bigint;
  v_loss_limit bigint;
  v_locked timestamptz;
  v_staked bigint;
  v_lost bigint;
BEGIN
  SELECT limit_row.daily_bet_limit, limit_row.daily_loss_limit, limit_row.locked_until
  INTO v_bet_limit, v_loss_limit, v_locked
  FROM public.casino_self_limits AS limit_row
  WHERE limit_row.user_id = NEW.user_id;

  IF NOT FOUND THEN RETURN NEW; END IF;

  IF v_locked IS NOT NULL AND v_locked > pg_catalog.clock_timestamp() THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'you have locked yourself out of the casino';
  END IF;

  SELECT usage.staked, usage.lost INTO v_staked, v_lost
  FROM public.casino_daily_usage(NEW.user_id, NEW.play_date) AS usage;

  IF v_bet_limit > 0 AND v_staked + NEW.stake_amount > v_bet_limit THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'your own daily stake limit is reached';
  END IF;

  IF v_loss_limit > 0 AND v_lost + greatest(-NEW.net_amount, 0) > v_loss_limit THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'your own daily loss limit is reached';
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.casino_enforce_self_limit() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_enforce_self_limit() FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.member_casino_self_limit(p_actor uuid)
RETURNS TABLE(daily_bet_limit bigint, daily_loss_limit bigint, locked_until timestamptz)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  RETURN QUERY
  SELECT coalesce(limit_row.daily_bet_limit, 0),
         coalesce(limit_row.daily_loss_limit, 0),
         limit_row.locked_until
  FROM (SELECT p_actor AS user_id) AS actor
  LEFT JOIN public.casino_self_limits AS limit_row ON limit_row.user_id = actor.user_id;
END;
$$;

ALTER FUNCTION public.member_casino_self_limit(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_casino_self_limit(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.member_casino_self_limit(uuid) TO moneyverse_app;

COMMIT;
