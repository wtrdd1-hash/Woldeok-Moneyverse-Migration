# v2026.09.15.103 — Integrated planning, QA, SEO, security, and profitability audit

## Scope

This is a documentation/planning-only release. No runtime, database, API, infrastructure, or security code is changed.

## Fresh external references reviewed

- Google Search Central canonicalization, Core Web Vitals, and Breadcrumb structured-data guidance (reviewed 2026-09-15): https://developers.google.com/search/docs/crawling-indexing/canonicalization , https://developers.google.com/search/docs/appearance/core-web-vitals , https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Naver Search Advisor SEO, crawler, sitemap/RSS, canonical and robots guidance (reviewed 2026-09-15): https://searchadvisor.naver.com/guide/seo-basic-intro , https://searchadvisor.naver.com/guide/request-feed , https://searchadvisor.naver.com/guide/markup-structure
- OWASP API Security Top 10 2023 BOLA/Broken Authentication and OWASP Top 10:2025 / ASVS references (reviewed 2026-09-15): https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/ , https://api-security.owasp.org/editions/2023/en/0xa2-broken-authentication/ , https://top10.owasp.org/2025/ , https://owasp.org/www-project-application-security-verification-standard/
- FTC 2026 negative-option/subscription enforcement and rulemaking signals: https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices , https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-seeks-public-comment-response-advance-notice-proposed-rulemaking-regarding-negative-option
- Apple subscription economics and billing recovery guidance: https://developer.apple.com/kr/app-store/subscriptions/ and https://developer.apple.com/documentation/storekit/handling-subscriptions-billing

## Repository/runtime evidence

- Planning baseline inspected at `main` SHA `bb46906b786dd92e731be996ad8fc3c72e94f352`.
- The latest runtime-changing commit, v2026.09.15.102, restores authoritative `work_task_catalog.daily_limit`, counts completed/rewarded work in `taken_today`, and blocks only the completion after the configured limit is exhausted.
- GitHub combined-status and commit-workflow lookups for that SHA returned no visible checks/runs through the connected API during this planning run. This is recorded as verification unavailable, not as a CI failure.
- Production public status reported web, economy API, and ledger database as healthy at the latest visible snapshot.
- Production `/guide` still states that profession tasks can be repeated with no daily limit and full WLD/EXP each time. That directly conflicts with the v102 authoritative daily-quota contract.

## Priority changes

### P0 — runtime/spec/public-guide quota contract drift

Status: TODO / release-blocking until corrected and revalidated.

- Public guide claims unlimited repeated profession rewards.
- Current database contract enforces task-specific daily quotas.
- Required fix: update all public guide/FAQ/SEO copy, mobile/web copy, API examples, and generated metadata to describe server-authoritative `daily_limit` and `taken_today`; never hard-code a universal number unless the authoritative task catalogue supplies it.
- QA gate: real-DB tests for remaining quota, exact-limit completion, over-limit rejection, profession switch isolation, concurrent duplicate requests, Seoul day-boundary, and mobile/web schema parity; public E2E must verify rendered guide language against the current contract.
- Rollback: documentation can revert independently, but the applied DB migration must remain immutable; any economy-behavior rollback requires a new migration.

### P0 — promotion evidence gate

Status: IN PROGRESS / evidence unavailable in this run.

- A releasable SHA is not considered production-ready merely because code and DB tests exist.
- Promotion requires CI success, immutable test image, exact-SHA test deployment, backend/database smoke, key user-flow QA, migration parity/checksum, and rollback proof.
- Missing GitHub status visibility is not treated as pass or fail; it remains `verification unavailable` until evidence is available.

### P1 — SEO backend contract

- Canonical URL generation must be server-owned and deterministic.
- Dynamic sitemap entries require public/indexable status and authoritative `updatedAt`; private/account/admin/wallet/transaction/security/recovery paths are excluded.
- Public content should be SSR/ISR-readable without client-only discovery dependencies; filter/query variants should canonicalize or noindex as appropriate.
- Breadcrumb JSON-LD is limited to pages with visible breadcrumb semantics and must match canonical URLs.
- Search monitoring must connect crawl/index health to organic visit → signup → activation → D7/D30 → revenue, not just impressions/CTR.

### P1 — security verification matrix

- Every object-ID endpoint must test positive and negative object authorization, including another member’s object IDs.
- Authentication tests must cover credential stuffing/rate limiting, session rotation, logout/invalidation, OAuth state/nonce/PKCE/redirect URI, reauthentication, CSRF, and secret/log masking.
- Economy flows require idempotency, replay, concurrency, multi-account/fraud, duplicate reward, ledger reconciliation, and precision tests.
- New public uploads/UGC require decoded-type validation, storage isolation, authorization, malware/content moderation and metadata privacy checks.

### P1 — profitability/monetization decision gates

- Subscription/paid-feature models are hypothesis-only until price, attach/conversion, renewal/churn, refund, platform/payment fee, tax, infra, support, moderation/fraud cost, gross margin, contribution margin, CAC, LTV and payback are measured.
- Cancellation and material recurring terms must be clear before charge; retention tactics must not obstruct cancellation.
- Ad decisions optimize net contribution after ad-induced churn/session loss/support burden, not raw impressions.
- Security/QA/SEO work is valued through avoided fraud/refund/incident/support cost and retained organic/customer value.

## Integrated feature specification rule

Every major feature family—identity/session, profile/security center, inventory/collection, shop/cart/payment/subscription, season/quest/job/progression, business/bank/loan, virtual stocks/portfolio/alerts, casino/probability, community/comments/report/block, friends/clubs/referral, notifications, search, uploads, public content, app API, admin/audit/backup, analytics/experiments, advertising, SEO and incident operations—must carry implementation status and a concrete contract for UX states, authority/ownership, API errors/idempotency/rate limits, database constraints/transactions/concurrency, security/privacy/abuse, observability/admin operations, analytics/KPIs, performance/caching, profitability, QA acceptance, deployment and rollback.

## Runtime verification

Partial. Production public home/status/guide were reachable. Authenticated flows, exact-SHA isolated test deployment, CI run details, and real user/account economy flows were not independently executed in this documentation-only run.
