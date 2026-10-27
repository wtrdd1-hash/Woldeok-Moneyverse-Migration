# v2026.10.27.1382 — Blog End-to-End Plan / Main Source / Production Evidence Audit

**Status:** READ-ONLY REVIEW; source baseline `origin/main cf56520b` after mid-task refresh; public HTTPS and legacy JSON inspected on October 27, 2026 (KST). **No application code, production content, credentials, DB, file permissions, releases or deployed routes changed.** The Korean companion contains the complete risk table and actionable evidence.

## Authoritative contracts

`AGENTS.md` → integrated planning master / documentation index → editorial v975 → four-country original writing and limited instant GREEN publication v1107 → **v1108 override: no automatic unpublishing or noindex because the 24-hour review target is missed**. AMBER financial/regulatory claims require preapproval, RED blocks, and future publisher authority must come from verified independent checks and DB receipts rather than the model or a legacy JSON writer.

## Reproduced runtime evidence

- `GET https://easy-scraping.com/api/blog`: HTTP 200, six public articles, each dated `2026-10-15T14:00:00Z`.
- `/sitemap-blog.xml`: HTTP 200 and 28 `<loc>` entries (four locale hubs plus 24 article URLs); this does not prove Google indexing, CTR or new publication.
- `/srv/moneyverse-data/shared/blog-posts.json`: 211 records: 205 AI flagged, 17 TECH, 30 with `PUBLISHED` status, 180 status unset, one `WITHDRAWN`; mode `0664`, modified `2026-10-27 04:53:55 KST`. The 17 TECH records contain only three distinct titles; one title occurs twelve times. A source store record must not be confused with a publicly discoverable approved article.
- The public detail API returns an unreviewed legacy AI article by exact slug despite its exclusion from the hub/sitemap and the rendered `noindex` policy. Direct HTTP response is an accessibility/data-contract matter, separate from search indexing.
- Initial four frontend suites passed 20/20; after the main refresh, five frontend suites passed 22/22 and three backend editorial suites passed 34/34. This is **not** editorial quality, source-verification, full authenticated UI, release/Test or mobile acceptance.
- **Critical main ref refresh:** At initial `59cdc2e0`, the authenticated scheduler/admin route called the old bypass publisher. Main was refreshed mid-task to `cf56520b` where the v1102 source safeguard is now merged: authenticated `POST /api/blog/generate` returns 503 `EDITORIAL_REVIEW_REQUIRED`; `addBlogPost` throws outside tests. **No claim is made that Production has adopted this newer source SHA.**

## Audited implementation gap matrix

| Priority | Required behavior | Current code evidence / finding |
|---|---|---|
| P0 | Editorial category-specific composition | `frontend/src/app/blog/[slug]/blog-post-client.tsx`: compound-interest widget inserted unconditionally after Markdown block #2, even for software engineering |
| P0 | Proven claim-level provenance and reproducibility | `frontend/src/app/blog/blog-data.ts`: reusable legacy TECH template includes unsupported performance benchmark statements, finance/macro sections, generic central-bank and FRED references, with no reproducible experiment receipt |
| P0 | Safe publication and true approval lifecycle | `backend/src/blog-editorial/` provides non-publishing policy/claim/duplicate candidate checks; missing actual trusted ingestion, atomic DB publisher, outbox, revision receipt, operator review and manual withdrawal contracts |
| P0 | Legacy access and human-authorized correction | `frontend/src/app/api/blog/[slug]/route.ts` returns existing unreviewed AI content; `frontend/src/app/api/admin/blog/[slug]/route.ts` permits permanent purge without immutable approval/correction receipt |
| P0 | File-writer integrity and provenance | Legacy JSON `0664` on actual host, contradicting earlier emergency read-only containment; independently establish the writer and exact deployed release before any permission or runtime change |
| P1 | Four native jurisdictions | Planned KR/US/JP/CN versus old generated `BlogCountry` = KR/US/JP/VN, Korean-dominated generated text |
| P1 | Relevant secondary actions | `frontend/src/components/blog/blog-related-ecosystem.tsx`: unconditional calculator, virtual-stock and bank/advisor cards, default stock ticker CHIPS; no article-specific editorial relationship |
| P1 | Honest measurements | `generateDailyAiBlogPost` uses random views and hard-coded reading time; no verified server view/read source |
| P1 | Valid international SEO and localization | `blogAlternateLanguages` links four different national-intent articles as equivalent hreflang; static hub has six guide families but no discoverable TECH section |
| P1 | UX, media and disclosures | Unconditional finance promo and default compound calculator even for TECH; untranslated subsidiary cards, mobile/accessibility and ad-density real-device QA not yet accepted |

## Next engineering order with release gates

1. **v1382.1 Safety evidence:** identify live writer/file-permission owner and independently prove production API and scheduler hold; do not write or publish test articles in production.
2. **v1382.2 Editorial QA:** category-gated article composition; credible human-checkable citation receipts, time/jurisdiction, exact claim/source mapping; TECH benchmark command/dataset/reproduction evidence; anti-duplicate detection; no fake views or market telemetry.
3. **v1382.3 Durable publication:** source-verification service, revision hashes, RBAC and PostgreSQL atomic publisher/outbox; auto-publish genuinely GREEN low-risk verified articles, AMBER preapprove, RED reject; 24h overdue **alert only, keep public**, manual authorized corrections/withdrawals, immutable receipts.
4. **v1382.4 Four-country SEO:** truly independent KR/US/JP/CN copy, title/intent/currency/primary references; emit hreflang only for editorially equivalent language alternatives, indexed/public/withdrawn projections consistent; label GSC `NO_DATA` when unavailable.
5. **v1382.5 Contextual UX:** optional context-matched tools and technical references, vetted related articles, transparent ad/promotional claims, locale-specific components, 320/375/768/1024px QA.
6. **v1382.6 Acceptance:** reproducible positive/negative tests for approvals, concurrency, duplicate queues, source expiry, no auto-unpublish after 24/48h, manual withdrawal/410/sitemap/cache, accessibility/locale, Test backend+DB/auth/UI and exact SHA CI; backup, finance gate and verified zero-downtime production rollout only after acceptance.

**Concurrent ownership:** `docs/blog-tech-editorial-v1380-20261027` owns detailed TECH editorial remedies; C v1102 owns emergency legacy publisher blocking, already merged into observed main. This review creates no conflicting source implementation. Production promotion and real published/indexed growth remain **not verified**.
