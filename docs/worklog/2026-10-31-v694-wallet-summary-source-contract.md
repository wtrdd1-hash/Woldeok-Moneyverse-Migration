# v694 — Owner wallet glance source contract (DRAFT / RELEASE HOLD)

## Before work
- Main: 5bccda44d6db56aff05fa5623ef7f72b2ec0263c (2026-10-31 18:35 KST).
- QA v1418: official Test/Production provenance and DB ACL drift BLOCKED; no release.
- Scope: GET /api/wallet/summary Next API. The route trusts unvalidated upstream currency and WLD string; a malformed 200 could be shown as a balance or throw.
- Invariants: authenticated owner only, never invent a zero balance, no numeric conversion, no DB/migration/ledger changes, private no-store/noindex/no-referrer.

## Plan
- [ ] RED: add tests for malformed/missing/noncanonical/unsafe amount, currency mismatch, valid huge exact WLD, signed-out, upstream failure.
- [ ] GREEN: accept only WLD and isWldAmount; keep unavailable signed-in state.
- [ ] Regressions: focused tests, frontend/backend tests, lint, typecheck, builds, security, exact-SHA Test.
- [ ] Recheck main and planning, open Draft/HOLD PR, record CI and blockers.

## In progress
- Baseline inspected; no production or shared DB mutations.

## Finished
- Pending.
- 18:38: RED reproduced: 7 invalid wallet projections failed (including TypeError for missing balances); 3 baseline behavior tests passed when header assertions isolated. Full header tests initially 10 failed.
- 18:38: GREEN: 10/10 focused tests pass after exact WLD/currency validation and private noindex/no-referrer response headers.
