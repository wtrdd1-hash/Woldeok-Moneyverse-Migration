# Woldeok Moneyverse — Living Project Plan

> Status: Living specification
> Original planning baseline: 2026-08-26
> Implementation sync: 2026-09-15
> Korean counterpart: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md)

## 0. How this document is maintained

This is not a frozen proposal. It is the project specification that must evolve with the validated implementation.

When implementation intentionally changes during development because the new design is safer, more maintainable, or better matches operational reality, the plan must be updated in the same workstream. When code accidentally violates a still-valid security, data-integrity, privacy, or product invariant, the code must be fixed instead of rewriting the plan to excuse the regression.

Every material implementation/specification divergence must record the reason, validation performed, effective date, and remaining risk. Applied database migrations remain immutable even when documentation is corrected.

English documentation is primary in GitHub; Korean documentation is maintained for product and operator parity.

## 1. Product definition

Woldeok Moneyverse is a community virtual-economy and game platform shared by the web service and Discord. Users authenticate through supported identity providers, earn and spend WLD, use jobs and progression systems, operate virtual businesses, use a virtual bank and stock market, and access community/game features.

WLD, stock positions, casino play, bank balances, rewards, and other economy values are service-internal virtual data. The service does not promise cash redemption, investment returns, real securities, real deposits, or real gambling products.

## 2. Current implementation baseline

The current application is built around:

- Next.js for the browser-facing frontend.
- NestJS for the internal application API.
- PostgreSQL as the authoritative economy and authorization boundary.
- PostgreSQL `SECURITY DEFINER` functions for sensitive reads and writes.
- A least-privilege application database role that does not receive direct write access to protected ledger/economy tables.
- A double-entry append-only ledger as the source of truth for value movement.
- Idempotency for retryable value-changing requests.
- Outbox-style post-commit delivery for external notifications/integrations.

Operational economy data uses PostgreSQL. SQLite is limited to local, isolated, single-process tooling or experiments and is not the production economy database.

## 3. Economy invariants

All value-changing operations must pass the economy core/database contract. No application path may directly update a user balance to perform an economy event.

A value-changing transaction must atomically validate policy and authorization, write ledger postings, update derived balances, and create required audit/outbox state. Debits and credits must reconcile. Non-negative account rules must be enforced unless an account type explicitly allows a negative balance.

The ledger and audit trail are append-only. Incorrect transactions are corrected with compensating transactions that reference the original transaction rather than editing or deleting historical rows.

Money values are stored and transported as integer units/string-safe values. Browser or server code must not convert authoritative WLD amounts into unsafe JavaScript `Number` values when precision can be lost.

## 4. Accounts and identity

Supported OAuth/OIDC flows must use modern authorization-code security controls, including state, nonce where applicable, exact redirect URIs, and PKCE where supported/required.

Provider identities may only be linked after authenticating the existing account. A provider subject already linked to another internal user must not be silently merged.

Session cookies are `HttpOnly`, `Secure`, same-origin scoped, and rotated on authentication/privilege changes as required. Sensitive account changes require recent reauthentication.

Secrets, OAuth client secrets, bot tokens, session keys, database credentials, and backup encryption keys must never be committed to Git, rendered to users, or written into ordinary logs.

## 5. Administrator model — implementation-synced

The original draft evolved during implementation. The current control model is a single `superadmin` with compensating security controls rather than a mandatory two-person approval workflow.

The implemented/admin security contract is:

- `AdminSessionGuard` protects admin routes according to their role/session requirements.
- Console entry and high-risk boundaries require fresh reauthentication as implemented by `ReauthGuard`.
- High-risk operations require a second factor through the implemented TOTP/`SecondFactorGuard` path.
- Sensitive PostgreSQL functions re-check the acting administrator/operator; HTTP/UI authorization is not the final trust boundary.
- Protected economy/audit tables do not gain direct application write grants merely because the caller is an administrator.
- High-risk changes require target/impact preview, reason capture, idempotency where appropriate, and append-only audit evidence.
- Existing ledger and audit history must not be rewritten or deleted by the administrator.
- Read-only operational/admin views should not add unnecessary step-up friction, but still require appropriate admin session/role checks.

TOTP is the current implemented second-factor baseline. WebAuthn remains a future option until implementation and QA exist.

The plan must not re-introduce obsolete two-person approval requirements merely because they appear in an older draft. If the project later adopts multi-party approval, it must be introduced as a new, tested policy with migration and operational design.

## 6. Administrator capability scope

The admin control center may expose tightly scoped, server-validated operations for users, economy reconciliation/corrections, rewards, jobs/progression, shop/business policy, virtual stocks, banking/loans, casino feature controls, seasons/content, Discord integration, Minecraft operations, feature flags, maintenance mode, backup/reconciliation state, and observability.

Each capability must be implemented only when the backing database/API contract exists. UI controls must not advertise mutations that the database cannot safely perform.

High-risk actions must show the current value, proposed value, affected targets, monetary/operational impact, rollback or compensating strategy, and required confirmation/reauthentication state.

## 7. Audit and observability

Admin actions, security-relevant failures, economy adjustments, policy changes, and sensitive operations must be traceable through structured logs and append-only audit records.

Audit data should include identifiers such as request/trace/session/action/target IDs, actor identity, authentication/reauthentication context, timestamps, before/after policy/value summaries when safe, result classification, related transaction IDs, and integrity-chain state where implemented.

Passwords, session cookies, access/refresh tokens, OAuth client secrets, bot tokens, database passwords, encryption keys, and unrestricted request bodies must never be logged.

## 8. Jobs, progression, shop, business, banking, stocks, and casino

Jobs use assignment → completion → verification → reward flows rather than an unverified reward button. Reward policy, cooldowns, limits, and experience are server/database controlled.

Progression unlocks content, roles, titles, business eligibility, and other non-cash advantages. Infinite multiplicative money bonuses are avoided.

Shop purchases use the authoritative server price/effective-price contract, inventory rules, purchase limits, and idempotent value movement.

Businesses must not be risk-free fixed compounding instruments. Revenue should depend on inventory, demand/activity, costs, fees/taxes, management state, and other modeled inputs as the system matures.

Loans require eligibility, purpose restrictions where applicable, repayment/arrears behavior, source-of-funds design, and recovery/restart paths. Loan money must not become an uncontrolled mint.

Virtual stock functionality requires server-defined issuance, pricing/trading rules, market controls, anti-manipulation rules, and safe settlement before expansion.

Casino/probability features remain service-internal and must use server-generated outcomes, published probabilities/payouts, user limits, idempotent settlement, and the same ledger invariants as every other value-changing feature. Cash redemption or external prizes are prohibited unless a separate legal/product review explicitly changes the product model.

## 9. Economy health and policy automation

Economy health measures include supply, mint/burn flows, treasury movement, asset concentration, reward/sink flows, market activity, and ledger/balance reconciliation.

Policy automation begins in proposal mode. Automatic policy application may only be introduced after sufficient observation, minimum sample thresholds, bounded change limits, rollback criteria, and explicit validation demonstrate that automated changes are safe.

Historical ledger data is never rewritten to make a policy metric look healthier.

## 10. Security baseline

The project follows a defense-in-depth model covering OAuth/session security, CSRF, authorization/BOLA, XSS/output encoding, input validation, rate limiting, secret management, file-upload validation, least-privilege database roles, container hardening, dependency/supply-chain review, backup/recovery, and operational incident response.

The browser must not receive internal API credentials. The internal API is not treated as a public general-purpose origin. Public integration endpoints must be explicit and independently authenticated/verified.

Uploaded files are allowlisted by actual decoded type/magic bytes, stored outside the web root, size/dimension limited, randomly named, and authorization checked before private delivery.

## 11. SEO, Search Console, ads, privacy, and legal gates

One canonical public origin should be selected for public content. Duplicate public origins should redirect or canonicalize consistently. Public pages use correct status codes, titles, headings, metadata, internal links, sitemap entries, and crawl/index controls.

Private/account/admin/transaction paths are excluded from search indexing through authentication plus appropriate noindex/X-Robots handling; `robots.txt` alone is not considered a privacy control.

Reviewed advertising is enabled by default on the existing allowlisted public-information/content surfaces. Production builds therefore use `ADS_ENABLED=true` unless an operator explicitly disables advertising for an emergency policy/compliance hold. The isolated test deployment explicitly uses `ADS_ENABLED=false` and empty AdSense identifiers so QA never generates real ad traffic. The public community-board index may carry one bottom placement separated from posting controls, while individual user-generated post/comment detail pages remain ad-free and subject to publisher UGC review/removal responsibilities. Ads remain blocked from login, wallet, transfer, market, casino/gameplay, admin, error, and other sensitive/interactive paths.

Privacy/terms/cookie disclosures must describe the actual implementation. Under-age handling, paid features, advertising, probability-based features, or any cash-value change require an updated legal/product review before release.

## 12. Pre-production verification and deployment

The isolated `wdmv-test` Kubernetes/Flux stack is active again. Every releasable `main` SHA must be deployed and validated there before Production. Test and Production use separate namespaces and PostgreSQL databases.

The deployment gate is fail-closed: CI and immutable test-image build must succeed, the exact application SHA must be observed on `test.easy-scraping.com`, the backend/database smoke path must pass, and only then may same-SHA Production images and GitOps manifests advance. If the dedicated test stack is unavailable or does not serve the exact SHA, Production automation stops.

A run must never claim “test server passed” if no dedicated test server was available.

Before merging/deploying, sync with current `main`, preserve other contributors' work, resolve conflicts without force-pushing `main`, and rerun the required checks after integration.

Production deployment is followed immediately by smoke checks for HTTP/API health, major user flows, authentication where testable, logs/errors, container/service health, resource use, and rollback readiness.

