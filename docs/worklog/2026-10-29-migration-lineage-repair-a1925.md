# A1925 — P0 migration lineage collision repair

## Before work (2026-10-29 19:29 KST)
- Baseline main: `69c486777d023ee45a216528e7a0c8b7dd1d7ea7`; branch `auto/hourly-a-repair-migration-uniqueness-20261029-1925`; isolated worktree `/srv/moneyverse-data/build-workspaces/mv-a-repair-migration-uniqueness-20261029-1925`.
- Live Production/dev may share a database: **no live database writes, migrations, grants or data fixtures**.
- Reproduce 291–295 duplicate-number failure; preserve exact applied 291–294 names and bytes.
- Latest QA v1371: lint fix is independently owned by QA PR #1883. Do not duplicate.
- B PR #1881 introduces migration 305, held until 295–304 are contiguous.

## Plan / TDD
- [x] Capture RED parity and immutable applied migration baseline: baseline parity 5 PASS/1 FAIL; new regression 1 PASS/1 FAIL.
- [x] Renumber only never-applied migration filenames to contiguous 295–304; all 10 SQL file byte digests unchanged.
- [x] Run GREEN parity, SQL contract tests, isolated PostgreSQL, app gates; failures and skips recorded.
- [x] Re-fetch main and planning; compare other PRs; publish Draft PR with exact SHA and HOLD evidence (PR pending creation).

## In progress
- Confirmed duplicate filenames at 291–295 (14 filenames for five numbers). Latest applied production-connected DB reports canonical 291–294.
- TDD RED captured in isolated worktree before any SQL filename changes.
- Renamed exactly 10 pending SQL files (R100), retained applied 291–294 intact. Existing NPC and verified blog tests failed RED on stale migration filenames; updated only their paths and backend source comment. B #1881 reserves 305.

## Finished / Release (2026-10-29 19:38 KST)
- Existing parity RED 5 PASS / 1 FAIL, new lineage RED 1 PASS / 1 FAIL; stale path RED 6 FAIL. After filename-only repair: targeted 14 PASS; database 55 PASS / 4 SKIP; contract 41 PASS; targeted ESLint PASS.
- 10 SQL renames are R100; four applied 291–294 files retain exact bytes. Fresh disposable PostgreSQL 17.11 applied all 303 SQL files and recorded 303 migration checksums, zero unbalanced ledger transactions; container removed.
- Full lint FAIL (2 main parse errors, QA PR #1883 owns), typecheck/build FAIL (5 backend errors plus JSX), root test FAIL (mobile API doc drift), backend 2021 PASS / 243 FAIL / 809 SKIP, frontend timed out at 100s, security audit 0 known vulnerabilities.
- Latest main 69c486777d023ee45a216528e7a0c8b7dd1d7ea7 unchanged at start/mid/pre-PR. Official Test/Production both still c2129625aa6629c616fb31ce790950618b8d92b2; candidate not deployed.
- Official exact-SHA authenticated Test, full CI, independent restore, Production migration checksum proof BLOCKED. No main merge, Test or Production deployment, DB writes, branch deletion or PR closure. Rollback: abandon unmerged branch/PR only; never rewrite applied SQL.
- Evidence /srv/moneyverse-data/reports/Moneyverse-A-2026-10-29-1925; internal EN/KO and GitHub update documents under docs/updates. This is P0 code repair, **not** a new end-to-end user feature.
