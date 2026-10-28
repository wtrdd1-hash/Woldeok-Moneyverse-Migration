-- v290: administrator-only article status and revision, with audit.
-- No automatic expiration is implemented.
BEGIN;
CREATE FUNCTION public.blog_admin_moderate(
 p_actor uuid,p_slug text,p_action text,p_reason text,
 p_title text DEFAULT NULL,p_excerpt text DEFAULT NULL,p_content text DEFAULT NULL
) RETURNS TABLE(publication_receipt uuid,result_status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE v_rec public.blog_verified_articles%ROWTYPE;
BEGIN
 IF p_actor IS NULL OR NOT EXISTS (SELECT 1 FROM public.admin_current_roles(p_actor)) THEN
   RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='administrator required';
 END IF;
 IF length(trim(coalesce(p_reason,''))) < 3 OR length(p_reason)>2000
 OR p_action NOT IN ('WITHDRAW','DELETE','REVISE') THEN
   RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='invalid moderation request';
 END IF;
 SELECT * INTO v_rec FROM public.blog_verified_articles WHERE slug=p_slug FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION USING ERRCODE='P0002',MESSAGE='article not found'; END IF;
 IF p_action='REVISE' THEN
  IF v_rec.status<>'PUBLISHED'
   OR length(coalesce(p_title,'')) NOT BETWEEN 25 AND 180
   OR length(coalesce(p_excerpt,'')) NOT BETWEEN 65 AND 500
   OR length(coalesce(p_content,'')) NOT BETWEEN 1400 AND 18000 THEN
   RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='invalid revision';
  END IF;
  UPDATE public.blog_verified_articles
    SET title=p_title, excerpt=p_excerpt, content=p_content,
        content_digest=encode(sha256(convert_to(p_title||E'\n'||p_excerpt||E'\n'||p_content,'UTF8')),'hex'),
        ad_curated=false, updated_at=now() WHERE slug=p_slug;
 ELSIF v_rec.status<>'DELETED' THEN
  UPDATE public.blog_verified_articles SET
    status=CASE WHEN p_action='DELETE' THEN 'DELETED' ELSE 'WITHDRAWN' END,
    updated_at=now() WHERE slug=p_slug;
 END IF;
 INSERT INTO public.blog_verified_audit(period_key,actor,action,reason)
 VALUES(v_rec.period_key,p_actor::text,p_action,p_reason);
 RETURN QUERY SELECT v_rec.receipt,(SELECT status FROM public.blog_verified_articles WHERE slug=p_slug);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.blog_admin_moderate(uuid,text,text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.blog_admin_moderate(uuid,text,text,text,text,text,text) TO moneyverse_app;
COMMIT;
