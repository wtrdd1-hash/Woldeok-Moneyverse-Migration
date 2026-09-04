BEGIN;

-- 1. Allow operators and superadmins to view draft photo bytes for review
CREATE OR REPLACE FUNCTION public.content_storage_key_visible(p_viewer uuid, p_storage_key text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.photos AS photo_row
    WHERE photo_row.storage_key = p_storage_key
      AND (
        (photo_row.content_state = 'published'
          AND photo_row.visibility = 'public'
          AND photo_row.published_at <= pg_catalog.clock_timestamp())
        OR (p_viewer IS NOT NULL AND (
          photo_row.uploaded_by = p_viewer
          OR public.admin_role_holder(p_viewer, 'operator'::public.admin_role)
          OR public.admin_role_holder(p_viewer, 'superadmin'::public.admin_role)
        ))
      )
  );
$$;

ALTER FUNCTION public.content_storage_key_visible(uuid, text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.content_storage_key_visible(uuid, text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.content_storage_key_visible(uuid, text) TO moneyverse_app;

-- 2. Function to list draft photos awaiting operator review
CREATE OR REPLACE FUNCTION public.admin_list_pending_photos(
  p_actor uuid,
  p_limit integer DEFAULT 50
)
RETURNS TABLE(
  photo_id uuid,
  storage_key text,
  image_url text,
  alt_text text,
  uploaded_by uuid,
  uploader_display_name text,
  submitted_at timestamptz
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
  SELECT
    p.id AS photo_id,
    p.storage_key,
    COALESCE(p.image_url, '/media/' || p.storage_key) AS image_url,
    p.alt_text,
    p.uploaded_by,
    COALESCE(i.display_name, '회원') AS uploader_display_name,
    p.created_at AS submitted_at
  FROM public.photos p
  LEFT JOIN (
    SELECT DISTINCT ON (user_id) user_id, display_name
    FROM public.identities
    ORDER BY user_id, linked_at DESC
  ) i ON i.user_id = p.uploaded_by
  WHERE p.content_state = 'draft'
  ORDER BY p.created_at DESC
  LIMIT LEAST(GREATEST(coalesce(p_limit, 50), 1), 100);
END;
$$;

ALTER FUNCTION public.admin_list_pending_photos(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_list_pending_photos(uuid, integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_list_pending_photos(uuid, integer) TO moneyverse_app;

-- 3. Function to reject (delete draft) a photo
CREATE OR REPLACE FUNCTION public.admin_reject_photo(
  p_actor uuid,
  p_photo_id uuid,
  p_reason text DEFAULT 'operator rejected'
)
RETURNS boolean
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
  WHERE id = p_photo_id AND content_state = 'draft'
  RETURNING storage_key INTO v_storage_key;

  IF FOUND THEN
    PERFORM public.admin_append_audit_event(
      p_actor,
      'admin.photo.rejected',
      p_actor,
      p_photo_id,
      pg_catalog.jsonb_build_object(
        'photoId', p_photo_id::text,
        'storageKey', v_storage_key,
        'reason', coalesce(p_reason, 'operator rejected')
      )
    );
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

ALTER FUNCTION public.admin_reject_photo(uuid, uuid, text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_reject_photo(uuid, uuid, text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_reject_photo(uuid, uuid, text) TO moneyverse_app;

COMMIT;