## 13. Database migration rules

Applied migrations are immutable. Any correction is made in a new numbered migration.

Migration parity and production checksum rules must remain intact. Schema/data changes need integrity checks, backward-compatibility analysis where applicable, and a realistic recovery strategy.

Destructive production data operations require an explicit safe recovery path and must never be hidden inside an unrelated feature change.

## 14. Documentation and work-log rules

Every material feature/security/operations change must update the relevant documentation in the same development flow:

1. Living Project Plan if product/architecture/security intent changed.
2. Feature/architecture/operations docs for the concrete implementation contract.
3. English changelog/release notes first, Korean counterpart second.
4. Work log containing findings, rationale, files changed, tests, failures/fixes, merge/deploy state, rollback notes, and unresolved risks.

Documentation is not updated to make a regression look intentional. A spec change must have a defensible implementation reason and evidence that the new design is acceptable.

## 15. Current priority gaps

The project should continue to reconcile and improve, in priority order:

- Keep the Living Spec synchronized with current admin/security implementation.
- Restore or replace a dependable isolated pre-production environment so production is not the first environment executing risky changes.
- Continuously verify database privilege boundaries and actor-scoped read/write functions.
- Maintain economy reconciliation, backup/restore proof, and production rollback readiness.
- Close user-visible feature gaps and stale UI contracts that make implemented backend capabilities unreachable.
- Continue responsive/accessibility/Core Web Vitals/SEO/Search Console checks.
- Keep ad placement, privacy disclosures, and probability/game features behind explicit policy/legal gates.
- Treat security, reliability, and specification drift as recurring operational work rather than one-time launch tasks.

## 16. Change record

### 2026-09-13 — default-on reviewed advertising v2026.09.13.37

- Changed the reviewed public-content advertising policy from default-off to default-on.
- Production builds now enable the approved AdSense publisher/slot automatically, while an explicit operator switch can still disable advertising.
- The isolated test deployment remains explicitly ad-free so staging traffic cannot generate real ad requests.
- Sensitive/account/economy/gameplay routes remain outside the advertising allowlist.

### 2026-09-09 — implementation synchronization

- Converted the plan from a frozen draft into a Living Spec.
- Standardized the production economy database on PostgreSQL.
- Updated the administrator design to the implemented single-superadmin model with admin-session validation, reauthentication, TOTP second factor, database actor checks, and append-only audit controls.
- Removed the obsolete mandatory two-person approval statement from the current plan while retaining stronger compensating controls.
- Recorded that the previous always-on test stack was retired, while preserving mandatory pre-production verification gates.
- Added the rule that implementation and plan documentation must be synchronized in the same workstream.

### 2026-09-09 — product expansion roadmap parity

The following roadmap mirrors the Korean Living Spec and is staged behind implementation, validation, and release gates. It does not redefine WLD or any virtual-economy feature as a real financial product.

#### P0 — discovery, return visits, and operations

- **Virtual-stock detail hub:** combine price/candles, server-defined indicators, member holdings, and related community content on one canonical page. The first member-facing hub slice is implemented at `/stocks/[symbol]`, linking market data, holdings, watchlist, chart/trading controls, comparison/alerts, and stock-tagged discussion.
- **Stock watchlist:** store per-member watched virtual stocks and expose them from stock/home surfaces. The first watchlist slice is implemented in PostgreSQL/NestJS/Next.js and remains subject to the normal release/deployment gates.
- **Public-content SEO:** continuously verify canonical URLs, metadata, sitemap/robots behavior, breadcrumbs, and internal links for anonymous public content.
- **Admin operations console:** expand read-model-driven user/economy/content/error/service-health views while keeping risky writes separated and step-up protected.
- **Administrator audit trail:** preserve actor/action/target/result, safe before/after summaries, and masked network context without secrets or unrestricted request bodies.

#### P1 — data and community integration

- **Stock-tagged community:** connect posts to virtual stocks so members can navigate between a stock detail surface and relevant discussion. The member-facing path is implemented: stock detail links into a stock-filtered board composer that opens automatically with the symbol prefilled, while existing server-authoritative tagged-post creation/listing contracts remain unchanged.
- **Stock comparison:** compare multiple virtual stocks with server-defined metrics on a consistent basis. The comparison route accepts validated stock-symbol deep links from the stock detail hub, keeps the browser URL synchronized with the current 2–3 stock selection, lets members copy that exact comparison link for later return or sharing, and shows exact integer-string-derived absolute and percentage change from the day open.
- **Conditional alerts:** support server-verifiable price/change/service-event conditions with cooldown and rate limiting. Price and daily-change rules are implemented, and stock-detail alert links now preselect the referenced virtual stock on `/stocks/alerts` so the cross-surface flow preserves member intent.
- **Economy/event calendar:** unify service events, virtual-stock events, quests, and shop events around dates. The member calendar now includes authoritative shop sale-ending deadlines alongside daily events, weekly resets, and season-event endings.
- **Account security center:** expose active-session review, other-session termination, login-security state, and future second-factor expansion.

#### P2 — personalization and summaries

- **Personal dashboard:** combine watchlist, recent activity, holdings, quests, and economy events for the signed-in member.
- **Portfolio analysis:** calculate valuation, allocation, and gain/loss from authoritative virtual-stock holdings while preserving WLD integer/string precision contracts.
- **AI-assisted summaries:** optionally summarize announcements, guides, or public community activity. Generated output must be visibly distinguished from source content, include provenance/time context, and never decide economy outcomes.

#### P3 — long-term expansion

Advanced economic analysis, recommendations, and simulation remain gated on data quality, operating cost, safety, product wording, and legal review. They must not bypass existing ledger, authorization, privacy, or probability-feature controls.

## 17. Integrated implementation, QA, SEO, security, and profitability contract — v2026.09.15.103

This section is normative for all feature families and supersedes generic phrases such as “improve security”, “add SEO”, or “consider monetization”. Any implementation backlog item must be concrete enough for another developer or agent to identify authority, data flow, error states, tests, deployment gates, and business consequences.

### 17.1 Current release-blocking findings

**P0 — profession-work quota contract drift.** Runtime `/guide` currently says profession work is repeatable without a daily limit and always pays full WLD/EXP. `main` v2026.09.15.102 instead restored server/database-authoritative task-specific `daily_limit`, `taken_today`, exact-limit completion, over-limit rejection, and per-member/per-task concurrency protection. Until public/mobile/web guidance is synchronized and revalidated, release notes and user education must not claim unlimited rewards. Acceptance requires real-DB tests for zero/partial/full quota, one-over-limit rejection, profession switch isolation, concurrent duplicate completion, Seoul-day rollover, and API/web/mobile parity. Applied migrations are immutable; behavior rollback requires a new migration.

**P0 — promotion evidence must be fail-closed.** CI success, immutable test image, exact-SHA test deployment, backend/database smoke, migration parity/checksum, critical user-flow QA, and rollback readiness are separate pieces of evidence. Missing GitHub status visibility is `verification unavailable`, not pass and not fail. Production promotion is blocked whenever required evidence cannot be proven.

### 17.2 Required per-feature specification

For identity/session, profile/security center, inventory/collection, shop/cart/payment/subscription, season/quest/job/progression, business/bank/loan, virtual stocks/portfolio/alerts, casino/probability, community/comments/report/block, friends/clubs/referral, notifications, search, uploads, public content, app API, admin/audit/backup, analytics/experiments, advertising, SEO, and incident operations, every backlog entry records: purpose and user problem; implementation status (`UNIMPLEMENTED`, `PARTIAL`, `IMPLEMENTED`, `REDESIGN_REQUIRED`); actor/role and entry points; first-use/return/comeback flows; loading/empty/error/offline/timeout states; responsive/accessibility/i18n behavior; server authority and data ownership; read/write permissions; endpoint/method/request/response/error/idempotency/rate limit; service rules; tables/indexes/constraints/transactions/concurrency; audit/metrics/admin operations; feature flag/fallback/backup impact; security/privacy/abuse; SEO/public-indexing rules; analytics/KPIs; performance/cache targets; profitability/cost model; unit/integration/E2E/real-DB/security/regression acceptance; test-environment gate; production promotion and rollback.

### 17.3 Security verification matrix

Object-ID APIs must perform server-side object authorization on every read/write and must include negative tests using another member’s identifier, consistent with OWASP API1:2023 BOLA guidance. Authentication/session work must test credential stuffing and rate limits, session fixation/rotation, logout/invalidation, OAuth state/nonce/PKCE/exact redirect URI, recent reauthentication, CSRF boundaries, cookie attributes, MFA/TOTP admin boundaries, and secret/log masking. Economy endpoints additionally require idempotency/replay, concurrent requests, duplicate reward prevention, multi-account/collusion/market-manipulation scenarios, precision checks, append-only ledger reconciliation, and least-privilege DB verification. Upload/UGC work requires decoded-type/magic-byte validation, size/dimension limits, isolated storage, delivery authorization, metadata/privacy review, moderation/report/block paths, and malicious-link/phishing defenses. A failed CRITICAL/HIGH security test blocks promotion.

### 17.4 SEO backend contract

