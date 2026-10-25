# Development B v527 — P1 route-ledger exact-SHA evidence gate (HOLD)

## Scope and decision
- Source main at start: `c9a868b1e622341e2daa8b936ddf0988eda9988e`.
- Independent branch: `auto/hourly-b-route-ledger-provenance-v527-20261025-0935`.
- Source-backed issue: #1078. The package QA check supplied only fixtures and immediately failed for missing inventory; no authenticated five-pass E2E ledger was available. No overlapping open route-ledger PR was found. Development A/C and QA worktrees remain untouched.
- English canonical plan and Korean counterpart consulted; P0 isolation, DB ACL, and exact-SHA release gates remain outstanding.

## Code and QA contract
- `qa:route-ledger:check` now runs a fail-closed evidence runner. It requires independently generated `artifacts/qa/route-inventory.json` and `artifacts/qa/full-route-e2e-ledger.json`, supplies fixture catalog and actual Git HEAD to the verifier, and exits BLOCKED when evidence is absent. It does not manufacture test receipts.
- Inventory generation embeds the actual Git HEAD when `GITHUB_SHA` is not provided.
- Verifier independently recomputes SHA-256 over canonical inventory pages and checks inventory repository SHA, ledger candidate SHA and every route runtime SHA against the requested exact commit. Existing five-pass, admin-fixture, dynamic-scenario, and defect-id checks remain.
- No HTTP API/DB schema or ledger writes; QA release evidence contract only.

## TDD and validation
- RED: new tests detected missing content-hash check, missing exact-SHA checks, and unclear CLI invocation.
- GREEN: `pnpm qa:route-ledger:test`: 8/8 PASS; JS syntax checks PASS; generated inventory measured 168 routes, 34 admin, 31 dynamic; recomputed SHA-256 matched; inventory SHA matched Git HEAD.
- `pnpm qa:route-ledger:check`: intentionally BLOCKED because independently collected five-pass authenticated E2E ledger is absent. This is **not** a successful sitewide E2E run.
- Full application lint/typecheck/build/unit/real isolated PostgreSQL/security/app-api/auth E2E, GitHub required CI and official Test exact-SHA: not yet fully verified. Production remains HOLD.

## Review and release protection
- Do not merge or deploy on this local check alone. Candidate requires full CI, authenticated browser artifacts and SHA attestation, isolated PostgreSQL checks, and approved GitOps release gate.
- Production/dev DB sharing (#1053), broad app grants (#993), root disk at 100% (#1170) and auto-merge release gate (#1088) remain P0 blockers.
- No other automation schedules, worker branches, worktrees, Production/Test services or database contents were changed.
