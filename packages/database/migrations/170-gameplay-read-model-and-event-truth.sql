BEGIN;

-- A casino history is not "whatever casino rows happen to appear inside the
-- wallet's latest ten transactions". Give the member a bounded, actor-scoped
-- read model over the two private play tables instead. The tables remain
-- unreadable to moneyverse_app; this SECURITY DEFINER function is the only
-- application path and it can return rows for the caller only.
CREATE INDEX IF NOT EXISTS virtual_casino_coin_plays_user_created_idx
  ON public.virtual_casino_coin_plays (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS virtual_casino_dice_plays_user_created_idx
  ON public.virtual_casino_dice_plays (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.member_casino_history(
  p_actor uuid,
  p_limit integer DEFAULT 20
)
RETURNS TABLE(
  play_id uuid,
  game text,
  choice text,
  outcome text,
  stake_amount bigint,
  net_amount bigint,
  transaction_id uuid,
  played_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.users AS user_row
    WHERE user_row.id = p_actor
      AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'casino history limit must be between 1 and 100';
  END IF;

  RETURN QUERY
  SELECT history.play_id,
         history.game,
         history.choice,
         history.outcome,
         history.stake_amount,
         history.net_amount,
         history.transaction_id,
         history.played_at
  FROM (
    SELECT coin.id AS play_id,
           'coin'::text AS game,
           coin.choice,
           coin.outcome,
           coin.stake_amount,
           coin.net_amount,
           coin.transaction_id,
           coin.created_at AS played_at
    FROM public.virtual_casino_coin_plays AS coin
    WHERE coin.user_id = p_actor

    UNION ALL

    SELECT dice.id AS play_id,
           dice.game,
           dice.choice,
           dice.outcome::text AS outcome,
           dice.stake_amount,
           dice.net_amount,
           dice.transaction_id,
           dice.created_at AS played_at
    FROM public.virtual_casino_dice_plays AS dice
    WHERE dice.user_id = p_actor
  ) AS history
  ORDER BY history.played_at DESC, history.play_id DESC
  LIMIT p_limit;
END;
$$;

ALTER FUNCTION public.member_casino_history(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_casino_history(uuid, integer)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_casino_history(uuid, integer) TO moneyverse_app;

-- These three catalogue rows still advertised follow-up mechanics that no
-- schema/function implements. The actual rewards on the rows (EXP, WLD and
-- items) stay unchanged; only the misleading "coming later" promise is
-- removed. Guard the exact old text so a future deliberate replacement is not
-- silently erased by replaying this migration on a fresh environment.
UPDATE public.early_event_catalog
SET pending_effect = NULL
WHERE (code = 'tool_breakdown' AND pending_effect = '도구 내구도')
   OR (code = 'rainy_day' AND pending_effect = '배달 보상 상승과 농업 작업 교체')
   OR (code = 'lucky_box' AND pending_effect = '장식과 재료');

COMMIT;
