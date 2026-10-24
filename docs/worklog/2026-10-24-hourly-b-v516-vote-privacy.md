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

## In progress — implementation and isolated PostgreSQL (22:45 KST)
- New forward-only **candidate** migration 280 revokes app/PUBLIC direct vote table privileges, adds a SECURITY DEFINER admin-only aggregate with pinned search_path and narrow app EXECUTE.
- Admin controller/service/repository now pass authenticated actor and query aggregate; vote submission contract unchanged.
- Disposable Docker PostgreSQL 17.11-alpine: initialized all 002–280 migrations, verified raw table ACL denial, nonadmin rejection, two synthetic members' aggregate, existing vote function, transaction ROLLBACK. Container destroyed. No shared/live DB touched.
- TDD GREEN: 4/4 DB regression tests (including actual PG), 1/1 backend repository unit; changed-file ESLint 0 errors / 8 preexisting warnings.
- Collision still open: other PRs claim 280. Candidate cannot merge until coordinated renumber/rebase and new SHA gates.

## Main synchronization (22:52 KST)
- Main advanced from `49788d09494fed3e463651945b83386e87dd47bc` to `57f393395d16495b06187de69c17592d2c13d251` (shop UI only, no overlapping DB/backend files). Rebased this independent branch onto exact latest main; all changes preserved. Earlier tests were run before rebase; targeted regressions and CI must be re-run on final SHA.
