BEGIN;

-- The administrator allow-list must follow the verified OAuth identity, not a
-- nickname or a UUID copied from the member directory.  The production
-- Discord account below is the active Woldeok account; recording its current
-- deterministic subject makes the existing bootstrap trigger cover future
-- relinks made with the same durable data-encryption key.
INSERT INTO public.bootstrap_discord_operators (provider_subject, note)
VALUES (
  'enc:v1:det:2b96ca903dbebd21c97f45ee:48f6d51015bfdbaec57c2f6d27bae4a4:af04efa56e038ecba538e227a5756ffe2ed1',
  'Woldeok Discord 889085646768078850 (production deterministic identity)'
)
ON CONFLICT (provider_subject) DO UPDATE SET note = EXCLUDED.note;

-- Apply the allow-list to the already-linked active account.  This grants all
-- four roles through the same reviewed function used by deployment seeding.
SELECT public.apply_bootstrap_discord_operators();

COMMIT;
