# v2026.10.22.1106 Change record

**Runtime-only Production SEO configuration recovery, source SHA unchanged.** Previous release `v1083` had `SEO_INDEXING_ENABLED=false`; restored indexable public robots/meta/HTTP and non-empty sitemaps in same-source rebuilt immutable frontend. Scope: one frontend Nginx upstream, zero backend/DB modifications. SEO/blog Vitest 17 pass; public smoke and rollback saved. Legacy AI publication remains blocked pending reviewed publisher. See [release evidence](../releases/v2026.10.22.1106.md) and [worklog](../worklog/2026-10-22-seo-blog-indexing-v1106.md).
