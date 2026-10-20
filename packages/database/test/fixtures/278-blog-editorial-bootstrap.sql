CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE public.admin_role AS ENUM ('operator','superadmin','approver');
CREATE ROLE moneyverse_app NOLOGIN;
CREATE TABLE public.users(id uuid PRIMARY KEY DEFAULT gen_random_uuid());
CREATE TABLE public.user_roles(user_id uuid NOT NULL REFERENCES public.users(id), role public.admin_role NOT NULL, PRIMARY KEY(user_id,role));
CREATE OR REPLACE FUNCTION public.game_catalog_operator(p_actor uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp
AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=p_actor AND role='operator'::public.admin_role)
 THEN RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='operator role required'; END IF;
END $$;
