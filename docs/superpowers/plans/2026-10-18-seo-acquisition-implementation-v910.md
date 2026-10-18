# Moneyverse SEO Evidence & Customer Acquisition — Implementation Plan v2026.10.18.910

**Status:** implementation candidate. English canonical; [Korean companion](2026-10-18-seo-acquisition-implementation-v910.ko.md). Exact start main a945fb2ffd2f027cb8393701874a6d8209b7558f. Distinct branch fix/seo-crawler-evidence-v2026.10.18.910. This implements the first safe slice of the approved [v860 acquisition proposal](../../planning/SEO_ZERO_TRAFFIC_QUALIFIED_ACQUISITION_PLAN_v2026.10.18.860.md); proposal PR #937 is not product authority.

## Evidence and state machines

Owner reports no customers after >2 weeks SEO; Search Console and Naver actual property analytics and confirmed registrations are UNKNOWN until observed. Five evidence families must never be collapsed: source URL indexability, search-engine notification receipt, external crawler visits, indexed-version provider inspection, and final search clicks/impressions. Every provider read needs property, period, locale/country/device, collectedAt, lastSuccess, final/partial/unknown, authorization and source SHA. Site inspection is not indexing proof.

### S0: current isolated implementation — admin crawler honesty

1. Initial RED tests reproduce misleading index ratios, normal-indexed badges, and false unindexed labels when only external bot visit telemetry exists. Fallback must show unobserved, not invented zero.
2. File frontend/src/app/admin/seo/seo-client-view.tsx keeps the existing backend wire contract, but presents legacy indexed counters as **recent external bot visit coverage**. An unconfigured/failed crawler data response shows '관측 자료 없음'. The operator is directed to GSC for real index status. Bot request latency must not assert 'superfast SSR'.
3. File frontend/src/app/admin/seo/admin-seo.test.tsx verifies bot observation and true unavailable state independently. Frontend/src/security-headers.test.ts retains both branches: indexing OFF => explicit noindex/nofollow; indexing ON => explicit index/follow and preview/snippet directives. The Next runtime security policy is unchanged.
4. TDD acceptance: 9/9 SEO tests; 8/8 security header tests, frontend full suite, TypeScript, targeted lint, production Next build. Real browser authenticated Test routes and financial ledger remain separate mandatory release gates.

### S1: existing /admin/seo property-backed observability — separate code branch

Reuse backend/src/seo/gsc-client.ts and /api/seo/gsc, not new parallel provider adapters. Add bounded page/query/country/device/date Search Analytics reads, reporting timezone America/Los_Angeles, last finalized date and safe quotas. Distinguish UNCONFIGURED, AUTH_ERROR, STALE, NO_ROWS, PARTIAL and OBSERVED. Do not display unreported dates as zero. Admin-only/CSRF, credentials never client-side. Test 401/403/429, last-good stale states, country/locale filters and source release identity.

### S2: canonical multilingual technical audit — separate code branch

Reuse frontend/src/app/sitemap.ts and /guide/glossary. Only publish hreflang alternates for genuinely translated pages with language-specific canonical, title/H1 and body. Assert no doubled /en/en, /ja/ja or /zh/zh; reciprocal pairs, indexable content only, consistent redirects and actual last-modified dates. Do not bulk delete URLs on incomplete GSC evidence. Private user/admin/Test pages always noindex. Verify Korean/English/Japanese/Chinese samples, 320px screen and source/date on financial formulas.

### S3: guest-first customer experience — separate code branch

Homepage offers one concise promise: persistent fictional economy, without cash investment. Entry choices: useful calculator, fictional company explorer, read-only career simulation. Provide complete result before voluntary signup for storing progress. Preserve safe intent across login, never grant WLD or report bank deposit based on client-side samples, only show money success after backend immutable receipt. First next-action tray maximum three eligible actions, also Not Now. Tests across 401/403, old session, cross-account isolation, mobile keyboard and screen readers.

### S4: discovery, conversion and retention

Instrument landing_view -> guest_tool_complete -> signup_start -> signup_complete_server -> auth_return_complete -> first_economy_action_verified -> D1/D7. Privacy-minimized event IDs, no account balances or raw emails in ad analytics. Handpick 3–5 demand-validated helpful tools/content clusters; do not generate one page per keyword in v527 corpus. Conduct opt-in community interviews and moderated beta distribution without spam. Compare qualified completion by landing, source, locale and device; never promise a day-14 conversion uplift.

## Data reset authorization and release guard

User allows initialization when a problem is found. Scope safe for disposable synthetic Test fixtures, isolated Test databases, and rebuildable cache **after identification and backup validation**. This is not evidence that existing Production balances, accounts, consents, immutable ledger or audit trail can be destroyed. v855/v901 noted 19 uncertified Production financial projections (+4,779,188 WLD) and Test-current release corruption; do not reset away forensic evidence or claim success from HTTP 200. Financial provenance must be reconciled and broad DML privileges removed with narrow actor-scoped SQL commands, independently verified on a restored database.

Release: fresh main comparison, isolated worktree, recorded RED/GREEN, branch CI and full applicable tests, exact-SHA active Test build + backend+auth/ledger E2E, v530 signed-in 166 route five passes and 34 admin workflows, session/backup restore, rollback/canary, then zero-downtime Production. Revalidate Source/Next/Manifest SHA after promotion. If a gate fails, fix and rerun; no waiver, fabricated result or Production reset.

## Reference register

Google https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl ; multilingual https://developers.google.com/search/docs/specialty/international/localized-versions ; content https://developers.google.com/search/docs/fundamentals/creating-helpful-content ; Naver collection https://searchadvisor.naver.com/guide/report-crawl-refine ; Naver exposures https://searchadvisor.naver.com/guide/report-expose-ctr ; GA4 https://support.google.com/analytics/answer/9267735 . Product references and experiment definitions are recorded in v860.