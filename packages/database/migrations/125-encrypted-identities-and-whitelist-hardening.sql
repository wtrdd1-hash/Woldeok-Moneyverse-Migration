-- Migration 125: Support encrypted identities and seed deterministic operator identifiers

CREATE OR REPLACE FUNCTION public.discord_user_for_subject(p_discord_subject text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  IF p_discord_subject IS NULL
    OR (p_discord_subject !~ '^[0-9]{16,22}$' AND p_discord_subject !~ '^enc:v1:det:[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$') THEN
    RETURN NULL;
  END IF;

  SELECT identity_row.user_id
  INTO v_user_id
  FROM public.identities AS identity_row
  JOIN public.users AS user_row ON user_row.id = identity_row.user_id
  JOIN public.user_consents AS consent_row ON consent_row.user_id = user_row.id
  WHERE identity_row.provider = 'discord'::public.identity_provider
    AND identity_row.provider_subject = p_discord_subject
    AND user_row.status = 'active'::public.user_status
    AND consent_row.age_confirmed IS TRUE
    AND consent_row.consent_version_id = (
      SELECT consent_version.id
      FROM public.consent_versions AS consent_version
      WHERE consent_version.published_at <= pg_catalog.now()
      ORDER BY consent_version.published_at DESC, consent_version.id DESC
      LIMIT 1
    )
  LIMIT 1;

  RETURN v_user_id;
END;
$function$;

-- Update check constraint on bootstrap_discord_operators to allow encrypted subjects
ALTER TABLE public.bootstrap_discord_operators
  DROP CONSTRAINT IF EXISTS bootstrap_discord_operators_provider_subject_check;

ALTER TABLE public.bootstrap_discord_operators
  ADD CONSTRAINT bootstrap_discord_operators_provider_subject_check
  CHECK (provider_subject ~ '^[0-9]{5,32}$' OR provider_subject ~ '^enc:v1:det:[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$');

-- Seed deterministic encrypted subjects into bootstrap_discord_operators
INSERT INTO public.bootstrap_discord_operators (provider_subject, note)
VALUES
  ('enc:v1:det:95ef3a7a636674764fbcd4b8:2bdae51e0d42f11e1ceda772ca5f62c8:2b231e0308718f404025c90c059323985f45', '루마 (Encrypted)'),
  ('enc:v1:det:eb83f0ae5f47bfe4cc36380d:0144d90b68ad2c28f5c99742d3cc0bd3:322e82c950212e4df660a403e680ac3d05a4', '월덕 (Encrypted 889085646768078850)'),
  ('enc:v1:det:8407e136d96955875b676e51:90bb9d6894cebfc695de447ce89f9517:f950b2f867373899925c449bb460598f04c3', '월덕 (Encrypted 886478189520637992)'),
  ('enc:v1:det:fcf94be490383d13a37d9f6e:e6748ac8b1212c5452270cf5e37c6ae7:26522c62ea7094237fec39ff9cfaae8f9f9828', '월덕 (Encrypted 1545280111258107934)')
ON CONFLICT (provider_subject) DO UPDATE SET note = EXCLUDED.note;

-- Update bootstrap_google_operators with deterministic encrypted subjects
INSERT INTO public.bootstrap_google_operators (email, provider_subject, note)
VALUES
  ('woldeog12@gmail.com', 'enc:v1:det:992d68562e5428a19f0078ed:75865c6dc2245c88d4180568f331ad89:aea85af0c009b4871effdfb179ea650a0fbe5be791', 'woldeog12@gmail.com (Encrypted)'),
  ('jungchwimisaenghwal63@gmail.com', 'enc:v1:det:116253afe006ccf2af2c8f07:4f088c7f8442f1aecc3526e99474eb46:74f50d1838ca46f6ca178420038f8b28643b737043cc7d0294762b5675702e', 'jungchwimisaenghwal63@gmail.com (Encrypted)')
ON CONFLICT (email) DO UPDATE SET
  provider_subject = EXCLUDED.provider_subject,
  note = EXCLUDED.note;
