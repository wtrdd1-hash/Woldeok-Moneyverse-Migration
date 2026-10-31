# Owner Profile App API Response Privacy Implementation Plan

> For agentic workers: follow test-driven-development and verification-before-completion; release remains HOLD.

**Goal:** Prevent Android profile member data and account settings responses from inheriting cacheable/indexable/referrer-leaking upstream headers.

**Architecture:** The existing Nest profile controller already binds member reads and writes to session/consent/CSRF. Enforce response privacy in the Next App API gateway's final `handle()` boundary for the entire `profile` path group, including gateway-generated errors and HEAD/204. Leave public catalogue routes and authentication contracts unchanged. Do not alter database grants, session forwarding or money operations.

**Tech Stack:** Next.js route handler, Vitest, NestJS existing profile controller, pnpm.

**Spec:** `AGENTS.md`, `docs/planning/PROJECT_PLAN.md` privacy/least-privilege constraints; this is a bounded hardening of existing `/app-api/v1/profile/*`.

## Global Constraints
- Canonical main `761a55a094fb9dd383d213e817305e68c79fa23c`; independent branch/worktree.
- No DB/migration/ledger/WLD changes, no live deployment, no direct table grants.
- `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, `Referrer-Policy: no-referrer` for all profile statuses and methods.
- Preserve public `stocks` upstream caching and response body/HTTP status; do not claim E2E without official exact-SHA Test.

## Review Focus
- HTTP 200 profile response with upstream `public, max-age` and `index, follow` must be private.
- HTTP 401/503 errors and HEAD/204 must be private.
- Early gateway rejection before upstream fetch must also be private.
- Public stock catalogue caching must remain unchanged.
- Cookie/session/CSRF must be forwarded unchanged.

## Task 1: RED/GREEN privacy regression
- [x] Add `frontend/src/app/app-api/v1/[...path]/profile-private.test.ts` with success, errors, HEAD/204, early gateway rejection, public control and session forwarding.
- [x] Run targeted Vitest and record expected failing assertions (RED).
- [x] Add minimal profile-only response header enforcement in `route.ts` final `handle` path.
- [x] Re-run targeted Vitest (GREEN) and inspect exact diff.

## Task 2: Verification and review
- [x] Run lint, typecheck, unit/integration, build, API contract, security and database checks where available.
- [x] Review branch vs fresh origin/main and open PR overlap; do not merge without all required gates.
- [x] Record API contract unchanged, no DB changes, test counts, exact SHA, release HOLD in internal log and Draft PR.

## Execution Evidence (2026-10-31 KST)
- RED: 9 failing/1 passing Vitest cases with cacheable profile upstream (first test-harness typo corrected before recording RED).
- GREEN: 10/10 profile privacy regression tests.
- Backend 2,778 PASS / 501 SKIP; Frontend 2,780 PASS; contract 41 PASS; DB package 62 PASS / 4 SKIP.
- Lint 0 errors (1,049 pre-existing warnings), typecheck and build PASS; mobile contract 184 endpoints PASS.
- Isolated PostgreSQL 17.11: 311/311 contiguous migrations; profile repository/DB/E2E 34/34 PASS; app-role users/identities SELECT and audit DELETE refused. Temporary DB destroyed.
- Security/release 35 PASS; production-only dependency audit PASS; full dependency audit FAIL (13 development advisories).
- Read-only official Test public gate FAIL: backend/frontend version unverified and Treasury fail-closed proof absent. This is not an exact-head Test deployment.
- Existing private response header work #2136/#2140/#2145/#2152 modifies the same gateway file; integration requires rebase and combined regression.
- No migrations, data writes, release, merge, or other worker branch changes. Draft/HOLD until independent exact-SHA gates.
