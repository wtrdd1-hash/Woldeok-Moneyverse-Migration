-- v288: primary-source verified country blog, separate from manually withdrawn JSON articles.
BEGIN;
CREATE TABLE public.blog_verified_articles (
  period_key text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  country text NOT NULL CHECK (country IN ('KR','US','JP','CN')),
  locale text NOT NULL CHECK (locale IN ('ko-KR','en-US','ja-JP','zh-CN')),
  topic text NOT NULL CHECK (topic IN ('ECONOMY','CODING','COMPUTER')),
  title text NOT NULL CHECK (length(title) BETWEEN 25 AND 180),
  excerpt text NOT NULL CHECK (length(excerpt) BETWEEN 65 AND 500),
  content text NOT NULL CHECK (length(content) BETWEEN 1400 AND 18000),
  primary_source_url text NOT NULL CHECK (primary_source_url LIKE 'https://%'),
  source_digest text NOT NULL CHECK (source_digest ~ '^[a-f0-9]{64}$'),
  content_digest text NOT NULL UNIQUE CHECK (content_digest ~ '^[a-f0-9]{64}$'),
  evidence jsonb NOT NULL CHECK (evidence->>'quality'='PASS'),
  receipt uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'PUBLISHED' CHECK (status IN ('PUBLISHED','WITHDRAWN','DELETED')),
  ad_curated boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX blog_verified_visible ON public.blog_verified_articles(published_at DESC) WHERE status='PUBLISHED';
CREATE TABLE public.blog_verified_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 period_key text NOT NULL REFERENCES public.blog_verified_articles(period_key),
 actor text NOT NULL,
 action text NOT NULL,
 reason text NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT now()
);
-- No table-level inserts/updates/deletes are granted to the web role.
REVOKE ALL ON public.blog_verified_articles,public.blog_verified_audit FROM PUBLIC,moneyverse_app;
GRANT SELECT ON public.blog_verified_articles TO moneyverse_app;
COMMIT;
