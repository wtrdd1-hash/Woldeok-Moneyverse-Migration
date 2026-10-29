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
- [ ] Run GREEN parity, SQL contract tests, isolated PostgreSQL, app gates as feasible.
- [ ] Re-fetch main and planning; compare other PRs; publish Draft PR with exact SHA and HOLD evidence.

## In progress
- Confirmed duplicate filenames at 291–295 (14 filenames for five numbers). Latest applied production-connected DB reports canonical 291–294.
- TDD RED captured in isolated worktree before any SQL filename changes.
- Renamed exactly 10 pending SQL files (R100), retained applied 291–294 intact. Existing NPC and verified blog tests failed RED on stale migration filenames; updated only their paths and backend source comment. B #1881 reserves 305.

## Finished / Release
Pending evidence. Production/Test deployment and rollback: **not authorized**, HOLD.
