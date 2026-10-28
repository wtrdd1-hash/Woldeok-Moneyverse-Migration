# v2026.10.28.1414 — Automatic primary-source discovery for AI blog

## Before work — 2026-10-28 KST
Owner reported the live administrator page blocked in editorial-review hold and explicitly required online information **search and collection**, not an inert button or manually supplied citations. Current main `8b6e1641f1fb773db69e4271e7f6f547162c989b` includes v1412 source-candidate code but has **no confirmed Production/Test publisher**. `blog-primary-sources.ts` fetches the same preassigned homepage for each country/topic and never discovers article-level primary material; a central bank homepage also cannot substantiate detailed article claims. Human approval is not required by v1405; unsafe/unverifiable writing must fail closed; owner-withdrawn legacy articles must stay withdrawn.

Read `AGENTS.md`, `docs/RELEASING.md`, EN integrated master and KR v1405 policy, v1412 worklog, v1412.1 concurrent PR #1665 and v1413 E2E PR #1662. This isolated branch changes *only* source discovery and its focused regression tests, avoiding active admin/SEO/quality/DB modifications. Requirements: genuine automated online primary-source discovery (prefer official RSS/index pages), strict HTTPS allowlists and path checks, prompt-injection/SSRF/redirect protection, bounded fetch/read/selection and tested fallback; no invented freshness or publication status.

## Midpoint
Pending tests, code and integration results.

## End
Pending CI and official Test/Production gates. Production scheduler remains OFF; no claim of public posts.
