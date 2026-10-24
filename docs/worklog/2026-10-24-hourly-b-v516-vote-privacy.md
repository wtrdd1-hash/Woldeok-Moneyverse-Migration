# Backend B v516 — Citizen budget vote privacy (P0 #1179)

## Before work
- Start main: `49788d09494fed3e463651945b83386e87dd47bc` (2026-10-24 22:40 KST).
- Branch: `auto/hourly-b-vote-privacy-v516-20261024-2240`.
- Reviewed AGENTS.md, README.md, English canonical / Korean supporting plans, current QA, CI, PR #1178, migration collisions #1105/#1117/#1139/#1143.
- RED expected: app role has SELECT on all member votes, while treasury admin repository directly reads the table.
- Production-linked DB prohibited. Work only against isolated PostgreSQL.

## Plan / progress
- [ ] RED tests: deny app/public table SELECT, authorized admin aggregate, unauthorized rejection, no raw rows, existing vote write.
- [ ] New forward-only migration, app repository/controller read through privileged aggregate.
- [ ] GREEN tests and isolated real PostgreSQL app-role ACL; lint, typecheck, build, full tests, audits, CI.
- [ ] Re-fetch main/plan; record merge/Test/Production HOLD and migration-number collision.

## Release HOLD
Migration 280 is already claimed by other unmerged PRs. This branch is a nonmergeable candidate until numbering and exact-SHA validation are reconciled. No Test or Production promotion.

## In progress — TDD RED (22:42 KST)
- Added 3 structural regressions + 1 disposable-PG integration contract. Observed **3 RED / 1 SKIP** before implementation: migration absent, aggregate function absent, direct table SELECT still present.
- Test role uses only CI-provided localhost:5432 disposable migrator DB; never touches Production-linked 5433.
