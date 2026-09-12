# Woldeok Moneyverse — Living Project Plan

> Status: Living specification
> Original planning baseline: 2026-08-26
> Implementation sync: 2026-09-09
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

Advertising remains disabled by default until policy/review gates are complete. Ads are restricted to allowlisted public information/content pages. The public community-board index may carry one bottom placement separated from the posting controls, while individual user-generated post/comment detail pages remain ad-free and subject to publisher UGC review/removal responsibilities. Ads remain blocked from login, wallet, transfer, market, casino/gameplay, admin, error, and other sensitive/interactive paths.

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

- **Virtual-stock detail hub:** combine price/candles, server-defined indicators, member holdings, and related community content on one canonical page.
- **Stock watchlist:** store per-member watched virtual stocks and expose them from stock/home surfaces. The first watchlist slice is implemented in PostgreSQL/NestJS/Next.js and remains subject to the normal release/deployment gates.
- **Public-content SEO:** continuously verify canonical URLs, metadata, sitemap/robots behavior, breadcrumbs, and internal links for anonymous public content.
- **Admin operations console:** expand read-model-driven user/economy/content/error/service-health views while keeping risky writes separated and step-up protected.
- **Administrator audit trail:** preserve actor/action/target/result, safe before/after summaries, and masked network context without secrets or unrestricted request bodies.

#### P1 — data and community integration

- **Stock-tagged community:** connect posts to virtual stocks so members can navigate between a stock detail surface and relevant discussion.
- **Stock comparison:** compare multiple virtual stocks with server-defined metrics on a consistent basis.
- **Conditional alerts:** support server-verifiable price/change/service-event conditions with cooldown and rate limiting.
- **Economy/event calendar:** unify service events, virtual-stock events, quests, and shop events around dates.
- **Account security center:** expose active-session review, other-session termination, login-security state, and future second-factor expansion.

#### P2 — personalization and summaries

- **Personal dashboard:** combine watchlist, recent activity, holdings, quests, and economy events for the signed-in member.
- **Portfolio analysis:** calculate valuation, allocation, and gain/loss from authoritative virtual-stock holdings while preserving WLD integer/string precision contracts.
- **AI-assisted summaries:** optionally summarize announcements, guides, or public community activity. Generated output must be visibly distinguished from source content, include provenance/time context, and never decide economy outcomes.

#### P3 — long-term expansion

Advanced economic analysis, recommendations, and simulation remain gated on data quality, operating cost, safety, product wording, and legal review. They must not bypass existing ledger, authorization, privacy, or probability-feature controls.

The first P3 implementation slice is the `v2026.09.12.14` Economy Scenario Lab candidate: an administrator-only, read-only deterministic projection using current M2 and recent 24-hour issuance/burn figures. It does not write policy, ledger, balance, or database state and must pass the normal exact-SHA Test gate before Production. Recommendation or automatic-policy capability remains unimplemented and behind the gates above.