SEO is a backend/read-model responsibility, not only page copy. Canonical URL generation is deterministic and server-owned. Dynamic sitemap generation includes only public, indexable canonical URLs and authoritative `lastModified`; split sitemap indexes before protocol limits become operational risk. Account/admin/wallet/transaction/recovery/security/private holdings pages are excluded from sitemap and are protected by authentication plus `noindex`/`X-Robots-Tag` where relevant; robots.txt is never a confidentiality control. Stable slug changes use explicit 301/308 redirect maps. Public content must expose core meaning in crawlable SSR/ISR HTML; filter/sort/search/query variants canonicalize or noindex rather than multiplying thin duplicates. Breadcrumb JSON-LD mirrors visible navigation and canonical URLs. Image metadata includes safe alt text, dimensions, optimized formats, and no private filenames/EXIF leakage. Multi-language public pages use consistent canonical/hreflang policy. Google Search Console and Naver Search Advisor monitoring must track crawl/index/canonical/sitemap errors and connect organic visit → signup → activation → D7/D30 → revenue. Core Web Vitals target good thresholds (LCP ≤2.5s, INP <200ms, CLS <0.1) for representative public templates.

### 17.5 Monetization and profitability contract

No paid feature is approved from gross-revenue intuition alone. Each subscription, one-time/non-consumable/consumable item, sponsorship, ad surface, or B2B2C feature carries price/test range and rationale; attach/conversion/repeat/renewal hypotheses; refund/cancellation/churn assumptions; platform/payment fees, tax, refund cost, infra/storage/CDN/notification/LLM cost; content/CS/moderation/fraud operations cost; gross margin and contribution margin; CAC, LTV, LTV/CAC and payback; optimistic/base/conservative sensitivity; D1/D7/D30 impact; trust/legal risk; and explicit `SCALE`, `ITERATE`, `HOLD`, `KILL` thresholds. Unknown values are labeled hypothesis/test targets. Subscription material terms and recurring billing are clear before charge, express consent is required, and cancellation must not be obstructed. Advertising optimizes `ad revenue - ad-induced churn/session loss/support burden`, never impression count alone. Security, QA, backup, SEO, and admin tooling are evaluated through avoided incident/fraud/refund/support cost and retained customer/organic value.

### 17.6 Store and catalog contract

Each shop SKU records canonical item ID/name/category/description/audience/value proposition; WLD vs real payment; consumable/non-consumable/subscription classification; server-authoritative price and test band; discount/bundle/coupon rules; inventory/sale window/purchase limit/duplicate behavior; account binding/gifting; refund/recovery/cancellation/renewal; grant/inventory reflection and idempotency; economy sink/source impact and P2W classification; retention/revenue hypothesis; KPI and fraud controls; API/DB/admin lifecycle; and QA. Fake scarcity, resetting countdowns, hidden personalized pricing, wealth/profit/casino prestige as default aspiration, and paid competitive advantage are excluded.

### 17.7 Priority and release order

Priority order is: `P0 data loss/security/auth/authorization/asset duplication/economy abuse/DB integrity/promotion evidence` → `P1 major user-visible correctness and core-flow completeness` → `P1 monetization contract and store/payment correctness` → `P1 SEO backend/public acquisition` → `P2 retention/growth` → `P2 accessibility/responsive` → `P3 long-term expansion`. Every item carries status, evidence, acceptance conditions, QA gate, dependencies, rollback and business-effect hypothesis.

### 17.8 Current runtime and QA reality

Production public status currently reports the web service, economy API, and ledger database healthy at its latest recorded snapshot. Public home/status/guide are reachable, but authenticated flows were not independently executed in this documentation-only run. The connected GitHub status/workflow lookup did not expose checks for the starting `main` SHA, so CI/test-server success is not claimed. Runtime verification is therefore partial.

### 17.9 External reference decisions

Directly adopted: Google canonicalization/Core Web Vitals/Breadcrumb guidance; Naver crawler/sitemap/canonical/robots guidance; OWASP API BOLA/Broken Authentication, OWASP Top 10:2025 and ASVS as verification references; FTC 2026 subscription enforcement as a consumer-protection signal; Apple subscription/billing-recovery documentation as platform economics/renewal reference. Platform-specific revenue percentages or recovery durations are not assumed to apply to Moneyverse unless the corresponding platform/payment model is actually adopted.

### 17.10 Change record — v2026.09.15.103

- Integrated development/QA/SEO-backend/security/profitability requirements into the Living Project Plan.
- Elevated the public unlimited-work copy vs authoritative daily-quota implementation mismatch to P0 release-blocking contract drift.
- Formalized fail-closed promotion evidence and `verification unavailable` semantics.
- Added a required per-feature contract covering UX, API, DB, security, operations, analytics, economics, QA and rollback.
- No runtime/code/database/infrastructure change is performed by this planning update.

## 18. Integrated release-governance and feature-evidence audit — v2026.09.15.104

This section is normative and adds evidence-backed implementation status, concrete release blockers, SEO route contracts, security threat controls, business economics, and QA acceptance gates. It does not authorize a runtime deployment.

### 18.1 Release blocker register

#### QA-104-01 — P0 — OPEN — profession-work quota guidance still contradicts authoritative behavior

- **First recorded:** 2026-09-15 v103. **Reproduced:** 2026-09-15 in Production anonymous `/guide`.
- **Evidence:** Production guide still states that profession work can be repeated without a daily count limit and pays full WLD/EXP each time, while current server/database policy uses task-specific `daily_limit`, `taken_today`, exact-limit acceptance, over-limit rejection, and per-member/per-task concurrency protection.
- **Affected users/functions:** all new/returning members using the guide before choosing work; support, mobile clients and any SEO snippet derived from the guide; economy expectation and trust.
- **Root cause:** confirmed specification/content drift. The public copy was not updated when the authoritative quota contract was restored.
- **Change targets:** frontend guide content and structured metadata; any mobile/app guide copy; public FAQ/help; endpoint/schema examples that still imply unlimited full reward; product analytics labels. The database contract is not changed by this fix.
- **Required behavior:** show per-task limit/cooldown where available, `takenToday`, remaining rewarded completions or a plain-language equivalent, and the exact reset timezone/policy. If repeated play after the rewarded quota is allowed, the UI must explicitly distinguish “play allowed” from “full reward eligible”.
- **Migration:** none for copy synchronization. Never edit an applied migration. Any future economy-policy change requires a new migration/policy version.
- **Rollback:** content-only revert to the previous verified accurate wording; never rollback by reintroducing unlimited rewards merely to match stale copy.
- **QA:** unit/static regression preventing the prohibited unlimited-full-reward phrase; API/real-DB tests for 0/partial/exact-limit/+1 limit; concurrency double-submit; profession/task isolation; Seoul-day reset boundary; retry/idempotency; web/mobile response parity; authenticated E2E from work selection through receipt and quota display.
- **Test acceptance:** exact test SHA serves the corrected guide and the same SHA passes the authenticated quota matrix against isolated PostgreSQL.
- **Production promotion:** BLOCK until corrected copy and quota behavior are verified together. Monitor quota-rejection rate, duplicate-reward signal, support reports, work completion conversion and D1/D7 retention after release.
- **Business impact hypothesis:** accurate limits reduce support disputes and accidental inflation; success is lower mismatch/support rate without a material reduction in meaningful job activation.

#### REL-104-02 — P0 — OPEN — automated Production-ready gate proves less than the Living Plan requires

- **First recorded:** 2026-09-15 v104. **Evidence source:** `.github/workflows/deploy.yml` versus sections 12 and 17.
- **Observed automation:** the isolated-test gate waits for the exact release SHA, verifies a non-empty public shop catalog, and verifies root `X-Robots-Tag: noindex`; after that it builds Production images and emits a `production-ready` deployment signal.
- **Gap:** the normative plan also requires migration parity/checksum, critical authenticated user-flow QA, database/economy integrity evidence, and rollback readiness. Those are not directly proven by the current isolated-test job before the `production-ready` signal. CI does run migrations and tests against a CI PostgreSQL instance, which is valuable but is not proof that the isolated test database has production-compatible migration parity or that authenticated test flows passed there.
- **Required change design:** add a fail-closed `release-evidence` stage before publishing `production-ready`. It must produce machine-readable evidence for: (1) exact backend/frontend SHA; (2) test DB migration version/checksum parity; (3) backend DB connectivity and least-privilege application role smoke; (4) authenticated synthetic-user session bootstrap/login/logout; (5) one representative read from wallet/profile and one non-destructive economy flow; (6) job quota/idempotency/concurrency smoke for releases touching reward code; (7) reconciliation/ledger health for economy migrations; (8) rollback target/image/manifests available; (9) test environment ads disabled and indexing disabled. High-risk feature families add their own gate.
- **Secrets/test accounts:** synthetic credentials/tokens belong in environment secrets; they must never be printed. A missing test identity or unavailable evidence is `BLOCKED`, not skipped-pass.
- **Migration:** no product migration required to strengthen the gate. If the evidence endpoint/read model requires schema changes, use a new migration and least-privilege read contract.
- **Rollback:** do not emit `production-ready`; preserve previous Production SHA. If a release was already promoted, rollback to the last known-good immutable SHA and use compensating transactions rather than rewriting economy history.
- **QA/monitoring:** intentionally break each prerequisite in a non-Production test to prove the gate fails; alert on repeated exact-SHA timeout, migration mismatch, auth smoke failure, reconciliation failure and rollback-artifact absence.
- **Business impact hypothesis:** prevents incident/refund/support/fraud costs. Quantify with expected-loss avoided = incident probability × expected impact plus avoided downtime/support/refund cost; do not invent a currency amount without incident data.

#### REL-104-03 — P1 — TODO — branch protection does not enforce required status checks

