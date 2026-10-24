# Verified Credit Policy Disclosure Implementation Plan

> For agentic workers: use test-driven-development and verification-before-completion, with independent spec and quality reviews.

**Goal:** Expose a trustworthy, owner-scoped virtual bank credit policy report on web and Android without exposing restricted tables.

**Architecture:** NestJS authenticated GET calls BankRepository projection of the existing SECURITY DEFINER bank standing. Next.js server page and dashboard card consume this read-only API; app-api gateway forwards it with private session headers.

**Tech Stack:** TypeScript, NestJS, Next.js, Vitest, PostgreSQL 17.

**Spec:** `docs/superpowers/specs/2026-10-25-verified-credit-policy.md`

## Constraints
- `origin/main` source of truth; separate `auto/hourly-*` worktree only.
- No applied migration edits, DB writes, privilege grants, or Number conversion of WLD balances.
- Owner authentication and consent required; private no-store/noindex; no fabricated score/approval.
- Production and main merge blocked until exact-SHA full gates and Test financial E2E PASS.

## Review focus
- 100-digit positive WLD limit stays exact.
- Missing or malformed bank standing returns unavailable, not zero or fabricated policy.
- Active loan suppresses new application eligibility.
- Anonymous and other-member requests cannot choose actor.
- Android proxy preserves private no-store, session and noindex; no cache leakage.

### Task 1 — Backend contract (RED/GREEN)
- [x] Add failing repository tests for strict projection, no direct table SQL, huge amounts, active loan and invalid data.
- [x] Add `BankRepository.getCreditPolicy` from `getStanding`; rerun tests.
- [x] Add failing controller actor/guard test and authenticated GET; rerun.

### Task 2 — Web/Android (RED/GREEN)
- [x] Add failing tests for private verified policy card and no fabricated score.
- [x] Add `VerifiedCreditPolicyCard`, authenticated noindex `/bank/credit-policy` and bank dashboard entry; rerun.
- [x] Add failing Android gateway regression and rerun with existing allowlist.

### Task 3 — Evidence and release
- [x] Run focused and full tests, typecheck, lint, builds, contract, security, real isolated PostgreSQL ACL and authenticated Test exact-SHA E2E.
- [x] Re-fetch main/integrated plan mid-run and pre-integration; review conflicts and CI.
- [x] Record before/during/after worklog, EN/KO release reports, branch counts, SHAs, PASS/FAIL/BLOCKED, rollback and deletion decisions; push Draft PR, no unsafe merge.
