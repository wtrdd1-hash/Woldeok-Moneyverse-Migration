-- v289: atomic, idempotent verified publication and immutable receipt.
BEGIN;
CREATE FUNCTION public.blog_publish_verified(
 p_period text,p_slug text,p_country text,p_locale text,p_topic text,
 p_title text,p_excerpt text,p_content text,p_source_url text,
 p_source_digest text,p_content_digest text,p_evidence jsonb
) RETURNS TABLE(publication_receipt uuid, inserted boolean, result_status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
DECLARE v_receipt uuid; v_digest text; v_status text;
BEGIN
 IF p_evidence IS NULL OR p_evidence->>'quality'<>'PASS'
   OR p_period !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}T(0[02468]|1[02468]|2[02]):00\+09:00$'
   OR p_slug !~ '^20[0-9]{2}-[0-9]{2}-[0-9]{2}-[a-z0-9-]{4,100}$' THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='invalid or unverified article';
 END IF;
 INSERT INTO public.blog_verified_articles(period_key,slug,country,locale,topic,title,excerpt,
  content,primary_source_url,source_digest,content_digest,evidence)
 VALUES(p_period,p_slug,p_country,p_locale,p_topic,p_title,p_excerpt,p_content,
  p_source_url,p_source_digest,p_content_digest,p_evidence)
 ON CONFLICT (period_key) DO NOTHING RETURNING receipt INTO v_receipt;
 IF v_receipt IS NOT NULL THEN
  INSERT INTO public.blog_verified_audit(period_key,actor,action,reason)
  VALUES(p_period,'verified_scheduler','PUBLISH','automatically verified primary source');
  RETURN QUERY SELECT v_receipt,true,'PUBLISHED'::text;
  RETURN;
 END IF;
 SELECT a.receipt,a.content_digest,a.status INTO v_receipt,v_digest,v_status
 FROM public.blog_verified_articles a WHERE a.period_key=p_period;
 IF v_receipt IS NULL OR v_digest IS DISTINCT FROM p_content_digest THEN
  RAISE EXCEPTION USING ERRCODE='23505',MESSAGE='conflicting publication slot';
 END IF;
 RETURN QUERY SELECT v_receipt,false,v_status;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.blog_publish_verified(text,text,text,text,text,text,text,text,text,text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.blog_publish_verified(text,text,text,text,text,text,text,text,text,text,text,jsonb) TO moneyverse_app;
COMMIT;
