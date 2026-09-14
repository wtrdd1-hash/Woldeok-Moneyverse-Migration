# Internal work log — v2026.09.15.103

## Purpose

Perform the scheduled integrated planning audit in the required order: current external references → latest repository/runtime/QA reality → detailed development/QA/security/SEO/profitability planning → mid-work main recheck → Living Project Plan integration in English and Korean.

This run is documentation/planning only. It does not change runtime code, database behavior, API contracts, Kubernetes/Flux manifests, secrets, or production configuration.

## Starting repository state

- Repository: `wtrdd1-hash/Woldeok-Moneyverse-Migration`
- Starting `main`: `bb46906b786dd92e731be996ad8fc3c72e94f352`
- Starting latest change: `fix(v2026.09.15.102): restore work daily quota contract`
- The v102 change restores authoritative task-catalog daily quotas, completion-based `taken_today`, over-limit rejection, and shared concurrency protection for work reward paths.
- Existing Living Project Plan already requires PostgreSQL economy authority, append-only ledger, least privilege, OAuth/session controls, sensitive-route ad exclusions, exact-SHA pre-production validation, immutable applied migrations, and a fail-closed promotion gate.

## External research completed before planning

### Search/SEO

1. Google Search Central — canonicalization: `https://developers.google.com/search/docs/crawling-indexing/canonicalization`
   - Decision: DIRECT ADOPTION for deterministic canonical policy and duplicate control.
2. Google Search Central — Core Web Vitals: `https://developers.google.com/search/docs/appearance/core-web-vitals`
   - Decision: DIRECT ADOPTION for representative public-template targets: LCP <= 2.5 s, INP < 200 ms, CLS < 0.1.
3. Google Search Central — breadcrumb structured data: `https://developers.google.com/search/docs/appearance/structured-data/breadcrumb`
   - Decision: DIRECT ADOPTION where a visible breadcrumb hierarchy exists.
4. Naver Search Advisor — SEO basic, crawler, sitemap/RSS and markup/canonical guidance:
   - `https://searchadvisor.naver.com/guide/seo-basic-intro`
   - `https://searchadvisor.naver.com/guide/request-feed`
   - `https://searchadvisor.naver.com/guide/markup-structure`
   - Decision: DIRECT ADOPTION for Korean crawl/index/canonical/sitemap planning.

### Security

1. OWASP API Security Top 10 2023 — API1 BOLA and API2 Broken Authentication:
   - `https://api-security.owasp.org/editions/2023/en/0xa1-broken-object-level-authorization/`
   - `https://api-security.owasp.org/editions/2023/en/0xa2-broken-authentication/`
   - Decision: DIRECT ADOPTION as endpoint/object authorization and auth negative-test requirements.
2. OWASP Top 10:2025 and ASVS:
   - `https://top10.owasp.org/2025/`
   - `https://owasp.org/www-project-application-security-verification-standard/`
   - Decision: DIRECT ADOPTION as broad verification references; they do not replace project-specific threat modeling.

### Subscription/consumer protection and unit economics references

1. FTC 2026 subscription/negative-option enforcement and rulemaking:
   - `https://www.ftc.gov/news-events/news/press-releases/2026/05/shutterstock-pay-35-million-settle-ftc-allegations-over-illegal-subscription-cancellation-practices`
   - `https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-seeks-public-comment-response-advance-notice-proposed-rulemaking-regarding-negative-option`
   - Decision: DIRECT ADOPTION of clear material terms, informed consent, and non-obstructive cancellation as product guardrails. Do not treat a proposed rulemaking step as a final universal rule.
2. Apple subscriptions and billing recovery:
   - `https://developer.apple.com/kr/app-store/subscriptions/`
   - `https://developer.apple.com/documentation/storekit/handling-subscriptions-billing`
   - Decision: REFERENCE for platform economics and renewal/recovery behavior only. Apple-specific revenue share or billing-recovery durations are not Moneyverse assumptions unless that platform/payment model is actually adopted.

## Runtime and QA reality checked

### Public runtime

- Production public home was reachable and still labels WLD/rewards as service-internal game-only virtual data.
- Production `/status` was reachable and its latest visible snapshot reported the web service, economy API, and ledger database healthy; lobby state was not equivalently confirmed.
- Production `/guide` was reachable.

### P0 contract drift discovered

The public guide states that profession work can be repeated without a daily count limit and pays full WLD/EXP each time. The current v102 database contract does the opposite: each task exposes authoritative `daily_limit`, `taken_today` counts completed/rewarded work, and the next completion after the configured limit is rejected.

