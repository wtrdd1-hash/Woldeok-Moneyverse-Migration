# A1825 — Owner-scoped bank loan exposure summary

## BEFORE (2026-10-24 18:32 KST)
- MiniPC Debian 13 reachable; backend/frontend/bot/MCP/Nginx/Docker active; DB status reports development name, which is **not proof of isolation**.
- Base `origin/main`: `49788d09494fed3e463651945b83386e87dd47bc`; remote branches 1106 excluding local origin HEAD as measured, open PRs 49. No deletion.
- Read AGENTS, README, English and Korean living plan/integrated master, latest QA and A/B/C open PRs. Existing loan list returns owner-scoped `bank_my_loans(actor)` and no historical loan totals; PR #1150 adds status-filter history but not exposure aggregation. This branch does not modify its worktree.
- Bounded design: a read-only `GET /api/v1/bank/loans/summary` returns integer-string outstanding totals for all active and overdue loans and counts per status, from existing owner-scoped PostgreSQL function; no migrations, no ledger writes. Web bank loan tab shows totals, or a truthful unavailable state. Android gateway passes the same authenticated API. Never interpret unavailable repository as zero.
- Acceptance: huge 38-digit WLD exactness, mixed active/overdue/repaid, unknown actor zero, invalid rows fail closed, auth guard, no-store, Android route, tests RED then GREEN. No changes to finance mutation paths.
- Safety: existing unmerged branch commits protected; Test/Production HOLD until all gates PASS, isolated exact SHA, least privilege and GitOps. Worklog before implementation.

## IN PROGRESS
- Pending.

## FINISHED
- Pending.

### TDD RED checkpoint
- Added backend owner/precision/fail-closed tests, HTTP mount regression, Android gateway contract route test and frontend summary card tests before production implementation.

### GREEN implementation checkpoint
- Added owner-only loan exposure endpoint with private/no-store, exact BigInt aggregation and fail-closed unavailable/invalid data handling; reused immutable existing `bank_my_loans` read function (no schema migration). Its LIMIT 20 is surfaced as a mandatory scope warning.
- Added bank loan-tab card with unavailable state, explicit 20-record scope and Android gateway contract regression. No mutations to existing developer PR branches.

### MID checkpoint (2026-10-24 18:40 KST)
- Refetched main: unchanged `49788d09494fed3e463651945b83386e87dd47bc`; reread EN living plan and current QA HOLD. Other branches/worktrees untouched.
- TDD RED 5/5 as expected; GREEN backend 28/28 and frontend 16/16. Typecheck PASS. Lint 0 errors/1137 warnings. Root test FAIL: backend 1320 PASS/398 SKIP, frontend 1397 PASS/5 FAIL (pre-existing SEO 3, locale 1, login a11y 1). Full pnpm audit FAIL 26 advisories (Critical 2, High 10). Default Turbopack build FAIL due to worktree node_modules symlink outside project root; webpack build PASS with no application compile errors. Keep default build gate blocked, do not claim equivalent.
- Isolated `moneyverse-test-db` read-only PostgreSQL: `bank_my_loans(uuid)` exists, app EXECUTE allowed, app direct DML on loans denied, unknown actor 0 rows, fixture has 0 loans. Explicit ROLLBACK. No production DB writes, no synthetic test data. Official Test authenticated finance E2E BLOCKED.
- Android app-api gateway explicitly sets `private, no-store` for the new route even on error.

## FINISHED (2026-10-24 18:42 KST)
- Application code and focused regression tests implemented. Backend focused 28 PASS; frontend/Android focused 16 PASS; backend full 1320 PASS/398 SKIP; frontend full 1397 PASS/5 FAIL; typecheck PASS; lint 0 errors/1137 warnings; Webpack build PASS; default Turbopack FAIL due to external node_modules symlink; API contract 179 PASS; bot 8 PASS.
- Security audit FAIL (Critical 2, High 10; 26 total), production dependency audit FAIL (2 High), bot audit FAIL (Critical 1, High 5). Isolated real PostgreSQL read-only function/ACL/unknown owner PASS; populated loan fixture 0; exact-SHA authenticated Test E2E BLOCKED.
- Main SHA rechecked unchanged before PR. No main merge, Test/Production release, DB mutation, restart, rollback or branch deletion. Draft PR and final CI to be recorded in PR comment; never claim production ready.
- Source files: backend wallet controller/service and focused/E2E tests; frontend bank page/loan card/test, Android gateway cache policy and contract test; EN/KO release report and this worklog. Branches before 1106 refs; open PRs 49; final counts after push in PR comment.
