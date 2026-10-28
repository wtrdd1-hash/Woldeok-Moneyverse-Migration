# Development A — member shop minimum price filter (2026-10-29 02:25 KST)

## Start / design / task checklist
- [x] Check Debian 13, services, disks, latest main, policies, English/Korean plans, QA v1354, open PRs and CI status.
- [x] Start from `35971c600f25869c96f1c666d4b9f58927202730` on an isolated `auto/hourly-*` worktree; no other branch edits.
- [x] RED: add tests for exact bigint minPrice parsing, public/member filtering, web query preservation, Android gateway no-store.
- [x] GREEN: implement backend+web+Android app-api minimum price filter, using existing PostgreSQL SECURITY DEFINER catalogue reads and no new grants/migrations.
- [ ] Verify focused and complete tests, lint/typecheck/build, isolated PostgreSQL, security, a11y/SEO and exact SHA CI.
- [ ] Re-fetch latest main/plans before PR and merge. Release HOLD until QA and official Test/Production gates are independently satisfied.

## Safety and release
QA v1354 FAIL: historical 18,000 WLD drift, excessive DB DML grants, migration parity, official Test/backup-restore blockers; root 95%, data 98%. Never alter Production DB, applied migrations, existing PRs/branches, backups or other agents' work. No production deployment without exact-SHA independent Test and release proof.

## Midpoint evidence (02:36 KST)
- RED: backend missing module, frontend missing module and Android private cache regression reproduced. GREEN focused backend 15 PASS, frontend 28 PASS.
- Full backend 1,954 PASS/440 SKIP; frontend 1,874 PASS; root lint 0 errors/1,099 pre-existing warnings; typecheck PASS after correcting a test mock signature.
- Existing main lacked installed `undici` in the shared dependency tree: isolated dependency links were completed using an already-installed compatible package from a preserved worktree; no shared node_modules mutation.
- 320px form wraps and preserves existing responsive regression assertions; a resource cap of 2 static workers is required on the low-capacity Debian build host.
- Read-only existing PostgreSQL SECURITY DEFINER shop_catalog reads remain unchanged. No migration, ledger or Production DB writes.
