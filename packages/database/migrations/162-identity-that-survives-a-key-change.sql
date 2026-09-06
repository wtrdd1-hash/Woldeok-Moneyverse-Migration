-- An account that survives a change of encryption key.
--
-- 129 encrypted `identities.provider_subject` deterministically: the same
-- Discord or Google id always encrypts to the same string, so a login can
-- find the account it belongs to by looking the ciphertext up. That holds
-- only while the key holds. `DATA_ENCRYPTION_KEY` has moved at least once on
-- this deployment -- the whitelist carries two different ciphertexts for the
-- same Discord id, seeded on two different days -- and every time it moves,
-- every stored subject becomes unfindable. A returning member is then a
-- stranger: a new user row, an empty wallet, the consent screen again, and no
-- roles. Three separate reports, one cause.
--
-- So identity stops depending on a key. Beside the encrypted subject sits a
-- hash of the plaintext one, and that is what a login looks up. It is a plain
-- SHA-256 rather than a keyed one on purpose: a keyed digest would be the
-- same fragility wearing a different hat.
--
-- What that costs is worth stating plainly. A provider subject is a
-- pseudonymous account id, not a secret like a password, and the encrypted
-- copy stays. Someone holding a full dump of this database could test whether
-- one particular Discord id is present -- which they could already do with
-- the dump and the key together. What it buys is that a rotated key, a lost
-- key, or a rebuilt `.env` can never again separate a member from their
-- money.
--
-- Rows written before this have no hash. The first login after it fills one
-- in -- by the old ciphertext, which still matches while the key that wrote
-- it is the key in use -- and refreshes the subject to the current key at the
-- same time. An account already split by a past rotation is not repaired
-- here; that is a merge, and a merge is somebody's decision, not a
-- migration's.

BEGIN;

ALTER TABLE public.identities ADD COLUMN IF NOT EXISTS subject_hash text;

ALTER TABLE public.identities DROP CONSTRAINT IF EXISTS identities_subject_hash_check;
ALTER TABLE public.identities
  ADD CONSTRAINT identities_subject_hash_check
  CHECK (subject_hash IS NULL OR subject_hash ~ '^[0-9a-f]{64}$');

-- One account per provider identity, as `provider_subject` already promises.
CREATE UNIQUE INDEX IF NOT EXISTS identities_provider_subject_hash_idx
  ON public.identities (provider, subject_hash)
  WHERE subject_hash IS NOT NULL;

/**
 * 144's login, finding the account by hash first and by ciphertext second.
 *
 * The second lookup is what repairs a row: an identity stored before this
 * migration is found by its ciphertext, and the hash and the current
 * ciphertext are written onto it, so the next key change costs nothing.
 */
