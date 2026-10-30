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

## Finished (2026-10-30 13:14 KST; DRAFT / RELEASE HOLD)
- Draft PR #1996 created. Feature code/contract SHA `5b9d46a9d476c9c2a6b602ae98bfa27fd747df28`; final documentation SHA recorded on PR after commit. Latest origin/main rechecked unchanged `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef` at start, middle and pre-integration; English/Korean plans re-read. No merge.
- Changed files: backend controller/repository/test; frontend security page/filter helper/test; Android gateway/test; machine-readable mobile API contract and EN/KO references; EN/KO feature/mobile guides; plan and EN/KO worklogs (18 files in candidate).
- Fresh final local: typecheck PASS, build PASS, changed ESLint PASS, full lint PASS (0 errors, 1,043 warnings), Android API contract PASS, Backend target 10 PASS, Frontend target 68 PASS, DB unit 56 PASS/4 SKIP, security/release 26 PASS, production dependency audit no known vulnerabilities, isolated PostgreSQL 305 migrations and owner/ACL/rollback PASS.
- Full Backend FAIL (2,567 PASS / 119 FAIL / 495 SKIP); full Frontend FAIL (2,614 PASS / 54 FAIL). These are not waived by target passes. Exact code SHA Build Test Candidate #41001065886 FAIL: generated mobile contract classified UNKNOWN while separate repair Draft #1986 remains unmerged. Runtime CI pending when PR opened.
- Official Test version `c2129625...` differs from candidate and main; Treasury public API still HTTP 200 unverified. Production `/api/version` `94d38f476...`, Treasury 503 UNVERIFIED; backend/frontend PIDs still run from deleted v1515 while release symlink is v1523. Independent backup restore, official authenticated Test E2E, GitOps and rollback rehearsal BLOCKED.
- Branch audit: start 7 open PRs, end 9 open Draft PRs. End 59 origin branches (58 non-main; 49 fully merged into main, 9 unique unmerged). Initial local `git branch -r` count 1,109 included 1,054 historical `pr/*` snapshot refs, not 1,109 GitHub branches. No branch deleted or closed; preserve every unique commit and other agents' work.
- No Test/Production deploy, no production DB/ledger changes, no service restart, no Docker prune, no main merge and no rollback. Owned isolated PostgreSQL container stopped after verified fixture rollback. Future rollback, if approved release ever occurs: revert code-only feature; no migration to reverse.
- Final decision: **P1 TARGETED PASS / FULL GATES FAIL / OFFICIAL TEST BLOCKED / PRODUCTION HOLD**.

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