- **Evidence:** `main` is protected but GitHub reports required-status-check enforcement off with an empty check/context list. CI/test-candidate workflows exist and the scheduled auto-integrator validates exact development-branch heads, but repository protection itself does not prove that every direct runtime-code update to `main` passed those checks.
- **Risk:** a maintainer or automation path can land runtime code on `main` without the PR check being repository-enforced. Production promotion remains separately gated, so this is not equivalent to immediate Production compromise, but it weakens merge-quality guarantees and makes “main is releasable” ambiguous.
- **Required design:** create a ruleset/branch-protection policy for runtime-code paths requiring PR review or an approved automation path and successful CI/check contexts before merge. Prohibit force-push and deletion. Preserve the current documentation-only direct-main policy through the narrowest supported path/actor exception; a docs-only exception must not permit changes under `backend/`, `frontend/`, `packages/database/`, deployment manifests or security scripts.
- **QA:** attempt a failing runtime-code PR and a direct runtime-code push in a sandbox/repository test; both must be blocked. Confirm validated automation merge still works. Confirm docs-only automation can update the two planning files/changelog/worklog without gaining runtime-code bypass.
- **Business effect:** reduces unvalidated-main churn, incident probability and wasted QA capacity; no direct revenue claim.

### 18.2 Evidence-backed feature register and implementation contracts

Status is evidence-limited: `IMPLEMENTED` means current code/runtime evidence exists for the stated slice, not that the entire product family is complete; `PARTIAL` means some slices exist while required flows remain unaudited or incomplete; `UNVERIFIED` means planning may exist but this run lacks enough code/runtime proof; `REDESIGN_REQUIRED` means a verified implementation conflicts with a normative invariant.

| Feature family | Current status/evidence | Authority and UX/API/DB contract | Security/abuse and privacy | SEO/growth/business | QA gate |
| --- | --- | --- | --- | --- | --- |
| Registration/login/OAuth/logout/session | `IMPLEMENTED/PARTIAL`: Nest auth controllers/modules and local-email + Discord/Google provider bootstrap exist; app API coverage documents these flows | Server owns identity linking, consent, session issuance/rotation/revocation. UI must expose loading/provider-error/consent-required/session-expired/offline states and never infer login from client-only state. Linked-provider removal/account deletion require recent reauth where implemented. | Rate-limit credential attempts; detect credential stuffing; state/nonce/PKCE/exact redirect URI; session fixation rotation; CSRF; secure cookies; logout invalidation; no auth secret in logs/URLs. | Auth pages `noindex`; conversion KPI is visitor→successful verified session→meaningful activation, not raw form submit. Cost KPI includes auth-provider/support/fraud cost per activated D30 user. | Unit DTO/guard tests; replay/state mismatch; session fixation; cross-account linking; logout invalidation; mobile handoff one-time semantics; real-provider sandbox where available. |
| Account/profile/security center | `PARTIAL`: account controller and admin security controls exist; full member-facing security-center parity not assumed | Member owns profile and linked methods; active-session list/terminate-other-session must be server authoritative. Sensitive change uses recent reauth; admin uses stricter role/TOTP boundary. | BOLA negative tests on session/account IDs; notification of high-risk changes without secrets; audit security events; privacy-minimal profile defaults. | Private/account pages auth + noindex. Business value is lower ATO/support loss and increased trust, measured via takeover signals and security-support tickets. | Other-user session-ID denial; reauth expiry; terminate-all-other-sessions; lost-provider recovery; accessibility and mobile parity. |
| Inventory/collections/marketplace workbench | `PARTIAL`: recent inventory/marketplace planning and UI slices exist; live player-to-player settlement is not treated as complete | Ownership/provenance is server/DB authoritative. Empty/loading/error/offline states must not fabricate holdings. Any future listing requires explicit escrow, cancellation, expiry, settlement, fee and reversal rules. | Prevent BOLA, serial/ownership leakage, multi-account wash trading, collusion, duplicate grant/replay. Private holdings default noindex/private. | Retention KPI: acquire→use→curate→reuse; WLD spend is an economy sink, not real revenue. Secondary-market volume is not a success KPI until fraud-adjusted. | Ownership concurrency, duplicate entitlement, transfer denial, item rollback/recovery, private URL leakage, future wash-trade scenarios. |
| Shop/catalog | `IMPLEMENTED/PARTIAL`: public catalog is used by release smoke; WLD catalog/store exists. Real-money commerce is a separate unverified scope | Server-authoritative effective price, eligibility, purchase limit, sale window and entitlement grant. UX shows exact price/currency, ownership, duplicate behavior, sale end and receipt; timeout retries are idempotent. | No client price authority, replay/duplicate grant, fake scarcity, hidden personalized pricing, P2W or wealth/casino prestige as default aspiration. | Public catalog/collection editorial pages may index if substantial; member purchase history is private/noindex. WLD spending counts as sink/retention, never booked as revenue. | Effective-price tamper, boundary time, duplicate click, insufficient balance, concurrent purchase, entitlement repair, catalog cache invalidation. |
| Real-money cart/payment/subscription/ad-removal | `UNVERIFIED`: do not infer availability from WLD shop | Before implementation define provider, receipt/webhook signature, tax/refund, entitlement source of truth, renewal/cancel/recovery and idempotency. UI must show material recurring terms before charge and simple cancellation. | Receipt forgery, webhook replay, BOLA on order IDs, payment data minimization, PCI/provider boundary, refund abuse, chargeback/fraud monitoring. | Checkout/account/order pages noindex. Unit economics require net revenue after platform/payment/tax/refund/support/fraud/infra; define `SCALE/ITERATE/HOLD/KILL` before launch. | Provider sandbox, duplicate webhook, out-of-order renewal/cancel, refund/regrant, grace/billing-recovery, cancellation E2E; legal review gate. |
| Jobs/quests/progression/level/reward | `PARTIAL + P0 DRIFT`: authoritative quota slice exists; public guide is stale | DB/server owns catalog, minimum duration, cooldown, daily limit, reward/EXP and receipt. UI shows eligibility/remaining reward/next unlock and differentiates playable from reward-eligible. | Bot/macro, multi-account, replay, concurrent duplicate completion, clock/reset abuse; append-only reward receipt and reconciliation. | Job guide can index only after contract correction. KPI: TTFV, first verified job, D1/D7 progression, fraud-adjusted reward cost and inflation. | QA-104-01 matrix is mandatory and release blocking. |
| Business | `UNVERIFIED/PARTIAL`: product plan exists; this run did not prove complete runtime settlement | Must define inventory/demand/cost/fees/tax/management inputs; no risk-free fixed compounding. All value movement through ledger/idempotency. | Multi-account demand farming, circular purchases, refund/replay, admin manipulation, integer precision. | Public educational business pages may index; private business P&L noindex. KPI is retained gameplay and sustainable sink/source balance, not nominal WLD profit. | Real-DB settlement/reconciliation/concurrency plus abuse simulations before enabling expansion. |
| Bank/loans | `UNVERIFIED/PARTIAL`: public guide describes deposit/bond/loan concepts; complete current code/QA not proven this run | Server owns eligibility, source-of-funds, interest/accrual schedule, repayment, arrears, purpose restrictions and recovery. Exact game-only wording mandatory. | Loan mint abuse, double repayment, clock manipulation, BOLA, loss-chasing nudges; never imply real deposit safety or guaranteed real yield. | Financial-looking public content needs game/simulation labels and source context; private debt/balance noindex. | Time-boundary accrual, idempotent repayment, insufficient funds, concurrent payment, restart/recovery and ledger reconciliation. |
| Virtual stocks/watchlist/portfolio/alerts/comparison | `PARTIAL`: detail hub, watchlist, comparison and alert slices are documented as implemented | Public market data and member holdings are separate read models. Trading/settlement server authoritative; URL state may contain public symbols only, never private holdings/session identifiers. | BOLA holdings, market manipulation/collusion, duplicate settlement, alert spam/phishing, precision errors. | `/stocks/[symbol]` may be canonical/indexable only with public-safe substantial content; watchlist/portfolio/alerts are private/noindex. KPI includes discovery→activation→D7, not trade volume alone. | Other-user holdings denial, symbol validation, large integer precision, alert cooldown, settlement idempotency, manipulation scenarios. |
| Casino/probability | `PARTIAL/high-risk`: runtime/public guide references the feature; full release evidence remains high-risk | Server generates outcome, publishes probability/payout/limits, settles atomically, reuses result for same idempotency key. | Bot/replay, RNG/result tampering, limit bypass, multi-accounting, loss chasing, youth risk; never connect to cash redemption/external prize without separate legal redesign. | Gameplay and account-specific probability history noindex; avoid acquisition/SEO promises framed as winnings. Revenue is zero unless a separately reviewed real-money model exists. | Probability distribution sanity, deterministic replay receipt, max-loss/limit boundary, concurrency, ledger reconciliation, legal/product gate. |
| Community/posts/comments/report/block | `PARTIAL`: public/community surfaces exist; full moderation feature parity must be audited | Server owns authorship/edit/delete/moderation state; clear empty/loading/deleted/locked states and report/block feedback without leaking enforcement details. | Spam/bot, harassment, impersonation, doxxing, malicious links, XSS, BOLA, moderator abuse; immutable moderation audit where appropriate. | Board index may be indexable if curated; individual UGC defaults to quality/moderation policy and can remain noindex. Ads remain off individual unreviewed UGC detail. | Stored-XSS/link tests, other-user edit/delete denial, report spam, block semantics, moderation audit, deletion/index removal. |
| Friends/clubs/referral | `UNVERIFIED/PARTIAL`: growth planning exists; full implementation not claimed | Define invite lifecycle, membership/role, privacy visibility, leave/kick/ban, referral attribution and reward maturity. | Invite spam, fake accounts, referral fraud, collusion, private-club leakage, impersonation. Rewards prefer cosmetic/status convenience and mature only after fraud-resistant milestones. | Public club pages only by explicit visibility; private membership never leaks in search/share URLs. | Multi-account/referral ring, invite replay, role escalation, privacy toggle, block interactions. |
| Notifications/email/push/Discord | `PARTIAL`: stock/service notification concepts exist; all-channel parity not assumed | Event source, preference, cooldown, dedupe, delivery status and deep-link target are server owned. Notification text excludes sensitive balances/debt/security state. | Phishing/ATO imitation, webhook abuse, spam, secret leakage; canonical-domain deep links; opt-out/consent requirements. | Not indexable. Business KPI is incremental healthy return minus opt-out/spam/support/privacy cost. | Dedupe/cooldown, stale deep link, revoked session, opt-out, provider failure, retry/outbox tests. |
| Search | `UNVERIFIED` | Public search must use safe public read models; private/member search authorization is explicit. Query parsing, pagination, empty/no-result and timeout behavior specified. | Injection, expensive-query DoS, private-object enumeration, search-log PII. | Search-result pages generally noindex unless deliberately curated canonical landing exists; avoid thin query-page indexing. | Authorization, special characters, pagination stability, rate/complexity limits, relevance regression. |
| Upload/gallery/files | `PARTIAL/spec-level unless code evidence is linked per feature` | Server validates decoded type/magic bytes, size/dimensions, random name, isolated storage and authorized delivery; strip private EXIF where applicable. | Polyglot/malware, path traversal, decompression bombs, SSRF from remote fetch, BOLA delivery, metadata leakage. | Private media noindex; public images use safe alt/dimensions and stable URLs only after moderation/permission. | Malformed/polyglot, oversized dimensions, unauthorized read, metadata stripping, storage failure/recovery. |
| Public content/home/guide/status | `IMPLEMENTED`: anonymous Production pages reachable | Public read model must fail honestly; status timestamps show measurement age; guide contracts must match server behavior. | No secret/internal topology beyond safe operational disclosure; prevent reflected/stored XSS and phishing lookalikes. | Canonical/indexable subject to quality. `/guide` SEO expansion is HOLD until quota drift closes. | HTTP/status/canonical/meta/structured data/accessibility/CWV/content-contract regression. |
| App API/mobile gateway | `PARTIAL/COVERAGE DOCUMENTED` | Versioned `/app-api/v1` contract; wrapper keys and response shapes are stable; mobile handoff is one-time and server verified. Backward compatibility or version bump required for breaking changes. | Token/handoff replay, BOLA, rate limit, CORS/origin assumptions, PII/log masking. | API endpoints noindex. Business value measured by mobile activation/retention and support burden. | Contract snapshot, old-client compatibility, one-time handoff, auth expiry, error-code parity. |
| Admin/audit | `PARTIAL/IMPLEMENTED controls`: AdminSessionGuard/Reauth/TOTP and protected DB functions documented | Read operations and risky writes separated. High-risk write shows target/current/proposed/impact/reason and uses audit/idempotency/step-up. | Privilege escalation, session theft, CSRF, BOLA, mass-action abuse, audit tampering. Single-superadmin residual risk remains; TOTP/reauth/audit are compensating controls. | Always noindex/auth. Business value = avoided incident/operator error/support cost. | Other-role denial, expired reauth, missing/invalid TOTP, mass impact preview, audit integrity, rollback/compensation. |
| Backup/recovery | `UNVERIFIED EVIDENCE in this run` | Define RPO/RTO, encrypted backup ownership, restore target, checksum, restore drill and application/ledger reconciliation. Backups are not “healthy” until restore is proven. | Key theft, unencrypted snapshot, excessive retention, restore to wrong environment, destructive operator action. | Not public/indexable. Value = avoided catastrophic loss/downtime. | Scheduled restore drill in isolated environment, checksum, migration parity, ledger reconciliation, access audit. Destructive migrations blocked without current proof. |
| Analytics/experiments | `PARTIAL/SPECIFIED`: governance spec exists; per-feature event coverage not fully audited | Pseudonymous subject IDs; analytics session IDs are not auth secrets; event schema/version/retention/experiment assignment defined. | PII/secret leakage, re-identification, experiment manipulation, sensitive finance/security profiling. | SEO attribution joins only safe campaign/content IDs to downstream cohorts. | Schema validation, consent/retention deletion, experiment deterministic assignment, no-secret scanning. |
| Advertising | `IMPLEMENTED/PARTIAL`: reviewed public placements visible; sensitive-route allowlist policy exists | Ads only on approved substantial public surfaces; test environment forced off. Ad load and layout must not obscure CTA/content or masquerade as product action. | Invalid traffic, click encouragement, youth/privacy targeting, third-party tracking leakage, sponsor confusion. | Ads must not turn thin pages into index targets. Net KPI = ad revenue − churn/session/support/privacy cost. | Route allowlist, test ads disabled, CLS/CWV, ad-induced exit, policy review, invalid-traffic monitoring. |
| SEO backend | `PARTIAL`: policy exists and test root noindex is release-smoked; complete automated read-model/dashboard proof is not assumed | Deterministic canonical builder; public SEO read model; sitemap index/shards; redirect map; structured-data serializer; authoritative `updatedAt/lastModified`; crawler observations. | Private route leakage, cache poisoning, host-header canonical injection, PII in structured data/sitemap, admin endpoint exposure. | KPI organic visit→signup→activation→D7/D30→revenue and organic CAC savings. | Canonical host injection, sitemap privacy scan, redirect loops, SSR HTML, GSC/Naver errors, CWV representative templates. |
| Incident/status operations | `PARTIAL`: public status page exists; release evidence still incomplete | Separate public-safe status from internal telemetry; incident start/update/resolution timestamps; owner/severity/customer impact/rollback. | Over-disclosure of topology, fake status, admin abuse, alert fatigue. | Status page is trust infrastructure, not acquisition bait. Value = lower support load and faster MTTR. | stale-status detection, dependency outage simulation, rollback drill, customer-safe copy and post-incident review. |