CREATE OR REPLACE FUNCTION public.auth_complete_oauth_login(
  p_pre_auth_session_id uuid,
  p_provider public.identity_provider,
  p_provider_subject text,
  p_subject_hash text,
  p_display_name text,
  p_session_token_hash text,
  p_csrf_hash text
)
RETURNS TABLE(user_id uuid, session_id uuid, is_new boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_session_id uuid;
  v_status public.user_status;
  v_is_new boolean := false;
  v_name text;
  v_identity uuid;
BEGIN
  IF p_provider_subject IS NULL OR char_length(p_provider_subject) = 0 OR char_length(p_provider_subject) > 255 THEN
    RAISE EXCEPTION 'invalid OAuth provider subject' USING ERRCODE = '22023';
  END IF;
  IF p_subject_hash IS NULL OR p_subject_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid OAuth subject hash' USING ERRCODE = '22023';
  END IF;
  IF p_display_name IS NULL OR char_length(btrim(p_display_name)) = 0 THEN
    RAISE EXCEPTION 'invalid OAuth display name' USING ERRCODE = '22023';
  END IF;
  IF p_session_token_hash IS NULL OR p_csrf_hash IS NULL
    OR p_session_token_hash !~ '^[0-9a-f]{64}$' OR p_csrf_hash !~ '^[0-9a-f]{64}$' THEN
    RAISE EXCEPTION 'invalid session credential hash' USING ERRCODE = '22023';
  END IF;

  PERFORM 1
  FROM public.auth_sessions AS session_row
  WHERE session_row.id = p_pre_auth_session_id
    AND session_row.user_id IS NULL
    AND session_row.revoked_at IS NULL
    AND session_row.expires_at > pg_catalog.now()
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'active pre-login session required' USING ERRCODE = '28000';
  END IF;

  -- The hash, not the ciphertext: the same member locks the same row however
  -- many times the key has changed under them.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_provider::text || ':' || p_subject_hash, 0));
  v_name := left(btrim(p_display_name), 120);

  SELECT identity_row.id, identity_row.user_id, user_row.status
  INTO v_identity, v_user_id, v_status
  FROM public.identities AS identity_row
  JOIN public.users AS user_row ON user_row.id = identity_row.user_id
  WHERE identity_row.provider = p_provider
    AND identity_row.subject_hash = p_subject_hash
  FOR UPDATE OF identity_row, user_row;

  IF NOT FOUND THEN
    -- Written before this migration, or by a key that is still in use.
    SELECT identity_row.id, identity_row.user_id, user_row.status
    INTO v_identity, v_user_id, v_status
    FROM public.identities AS identity_row
    JOIN public.users AS user_row ON user_row.id = identity_row.user_id
    WHERE identity_row.provider = p_provider
      AND identity_row.provider_subject = p_provider_subject
    FOR UPDATE OF identity_row, user_row;
  END IF;

  IF v_user_id IS NULL THEN
    INSERT INTO public.users DEFAULT VALUES RETURNING id INTO v_user_id;
    INSERT INTO public.identities(user_id, provider, provider_subject, subject_hash, display_name)
    VALUES (v_user_id, p_provider, p_provider_subject, p_subject_hash, v_name);
    v_is_new := true;
  ELSE
    IF v_status <> 'active'::public.user_status THEN
      RAISE EXCEPTION 'account unavailable' USING ERRCODE = '28000';
    END IF;
    -- Repair in place: the hash it did not have, and the subject as the key
    -- in use writes it today.
    UPDATE public.identities
    SET subject_hash = p_subject_hash,
        provider_subject = p_provider_subject
    WHERE id = v_identity
      AND (subject_hash IS DISTINCT FROM p_subject_hash OR provider_subject IS DISTINCT FROM p_provider_subject);
  END IF;

  INSERT INTO public.accounts(account_type, owner_user_id)
  VALUES ('USER_CASH', v_user_id), ('USER_BANK', v_user_id)
  ON CONFLICT (owner_user_id, account_type) WHERE owner_user_id IS NOT NULL DO NOTHING;

  INSERT INTO public.account_balances(account_id)
  SELECT account_row.id
  FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = v_user_id
    AND account_row.account_type IN ('USER_CASH', 'USER_BANK')
  ON CONFLICT (account_id) DO NOTHING;

  UPDATE public.auth_sessions SET revoked_at = pg_catalog.now() WHERE id = p_pre_auth_session_id;
  INSERT INTO public.auth_sessions(id, token_hash, csrf_hash, user_id, expires_at)
  VALUES (pg_catalog.gen_random_uuid(), p_session_token_hash, p_csrf_hash, v_user_id, pg_catalog.now() + interval '30 days')
  RETURNING id INTO v_session_id;

  RETURN QUERY SELECT v_user_id, v_session_id, v_is_new;
END;
$$;

-- One way to sign in: the six-argument form cannot find an account whose key
-- has moved, and leaving it callable is leaving the bug callable.
DROP FUNCTION IF EXISTS public.auth_complete_oauth_login(uuid, public.identity_provider, text, text, text, text);

ALTER FUNCTION public.auth_complete_oauth_login(uuid, public.identity_provider, text, text, text, text, text)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.auth_complete_oauth_login(uuid, public.identity_provider, text, text, text, text, text)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_complete_oauth_login(uuid, public.identity_provider, text, text, text, text, text)
  TO moneyverse_app;

COMMIT;
