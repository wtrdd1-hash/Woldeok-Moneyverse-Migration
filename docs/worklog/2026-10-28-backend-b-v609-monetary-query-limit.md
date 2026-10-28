# B v609 — Admin monetary listing query boundary (2026-10-28)

Status: IN PROGRESS / DRAFT HOLD. Starting main `a28bed9aa40ff74d492824ae12892a7d52132fdd`.

## Problem / evidence
Six admin monetary read routes coerce the raw `limit` query with `Number()` and truthy fallback. `?limit=0`, `?limit=`, `?limit=1e3`, `?limit=0x20`, whitespace and duplicate parameters can silently become unintended SQL LIMIT values. Auto-regulation events have no downstream bound. The services are read-only for these routes, but ambiguous query inputs must be rejected before DB access.

## Contract / implementation plan
- [x] Inspect current main, AGENTS, QA v1342, planning EN/KO, other open PRs.
- [ ] RED: HTTP tests for all six endpoints, admin guard, defaults and invalid inputs.
- [ ] GREEN: strict canonical decimal `1..50` limit parser; default 20 only when omitted. Reject duplicate arrays, zero, negative, whitespace, exponents, hex, leading zeros, floats, out-of-range.
- [ ] Regression: backend tests, lint/typecheck/build, API contract, security audit, isolated PostgreSQL where applicable.
- [ ] Re-fetch main/planning, record CI and exact-SHA release status. No merge/deploy without all gates.

Scope: no DB migration, no ledger writes, no admin mutation, no frontend UX change. Existing authentication/authorization guards remain. Current QA says official Test exact-SHA unavailable; production HOLD.

## TDD checkpoint 14:38 KST
- RED: original controller failed malformed HTTP query cases (84 failures; other repository DB tests were also triggered accidentally by broad test command). Captured `red.log`.
- GREEN: targeted `vitest run src/economy/monetary/monetary-query-limit.http.test.ts` 96/96 PASS; default 20, boundaries 1 and 50, 14 malformed encodings across six routes, guard 403 and no service call.
- Implementation: one canonical-decimal parser in `monetary.controller.ts`, no DB/ledger/contract response changes.