### 18.3 SEO implementation matrix and backend backlog

SEO work is released only for content that independently helps an anonymous visitor. Current official Google guidance treats redirects, sitemaps and `rel=canonical` as canonicalization signals rather than guarantees; current Naver guidance prioritizes accurate unique titles/descriptions, crawlable HTML/resources and submitted sitemap/RSS feeds. Apply the following route policy:

- **`/`** — `PUBLIC_INDEXABLE`; canonical `/`; brand/product-purpose intent; unique title/H1/meta; Organization/WebSite structured data only where facts are accurate; OG/Twitter; stable hero image dimensions; internal links to substantial guides/content.
- **`/guide`** — `PUBLIC_INDEXABLE_BUT_HOLD_EXPANSION` until QA-104-01 closes. After correction, target beginner/game-system intent, not real-investment-return queries. `Article`/breadcrumb markup only when visible author/review/date hierarchy supports it. `lastModified` changes on meaningful editorial changes, not dynamic WLD ticks.
- **`/status`** — public and canonical if maintained as genuine service-status information. Never expose DB credentials, private hostnames, stack traces or user-specific state. Search visibility is secondary to trust/operations.
- **Public news/season/collection/world guides** — indexable when original, substantial and maintained; stable slug; breadcrumb; author/review/update metadata; image alt/dimensions; `lastModified` from editorial update.
- **`/stocks/[symbol]`** — only the public-safe stock/company/world read model may be indexable. Member holdings, watch status, orders, alerts and portfolio values are excluded from HTML/JSON-LD/cache shared with anonymous crawlers. Sitemap `lastModified` follows material public-content changes, not every price update.
- **Community index** — indexable only with moderated substantial discovery value. Individual UGC detail defaults to `noindex` until a documented moderation/quality rule approves indexing; deleted/removed content uses appropriate 404/410 and sitemap removal.
- **Search/filter/sort/pagination/query variants** — noindex/canonical unless a deliberately curated stable landing exists; query parameters never create doorway-page inventory.
- **Login/signup/account/security/recovery/wallet/transfers/private business/bank/loan/portfolio/watchlist/alerts/checkout/orders/subscriptions/admin/moderation queues** — `AUTH_REQUIRED` or `PUBLIC_NOINDEX`; excluded from all sitemaps. robots.txt is not confidentiality control.
- **Test origin** — global `X-Robots-Tag: noindex` plus sitemap/indexing disabled. The release gate already tests root `noindex`; expand to representative public paths to prevent route-level leakage.

Required backend components are implementation backlog, not optional copy work: `SeoMetadataReadModel` with safe public fields; canonical URL builder pinned to configured public origin rather than Host header; sitemap index/shard generator with URL count/byte safeguards; robots generator; structured-data serializer with schema allowlist; permanent redirect map with conflict/loop validation; public image metadata service; crawler-log classification; GSC/Naver ownership/config state; crawl/index/canonical/sitemap error ingestion; SEO operator dashboard/read API. Cache keys must include locale/content version but never auth/session identity for public SEO HTML. Invalidation must keep HTML, metadata, sitemap and redirects coherent.

### 18.4 Security threat register — v104 additions

