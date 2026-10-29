#!/usr/bin/env bash
# Isolated SQL ACL test: never connects to a host or an existing service database.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
NAME="mv-b-v292-acl-$$"
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run -d --rm --network none --name "$NAME" -e POSTGRES_HOST_AUTH_METHOD=trust postgres:17-alpine >/dev/null
for i in $(seq 1 30); do
  if docker exec "$NAME" pg_isready -U postgres -q; then break; fi
  sleep 1
done
docker exec "$NAME" pg_isready -U postgres -q
printf 'CREATE ROLE moneyverse_app LOGIN;\n' | docker exec -i "$NAME" psql -U postgres -v ON_ERROR_STOP=1 >/dev/null
docker exec -i "$NAME" psql -U postgres -v ON_ERROR_STOP=1 < "$ROOT/migrations/288-verified-country-blog-publication.sql" >/dev/null
# RED baseline: v288 accidentally grants direct SELECT of withdrawn content.
printf "SET ROLE moneyverse_app; SELECT has_table_privilege(current_user,'public.blog_verified_articles','SELECT');\n" |
  docker exec -i "$NAME" psql -U postgres -At -v ON_ERROR_STOP=1 | grep -qx t
docker exec -i "$NAME" psql -U postgres -v ON_ERROR_STOP=1 < "$ROOT/migrations/298-verified-blog-visibility-boundary.sql" >/dev/null
cat <<'SQL' | docker exec -i "$NAME" psql -U postgres -v ON_ERROR_STOP=1 >/dev/null
INSERT INTO public.blog_verified_articles
(period_key,slug,country,locale,topic,title,excerpt,content,primary_source_url,source_digest,content_digest,evidence,status)
SELECT 'slot-'||n,'slug-'||n,'KR','ko-KR','CODING',repeat('T',30),repeat('E',80),repeat('C',1400),
'https://example.org/source',repeat('f',64),lpad(n::text,64,'0'),'{"quality":"PASS"}'::jsonb,
CASE n WHEN 1 THEN 'PUBLISHED' WHEN 2 THEN 'WITHDRAWN' ELSE 'DELETED' END
FROM generate_series(1,3) AS n;
SET ROLE moneyverse_app;
DO $$
DECLARE v_count integer; v_digest text; v_receipt uuid; v_status text;
BEGIN
  IF has_table_privilege(current_user,'public.blog_verified_articles','SELECT') THEN
    RAISE EXCEPTION 'unrestricted article SELECT remains granted';
  END IF;
  BEGIN
    EXECUTE 'SELECT content FROM public.blog_verified_articles WHERE status=''WITHDRAWN''';
    RAISE EXCEPTION 'direct withdrawn article read unexpectedly succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  SELECT count(*) INTO v_count FROM public.blog_verified_public_list();
  IF v_count <> 1 THEN RAISE EXCEPTION 'public list exposed % articles',v_count; END IF;
  SELECT count(*) INTO v_count FROM public.blog_verified_public_by_slug('slug-2');
  IF v_count <> 0 THEN RAISE EXCEPTION 'withdrawn body exposed'; END IF;
  SELECT count(*) INTO v_count FROM public.blog_verified_public_by_slug('slug-3');
  IF v_count <> 0 THEN RAISE EXCEPTION 'deleted body exposed'; END IF;
  SELECT count(*) INTO v_count FROM public.blog_verified_public_by_slug('slug-1');
  IF v_count <> 1 THEN RAISE EXCEPTION 'published lookup missing'; END IF;
  SELECT receipt,content_digest,status INTO v_receipt,v_digest,v_status
    FROM public.blog_verified_period_receipt('slot-2');
  IF v_receipt IS NULL OR v_digest IS NULL OR v_status <> 'WITHDRAWN' THEN
    RAISE EXCEPTION 'scheduler idempotency metadata lost';
  END IF;
  SELECT count(*) INTO v_count FROM public.blog_verified_recent_digests();
  IF v_count <> 3 THEN RAISE EXCEPTION 'duplicate prevention lost'; END IF;
  IF has_table_privilege(current_user,'public.blog_verified_audit','SELECT') THEN
    RAISE EXCEPTION 'audit table unexpectedly readable';
  END IF;
END;
$$;
RESET ROLE;
UPDATE public.blog_verified_articles SET status='WITHDRAWN' WHERE slug='slug-1';
SET ROLE moneyverse_app;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM public.blog_verified_public_list()) THEN
    RAISE EXCEPTION 'withdrawal not respected by public function';
  END IF;
END $$;
SQL
echo 'PG17 ACL PASS: direct SELECT denied, published-only public reads, withdrawal fenced, scheduler metadata preserved'
