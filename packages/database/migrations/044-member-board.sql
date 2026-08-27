BEGIN;
CREATE TABLE public.member_board_posts (
 id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(), author_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT, idempotency_key uuid NOT NULL UNIQUE,
 title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120 AND title !~ '[<>[:cntrl:]]'),
 body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000 AND body !~ '[<>[:cntrl:]]'),
 created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(), deleted_at timestamptz
);
CREATE INDEX member_board_posts_visible_idx ON public.member_board_posts(created_at DESC,id DESC) WHERE deleted_at IS NULL;
REVOKE ALL ON public.member_board_posts FROM PUBLIC,moneyverse_app;
CREATE OR REPLACE FUNCTION public.member_board_list(p_actor uuid,p_limit integer) RETURNS TABLE(post_id uuid,title text,body text,author_name text,created_at timestamptz,mine boolean) LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
BEGIN
 IF p_actor IS NULL OR p_limit NOT BETWEEN 1 AND 50 OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=p_actor AND status='active'::public.user_status) THEN RAISE EXCEPTION USING ERRCODE='28000'; END IF;
 RETURN QUERY SELECT p.id,p.title,p.body,coalesce((SELECT i.display_name FROM public.identities i WHERE i.user_id=p.author_user_id ORDER BY i.linked_at LIMIT 1),'사용자'),p.created_at,p.author_user_id=p_actor FROM public.member_board_posts p WHERE p.deleted_at IS NULL ORDER BY p.created_at DESC,p.id DESC LIMIT p_limit;
END; $$;
CREATE OR REPLACE FUNCTION public.member_board_create(p_actor uuid,p_title text,p_body text,p_key uuid) RETURNS TABLE(post_id uuid,title text,body text,author_name text,created_at timestamptz,mine boolean) LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$ DECLARE v_id uuid; v_author uuid; BEGIN
 IF p_actor IS NULL OR p_key IS NULL OR p_title IS NULL OR p_body IS NULL OR char_length(p_title) NOT BETWEEN 1 AND 120 OR char_length(p_body) NOT BETWEEN 1 AND 5000 OR p_title ~ '[<>[:cntrl:]]' OR p_body ~ '[<>[:cntrl:]]' OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=p_actor AND status='active'::public.user_status) THEN RAISE EXCEPTION USING ERRCODE='22023'; END IF;
 SELECT id,author_user_id INTO v_id,v_author FROM public.member_board_posts WHERE idempotency_key=p_key; IF FOUND THEN IF v_author<>p_actor THEN RAISE EXCEPTION USING ERRCODE='28000'; END IF; ELSE INSERT INTO public.member_board_posts(author_user_id,idempotency_key,title,body) VALUES(p_actor,p_key,p_title,p_body) RETURNING id INTO v_id; END IF;
 RETURN QUERY SELECT p.id,p.title,p.body,coalesce((SELECT i.display_name FROM public.identities i WHERE i.user_id=p.author_user_id ORDER BY i.linked_at LIMIT 1),'사용자'),p.created_at,true FROM public.member_board_posts p WHERE p.id=v_id;
END; $$;
CREATE OR REPLACE FUNCTION public.member_board_delete(p_actor uuid,p_post uuid,p_key uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$ BEGIN
 IF p_actor IS NULL OR p_post IS NULL OR p_key IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023'; END IF; UPDATE public.member_board_posts SET deleted_at=pg_catalog.clock_timestamp() WHERE id=p_post AND author_user_id=p_actor AND deleted_at IS NULL; RETURN FOUND; END; $$;
ALTER FUNCTION public.member_board_list(uuid,integer) OWNER TO moneyverse_migrator; ALTER FUNCTION public.member_board_create(uuid,text,text,uuid) OWNER TO moneyverse_migrator; ALTER FUNCTION public.member_board_delete(uuid,uuid,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.member_board_list(uuid,integer),public.member_board_create(uuid,text,text,uuid),public.member_board_delete(uuid,uuid,uuid) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.member_board_list(uuid,integer),public.member_board_create(uuid,text,text,uuid),public.member_board_delete(uuid,uuid,uuid) TO moneyverse_app;
COMMIT;
