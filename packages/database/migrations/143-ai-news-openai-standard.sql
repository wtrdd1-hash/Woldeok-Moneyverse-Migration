-- The newsroom's address, in the standard every model API answers.
--
-- 135 stored the address and the model of one vendor's API, and the
-- application called it through that vendor's SDK. The operator asked for
-- the OpenAI standard instead: `POST {base}/chat/completions` with the model
-- named in the body, and `GET {base}/models` to list what a key can reach.
-- Every hosted API and every self-hosted server speaks it, including the
-- vendor 135 assumed -- at `https://api.anthropic.com/v1` rather than at the
-- root -- so a deployment that already stored a key keeps it and keeps
-- working.
--
-- Nothing here calls anything. This is one row of settings: the defaults a
-- fresh deployment starts from, and the one row this one already has.

BEGIN;

-- Where a deployment that has never been configured starts.
ALTER TABLE public.ai_news_settings
  ALTER COLUMN api_base_url SET DEFAULT 'https://api.openai.com/v1',
  ALTER COLUMN model SET DEFAULT 'gpt-4o-mini';

-- A stored key belongs to whoever issued it: keep the vendor and move to its
-- compatible path, where the same key and the same model name still answer.
UPDATE public.ai_news_settings
SET api_base_url = 'https://api.anthropic.com/v1'
WHERE id = 1
  AND api_key_sealed IS NOT NULL
  AND pg_catalog.btrim(api_base_url, '/') = 'https://api.anthropic.com';

-- No key was ever stored, so nothing is lost by starting from the default.
UPDATE public.ai_news_settings
SET api_base_url = 'https://api.openai.com/v1',
    model = 'gpt-4o-mini'
WHERE id = 1
  AND api_key_sealed IS NULL
  AND pg_catalog.btrim(api_base_url, '/') = 'https://api.anthropic.com';

COMMIT;
