# AI Blog end-to-end recheck — v2026.10.16.719

**English canonical | [한국어](MONEYVERSE_AI_BLOG_RECHECK_v2026.10.16.719.ko.md)**

Status: **TEST_VERIFIED local candidate, Production unchanged**. Source base `origin/main=2f091034` (v718), v717 editorial hold remains authoritative. No finance/DB/live data mutations.

## Read-only Production evidence — 2026-10-16 16:11–16:16 KST
- Public `GET https://easy-scraping.com/api/blog`: **177 posts**, **171 flagged AI-generated**, only **6 distinct AI titles**. Top title repetitions: 80 + 51 + 37 = **168** articles with three titles. 6 non-AI country guides have EN/JA/ZH editions each, representing **24 locale-specific educational articles**.
- Legacy articles openly claimed a current, officially measured USD/KRW rate and market backtests without a verifiable source/as-of receipt. One sampled body described `1,385.5` as a latest measured exchange rate; no evidence establishes it as a true current quote. Do not publish these as verified journalism.
- 17 AI articles dated 2026-10-16 UTC, latest 05:19:59Z (14:19:59 KST), **before** documented v717 Production cutover (~14:30 KST). This does not show that v717 generated fresh posts after rollout. Keep watch for newly dated articles after the cutover.
- Production locale blog hubs and `/blog/country-guide-compound` for KO/EN/JA/ZH: HTTP 200; sitemap HTTP 200. Existing `/api/blog` transferred ~1.25 MB. Images: only one of the 177 posts had a heroImage field; six new country guides intentionally have none, not broken images.
- v717 API holds *new* publication via authorized `503 EDITORIAL_REVIEW_REQUIRED`, but historical spam remained discoverable in `/blog`/sitemap. The administrator UI incorrectly promised daily generation and successful indexing, while the SEO digest still called the paused endpoint with an insecure legacy fallback credential.

## Candidate remediation
1. Keep existing `POST /api/blog/generate` authorization and editorial 503 hold; no toggle or bypass.
2. Remove deprecated daily digest → blog POST and fallback credential, retaining SEO analytics/Discord digest independently.
3. Show administrator the actual editorial hold, disable inactive generation action and expose per-post unreviewed-AI flags. Never represent IndexNow submission as indexing success.
4. Temporarily restrict public blog discovery (`/blog`, locale hubs, `/api/blog`, sitemap) to non-AI editorial posts. This is a **fail-closed interim policy**, not a durable human-approval schema: future AI posts require explicit source, as-of, editor ID, decision, revision and duplicate-signature receipts before this restriction may change.
5. Preserve legacy data and direct article URLs while adding a prominent archive warning and HTML robots `noindex, follow`; remove unreviewed structured `BlogPosting` data. Do not block these pages in robots.txt: crawlers must fetch `noindex`. Search deindexing is asynchronous and not yet verified in GSC.

## Verification
- RED: administrator-UI and scheduled-digest regression tests both failed against unmodified v718 source; legacy sitemap/public-gate test failed before implementation.
- GREEN: targeted 17 frontend + 1 backend tests PASS. Full `pnpm test`: **1,216 backend pass, 396 DB-dependent skipped; 1,237 frontend pass**. Workspace typecheck and build PASS; targeted ESLint PASS (after dead import cleanup).
- Isolated local Next preview port 3311: four locale hubs and Korean country detail HTTP 200, public API contains **6 non-AI posts**, blog sitemap contains **28 URLs** (4 hubs + 24 localized guides), a sampled old AI article remains HTTP 200 with `robots=noindex, follow` and an editorial warning, and English guide self-canonical is correct. No Production runtime update.
- **Not verified:** exact-SHA designated Test backend/DB and authenticated admin E2E, deployment CI and Production promotion, Google Search Console index changes, completeness of source/date verification for individual country-guide laws and external official references, and mobile browser visual acceptance. No claim of those gates passing.

## Residual editorial decisions
- P0: introduce human approval, provenance, content similarity and publication-job idempotency; why 171 posts with 6 titles appeared in three days needs scheduler/credential attribution from historical logs before any reenablement.
- P1: licensed/owned topic images with descriptive alt text where genuinely helpful; source update timestamps, locale-specific proofreading and Search Console URL Inspection samples.
- P1: decide long-term treatment of historical AI articles (archive + noindex versus curated rewrite versus HTTP 410), with non-destructive migration and Search Console evidence.

Google references: [Scaled content abuse](https://developers.google.com/search/docs/essentials/spam-policies) and [noindex implementation](https://developers.google.com/search/docs/crawling-indexing/block-indexing). IndexNow request delivery is not Google indexing proof.
