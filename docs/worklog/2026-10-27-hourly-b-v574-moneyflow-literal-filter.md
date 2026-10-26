# Backend B v574 — Admin money-flow search filter integrity (2026-10-27)

## Source, isolation and scope
- Start/mid `origin/main`: `0fe614b2ca1a7bc0df540514e54db78130479e2a` (fetched twice); branch `auto/hourly-b-moneyflow-filter-v574-20261027-0740`, isolated miniPC worktree.
- Read `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md` (English primary) and `.ko.md`, open PRs, QA evidence, CI and development A/C work. No changes to other worktrees, GitHub automations, migrations, ledger balances or Production.
- P1: `GET /api/v1/admin/treasury/user-money-flows` previously used `%${search}%` with `ILIKE`, so a literal `%` or `_` broadened an administrator's financial audit query. Malformed `direction` was silently ignored; malformed `limit` silently defaulted/clamped; malformed or huge search could cause errors or costly scans. This is a query correctness and audit scope risk, **not evidence of a data breach**.
- Nearby unmerged Draft #1495 (B v573) changes the **same repository method** to posting-level keyset pagination; Draft #1479 (C) changes the administrator UI. This candidate must be rebased and reconciled with both before any merge. Neither branch was modified.

## Implementation and contract
- `backend/src/admin/treasury/treasury.repository.ts`: validate limit as integer 1..200; reject invalid direction, oversized/unsafe or non-string search and type before SQL; normalize whitespace; use parameterized case-insensitive literal `strpos` on display name and UUID text rather than `ILIKE` patterns.
- API route and response structure unchanged. Invalid filters return HTTP 400 (`BadRequestException`) rather than silently broadening results; literal `%`, `_`, backslash are searchable; Korean substring, transaction type and direction filters preserved. No DB migration, new privileges, WLD, ledger posting or transaction writes.
- Regression files: `treasury-moneyflow-filter-v574.test.ts` (TDD RED 20, GREEN 25 after extra coverage); `treasury-moneyflow-filter-v574.db.test.ts` (5 real PostgreSQL checks, skipped when no disposable fixture URL). The real PG fixture used synthetic names and balances only; no actual service database was modified.

## Verification evidence and release holds
- Before fix: 20/20 new tests RED on `main`. After fix: 25/25 focused unit tests PASS. Disposable PostgreSQL 17.11: 5/5 PASS for `%`, `_`, backslash, Korean/UUID and read-only role; container removed.
- Full pre-final-commit local gates: `pnpm test` PASS (backend 1,346 PASS / 403 SKIPPED before five additional unit cases; frontend 1,423 PASS; contract 38 PASS; database 15 PASS / 3 SKIPPED); `pnpm typecheck` PASS; `pnpm lint` PASS with existing warnings; `pnpm build` PASS after isolated offline dependency installation; bot test 8/8 PASS; production-only audit PASS.
- Full pnpm audit FAIL: 2 Critical, 8 High, 11 Moderate, 3 Low. Bot audit FAIL: 1 Critical, 5 High. These are not waived by production-only audit.
- Official Test exact-SHA, authenticated admin/financial E2E, full migration/ACL and GitOps release gates: **BLOCKED / NOT VERIFIED**. No main merge or Production promotion. Branch is Draft/HOLD until all gates and independent approval pass.
- Initial build failure (`next/package.json` not resolvable) was caused by a cross-worktree `node_modules` symlink, not by the source change. An offline frozen-lockfile installation into this worktree fixed that environment issue; the default Turbopack build then passed. Bot's first test run lacked its separate npm modules; reusing the already-installed bot dependencies restored 8/8 PASS.

## Rollback / dependencies
- Revert the isolated code change before merge if integration with #1495's cursor filter fingerprint cannot be made consistent. Preserve #1495's microsecond/posting cursor behavior and ensure continuation binds to normalized search/type/direction; do not weaken admin guards.
- Do not merge until full security audits, actual exact-SHA Test authentication/finance E2E, migration checksums, backup/restore, and approved GitOps gates pass. No automatic branch cleanup or Production change is authorized by this PR.
