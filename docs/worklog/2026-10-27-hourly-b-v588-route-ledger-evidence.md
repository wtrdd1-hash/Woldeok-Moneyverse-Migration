# Backend B v588 — Route QA ledger evidence provenance (P1 #1078)

## Before work — 2026-10-27 18:35 KST
- Starting main SHA: 5373c6ae7a0987ebe31cb4cca59823e624eb62d9
- Branch: auto/hourly-b-route-ledger-provenance-v588-20261027-1835
- Reviewed AGENTS.md, README.md, English/Korean project plans, QA #1078 and #1088, open PRs and CI.
- No overlapping open PR was found for the route-ledger CLI entry point. Development A/C/QA worktrees are untouched.
- Reproduced design defect: package script invokes verifier with only --fixtures; verifier also requires --inventory and --ledger.
- Plan: TDD negative tests; require explicit existing inventory and real E2E ledger artifact paths plus exact 40-hex candidate SHA; validate inventory SHA and candidate/runtime provenance; never synthesize acceptance evidence. Keep missing evidence BLOCKED.
- Release policy: Draft/HOLD; no main merge, shared database write, official Test deployment or Production change.

## In progress
- Pending RED regression tests, implementation, verification and current-main recheck.

## Finished — 2026-10-27 18:45 KST
- Scope: P1 #1078 / release-integrity #1088. Unique fix: reject `FAIL` and `BLOCKED` entries even when all five pass numbers and defect IDs are present. Wire verifier regression tests into mandatory `pnpm test`.
- RED: 7 earlier proposed CLI tests failed; those overlapping CLI changes were removed after identifying #1252. The retained unique regression failed because `verifyLedger` returned `ok: true` for FAIL/BLOCKED. GREEN: 4/4 route-ledger tests, including that regression.
- Final scoped typecheck PASS; lint PASS (0 errors, 1,122 pre-existing warnings); full build PASS; backend tests 1,544 PASS / 412 SKIPPED; frontend 1,485 PASS; bot 8 PASS after offline dependency install; contract 38 PASS.
- Mandatory `pnpm test` FAIL: repository main already contains both `280-qualification-ledger-settlement-hold.sql` and `280-verified-help-center.sql` plus `281-season-reward-ledger-settlement-hold.sql`. `packages/database/test/migration-parity.test.ts` rejects the duplicate 280 and missing 282. This is not caused by v588 and was not modified.
- Full pnpm audit FAIL: 2 Critical / 8 High / 11 Moderate / 3 Low; bot npm audit FAIL: 1 Critical / 5 High; production-only pnpm audit PASS. Security scan/control-byte/Prisma guard PASS.
- Isolated real PostgreSQL: NOT RUN for QA-only code; no database changes or DB execution. Official Test exact-SHA authenticated backend/API/DB/finance E2E: BLOCKED (public Test SHA differs). Independent signed browser evidence: NOT AVAILABLE.
- GitHub CI: pending until PR creation. Merge: NONE. Production: HOLD. Cleanup: NONE (all other branches/worktrees protected).
- No API/DB contract or migration changes; QA command behavior changes only for non-PASS result acceptance and required test coverage.


### TDD checkpoint — 18:38 KST
- RED: seven new tests failed (runner missing / package script not wired), captured in `mv-b-v588-logs/red.log`.
- GREEN: ten focused tests passed after implementing a fail-closed CLI runner, exact checkout/ledger/inventory/runtime SHA checks, and recomputed inventory digest.
- `pnpm qa:route-ledger:check` with no evidence exits 1 and names the missing input instead of silently passing.
- Explicit inputs: `QA_ROUTE_INVENTORY`, `QA_ROUTE_LEDGER`, `QA_CANDIDATE_SHA` (exact current checkout 40-hex SHA). The existing fixture catalog is repository-owned.
- Successful structural validation is explicitly `STRUCTURAL_METADATA_ONLY`, `releaseAuthorized: false`; it does not authenticate a browser session, verify evidence file signatures, prove backend/DB/finance E2E or authorize deployment.
- No PostgreSQL migrations or API contract changes. No Test/Production changes.

### Overlap resolution — 18:45 KST
- Discovered existing Draft/HOLD PR #1252 (B v527), which already implements the missing inventory/ledger input wiring and exact-SHA provenance. Do **not** duplicate its runner or CLI contract. Removed the overlapping v588 runner and its tests before commit.
- Unique v588 fix: `verifyLedger` previously returned `ok: true` when all five passes were present but one or more results were `FAIL`/`BLOCKED` with a valid `defectId`. This is a false-green release acceptance risk not covered by #1252.
- TDD RED: a complete ledger with `FAIL` and `BLOCKED` returned `ok: true` (captured in `red-fail-status.log`). GREEN: verifier now records explicit non-PASS issues and refuses certification.
- Required root `pnpm test` now executes `pnpm qa:route-ledger:test`, preventing this regression from remaining optional. Existing `qa:route-ledger:check` remains unchanged for clean integration with #1252.
- No real browser E2E evidence was collected or synthesized. The existing missing-evidence CLI remains BLOCKED until #1252 is integrated.
