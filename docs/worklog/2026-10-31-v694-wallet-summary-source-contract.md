# v694 — Owner wallet glance source contract (DRAFT / RELEASE HOLD)

## Before work
- Main: 5bccda44d6db56aff05fa5623ef7f72b2ec0263c (2026-10-31 18:35 KST).
- QA v1418: official Test/Production provenance and DB ACL drift BLOCKED; no release.
- Scope: GET /api/wallet/summary Next API. The route trusts unvalidated upstream currency and WLD string; a malformed 200 could be shown as a balance or throw.
- Invariants: authenticated owner only, never invent a zero balance, no numeric conversion, no DB/migration/ledger changes, private no-store/noindex/no-referrer.

## Plan
- [x] RED: add tests for malformed/missing/noncanonical/unsafe amount, currency mismatch, valid huge exact WLD, signed-out, upstream failure.
- [x] GREEN: accept only WLD and isWldAmount; keep unavailable signed-in state.
- [x] Regressions: focused tests, frontend/backend tests, lint, typecheck, builds, security, exact-SHA Test.
- [x] Recheck main and planning, open Draft/HOLD PR, record CI and blockers.

## In progress
- Baseline inspected; no production or shared DB mutations.

## Finished (2026-10-31 18:48 KST)
- Changed the existing Next GET /api/wallet/summary only. Invalid currency, missing nested balances, noncanonical/unsafe amount and malformed upstream responses now return signedIn=true with null amount, never a fabricated zero or rounded balance. Signed-out response and valid exact large WLD strings retain their contract.
- Owner-private responses on every path now include private,no-store / noindex / no-referrer. No new API route, DB migration, table grants, financial transaction or ledger write.
- TDD: 7 payload regressions RED, 3 baseline behaviors GREEN before implementation (headers isolated); 10/10 final focused tests GREEN.
- Full backend 2786 PASS / 501 SKIP; frontend 2786 PASS; contract 41 PASS; database 62 PASS / 4 SKIP; Lint 0 errors / 1049 pre-existing warnings; Typecheck PASS; full Build PASS; app-api contract 184 PASS; security/release 28 PASS; production dependency audit 0 known vulnerabilities; full dependency audit FAIL 13 (10 moderate / 3 low).
- Isolated PostgreSQL 17.11, network none, tmpfs: 312/312 forward migrations applied; app role is non-superuser, identities SELECT false, audit DELETE false, ledger postings DELETE false. Test container removed. This is clean-schema verification, NOT DEV/Test DB drift remediation.
- QA v1418 FAILED/P0: DEV ACL/checksum drift, official Test 315 vs canonical 312 migrations and FX 500, Production source provenance mismatch and independent restore remain unresolved. Exact-SHA Test, authenticated E2E, GitOps release gate remain BLOCKED.
- Midpoint remote main 5bccda44d6db56aff05fa5623ef7f72b2ec0263c; English/KO plan sha256 0e18217e... / 2a384f4c... unchanged. No competing A/C/QA code touched; no branch cleanup, merge, Test or Production deployment.
- Draft PR/HOLD and remote CI evidence are tracked separately; release HOLD until all required gates PASS.
- 18:38: RED reproduced: 7 invalid wallet projections failed (including TypeError for missing balances); 3 baseline behavior tests passed when header assertions isolated. Full header tests initially 10 failed.
- 18:38: GREEN: 10/10 focused tests pass after exact WLD/currency validation and private noindex/no-referrer response headers.
