# Development A — member shop minimum price filter (2026-10-29 02:25 KST)

## Start / design / task checklist
- [x] Check Debian 13, services, disks, latest main, policies, English/Korean plans, QA v1354, open PRs and CI status.
- [x] Start from `35971c600f25869c96f1c666d4b9f58927202730` on an isolated `auto/hourly-*` worktree; no other branch edits.
- [x] RED: add tests for exact bigint minPrice parsing, public/member filtering, web query preservation, Android gateway no-store.
- [x] GREEN: implement backend+web+Android app-api minimum price filter, using existing PostgreSQL SECURITY DEFINER catalogue reads and no new grants/migrations.
- [x] Verify focused and complete local tests, lint/typecheck/build, isolated PostgreSQL, security, a11y/SEO; exact-SHA CI is tracked separately.
- [ ] Re-fetch latest main/plans before PR and merge. Release HOLD until QA and official Test/Production gates are independently satisfied.

## Safety and release
QA v1354 FAIL: historical 18,000 WLD drift, excessive DB DML grants, migration parity, official Test/backup-restore blockers; root 95%, data 98%. Never alter Production DB, applied migrations, existing PRs/branches, backups or other agents' work. No production deployment without exact-SHA independent Test and release proof.

## Midpoint evidence (02:36 KST)
- RED: backend missing module, frontend missing module and Android private cache regression reproduced. GREEN focused backend 15 PASS, frontend 28 PASS.
- Full backend 1,954 PASS/440 SKIP; frontend 1,874 PASS; root lint 0 errors/1,099 pre-existing warnings; typecheck PASS after correcting a test mock signature.
- Existing main lacked installed `undici` in the shared dependency tree: isolated dependency links were completed using an already-installed compatible package from a preserved worktree; no shared node_modules mutation.
- 320px form wraps and preserves existing responsive regression assertions; a resource cap of 2 static workers is required on the low-capacity Debian build host.
- Read-only existing PostgreSQL SECURITY DEFINER shop_catalog reads remain unchanged. No migration, ledger or Production DB writes.

## Final local verification / release decision (02:45 KST)
- Scope: backend minPrice validation/filter/controller, web `/shop` input/query/accessible feedback, Android app-api forwarding/cache privacy, regression tests, resource-limited Next build configuration. No schema or ledger change.
- Full `pnpm test` PASS: backend 1,954 PASS / 440 SKIP; frontend 1,874 PASS; database 46 PASS / 4 SKIP; bot 11 PASS; contract/guards PASS. `pnpm typecheck` PASS, `pnpm lint` 0 errors (1,099 pre-existing warnings), `pnpm build` PASS, app contract 180 endpoints PASS.
- Root dependency audit: 0 High/Critical (3 Low / 9 Moderate); bot audit 0 vulnerabilities.
- Independent isolated PostgreSQL 17.11 migration replay PASS; 146 rows through app-role SECURITY DEFINER function, 127 with price >=1000, direct table SELECT denied. Isolated container stopped.
- First full backend test failed due to absent `undici` package in base workspace; resolved only inside this worktree by linking the pinned already-installed dependency. First full frontend test failed existing narrow-layout string assertion; class order adjusted without removing wrap. Typecheck test-mock tuple issue corrected. All full tests rerun successfully.
- Start remote heads 88/open PRs 86; after PR #1771 remote heads 89/open PRs 87; 3 conflicting PRs, 18 PRs with failed checks, 0 duplicate PR heads. Incident recovery 352/352 commit objects valid. Deleted 0 branches; all unmerged unique work preserved.
- Candidate PR #1771 remains Draft. Latest main `35971c600f25869c96f1c666d4b9f58927202730` and EN/KO planning masters unchanged on start/mid/pre-PR checks. No main merge, Test/Production deployment, Production DB mutation, ledger change or rollback.
- **Production RELEASE HOLD**: QA v1354 FAILED (historical 18,000 WLD drift, excessive grants, migration checksum/gaps, backup restore and official Test exact-SHA auth/E2E gaps). Exact final PR SHA CI and image build must pass independently; official Test/Production gates remain BLOCKED.
