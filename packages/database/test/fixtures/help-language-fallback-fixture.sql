-- ISOLATED PostgreSQL ONLY. Never apply this synthetic data to dev/Test/Production.
BEGIN;
INSERT INTO public.users(id) VALUES
 ('00000000-0000-4000-8000-000000000111'),
 ('00000000-0000-4000-8000-000000000222')
ON CONFLICT (id) DO NOTHING;
WITH article AS (
 INSERT INTO public.help_articles(id,locale,slug,category,state,created_by)
 VALUES
 ('00000000-0000-4000-8000-000000000301','en','backup-help','account','published','00000000-0000-4000-8000-000000000111'),
 ('00000000-0000-4000-8000-000000000302','en','expired-backup','account','published','00000000-0000-4000-8000-000000000111'),
 ('00000000-0000-4000-8000-000000000303','en','unapproved-backup','account','published','00000000-0000-4000-8000-000000000111'),
 ('00000000-0000-4000-8000-000000000304','ko','korean-guide','account','published','00000000-0000-4000-8000-000000000111')
 ON CONFLICT (id) DO NOTHING RETURNING id
)
SELECT count(*) FROM article;
INSERT INTO public.help_article_revisions
 (id,article_id,revision_no,title,summary,body_plain,source_url,source_sha256,reviewed_until,author_id,approved_by,published_at)
VALUES
 ('00000000-0000-4000-8000-000000000401','00000000-0000-4000-8000-000000000301',1,'Backup recovery','Verified backup instructions','English synthetic fixture','https://example.org/backup',repeat('a',64),clock_timestamp()+interval '1 day','00000000-0000-4000-8000-000000000111','00000000-0000-4000-8000-000000000222',clock_timestamp()),
 ('00000000-0000-4000-8000-000000000402','00000000-0000-4000-8000-000000000302',1,'Backup expired','Expired','Synthetic fixture','https://example.org/expired',repeat('b',64),clock_timestamp()-interval '1 day','00000000-0000-4000-8000-000000000111','00000000-0000-4000-8000-000000000222',clock_timestamp()),
 ('00000000-0000-4000-8000-000000000403','00000000-0000-4000-8000-000000000303',1,'Backup unapproved','Unapproved','Synthetic fixture','https://example.org/unapproved',repeat('c',64),clock_timestamp()+interval '1 day','00000000-0000-4000-8000-000000000111',NULL,clock_timestamp()),
 ('00000000-0000-4000-8000-000000000404','00000000-0000-4000-8000-000000000304',1,'한국어 도움말','검증된 한국어 안내','Synthetic fixture','https://example.org/ko',repeat('d',64),clock_timestamp()+interval '1 day','00000000-0000-4000-8000-000000000111','00000000-0000-4000-8000-000000000222',clock_timestamp());
UPDATE public.help_articles a SET published_revision_id = r.id
FROM public.help_article_revisions r WHERE r.article_id = a.id AND a.id IN
 ('00000000-0000-4000-8000-000000000301','00000000-0000-4000-8000-000000000302','00000000-0000-4000-8000-000000000303','00000000-0000-4000-8000-000000000304');
COMMIT;
