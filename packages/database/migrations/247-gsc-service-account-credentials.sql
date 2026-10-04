-- 247-gsc-service-account-credentials.sql
--
-- Persists the Google Search Console service-account credential encrypted by
-- the application. The table itself is not readable by moneyverse_app; the
-- runtime receives only the sealed value through a narrow SECURITY DEFINER
-- function and decrypts it with the deployment-owned encryption key.

CREATE TABLE IF NOT EXISTS public.seo_gsc_credentials (
  id smallint PRIMARY KEY CHECK (id = 1),
  client_email text NOT NULL
    CHECK (
      pg_catalog.char_length(client_email) BETWEEN 6 AND 320
      AND client_email LIKE '%@%.gserviceaccount.com'
    ),
  key_json_sealed text NOT NULL
    CHECK (key_json_sealed LIKE 'enc:v1:rnd:%'),
  property_url text
    CHECK (property_url IS NULL OR pg_catalog.char_length(property_url) BETWEEN 1 AND 500),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

ALTER TABLE public.seo_gsc_credentials OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON TABLE public.seo_gsc_credentials FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.seo_gsc_credential_runtime()
RETURNS TABLE(
  client_email text,
  key_json_sealed text,
  property_url text,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT credential.client_email,
         credential.key_json_sealed,
         credential.property_url,
         credential.updated_at
  FROM public.seo_gsc_credentials AS credential
  WHERE credential.id = 1
$$;

CREATE OR REPLACE FUNCTION public.seo_gsc_credential_set(
  p_client_email text,
  p_key_json_sealed text,
  p_property_url text
)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_updated_at timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF coalesce(pg_catalog.char_length(pg_catalog.btrim(p_client_email)), 0) < 6
     OR p_client_email NOT LIKE '%@%.gserviceaccount.com'
     OR p_key_json_sealed NOT LIKE 'enc:v1:rnd:%'
     OR (p_property_url IS NOT NULL
         AND pg_catalog.char_length(pg_catalog.btrim(p_property_url)) NOT BETWEEN 1 AND 500) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid Search Console credential';
  END IF;

  INSERT INTO public.seo_gsc_credentials (
    id, client_email, key_json_sealed, property_url, updated_at
  )
  VALUES (
    1,
    pg_catalog.btrim(p_client_email),
    p_key_json_sealed,
    NULLIF(pg_catalog.btrim(p_property_url), ''),
    v_updated_at
  )
  ON CONFLICT (id) DO UPDATE
  SET client_email = EXCLUDED.client_email,
      key_json_sealed = EXCLUDED.key_json_sealed,
      property_url = EXCLUDED.property_url,
      updated_at = EXCLUDED.updated_at;

  RETURN v_updated_at;
END;
$$;

CREATE OR REPLACE FUNCTION public.seo_gsc_credential_delete()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  DELETE FROM public.seo_gsc_credentials WHERE id = 1;
  RETURN FOUND;
END;
$$;

ALTER FUNCTION public.seo_gsc_credential_runtime() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.seo_gsc_credential_set(text, text, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.seo_gsc_credential_delete() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.seo_gsc_credential_runtime()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.seo_gsc_credential_set(text, text, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.seo_gsc_credential_delete()
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.seo_gsc_credential_runtime() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.seo_gsc_credential_set(text, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.seo_gsc_credential_delete() TO moneyverse_app;

COMMENT ON TABLE public.seo_gsc_credentials IS
  'Singleton encrypted Google Search Console service-account credential; plaintext is never stored in PostgreSQL.';
