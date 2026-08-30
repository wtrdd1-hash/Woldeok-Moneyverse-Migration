BEGIN;

INSERT INTO public.work_task_catalog(code,name,description,job_type,difficulty,base_reward,base_experience,minimum_duration_seconds,daily_limit)
VALUES
  ('logistics_sorting','물류 정리','순서형 작업을 완료합니다.','carrier',1,60,10,300,3),
  ('farm_care','농장 관리','재배와 수확 목표를 완료합니다.','farmer',2,80,14,600,2),
  ('mine_survey','광산 조사','지정 자원 목표를 완료합니다.','miner',3,100,18,900,2),
  ('delivery_run','배달 작업','시간과 순서를 충족해 배달합니다.','carrier',2,90,16,900,2),
  ('equipment_inspection','장비 점검','점검 작업을 완료합니다.','technician',2,90,16,900,2)
ON CONFLICT (code) DO NOTHING;

-- The legacy button has no assignment or completion evidence, so retaining
-- it would provide an unbounded bypass around the new reward policy.
CREATE OR REPLACE FUNCTION public.economy_claim_work(p_key uuid,p_actor uuid)
RETURNS TABLE(transaction_id uuid,amount bigint,replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  IF p_key IS NULL OR p_actor IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid work reward';
  END IF;
  RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='legacy work reward is retired';
END;
$$;
ALTER FUNCTION public.economy_claim_work(uuid,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_claim_work(uuid,uuid) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_claim_work(uuid,uuid) TO moneyverse_app;

COMMIT;
