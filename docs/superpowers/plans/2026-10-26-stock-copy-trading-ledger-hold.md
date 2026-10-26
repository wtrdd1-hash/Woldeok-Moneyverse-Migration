# Stock League Copy-Trading Ledger Hold — Implementation Plan

> **For agentic workers:** Use the repository's test-driven-development and verification-before-completion skills; do not treat a successful stub as a ledger-backed implementation.

**Goal:** Prevent unverified stock-league copy-trading subscriptions from being reported as active, while preserving idempotent cancellation of pre-existing subscriptions.

**Architecture:** Fail closed at both the NestJS controller and repository method. Preserve the existing session, authentication, consent and CSRF guards. Replace two independent cancellation writes with a single conditional writable PostgreSQL CTE. Do not change ledger data, applied migrations, or client-facing route paths.

**Tech stack:** NestJS, TypeScript, Vitest, PostgreSQL 17.

## Tasks and evidence

- [x] Read current main, AGENTS, README, EN/KO plans, open PRs, QA and P1 issue #1169; isolate a clean worktree.
- [x] Write RED tests for the unsafe subscribe success path, repository SQL access and non-idempotent cancellation; observe four failures on baseline.
- [x] Implement `503 COPY_TRADING_LEDGER_UNAVAILABLE` and repository fail-closed guard; preserve prior input validation.
- [x] Implement atomic active-only cancellation and add guard-preservation regression test.
- [x] GREEN: focused tests 10/10; isolated PostgreSQL 100 concurrent cancellations => one transition, 99 no-ops, follower count 0; constraint failure rolls back both changes.
- [x] Run local typecheck, lint, full tests, build, security scans and dependency audits; record all failures and skipped tests.
- [ ] Coordinate UI cancellation re-enablement with C/QA; browser-facing cancellation in #1168 is still held.
- [ ] Replace hold with owner-scoped restricted DB functions and balanced, immutable, idempotent WLD reservation/execution receipts.
- [ ] Pass full CI, official Test exact-SHA authentication/finance E2E and authorized GitOps release gates before main/Production.

**Explicit limitation:** This is Backend-level containment, not a database permission migration. Existing direct table DML and the full copy-execution engine remain outside this PR.
