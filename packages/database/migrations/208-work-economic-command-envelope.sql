-- 208-work-economic-command-envelope.sql
-- Update version: v2026.09.19.264
-- P0 ECON-233-02: adopt the common immutable economic command envelope for work rewards.
-- Forward-only: preserve the latest authoritative work policy implementation as a private delegate.

BEGIN;

ALTER FUNCTION public.work_verify_and_reward(uuid, uuid, uuid)
  RENAME TO work_verify_and_reward_policy_delegate;

REVOKE ALL PRIVILEGES ON FUNCTION public.work_verify_and_reward_policy_delegate(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
ALTER FUNCTION public.work_verify_and_reward_policy_delegate(uuid, uuid, uuid)
  OWNER TO moneyverse_migrator;

CREATE FUNCTION public.work_verify_and_reward(
  p_key uuid,
  p_actor uuid,
  p_assignment uuid
)
RETURNS TABLE(
  assignment_id uuid,
  reward_amount bigint,
  experience_amount bigint,
  transaction_id uuid,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_command uuid;
  v_command_replayed boolean;
  v_command_tx uuid;
  v_command_result jsonb;
  v_hash bytea;
  v_assignment uuid;
  v_reward bigint;
  v_experience bigint;
  v_transaction uuid;
  v_policy_replayed boolean;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_assignment IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid work verification';
  END IF;

  v_hash := pg_catalog.digest(
    pg_catalog.convert_to(p_assignment::text, 'UTF8'),
    'sha256'
  );

  SELECT c.command_id, c.replayed, c.ledger_transaction_id, c.result_snapshot
    INTO v_command, v_command_replayed, v_command_tx, v_command_result
  FROM public.economic_command_claim(
    p_actor,
    'work.reward',
    p_assignment::text,
    p_key,
    v_hash,
    NULL
  ) AS c;

  IF v_command_replayed THEN
    assignment_id := (v_command_result ->> 'assignmentId')::uuid;
    reward_amount := (v_command_result ->> 'rewardAmount')::bigint;
    experience_amount := (v_command_result ->> 'experienceAmount')::bigint;
    transaction_id := v_command_tx;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT r.assignment_id, r.reward_amount, r.experience_amount,
         r.transaction_id, r.replayed
    INTO v_assignment, v_reward, v_experience, v_transaction, v_policy_replayed
  FROM public.work_verify_and_reward_policy_delegate(p_key, p_actor, p_assignment) AS r;

  IF v_assignment IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'work reward policy returned no result';
  END IF;

  v_command_result := pg_catalog.jsonb_build_object(
    'assignmentId', v_assignment,
    'rewardAmount', v_reward,
    'experienceAmount', v_experience
  );
  PERFORM public.economic_command_complete(v_command, v_transaction, v_command_result);

  assignment_id := v_assignment;
  reward_amount := v_reward;
  experience_amount := v_experience;
  transaction_id := v_transaction;
  replayed := v_policy_replayed;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.work_verify_and_reward(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_verify_and_reward(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_verify_and_reward(uuid, uuid, uuid)
  TO moneyverse_app;

COMMIT;
