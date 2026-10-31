# Development A — owner shop holdings attention filter repair

## Before work (2026-10-31 18:12 KST)
- Baseline origin/main: 5bccda44d6db56aff05fa5623ef7f72b2ec0263c. Isolated worktree: /srv/moneyverse-data/tasks/mv-a-20261031-1812-holdings-attention/repo; branch auto/hourly-a-20261031-1812-holdings-attention-repair.
- Start inventory: 108 remote branches including main, 94 open PRs. Recent QA v1417 inspected; exact-SHA release evidence must be revalidated.
- Source gap: member shop/catalog sends `status=attention` but Nest shop/holdings accepts only `filter=attention`; the backend ignores `status`, so the screen can falsely label all holdings as overdue. Backend filtering also omits positive `arrears_due` with zero unpaid weeks, despite an existing bigint-safe helper. Android app-api does not independently validate this filter or enforce private response headers on shop/holdings.
- Constraints: use existing actor-scoped `shop_my_items_v2` PostgreSQL function; no migration, no direct table GRANT, no ledger writes. Avoid B #2136 (owner holdings privacy) duplication where possible; maintain separate PR and preserve their branch.

## In progress
- [x] RED: backend and frontend/app-api regression tests reproduce mismatch and stale HTTP 200.
- [x] GREEN: align query token, strict backend parsing and BigInt-safe attention predicate.
- [x] GREEN: app-api rejects duplicate/invalid filter and unverified 200; protect owner headers.
- [x] Verify read-only database function/ACL and local gates; [ ] exact-SHA CI and official Test/Production release gates.

## Midpoint (2026-10-31 18:16 KST)
- RED confirmed: backend 2 assertions fail after contract build; frontend 5 fail / 2 pass before implementation. First backend attempt lacked built contract; corrected environment before RED proof.
- Implemented strict owner filter and Android verification; targeted GREEN: 7 backend and 7 frontend/Android tests pass. Full gates and exact-SHA CI pending.

## Finished (local candidate; release HOLD)
- Code checkpoint `5f7460daa681af836d99e67b207c9fea987891f4` from baseline `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`. Main re-fetched at start, midpoint and before final documentation; unchanged at those checks.
- RED: backend 2 failing assertions after contract build; frontend 5 failing / 2 passing. GREEN: targeted backend 7/7, frontend and Android 7/7.
- Full lint exit 0 with 1,048 warnings; typecheck exit 0; backend/frontend build exit 0; backend 2,788 passed / 501 skipped; database unit 62 passed / 4 skipped; security/release checks 20 passed; frontend `NODE_ENV=test` with two workers 2,781 passed / 0 failed; app API contract 184 endpoints match; production dependency audit reports no known vulnerabilities.
- Initial whole-workspace `pnpm test` timed out after 160s during frontend, exit 124. First independent frontend retry omitted `NODE_ENV=test`, causing React.act failures (489 FAIL); the corrected `NODE_ENV=test` rerun passed all 2,781. These intermediate failures are retained, not hidden.
- Read-only real PostgreSQL 17.11 (development DB): `shop_my_items_v2(uuid)` exists, moneyverse_app EXECUTE=true, synthetic unknown actor returns 0, transaction ROLLBACK. **P0 FAIL:** moneyverse_app direct SELECT=true and DELETE=true on `public.user_items`, violating least privilege; see #993. No production DB inspected or changed.
- Remote audit at 18:27 KST: 112 remote branches including main; 111 non-main, 103 with unmerged commits, 8 ancestors of main. All preserved (8 ancestor candidates require ownership/open-PR review before safe deletion). Open PRs 95, 8 conflicting; no PR merged, no branch deleted.
- Public Test and Production backend/frontend report `bc8cd8a6c654af0336f550643f23049a58ee1d16`, not candidate SHA. Exact-SHA authenticated Test E2E and independent restore are BLOCKED; Production HOLD. No service restart, migration, ledger write, deployment or rollback.
- Final candidate CI/build and PR links are recorded on GitHub; do not interpret a green build as permission to promote while DB ACL and exact-SHA Test remain blocked.