| ID | Severity | Scenario/precondition/impact | Preventive control | Detection/log/alert | Test/deploy rule | Residual risk |
| --- | --- | --- | --- | --- | --- | --- |
| SEC-104-01 | HIGH | BOLA/IDOR: authenticated user substitutes another member/object ID; private holdings/session/order/report data exposed or changed | actor-scoped service/DB authorization on every object read/write; never trust client owner ID | structured authz denial metric with route/object type, no sensitive payload | negative other-user ID tests are mandatory; failure blocks release | logic gaps on newly added object paths |
| SEC-104-02 | HIGH | credential stuffing/session fixation/stolen session leads to account takeover | rate limit + abuse signals; rotate session on auth/privilege changes; recent reauth for sensitive actions; secure cookie/CSRF; provider-link uniqueness | auth failure velocity, reused IP/device signals, session rotation and high-risk action audit | fixation, logout invalidation, reauth expiry, OAuth state/nonce/PKCE tests; failure blocks release | distributed low-rate attacks and compromised providers |
| SEC-104-03 | HIGH | duplicate/replayed/concurrent economy request mints or spends WLD twice | idempotency key + unique constraints; DB transaction/locking; append-only ledger and reconciliation | duplicate-key/retry/concurrency anomalies and reconciliation mismatch alert | parallel request + retry replay + ledger balance tests; any unexplained mismatch blocks release | collusive multi-account behavior that is individually valid |
| SEC-104-04 | HIGH | release automation promotes a build without required migration/auth/rollback evidence | REL-104-02 fail-closed release-evidence stage; immutable SHA; separate test/production DB | deployment evidence record keyed by SHA; alert on missing evidence/timeout | intentionally break each gate; production-ready signal must not emit | external CI/GitHub outage causes safe blocking, not unsafe bypass |
| SEC-104-05 | MEDIUM | supply-chain workflow action tag changes unexpectedly | pin security-sensitive third-party actions to immutable commit SHA; Dependabot/review updates; production dependency audit/SBOM/provenance | dependency/action update review and audit alerts | workflow lint validates pinned action policy for chosen allowlist | compromise of trusted pinned artifact/upstream build infrastructure |
| SEC-104-06 | HIGH | upload/UGC carries malicious script/link/polyglot or leaks EXIF/private file identity | decoded-type validation, isolated storage, metadata stripping, CSP/output encoding, moderation/report/block | upload rejection/malware/moderation metrics; safe audit IDs | malformed/polyglot/XSS/link and unauthorized delivery tests | novel content/social-engineering payloads |
| SEC-104-07 | HIGH | admin/session abuse changes economy or exposes data | AdminSessionGuard + reauth + TOTP + DB actor check + least privilege + impact preview + append-only audit | high-risk action alert by actor/action/amount/result | expired reauth/TOTP, lower-role denial, CSRF, mass-action and DB privilege tests | single-superadmin compromise; no mandatory second approver currently |
| SEC-104-08 | MEDIUM/HIGH by data | analytics/ad/SEO payload leaks private economy/security state to third parties | event/public-field allowlist, minimization, retention/deletion policy, no auth tokens/balances/debt/security state in URL/structured data | schema validator + outbound-field sampling + privacy complaints | privacy payload tests and sitemap/JSON-LD scans; HIGH leak blocks release | third-party processor behavior outside direct control |

OWASP ASVS 5.0.0 is the verification baseline for technical controls. OWASP API Security API1:2023 is directly applied to object authorization and negative tests. These references define verification expectations; they do not imply compliance merely because a test list exists.

### 18.5 Profitability and cost-efficiency model

No real-currency revenue is attributed to WLD-only sinks. Financial reporting separates **game-economy activity** from **recognized real revenue**.

- **Security/QA/release governance:** value is avoided expected loss and faster recovery. Track incident frequency/severity, failed deployments caught pre-Production, downtime, refunds, fraud loss, support hours and restore/rollback time. Baseline formula: `avoided expected cost = Δincident probability × expected incident impact + avoided downtime/refund/support/fraud cost`. Inputs remain hypotheses until incident/ops data exists.
- **SEO/content:** `organic CAC = attributable content+SEO+tooling cost / incremental organic D30 retained users`; downstream KPI is organic visit→signup→activation→D7/D30→real net revenue or retained-user value. Kill scaled template creation when it increases indexed URLs without incremental activated/D30 users or degrades crawl/index quality.
- **Advertising:** `net ad contribution = ad revenue - estimated LTV loss from ad-induced churn/session reduction - ad infra/privacy/support/fraud cost`. SCALE only when D7/D30 guardrails and Core Web Vitals remain within predeclared tolerances; HOLD/KILL when incremental revenue is outweighed by retention/trust cost.
- **WLD shop:** evaluate sink health, item use/display, repeat healthy engagement, support/fraud cost and concentration. WLD purchase volume is not ARPU/real revenue. Avoid items that increase P2W or gambling/wealth pressure.
- **Future real-money one-time purchase/subscription:** prior to implementation create optimistic/base/conservative unit-economics table containing displayed price, taxes, processor/platform fees, refunds/chargebacks, content cost, entitlement/support/moderation/fraud/infra cost, net revenue, contribution margin, attach/renewal/churn assumptions, CAC, LTV and payback. FTC 2026 enforcement is adopted as a consumer-protection signal: material recurring terms before charge, affirmative consent, and non-obstructive cancellation are release gates.
- **Notifications/community/operations:** indirect value is incremental retained sessions/users minus send/provider/moderation/support/fraud cost. Never count notification opens or posts alone as revenue.

Every feature experiment declares a minimum observation window and sample sufficiency before `SCALE`; small cohorts use reversible tests and explicitly report uncertainty. No profitability claim may use a fabricated industry benchmark as Moneyverse observed data.

### 18.6 Development backlog and acceptance order

1. **P0 / QA-104-01 / owner sequence Frontend+Docs → API/DB QA → Web/Mobile E2E:** remove unlimited-full-reward guide drift, expose remaining quota accurately, run exact-SHA isolated DB matrix, then Production smoke.
2. **P0 / REL-104-02 / DevOps+Backend+DB+QA:** create machine-verifiable release-evidence stage for migration parity/checksum, authenticated synthetic smoke, economy/reconciliation conditions and rollback artifact before `production-ready`.
3. **P1 / REL-104-03 / Repository governance:** enforce runtime-code required checks/PR via branch rules while preserving a narrow docs-only automation exception.
4. **P1 / Security:** inventory every object-ID endpoint and add negative BOLA tests; inventory auth/session endpoints and complete fixation/rotation/logout/reauth tests; pin workflow actions according to approved supply-chain policy.
5. **P1 / SEO:** implement/verify public SEO read model, canonical builder, sitemap shards, redirect map, structured-data serializer, GSC/Naver ingestion and privacy scan. Hold aggressive `/guide` acquisition until QA-104-01 closes.
6. **P1 / Backup/recovery:** produce current restore proof, RPO/RTO, migration parity and ledger reconciliation evidence before destructive DB work can promote.
7. **P1/P2 / Monetization:** keep WLD economy separate from revenue accounting; instrument ad net contribution; do not start real-money subscription/payment implementation until provider/legal/unit-economics and receipt/webhook contracts are approved.
8. **P2 / UX/accessibility/growth:** after P0/P1 correctness, verify representative mobile/tablet/desktop flows, keyboard/focus/label/contrast/reduced-motion, comeback and D1/D7/D30 experiments.

Runtime implementation continues through a separate workflow: new branch → CI/static/unit/integration/real-DB tests → immutable candidate → isolated exact-SHA deployment → backend/API/DB/auth/user-flow/security QA → merge/integrate to `main` → exact-main-SHA test gate → Production-ready signal → GitOps Production promotion → Production smoke/observability → rollback if gate violated. This planning automation does not deploy runtime code.

### 18.7 Current runtime/QA evidence snapshot

- Starting and mid-run `main`: `3bfa41ce6c251b707254c09f7c3504d1e5245d28`; no concurrent change observed before this documentation update.
- Production public home, `/guide`, and `/status` were reachable. Status reported web/economy API/ledger DB healthy at its latest snapshot, but this is not authenticated feature QA.
- `/guide` reproduced QA-104-01, so the blocker remains OPEN.
- Repository contains CI, test-candidate, auto-integrate and Production-release workflows. CI runs clean-build lint/typecheck/build, PostgreSQL migrations/tests, secret/control-byte guards and high-severity production dependency audit. Candidate images use immutable SHA tags, SBOM/provenance, test indexing off and ads off.
- The Production release workflow verifies exact test SHA, non-empty public shop catalog and root `noindex`; REL-104-02 records the missing direct evidence versus the broader Living Plan gate.
- GitHub branch metadata reports `main` protected but required-status-check enforcement off/empty. Legacy combined commit status for the starting SHA was `pending` with zero status entries, and the available commit-workflow lookup returned no PR-triggered runs. CI success is therefore **not claimed**; verification remains partial/unavailable for that evidence class.

### 18.8 External research decisions — accessed 2026-09-15

- **Google Search Central canonicalization/current crawling guidance — DIRECT ADOPT:** canonical builder, redirects, sitemap and `rel=canonical` as coherent signals; no claim that canonical is an absolute command. Apply sitemap/lastModified only to meaningful content changes and keep crawlable SSR/HTML meaning.
- **Naver Search Advisor current SEO/index/sitemap guidance — DIRECT ADOPT:** accurate unique title/description, user-helpful content, crawlable resources/links, sitemap/feed submission and index-quality monitoring. Search optimization must improve user/content quality rather than produce thin query pages.
- **OWASP ASVS 5.0.0 (released 2025-05-30) — DIRECT ADOPT as verification baseline.**
- **OWASP API Security Top 10 API1:2023 BOLA / current authentication guidance — DIRECT ADOPT:** server-side object authorization, negative tests, session/auth failure controls.
- **FTC 2026 Shutterstock, Genesis Tech and Negative Option rulemaking/enforcement — REFERENCE/DIRECT GUARDRAIL:** if Moneyverse later introduces recurring real-money billing, disclose material terms, obtain affirmative consent and make cancellation straightforward. These actions are consumer-protection signals, not a claim that a specific US rule automatically governs every Moneyverse transaction.
- **Platform-specific fee/recovery percentages — HOLD:** do not put them into unit economics as facts until an actual payment/app-store provider is selected and its then-current official fee contract is verified.

### 18.9 Change record — v2026.09.15.104

