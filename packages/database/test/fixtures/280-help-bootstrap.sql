-- ISOLATED EPHEMERAL DB ONLY. Never run against production-linked 5433.
CREATE ROLE moneyverse_app NOLOGIN;
CREATE TABLE public.users(id uuid PRIMARY KEY);
INSERT INTO public.users(id) VALUES
 ('00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000002');
CREATE TYPE public.admin_role AS ENUM ('operator','approver','server_operator');
CREATE TABLE public.user_roles(user_id uuid NOT NULL REFERENCES public.users(id), role public.admin_role NOT NULL, PRIMARY KEY(user_id,role));
INSERT INTO public.user_roles(user_id,role) VALUES
 ('00000000-0000-0000-0000-000000000001','operator'),
 ('00000000-0000-0000-0000-000000000001','approver'),
 ('00000000-0000-0000-0000-000000000002','approver');
CREATE TABLE public.auth_sessions(id uuid PRIMARY KEY,user_id uuid NOT NULL REFERENCES public.users(id),is_open boolean NOT NULL);
INSERT INTO public.auth_sessions(id,user_id,is_open) VALUES
 ('00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001',true),
 ('00000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000002',true);
CREATE FUNCTION public.admin_session_touch(p_session uuid,p_actor uuid)
RETURNS TABLE(state text,expires_at timestamptz,idle_expires_at timestamptz)
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
 SELECT CASE WHEN EXISTS(SELECT 1 FROM public.auth_sessions WHERE id=p_session AND user_id=p_actor AND is_open) THEN 'open' ELSE 'none' END,
        clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 hour'
$$;
REVOKE ALL ON FUNCTION public.admin_session_touch(uuid,uuid) FROM PUBLIC;
