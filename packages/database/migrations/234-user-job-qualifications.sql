-- 234-user-job-qualifications.sql
-- Professional Career Qualifications & Mastery Certification System (JOBS_PROFESSION_MASTERY_SPEC §6, §7)

CREATE TABLE IF NOT EXISTS public.user_job_qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_type public.work_job_type NOT NULL,
  qualification_code text NOT NULL,
  title text NOT NULL,
  tier text NOT NULL,
  fee_wld bigint NOT NULL,
  acquired_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT ux_user_job_qualification UNIQUE (user_id, job_type, qualification_code)
);

CREATE INDEX IF NOT EXISTS idx_user_job_qualifications_user_job
  ON public.user_job_qualifications(user_id, job_type);

CREATE INDEX IF NOT EXISTS idx_user_job_qualifications_user
  ON public.user_job_qualifications(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_job_qualifications TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.job_certify_qualification(
  p_actor uuid,
  p_job_type text,
  p_code text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_type public.work_job_type;
  v_min_level int;
  v_fee_wld bigint;
  v_title text;
  v_tier text;
  v_user_level int;
  v_user_balance bigint;
  v_existing uuid;
  v_vault_balance text;
  v_new_qual record;
BEGIN
  -- Validate job_type enum
  BEGIN
    v_job_type := p_job_type::public.work_job_type;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION '유효하지 않은 직업군입니다: %', p_job_type;
  END;

  -- Match specification (JOBS_PROFESSION_MASTERY_SPEC §7)
  IF p_code = 'UNIFORM_STYLING' THEN
    v_min_level := 1;
    v_fee_wld := 500;
    v_title := '공식 유니폼 커스텀 스타일링 자격';
    v_tier := 'APPRENTICE';
  ELSIF p_code = 'BASIC_LICENSE' THEN
    v_min_level := 3;
    v_fee_wld := 750;
    v_title := '공인 기본 직업 면허';
    v_tier := 'JOURNEYMAN';
  ELSIF p_code = 'BADGE_ENGRAVING' THEN
    v_min_level := 5;
    v_fee_wld := 1500;
    v_title := '숙련 직업배지 각인 권한';
    v_tier := 'JOURNEYMAN';
  ELSIF p_code = 'SPECIALIST_CERTIFICATE' THEN
    v_min_level := 10;
    v_fee_wld := 5000;
    v_title := '전문가 공인 자격증서';
    v_tier := 'PROFESSIONAL';
  ELSIF p_code = 'MASTER_PORTFOLIO' THEN
    v_min_level := 25;
    v_fee_wld := 25000;
    v_title := '마스터 명예 포트폴리오 심사';
    v_tier := 'SPECIALIST';
  ELSE
    RAISE EXCEPTION '유효하지 않은 자격시험 코드입니다: %', p_code;
  END IF;

  -- 1. Check user level
  SELECT COALESCE(level, 1) INTO v_user_level
  FROM public.user_job_progress
  WHERE user_id = p_actor AND job_type = v_job_type;

  IF v_user_level IS NULL THEN
    v_user_level := 1;
  END IF;

  IF v_user_level < v_min_level THEN
    RAISE EXCEPTION '[%] 응시 요건이 부족합니다. (현재 Lv.% / 요구 Lv.%)', v_title, v_user_level, v_min_level;
  END IF;

  -- 2. Check already acquired
  SELECT id INTO v_existing
  FROM public.user_job_qualifications
  WHERE user_id = p_actor AND job_type = v_job_type AND qualification_code = p_code;

  IF v_existing IS NOT NULL THEN
    RAISE EXCEPTION '이미 취득한 자격증입니다: %', v_title;
  END IF;

  -- 3. Check user balance and deduct
  SELECT balance INTO v_user_balance
  FROM public.users
  WHERE id = p_actor
  FOR UPDATE;

  IF v_user_balance < v_fee_wld THEN
    RAISE EXCEPTION 'WLD 잔액이 부족합니다. (보유: % WLD / 수수료: % WLD)', v_user_balance, v_fee_wld;
  END IF;

  UPDATE public.users
  SET balance = balance - v_fee_wld
  WHERE id = p_actor;

  -- 4. Treasury Deposit & Ledger Hard Sink
  UPDATE public.system_treasury_vaults
  SET balance_wld = (balance_wld::bigint + v_fee_wld)::text, updated_at = clock_timestamp()
  WHERE code = 'VAULT_MAIN'
  RETURNING balance_wld INTO v_vault_balance;

  INSERT INTO public.system_treasury_ledger (
    tx_type, vault_name, amount_wld, balance_after, reason, actor_id, actor_name
  ) VALUES (
    'ABSORPTION_SINK', 'VAULT_MAIN', v_fee_wld::text, v_vault_balance,
    '직업 자격심사 응시료 국고 귀속 (' || v_title || ' - ' || p_job_type || ')',
    p_actor, 'WORK_QUALIFICATION_SINK'
  );

  -- 5. Record Qualification
  INSERT INTO public.user_job_qualifications (
    user_id, job_type, qualification_code, title, tier, fee_wld
  ) VALUES (
    p_actor, v_job_type, p_code, v_title, v_tier, v_fee_wld
  ) RETURNING id, job_type::text, qualification_code, title, tier, fee_wld::text, acquired_at
  INTO v_new_qual;

  RETURN jsonb_build_object(
    'id', v_new_qual.id::text,
    'job_type', v_new_qual.job_type,
    'qualification_code', v_new_qual.qualification_code,
    'title', v_new_qual.title,
    'tier', v_new_qual.tier,
    'fee_wld', v_new_qual.fee_wld,
    'acquired_at', v_new_qual.acquired_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.job_certify_qualification(uuid, text, text) TO moneyverse_app;