Classification:
- Priority/severity: P0 / HIGH user-facing economy-contract correctness risk.
- First known in this planning run: 2026-09-15.
- Latest reproduction: 2026-09-15 production public `/guide` plus current `main` v102 contract.
- Affected users: new/existing users learning profession work through the public guide; support/operator teams; SEO visitors who may rely on indexed guide text.
- User impact: misleading reward expectations, failed attempts after the real quota, trust loss, support load, possible abuse attempts based on obsolete unlimited-reward copy.
- Root cause: public guidance did not move with the latest authoritative DB contract.
- Required owners: web/public content + mobile/web user copy + documentation/SEO metadata; backend/DB require validation, not an additional design change in this planning run.
- Migration: no documentation migration. Existing DB migration is immutable. Any behavior rollback requires a new migration.
- Rollback: public copy can be reverted separately; economy migration/history must not be edited.
- Required QA: real-DB zero/partial/full/over-limit cases; profession switch isolation; concurrent completion; Seoul-day rollover; API schema parity; web/mobile display parity; public guide E2E/content assertion.
- Test-server acceptance: exact candidate SHA serves synchronized wording and quota behavior; DB smoke and relevant E2E pass.
- Production promotion: same-SHA promotion only after normal fail-closed gate.
- Monitoring: work-completion 4xx/5xx and quota rejection rates, reward receipts, support complaints, duplicate reward/replay signals.
- Status: TODO for public/runtime wording correction; backend quota restoration exists on `main` but is not independently certified for production by this planning run.

### CI/test evidence

- Connected GitHub combined-status lookup for the starting SHA returned no visible statuses.
- Commit workflow lookup returned no visible workflow runs.
- This is recorded as `verification unavailable`, not a CI failure and not a pass.
- Authenticated user flows, exact-SHA isolated test deployment, database migration execution in the test environment, and production economy E2E were not independently executed here.

## Planning decisions integrated

### Per-feature implementation contract

Every major feature family now requires implementation status plus concrete UX, authority/data ownership, API, DB, concurrency, observability, admin operations, security/privacy/abuse, SEO, analytics, performance/cache, profitability, QA, deployment and rollback contracts.

### Security

- Object-ID APIs require both allowed-object and another-user negative authorization tests.
- Auth/session requires credential-stuffing/rate-limit, rotation/fixation, logout/invalidation, OAuth state/nonce/PKCE/exact redirect, recent reauth, CSRF, cookie and secret/log tests.
- Economy requires idempotency/replay/concurrency, duplicate reward, multi-account/collusion/manipulation, precision, ledger reconciliation and DB least-privilege verification.
- Upload/UGC requires decoded-type validation, limits, isolated storage, delivery authorization, metadata/privacy, moderation/report/block and malicious-link/phishing checks.
- CRITICAL/HIGH security failures block promotion.

### SEO backend

- Server-owned deterministic canonical generator.
- Dynamic sitemap of public/indexable canonical URLs only, with authoritative last-modified data and sitemap splitting.
- Authentication + noindex/X-Robots for private account/admin/wallet/transaction/recovery/security/private-holdings paths; robots.txt is not a confidentiality boundary.
- Explicit permanent redirect map for stable slug changes.
- Crawlable SSR/ISR primary content.
- Canonical/noindex handling for filter/sort/search/query variants.
- Breadcrumb structured data only where semantically visible.
- Safe image metadata/alt/dimensions and EXIF/private-name avoidance.
- Consistent multilingual canonical/hreflang policy.
- Search Console/Naver crawl/index/canonical/sitemap monitoring connected to organic visit → signup → activation → D7/D30 → revenue.

### Profitability

Each monetized or cost-saving feature now requires hypothesis/test values for price, conversion/attach/repeat/renewal, refund/churn, fees/tax/refund, infra/storage/CDN/notification/LLM, content/CS/moderation/fraud, gross and contribution margin, CAC/LTV/payback, optimistic/base/conservative sensitivity, D1/D7/D30 impact, trust/legal risk, and SCALE/ITERATE/HOLD/KILL decision thresholds.

Advertising is evaluated as net contribution after ad-induced churn/session loss/support burden, not raw impressions. Security/QA/backup/SEO/admin work is valued through avoided incidents, fraud, refunds, support cost and retained customer/organic value.

## Repository writes

Documentation-only writes to `main` in this run:

1. `docs/changelog/2026-09-15-integrated-planning-audit-v2026.09.15.103.md`
2. `docs/changelog/2026-09-15-integrated-planning-audit-v2026.09.15.103.ko.md`
3. `docs/planning/PROJECT_PLAN.md`
4. `docs/planning/PROJECT_PLAN.ko.md`
5. This worklog.
6. Korean counterpart worklog.

The English and Korean Living Project Plan versions are synchronized for the new v103 integrated contract.

## Mid-work main synchronization

Before the planning-file writes, `main` was rechecked and was still `bb46906b786dd92e731be996ad8fc3c72e94f352`, so no external concurrent change needed rebasing at that point. A final main recheck is required after the worklog writes to record the resulting head and detect any later concurrent change.

## Deployment state

- Runtime/code/DB/API/infra change from this planning run: NONE.
- Test-server deployment from this planning run: NOT PERFORMED.
- Production deployment from this planning run: NOT PERFORMED.
- Runtime verification: PARTIAL.
- CI/test exact-SHA verification: UNAVAILABLE in this run.

## Rollback

Because all v103 changes are documentation-only, rollback is performed with normal Git revert of the v103 documentation commits while preserving all concurrent/runtime commits. Do not force-push `main`. No database rollback is associated with this planning release.
