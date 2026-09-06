BEGIN;

CREATE OR REPLACE FUNCTION public.admin_list_all_photos(
  p_actor uuid,
  p_limit integer DEFAULT 100
)
RETURNS TABLE(
  photo_id uuid,
  storage_key text,
  image_url text,
  alt_text text,
  uploaded_by uuid,
  uploader_display_name text,
  content_state text,
  submitted_at timestamptz,
  published_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'operator or superadmin role required';
  END IF;

  RETURN QUERY
  SELECT p.id, p.storage_key, p.image_url, p.alt_text, p.uploaded_by,
         COALESCE(i.display_name, '운영자'), p.content_state,
         p.created_at, p.published_at
  FROM public.photos p
  LEFT JOIN LATERAL (
    SELECT identity_row.display_name
    FROM public.identities identity_row
    WHERE identity_row.user_id = p.uploaded_by
    ORDER BY identity_row.linked_at DESC
    LIMIT 1
  ) i ON true
  ORDER BY p.created_at DESC, p.id DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 100), 1), 100);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_photo(p_actor uuid, p_photo_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_storage_key text;
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role)
    OR public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'operator or superadmin role required';
  END IF;

  DELETE FROM public.photos
  WHERE id = p_photo_id
  RETURNING storage_key INTO v_storage_key;

  IF v_storage_key IS NOT NULL THEN
    PERFORM public.admin_append_audit_event(
      p_actor, 'admin.photo.deleted', p_actor, p_photo_id,
      pg_catalog.jsonb_build_object('photoId', p_photo_id::text, 'storageKey', v_storage_key)
    );
  END IF;
  RETURN v_storage_key;
END;
$$;

ALTER FUNCTION public.admin_list_all_photos(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_delete_photo(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.admin_list_all_photos(uuid, integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL ON FUNCTION public.admin_delete_photo(uuid, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_list_all_photos(uuid, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_delete_photo(uuid, uuid) TO moneyverse_app;

COMMIT;
