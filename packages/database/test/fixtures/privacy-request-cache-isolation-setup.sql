-- Run only against a disposable database whose name starts with mv_a_privacy_.
DO $$
BEGIN
  IF current_database() NOT LIKE 'mv_a_privacy_%' THEN
    RAISE EXCEPTION 'refusing non-isolated privacy fixture';
  END IF;
END $$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE ROLE moneyverse_migrator NOLOGIN;
CREATE ROLE moneyverse_app NOLOGIN;
CREATE TYPE public.user_status AS ENUM ('active', 'deleted');
CREATE TABLE public.users (id uuid PRIMARY KEY, status public.user_status NOT NULL);
GRANT SELECT, UPDATE ON public.users TO moneyverse_migrator;
GRANT USAGE ON SCHEMA public TO moneyverse_app, moneyverse_migrator;
CREATE FUNCTION public.admin_append_audit_event(uuid,text,uuid,uuid,jsonb)
RETURNS void LANGUAGE sql AS $$ SELECT NULL::void $$;
INSERT INTO public.users(id,status) VALUES
 ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','active'),
 ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb','active');
