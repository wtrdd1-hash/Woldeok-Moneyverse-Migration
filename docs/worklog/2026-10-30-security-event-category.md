# Development A — recent security activity category filter

## Before work (2026-10-30 12:56 KST)
- Debian 13 / miniPC direct status: backend, frontend, nginx, Docker and database connected; root 44%, DATA 47% used.
- Authority: origin/main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; main checkout was one commit behind, untouched.
- Open PRs: #1983, #1985, #1986, #1987, #1990, #1991, #1992 (7). Non-main remote refs count includes historic refs; preserve all unmerged unique commits. No deletions.
- QA v1388: Production running deleted v1515 process path while symlink v1523; official Test synthetic Treasury HTTP 200; release HOLD. Previous A #1991 is shop CSV, B #1987/#1992 audit/NPS, C profile API; this feature is separate.
- Branch `auto/hourly-a-20261030-1256-security-event-category` and isolated worktree from latest main. Read AGENTS, README, English/Korean living plans, integrated master and Superpowers workflow. English canonical; Korean second language.
- Scope: P1 read-only recent security activity category filter, preserving PostgreSQL owner function, 20-event horizon, no raw metadata and no SQL migration.

## In progress
- Planned RED→GREEN Nest, web and Android regression; isolated PostgreSQL least-privilege proof; exact-SHA gates.

## Finished
- PENDING. No merge, production deployment, service restart, DB change, branch deletion or rollback authorized by this candidate.

## In-progress checkpoint (2026-10-30 13:00 KST)
- RED: backend 3 failing tests, frontend 3 failing tests; second RED for stale/malformed Android upstream responses; media-type RED confirmed.
- GREEN: backend repository/controller/privacy 9 PASS; web + Android gateway + existing app gateway regression 62 PASS; app gateway media guard 52 PASS.
- Added strict owner category validation, 20-event post-read filtering, web selection and fail-closed mismatch handling, Android proxy schema/category validation, EN/KO feature and mobile API docs.
- Re-fetched origin/main mid-task: unchanged `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`.
- Remaining: typecheck, lint, build, database/ACL proof, full suites, exact-SHA CI, release HOLD decision.

## In-progress checkpoint (2026-10-30 13:07 KST)
- Full workspace typecheck PASS; lint PASS with 0 errors / 1,043 pre-existing warnings; exact source local build PASS.
- Database package 56 PASS / 4 SKIP; Backend owner category and privacy 9 PASS; Frontend/web/app gateway evidence 68 PASS. Additional OpenAPI query enum test 4 PASS.
- Isolated PostgreSQL 17.11: all 305 migrations (002..306) applied from source with checksums; synthetic owner-1 latest-20, owner-2 isolation, excluded older setting event, direct app-role table read/update denial, owner-function EXECUTE, and fixture rollback to 0 PASS. No production DB touched; owned test container stopped.
- Machine-readable mobile API contract and EN/KO schema references updated to reflect optional `category` query. Pending fresh generated contract check after commit and full suites.
