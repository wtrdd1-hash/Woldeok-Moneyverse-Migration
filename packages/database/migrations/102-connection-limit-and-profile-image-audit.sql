BEGIN;

-- Two halves of 17.9 that were written down and never applied.
--
-- The first is a ceiling on how many connections the application may hold.
-- 095's API now bounds its own pool at ten, but a bound the application keeps
-- for itself is a promise, not a control: a second copy started by hand, a
-- container that fails to stop during a roll, or a `psql` opened as the app
-- role all sit outside it. The cluster allows a hundred and five other roles
-- draw on the same budget, so the reconciler and the nightly backup are what
-- get locked out when the application takes more than its share.
--
-- Thirty is three times the pool. It leaves room for the moment of overlap in
-- a roll and for somebody connecting to look at something, and it is still far
-- enough below a hundred that no other role can be starved by this one.
ALTER ROLE moneyverse_app CONNECTION LIMIT 30;

-- The second is the audit trail. 094 gave a member a picture they upload and
-- serve on their own terms, and recorded nothing when one was set or taken
-- down -- so a picture that has to be removed after a report leaves no trace of
-- who put it there or when, which is the one question that gets asked
-- afterwards. 14.9 lists profile changes among the events the trail carries.
--
-- The actor is the member, not an administrator. That is not new: 015 already
-- writes `privacy.request.created` with the requesting member as actor, for
-- the same reason -- the chain is the product's record of consequential acts,
-- and whose act it was is part of the record rather than a filter on it.
--
-- The storage key is in the metadata and the free-text nothing is. A key is a
-- server-generated uuid that names a file; it is what makes the row useful
-- when the file is the thing being asked about. `audit_first_sensitive_key`
-- refuses a payload holding a credential, and refusing here would roll back
-- the profile change with it -- 058 lost every administrator's second factor
-- to exactly that -- so `storageKey` is deliberately outside its pattern.

CREATE OR REPLACE FUNCTION public.member_set_profile_image(p_actor uuid, p_key text)
RETURNS TABLE(image_path text, replaced_key text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_path text := public.member_profile_image_path(p_key);
  v_previous text;
  v_replaced text;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;
  IF v_path IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid image storage key';
  END IF;

  SELECT profile_row.image_url INTO v_previous
  FROM public.member_profiles AS profile_row
  WHERE profile_row.user_id = p_actor
  FOR UPDATE;

  INSERT INTO public.member_profiles (user_id, image_url)
  VALUES (p_actor, v_path)
  ON CONFLICT (user_id) DO UPDATE
  SET image_url = excluded.image_url, updated_at = pg_catalog.clock_timestamp();

  -- Only an upload is worth deleting. An address the member typed points at
  -- somebody else's server and is not ours to remove.
  v_replaced := CASE
    WHEN v_previous LIKE '/media/profile/%' THEN substr(v_previous, 16)
  END;

  -- A local variable rather than the OUT parameters, which are still unset
  -- here and would record NULL for the key this row exists to name.
  PERFORM public.admin_append_audit_event(
    p_actor,
    'member.profile_image.set',
    p_actor,
    NULL,
    pg_catalog.jsonb_build_object(
      'storageKey', p_key,
      'replacedStorageKey', v_replaced,
      'replacedExternalAddress', v_previous IS NOT NULL AND v_replaced IS NULL
    )
  );

  image_path := v_path;
  replaced_key := v_replaced;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.member_clear_profile_image(p_actor uuid)
RETURNS TABLE(replaced_key text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_previous text;
  v_replaced text;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  SELECT profile_row.image_url INTO v_previous
  FROM public.member_profiles AS profile_row
  WHERE profile_row.user_id = p_actor
  FOR UPDATE;

  UPDATE public.member_profiles AS profile_row
  SET image_url = NULL, updated_at = pg_catalog.clock_timestamp()
  WHERE profile_row.user_id = p_actor;

  v_replaced := CASE
    WHEN v_previous LIKE '/media/profile/%' THEN substr(v_previous, 16)
  END;

  -- Written even when there was nothing to clear. "The member asked for the
  -- picture to come down and there was none" is a different fact from "nobody
  -- asked", and a trail that records only successful removals cannot tell a
  -- reviewer which one happened.
  PERFORM public.admin_append_audit_event(
    p_actor,
    'member.profile_image.cleared',
    p_actor,
    NULL,
    pg_catalog.jsonb_build_object(
      'replacedStorageKey', v_replaced,
      'hadPicture', v_previous IS NOT NULL
    )
  );

  replaced_key := v_replaced;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.member_set_profile_image(uuid, text) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.member_clear_profile_image(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.member_set_profile_image(uuid, text)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.member_clear_profile_image(uuid)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.member_set_profile_image(uuid, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.member_clear_profile_image(uuid) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.member_profiles FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.audit_logs FROM PUBLIC, moneyverse_app;

COMMIT;
