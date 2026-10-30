# Development A wallet detail — worklog

## Before
- 2026-10-30 13:55 KST: miniPC Debian 13.6 active backend/frontend/nginx/docker, DB connected; root 44%, DATA 51%.
- Read AGENTS, README, latest English/Korean living plan and integrated v1506, QA v1389, PRs, branches and CI.
- Start main SHA 9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef; isolated branch auto/hourly-a-20261030-1355-wallet-transaction-detail.
- 12 remote branches (11 non-main), 11 open Draft PRs at initial audit; no deletion.
- Scope: F675-182 owner-only WLD transaction detail, API/web/Android, fail-closed, no ledger mutation; exact-SHA gates required.
- Existing P0 release, Treasury and Production process mismatch remain HOLD.

## In progress
- [ ] TDD backend/DB
- [ ] TDD Next/Android
- [ ] Isolated PostgreSQL and regression
- [ ] CI, release audit and PR

## Finished
- Pending.

- 13:57–13:59 KST: TDD RED→GREEN for Nest owner detail SQL/DTO/404/503, Next private detail and activity CTA, Android app-api strict proof and headers. Initial target backend 6 PASS, frontend 19 PASS.
- 14:00–14:02: Fresh disposable PostgreSQL 17.11, 305 migrations (002..306), 2 owner/foreign synthetic transactions with four balanced postings. First setup failed because CI SQL was run with wrong function owner; recreated only this disposable container with migrator-owned schema. Real app-role read PASS, exact 9007199254740993 WLD, UTC microseconds, frozen/closed history, owner/foreign isolation, no INSERT/UPDATE; synthetic imbalance 0. Container stopped.
- 14:02–14:05: Typecheck PASS, lint 0 errors/1043 existing warnings, full local build PASS, database unit 56 PASS/4 SKIP, production dependency audit 0 known vulnerabilities. Android API catalog now includes the new route (184 total); generated schema references updated. Contract check compares generated artifacts to HEAD and will be rerun after committing them.
- 14:05–14:09: Full backend 2569 PASS/119 FAIL/496 SKIP, frontend 2626 PASS/53 FAIL. Counts match QA v1389 pre-existing failure classes; full gates FAIL. Additional RED→GREEN invalid Gregorian date checks. Feature OFF by default.
- P0 integration blocker: main ends at migration 306 while B owns pending migration 307 and dependent 308; adding 307/309 would collide or break contiguous migration sequence. This branch deliberately adds no migration or grant, and uses the existing owner-filtered SELECT projection. Disposable PG confirms moneyverse_app still has direct ledger SELECT. The planned dedicated SECURITY DEFINER owner read and independent DB-bound identity proof are NOT implemented; do not merge or enable until coordinated B security migration and exact-SHA full gates. No app table privilege is broadened.
- P1 follow-ups: authenticated Test E2E, session-switch cancellation in native Android client, anonymized admin cohort KPI and official Test exact-SHA deployment remain BLOCKED. This PR is a guarded functional candidate, not a certified complete release.

## Finished
- Source, tests, Android contract and documentation prepared on isolated main-based branch; no production database, ledger, service, backups or other worktrees changed.
- Release decision: DRAFT / HOLD. No main merge, Test/Production deployment or rollback executed. Feature default OFF is rollback path.
- Final branch/head SHA, CI, remote counts and Test/Production evidence are recorded in the associated PR and external report.