- Reproduced the profession-work quota public-copy drift; kept it P0 OPEN.
- Added P0 release-automation evidence gap and P1 branch-protection required-check gap with concrete remediation/QA/rollback criteria.
- Added an evidence-backed implementation register spanning identity, economy, commerce, social, app API, admin, backup, analytics, ads, SEO and incident operations; unknown scopes remain explicitly UNVERIFIED rather than being guessed complete.
- Added public-route SEO/index matrix and concrete SEO-backend components.
- Added security threat register including BOLA, authentication, economy replay, release governance, supply chain, uploads, admin and privacy/analytics.
- Added feature/business cost models that distinguish WLD sinks from real revenue and define scale/hold/kill logic using retained value and contribution cost.
- No runtime code, database, API, infrastructure, branch setting or security implementation is changed by this documentation update.

## 19. Identity data-processing parity and authentication release audit — v2026.09.15.105

This section is normative and extends the v104 all-feature contract without weakening any prior P0/P1 gate. The run re-audited the full feature register and found the largest new gap at the identity/privacy boundary: first-party email/password authentication is present in code, migrations and mobile API documentation, while the current public web login, guide and privacy notice remain OAuth-centric.

### 19.1 New and carried release issues

#### AUTH-105-01 — P0 — OPEN / PUBLIC ROLLOUT HOLD — local-auth processing contract is ahead of public privacy/login disclosure

- **First found/reproduced:** 2026-09-15. **Severity:** P0/HIGH because the gap concerns authentication credentials, consent and privacy disclosure. It does not by itself prove that an undisclosed Production mutation is currently enabled; this run did not create an account or mutate Production.
- **Repository evidence:** current `main` contains `LocalAuthController`; `POST /app-api/v1/auth/local/register`, `POST /app-api/v1/auth/local/verify-email`, `POST /app-api/v1/auth/local/login`; Argon2id password-verifier storage; normalized email and SHA-256 email hash; one-time verification-token hash; migrations for local email registration/verification; and mobile API coverage that treats first-party registration/login/email verification as covered.
- **Runtime/public-contract evidence:** Production `/login` currently offers Discord/Google only; Production `/guide` says users do not create a separate password; the current public privacy notice describes OAuth identity processing and Discord/Google external login but does not describe first-party email/password credentials, verification-token processing, local-auth retention/deletion or email-verification delivery as a separate data-processing purpose.
- **Affected users/functions:** native/mobile first-party registration, future web local-auth rollout, privacy/terms consent, account deletion and credential removal, SMTP verification delivery, recovery, support, security incident handling, analytics and any campaign that advertises local signup.
- **Root cause:** implementation/channel expansion landed after the public OAuth-centric disclosure contract and the public login/guide were not synchronized with that new credential-processing path.
- **Immediate product rule:** do not newly market or generally expose first-party local registration until the published privacy version and consent flow accurately describe the processing and exact-SHA QA passes. If Production already serves the app endpoint, preserve existing valid users and investigate exposure rather than destructively disabling accounts; new-registration gating must be reversible through a server-owned feature/rollout control. Proposed flag name is implementation-defined, not normative.
- **Required public disclosure/data contract before GA:** normalized email used for identity and verification/recovery; an email-derived hash used for lookup/uniqueness/security; Argon2id password verifier rather than plaintext password; display name; hashed verification token and its expiry/single-use behavior; consent/policy versions; authenticated session identifiers; verification-delivery metadata needed for troubleshooting; purposes; processor/SMTP transfer facts if applicable; retention and deletion/credential-removal rules; user-rights/contact procedure. Never publish internal hash/token values.
- **Retention:** migration evidence gives the pending verification token a 30-minute expiry. The exact cleanup schedule for expired pending registrations, credential retention after account deletion, legal/fraud holds and SMTP diagnostics must be documented and implemented before GA. Planning must not invent a retention duration that code/operations do not enforce.
- **Consent/versioning:** `/app-api/v1/auth/policy` remains the source of current `termsVersion`/`privacyVersion`; local registration requires current prelogin consent. A materially updated local-auth privacy notice requires a published version change and client use of the server version, not a hard-coded mobile version. Existing signed-in users follow the documented re-consent policy when `consentCurrent` becomes false.
- **Migration/rollback:** no applied migration is edited. Disclosure/UI synchronization needs no schema change unless deletion/retention enforcement requires a new data job/table/index. Rollback is feature exposure rollback plus restoration of the last accurate public copy; never remove or rewrite ledger history to delete an auth credential.
- **Status:** OPEN. **Promotion gate:** public local-auth GA BLOCKED until privacy/content/auth-doc parity, security tests and isolated exact-SHA acceptance pass.

#### AUTH-105-02 — P1 — TODO — canonical app-auth guide is stale against the cross-browser verification implementation

- **Evidence:** current `LocalAuthController.verifyEmail` does not use `SessionGuard` or `CsrfGuard`; it validates the bearer verification token through the credential repository and on success issues the signed-in session cookie/CSRF state. Migration/current mobile-complete documentation intentionally support opening the one-time verification link outside the original browser/cookie jar. `docs/app-auth-api-guide.md`, however, still tells clients to send the same prelogin cookie and current CSRF token to `POST /app-api/v1/auth/local/verify-email` and its minimal pseudocode preserves that obsolete dependency.
- **Impact:** new app implementations may incorrectly bind verification to the originating CookieJar, produce support failures when email opens in another browser, or maintain contradictory security assumptions.
- **Fix scope:** synchronize English/Korean app-auth guide, endpoint catalog/schema descriptions and generated examples with the controller contract. Explicitly state that register/login remain prelogin-session + CSRF guarded while verify-email is a one-time bearer-token exchange and therefore must receive stronger token secrecy controls instead of CSRF dependence.
- **QA:** documentation contract snapshot against OpenAPI/controller guards; same-browser and cross-browser verification; missing/invalid/expired/reused token; no-cookie success for a valid token; arbitrary CSRF header does not become an authorization primitive; cookie/session rotation after success; old-client compatibility.
- **Status:** TODO. This is P1 unless runtime testing reveals a client break/security bypass, in which case it escalates.

#### Carried blockers

- `QA-104-01` remains **P0 OPEN**: Production `/guide` still states unlimited full profession reward and therefore remains out of contract with authoritative daily quotas.
- `REL-104-02` remains **P0 OPEN**: the automated Production-ready gate still proves less than the Living Plan's migration/auth/economy/rollback evidence contract.
- `REL-104-03` remains **P1 TODO**: `main` is protected but repository metadata still reports required status checks unenforced/empty.

### 19.2 First-party authentication end-to-end contract

The following is the minimum implementation/operations contract for the existing local-auth slice. It supplements rather than replaces OAuth/OIDC requirements.

| Step | Endpoint/current authority | Required UX/state | Security/error contract | Data/side effects |
| --- | --- | --- | --- | --- |
| prelogin | `POST /app-api/v1/auth/prelogin-session` | create resumable pre-auth state; show retryable service failure, not a fake signed-in state | secure server cookie + in-memory CSRF; no secret logging | prelogin session only |
| policy | `GET /app-api/v1/auth/policy` | render current terms/privacy versions before local registration | server version is authoritative; clients never hard-code | read-only policy version |
| consent | `PUT /app-api/v1/auth/consent` | explicit terms/privacy/age acknowledgement; stale version returns refresh/review path | SessionGuard+CSRF, no silent consent | consent version/time bound to prelogin/user state |
| register | `POST /app-api/v1/auth/local/register` | email/password/display-name form; typo suggestion; pending-verification state; recoverable SMTP unavailable state | prelogin+CSRF, current consent required, generic accepted semantics, common-password rejection, 429 abuse control | normalized email, email hash, Argon2id verifier, display name, hashed one-time token; verification delivery |
| verify | `POST /app-api/v1/auth/local/verify-email` | email link may open cross-browser; success becomes signed-in; failure is generic and recoverable | bearer token is the authorization secret; no SessionGuard/CSRF dependency; single-use/expiry; no token disclosure in logs | completes account activation, invalidates/consumes pending token, issues session cookie + CSRF |
| login | `POST /app-api/v1/auth/local/login` | same public error for unknown email/wrong password; offline/429/5xx distinguished | prelogin+CSRF; dummy password work for nonexistent user; rate/abuse controls | verifies Argon2id credential, issues/rotates session |
| viewer/session | `GET /app-api/v1/auth/viewer`, `GET /app-api/v1/auth/session` | client trusts server signed-in state only; consent-current state can route to re-consent | signed-in cookie authority; no client-only auth inference | read/refresh session state |
| logout | `POST /app-api/v1/auth/logout` | clear local UI only after server invalidation response; offline failure does not pretend remote session is revoked | signed-in session+CSRF; revoke server session/cookie | session invalidation + audit as appropriate |

**Rate limits:** register, login, verify and any future resend/recovery endpoint require separate server-configured budgets with IP/network, credential/email-hash and session/device abuse signals where privacy-safe. Numeric thresholds are not invented in this plan; the chosen values must be recorded in the implementation/config review, return `429` with bounded retry behavior, and be load/abuse tested. OWASP API resource-consumption guidance applies because SMTP/Argon2 work can also be a cost-amplification target.

**Idempotency/state:** registration must not create duplicate active accounts on client retries; verification of an already-consumed token must not issue additional identities; OAuth/local linking must not silently merge identities on email similarity alone. Any linking workflow requires an authenticated existing account, provider/credential ownership proof, collision handling and audit.

### 19.3 Verification-link, privacy and analytics boundary

The verification token is a short-lived bearer secret even though it is delivered in a URL. The current email sender puts the token in the verification URL query, so the verification surface must apply all of these controls before GA:

