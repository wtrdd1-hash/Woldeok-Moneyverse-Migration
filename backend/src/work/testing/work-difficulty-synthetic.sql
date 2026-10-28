-- Isolated PostgreSQL fixture ONLY. Never apply to any existing/dev/Test/Production database.
CREATE ROLE moneyverse_app LOGIN;
CREATE TABLE public.work_task_catalog (
  owner_id uuid NOT NULL, task_id uuid PRIMARY KEY, code text NOT NULL,
  name text NOT NULL, description text NOT NULL, job_type text NOT NULL,
  difficulty smallint NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  base_reward bigint NOT NULL, base_experience bigint NOT NULL,
  minimum_duration_seconds integer NOT NULL, daily_limit integer NOT NULL,
  taken_today integer NOT NULL, reward_preview bigint NOT NULL,
  recommended boolean NOT NULL
);
REVOKE ALL ON TABLE public.work_task_catalog FROM PUBLIC, moneyverse_app;
CREATE FUNCTION public.work_task_board(p_actor uuid)
RETURNS TABLE(task_id uuid, code text, name text, description text,
  job_type text, difficulty smallint, base_reward bigint, base_experience bigint,
  minimum_duration_seconds integer, daily_limit integer, taken_today integer,
  reward_preview bigint, recommended boolean)
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT task_id, code, name, description, job_type, difficulty, base_reward,
         base_experience, minimum_duration_seconds, daily_limit, taken_today,
         reward_preview, recommended
  FROM public.work_task_catalog WHERE owner_id = p_actor
$$;
CREATE FUNCTION public.work_experience_preview(p_actor uuid, p_task uuid)
RETURNS bigint LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
  SELECT 14::bigint
$$;
REVOKE ALL ON FUNCTION public.work_task_board(uuid), public.work_experience_preview(uuid,uuid) FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_task_board(uuid), public.work_experience_preview(uuid,uuid) TO moneyverse_app;
INSERT INTO public.work_task_catalog VALUES
('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000011','farmer_easy','Easy farm','Farm task','farmer',2,100,14,60,3,0,100,true),
('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000012','farmer_hard','Hard farm','Farm task','farmer',4,9007199254740993,14,120,3,0,9007199254740993,false),
('00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000013','other_hard','Other member','Private task','farmer',4,200,14,120,3,0,200,false);
