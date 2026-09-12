# Changelog

## v2026.09.12.14 — Read-only Economy Scenario Lab

- Added the first P3 implementation slice: an administrator-only deterministic economy scenario lab.
- Projects M2 from authoritative current supply plus recent 24-hour issuance/burn using bounded assumptions and integer-safe `BigInt` arithmetic.
- The feature cannot write policy, ledger, balance, or database state; recommendation and automatic application remain out of scope.
- Release remains gated on exact-SHA isolated Test verification before Production.

## v2026.09.12.13 — Automatic Test-to-Production GitOps Reconciliation

- Added an exact application SHA as the public build identity used by `/api/version`.
- A successful `main` Test Candidate now drives isolated Test GitOps reconciliation automatically.
- Production image creation starts only after the same SHA is live on Test and the backend/database catalog path plus noindex boundary pass.
- Successful same-SHA Production images publish a `production-ready` deployment signal; GitOps accepts only a signal matching the latest successful `main` candidate and re-checks Test immediately before Production mutation.
- Production GitOps reconciliation is followed by exact-SHA public smoke checks. Test/Production namespaces and PostgreSQL databases remain isolated.

## v2026.09.12.10 — Test-to-Production Deployment Gate

- Restored documentation parity with the active isolated `wdmv-test` Kubernetes/Flux environment.
- `main` pushes now build immutable exact-SHA test candidate images after the reusable CI gate.
- Documented the enforced promotion order: test GitOps promotion, test readiness/API smoke checks, same-SHA production image build, reviewed production GitOps promotion, and production smoke/data-integrity checks.
- Test and Production remain separate namespaces and PostgreSQL databases; Production is not the first runtime environment for a release candidate.

## v2026.09.12.2 — Detailed Product Design Specification

- Added a bilingual implementation-oriented detailed product specification.
- Defined player personas, information architecture, screen states and first-session/D1/D2–D7 onboarding.
- Added an 8-week/50-level season pacing proposal and concrete daily/weekly progression rules.
- Added WDX issuer reference prices, share counts, volatility bands, market hours, price-engine constraints, order limits, fees, issuer-event ranges, market mastery, replay and isolated league rules.
- Added concrete shop SKU examples, catalog rotation, ownership/purchase rules and non-pay-to-win boundaries.
- Added profession XP, job rewards/cooldowns, starter business economics, banking/loan parameters, quests, achievements, clubs, leagues, notifications and comeback flows.
- Defined economy faucets/sinks, monitoring bands, anti-abuse controls, analytics events, KPI hypotheses, live-ops cadence and ethical finance-gamification rules.
- Added a feature Definition of Done requiring server/DB authority, idempotency, analytics, abuse controls, testing, staging validation and bilingual documentation.
- Documentation-only update; no runtime, database or production configuration changes.

## v2026.09.12.1 — Product Growth & Retention Planning

- Added a dedicated bilingual product growth/retention plan.
- Defined onboarding, daily/weekly/seasonal loops and reactivation strategy.
- Proposed a fictional WDX stock universe, market-event model and staged trading progression.
- Defined shop product families, collections, rotations, social competition and referral loops.
- Added activation/retention/economy/growth KPIs, abuse controls and experiment backlog.
- Documentation-only update; no runtime, database or production configuration changes.

## v2026.09.07.2 — Localized Guide Parity

- Expanded all 10 localized READMEs into full guides instead of short summaries.
- Added the Production GUI showcase, responsive behavior, architecture, gameplay/economy, WLD precision, security, mobile API, deployment, backup and development sections to every language.
- Synchronized the same Job 2.0, casino, banking and security facts across translations.
- Documentation-only release; no runtime/database changes.

## v2026.09.07.1 — Documentation & Showcase

- Visual README showcase using real public Production screenshots.
- 10-language README and changelog portal.
- Architecture, request-flow, database-security and deployment diagrams.
- Feature docs for jobs, quests, casino, banking, stocks, businesses, shop and admin controls.
- Operations docs for development, migrations, backup/recovery, deployment and security.
- Detailed gameplay/UX worklog and screenshot provenance policy.

## v2026.09.07 — Gameplay, UX and Economy Stability

- Stabilized work-completion timeout/retry UX with one idempotency key per attempt.
- Fixed responsive brand/header behavior.
- Fixed casino server-result/UI drift and amount-type crashes.
- Added casino history and balanced exposure limits.
- Reconciled banking interest and credit policy paths.
- Added migrations 170–172 and validated official Test/Production deployment.