- `noindex`/`X-Robots-Tag` and exclusion from sitemap; no public structured data for token-bearing URLs.
- `Referrer-Policy: no-referrer` (or an equally strict validated policy) on the token-consumption response/page.
- no AdSense, third-party analytics, social widgets, remote marketing pixels or external images/scripts before the token has been exchanged and removed from the address bar.
- web/access logs, error telemetry and analytics must drop or redact query strings on this route; never store the raw verification token.
- consume/exchange once, then redirect/replace navigation to a clean canonical success/failure URL with no token. Browser history/back/reload must not re-expose a usable token.
- email-link preview/scanner behavior must not accidentally consume the token solely through a GET. State mutation remains POST/server action after an intentional verification step; QA must include link scanners/prefetch where practical.

Privacy analytics for local auth may record coarse state transitions (`prelogin_created`, `consent_completed`, `registration_accepted`, `verification_succeeded|failed_class`, `login_succeeded|failed_class`, `logout`) using pseudonymous subject/session identifiers. Never send email, email hash, password/verifier, raw token, session cookie, CSRF, OAuth code, recovery state or precise security signals to general-purpose product analytics/ad systems.

### 19.4 Security threat additions

| ID | Severity | Scenario | Prevent/detect | Mandatory test/deploy rule |
| --- | --- | --- | --- | --- |
| SEC-105-01 | HIGH | credential stuffing or password spraying against local login | generic errors, Argon2id, rate/abuse budgets, dummy work for unknown account, high-velocity alert without raw credential logging | distributed/sequential invalid-login tests; unexplained bypass blocks local-auth rollout |
| SEC-105-02 | HIGH | verification token leaks through URL referrer/log/analytics or is replayed | hashed server storage, short expiry, one-time consume, no-referrer, query redaction, no third parties before exchange | token log/referrer/analytics scan; expired/replay/cross-browser tests; raw-token leak blocks release |
| SEC-105-03 | HIGH | local email collides with or is auto-merged into an OAuth identity, enabling account takeover | never merge by email similarity; authenticated explicit linking and uniqueness checks | cross-account/local-vs-OAuth collision matrix; any silent merge blocks release |
| SEC-105-04 | MEDIUM/HIGH | registration/resend/verification is abused to consume SMTP/Argon2/DB capacity | API4-style resource budgets, queue/provider limits, anomaly metrics, graceful 429/503 | load/cost-amplification test; provider outage must not loop mail or claim delivery |
| SEC-105-05 | HIGH privacy/trust | public privacy notice/consent omits credential-processing actually offered to users | rollout hold until published notice, consent version, deletion/retention and processor facts match implementation | policy-content snapshot in exact-SHA QA; mismatch blocks new public local registration |

### 19.5 SEO and public-content changes

- `/login`, any local-signup form, `/verify-email`, recovery/reset pages and authenticated security-center pages are `PUBLIC_NOINDEX` or `AUTH_REQUIRED` and excluded from all sitemaps. Their purpose is account security, not acquisition inventory.
- Verification-token query URLs never canonicalize to themselves. The only canonical candidate is a token-free informational route, and success/failure views must not expose account existence or private state to crawlers.
- `/privacy` and `/terms` remain public canonical legal/trust documents. Their `lastModified`/visible effective date changes only when policy text changes, and the server-published policy version used by consent must correspond to the actually published document.
- `/guide` remains acquisition/SEO expansion HOLD for two independent correctness reasons until fixed: profession quota misinformation (`QA-104-01`) and OAuth-only password wording that is incompatible with any decision to make local auth generally available.
- Google Search technical guidance is applied directly: public 200 pages can be indexed unless indexing is blocked; sensitive auth/token pages therefore require explicit noindex/auth controls rather than relying on robots.txt.

### 19.6 Profitability and business-value model for local auth

Local auth has no direct revenue in the current model. Its business case is **incremental activated/retained users and reduced single-provider dependency**, minus authentication operations cost.

Track: visitor/app-start → prelogin → consent → register accepted → email delivered → verified session → first meaningful action → D1/D7/D30; verification-delivery success/latency; time-to-verify; resend rate if implemented; login success/failure; ATO/credential-stuffing signals; fake-signup rate; support contacts per activated user; SMTP/provider cost; Argon2/CPU and DB cost; privacy/security incident workload; deletion/recovery workload.

Use `incremental local-auth contribution = incremental D30 retained-user contribution value - SMTP - auth compute/DB - support - fraud/abuse - privacy/security operations cost`. The D30 contribution value and attach uplift are hypotheses until measured; do not substitute industry averages. `SCALE` only if incremental D30 retention/activation improves without breaching ATO, privacy complaint, fake-signup, email abuse or support-cost guardrails. `ITERATE/HOLD` if verification drop-off or support burden is high. `KILL/ROLLBACK NEW SIGNUP` if disclosure cannot remain accurate, credential abuse becomes uncontrolled, or security tests fail.

### 19.7 QA, operations, rollout and rollback acceptance

Before local auth can be advertised or generally enabled, the same immutable SHA on isolated test must pass:

1. current policy version fetch and required consent; stale/missing consent rejection;
2. registration validation, known-domain typo handling, duplicate/retry behavior and SMTP success/failure semantics;
3. same-browser and cross-browser verification; no-cookie valid-token success; invalid/expired/reused token denial; link-scanner/prefetch safety;
4. local login unknown-email/wrong-password public-error equivalence, credential stuffing and 429 handling;
5. viewer/session confirmation, session rotation/fixation resistance, logout invalidation and CSRF on guarded mutations;
6. OAuth Discord/Google regression and cross-account provider/local collision/linking tests;
7. raw secret scan across application/access/error/analytics logs for password, verifier, verification token, cookie and CSRF;
8. privacy notice, terms, consent version, account deletion/credential removal and expired-pending-registration cleanup evidence;
9. mobile API schema/guide parity and old-client behavior; web login remains OAuth-only unless a separate web-local-auth rollout is intentionally approved;
10. SEO/privacy smoke: login/verify/recovery noindex, no token URL in sitemap/canonical, no ads/third-party analytics on token-consumption surface;
11. rollback: disable new local registration without invalidating existing legitimate sessions/accounts, preserve OAuth login and preserve append-only economy history.

Operator monitoring after rollout: registration/verification funnel, SMTP 4xx/5xx, queue latency, 429 by endpoint, failed-login velocity, token failure classes, account-link collision, signup fraud, deletion/recovery requests, support contacts, privacy complaints, D1/D7/D30. Alerts must contain pseudonymous IDs and safe error classes, not credentials or raw email/token.

### 19.8 Runtime/CI evidence snapshot for v105

- Starting and mid-run `main` remained `1679fe33a8b276035c4a8fc0ab8e79d42cb2f07c`; no concurrent change was observed before preparing this update.
- Production public home/login/guide/privacy/status were checked non-destructively. Login is OAuth-only in current web UX; guide still contains the known unlimited-work statement and OAuth-only password explanation; privacy is OAuth-centric; public status reports web/economy API/ledger DB healthy at its latest snapshot. Authenticated/mutating Production local-auth behavior was intentionally not exercised, so that runtime exposure remains `UNVERIFIED`.
- GitHub branch metadata still reports `main` protected with required-status-check enforcement off/empty. Legacy combined status for the starting SHA contains no status entries.
- A `Build Production Release` workflow run for the starting docs SHA completed as `skipped`, with `test-gate` and `build` skipped. The workflow itself only enters the test gate for manual dispatch or a successful `Build Test Candidate` workflow on `main`. Available evidence does not establish the exact upstream reason, so this run records **no Production promotion success** rather than guessing.
- `REL-104-02` therefore remains open: when a runtime release is eligible, the test gate still checks exact SHA, public catalog and root noindex but not the full normative migration/auth/economy/rollback evidence set.

### 19.9 External reference decisions — accessed 2026-09-15

- **OWASP ASVS 5.0.0 (2025-05-30) — DIRECT ADOPT:** current stable application-security verification baseline for authentication/session controls.
- **OWASP API Security Top 10 2023 — DIRECT ADOPT:** Broken Authentication, BOLA, Unrestricted Resource Consumption and Sensitive Business Flow abuse are directly relevant to local login, email verification and signup abuse.
- **Korea PIPC 2026 privacy-policy materials — DIRECT ADOPT as disclosure-design guidance:** current standard-policy materials emphasize documenting processing purpose, personal-data items, retention and user-rights procedures. Moneyverse must make those public facts match the actual local-auth processing before broad rollout.
- **Google Search Central technical/indexing guidance — DIRECT ADOPT:** publicly accessible 200 pages can be indexed; explicit noindex/auth controls are required for auth/token surfaces, and robots.txt is not the privacy boundary.
- **FTC 2026 negative-option/subscription actions — REFERENCE ONLY:** retain the existing guardrail for any future real-money recurring billing; it does not turn local auth or WLD into a paid product.

### 19.10 Change record — v2026.09.15.105

- Added P0 `AUTH-105-01` public-rollout hold for first-party email/password processing disclosure and consent parity.
- Added P1 `AUTH-105-02` for stale verify-email cookie/CSRF instructions versus the current cross-browser bearer-token implementation.
- Added endpoint-level local-auth UX/API/data/security/SEO/analytics/profitability/QA/rollback contracts.
- Added verification-token URL privacy/SEO controls and auth-specific threat cases.
- Reconfirmed QA-104-01 and REL-104-02 as P0 OPEN and REL-104-03 as P1 TODO.
- Recorded current workflow evidence accurately: Production Release for the starting docs SHA is skipped; no Production promotion pass is claimed.
- All v104 feature-family contracts remain normative unless explicitly superseded above. No runtime code, database, API, infrastructure, branch policy or security implementation is changed by v105.
