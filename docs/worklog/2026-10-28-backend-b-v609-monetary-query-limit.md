# B v609 — Admin monetary listing query boundary (2026-10-28)

Status: IN PROGRESS / DRAFT HOLD. Starting main `a28bed9aa40ff74d492824ae12892a7d52132fdd`.

## Problem / evidence
Six admin monetary read routes coerce the raw `limit` query with `Number()` and truthy fallback. `?limit=0`, `?limit=`, `?limit=1e3`, `?limit=0x20`, whitespace and duplicate parameters can silently become unintended SQL LIMIT values. Auto-regulation events have no downstream bound. The services are read-only for these routes, but ambiguous query inputs must be rejected before DB access.

## Contract / implementation plan
- [x] Inspect current main, AGENTS, QA v1342, planning EN/KO, other open PRs.
- [x] RED: HTTP tests for all six endpoints, admin guard, defaults and invalid inputs.
- [x] GREEN: strict canonical decimal `1..50` limit parser; default 20 only when omitted. Reject duplicate arrays, zero, negative, whitespace, exponents, hex, leading zeros, floats, out-of-range.
- [x] Regression attempted: backend tests, lint/typecheck/build, API contract, security audit, isolated PostgreSQL; full release gates FAIL as recorded below.
- [x] Re-fetch main/planning; official Test exact-SHA unavailable; no merge/deploy.

Scope: no DB migration, no ledger writes, no admin mutation, no frontend UX change. Existing authentication/authorization guards remain. Current QA says official Test exact-SHA unavailable; production HOLD.

## TDD checkpoint 14:38 KST
- RED: original controller failed malformed HTTP query cases (84 failures; other repository DB tests were also triggered accidentally by broad test command). Captured `red.log`.
- GREEN: targeted `vitest run src/economy/monetary/monetary-query-limit.http.test.ts` 96/96 PASS; default 20, boundaries 1 and 50, 14 malformed encodings across six routes, guard 403 and no service call.
- Implementation: one canonical-decimal parser in `monetary.controller.ts`, no DB/ledger/contract response changes.

## Final local verification — 2026-10-28 14:49–14:52 KST
- Focused HTTP: 96/96 PASS; isolated PostgreSQL 17-alpine with dedicated `mv_b_v609` database and SELECT-only test role: 7/7 PASS (combined 103/103). Test container removed; **never** connected to shared dev/Production DB. Synthetic schema is not a full migration-parity or finance E2E proof.
- Backend full pre-final test: 2,023 PASS / 440 SKIPPED; final rerun recorded separately in PR. DB package PASS. API contract: 180 endpoints PASS. Full root lint: 0 errors, 1,102 warnings; typecheck PASS; backend build PASS. Bot tests: 11 PASS. Repository security, control-byte and Prisma guards PASS.
- Full frontend test: EPIPE worker crash during concurrent build/test resource pressure; known admin blog test also failed. Earlier direct Vitest run without `NODE_ENV=test` had 401 React.act failures and is not a valid production-like frontend test. **Frontend gate FAIL**.
- Root Next build: Next static-page worker SIGABRT; **root build gate FAIL** (backend build PASS). Root audit: 3 LOW + 9 MODERATE (qs advisory), **security gate FAIL**. QA v1342 also reports five applied migration checksum mismatches and overbroad application DML on shared live DB; not modified here.
- Official Test exact-SHA authenticated API/DB/finance E2E, independent backup restore and GitOps approvals: **BLOCKED**. No main merge, Test promotion, Production deployment, schema change, ledger write, or branch cleanup.
- Existing concurrent PRs #1695 (blog), #1696 (monetary audit docs), A/C/QA and their worktrees untouched.

## Latest main synchronization (14:53 KST)
During verification `origin/main` advanced to `2f2169a99698fdcf3a03867f532caca3ff599d77` (blog publisher integration and webpack build fix). This independent B branch was rebased cleanly; the prior candidate SHA `d3f9a3c8ceb2b1c0f9e6e06c443167dfccb8a06f` is superseded. EN/KO project plan reread; no conflict with monetary query validation. Focused and required gates must be rerun on the rebased SHA. Other branches untouched.
