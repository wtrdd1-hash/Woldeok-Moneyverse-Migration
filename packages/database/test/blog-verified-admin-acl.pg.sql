-- Run only in a disposable PostgreSQL instance after the full 001..311 schema.
INSERT INTO public.users(id, status) VALUES
 ('11111111-1111-4111-8111-111111111111', 'active'),
 ('22222222-2222-4222-8222-222222222222', 'active'),
 ('33333333-3333-4333-8333-333333333333', 'restricted');
INSERT INTO public.user_roles(user_id, role) VALUES
 ('11111111-1111-4111-8111-111111111111', 'operator'),
 ('33333333-3333-4333-8333-333333333333', 'operator');

INSERT INTO public.blog_verified_articles (
 period_key, slug, country, locale, topic, title, excerpt, content,
 primary_source_url, source_digest, content_digest, evidence, status, published_at
)
SELECT 'slot-' || n, 'article-' || n, 'KR', 'ko-KR', 'ECONOMY',
 repeat('T', 25), repeat('E', 65), repeat('C', 1400),
 'https://example.com/' || n,
 md5(n::text) || md5('source-' || n),
 md5('content-' || n) || md5('digest-' || n),
 '{"quality":"PASS"}'::jsonb,
 CASE WHEN n=205 THEN 'WITHDRAWN' WHEN n=204 THEN 'DELETED' ELSE 'PUBLISHED' END,
 '2026-10-30T00:00:00Z'::timestamptz + n * interval '1 second'
FROM generate_series(1,205) AS n;

SET ROLE moneyverse_app;
DO $test$
DECLARE n integer; withdrawn integer; deleted integer; first_slug text; privilege_name text;
BEGIN
 FOREACH privilege_name IN ARRAY ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE'] LOOP
   IF has_table_privilege(current_user, 'public.blog_verified_articles', privilege_name) THEN
     RAISE EXCEPTION 'application role has unrestricted article privilege: %', privilege_name;
   END IF;
 END LOOP;
 BEGIN
   EXECUTE 'SELECT count(*) FROM public.blog_verified_articles';
   RAISE EXCEPTION 'direct article SELECT unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;

 SELECT count(*), count(*) FILTER (WHERE status='WITHDRAWN'),
        count(*) FILTER (WHERE status='DELETED')
 INTO n, withdrawn, deleted
 FROM public.blog_verified_admin_list('11111111-1111-4111-8111-111111111111');
 IF n<>200 OR withdrawn<>1 OR deleted<>0 THEN
   RAISE EXCEPTION 'bad admin result: count %, withdrawn %, deleted %', n, withdrawn, deleted;
 END IF;
 SELECT slug INTO first_slug
 FROM public.blog_verified_admin_list('11111111-1111-4111-8111-111111111111') LIMIT 1;
 IF first_slug <> 'article-205' THEN RAISE EXCEPTION 'unexpected order: %', first_slug; END IF;

 BEGIN
   PERFORM * FROM public.blog_verified_admin_list('22222222-2222-4222-8222-222222222222');
   RAISE EXCEPTION 'ordinary user gained admin read';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
   PERFORM * FROM public.blog_verified_admin_list('33333333-3333-4333-8333-333333333333');
   RAISE EXCEPTION 'inactive administrator gained admin read';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
   PERFORM * FROM public.blog_verified_admin_list(NULL::uuid);
   RAISE EXCEPTION 'NULL actor gained admin read';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 IF has_function_privilege('public', 'public.blog_verified_admin_list(uuid)', 'EXECUTE') THEN
   RAISE EXCEPTION 'PUBLIC unexpectedly has admin function EXECUTE';
 END IF;
END;
$test$;
RESET ROLE;
SELECT 'PASS: isolated PostgreSQL 17.11 verified-blog admin scoped read and ACL' AS verdict;
