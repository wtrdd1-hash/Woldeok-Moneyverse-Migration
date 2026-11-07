# Change record — v2026.11.03.1712 Blog SEO crawl truth

**EN canonical** | [한국어](2026-11-03-blog-seo-crawl-v1712.ko.md) · `IMPLEMENTED SOURCE / TEST AND PRODUCTION NOT DEPLOYED`.

- v1712.1: Read current planning, live production crawl and isolated branch; no production mutation.
- v1712.2: RED 4 regressions reproduced; fix blog hub page-title duplication, sitemap index request-time false lastmod, article canonical duplicates and malformed timestamps, and Test SEO-off blog sitemap URLs. No content hide or data edit.
- v1712.3: 52 scoped Vitest passing; contract build, frontend typecheck, scoped ESLint and diff validation passing. Full Next production build/GitHub exact-SHA CI/official Test staging and Production promotion not verified. See [worklog](../worklog/2026-11-03-blog-seo-crawl-v1712.md).
