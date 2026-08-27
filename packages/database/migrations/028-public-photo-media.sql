CREATE OR REPLACE FUNCTION public.content_is_public_storage_key(p_storage_key text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog,pg_temp AS $$
  SELECT EXISTS (SELECT 1 FROM public.photos WHERE storage_key=p_storage_key AND content_state='published' AND visibility='public' AND published_at<=clock_timestamp())
$$;
GRANT EXECUTE ON FUNCTION public.content_is_public_storage_key(text) TO moneyverse_app;
