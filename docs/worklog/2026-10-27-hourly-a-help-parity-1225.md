# Development A — Verified Help Migration Parity Repair (2026-10-27 12:25 KST)

## Scope, provenance, and ownership
- Baseline: remote `main` `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`; new isolated worktree and branch `auto/hourly-a-help-parity-20261027-1225`. Cherry-picked prior **unmerged** Draft PR #1522 commit `374c141833ab0906e1643528e22ab71a030c813f` without modifying its worktree or PR.
- Read AGENTS, README, canonical English and companion Korean project plans, planning v1354 (DRAFT/HOLD), previous QA/release and CI. Help center is feature-OFF and unapproved for deployment; no money/ledger mutations.
- RED: `migration-parity.test.ts` failed (main ends 279, candidate 282 skips 280/281). GREEN: renamed only **unapplied candidate** migration 282 to 280 and fixture filenames; updated contract-test path. **No applied migration content or production checksum changed.** This number conflicts with other unmerged PR candidates; merge remains HOLD until serialization and latest-main rebase.

## Independent verification and limits
- Focused migration parity and help contract: 9/9 PASS after observed 1 RED/8 PASS. Full `pnpm test` PASS: backend 1,336 PASS/398 SKIP; frontend 1,430 PASS; database 18 PASS/3 SKIP; contract 38 PASS. Android App API contract generated/checked as part of full test.
- Fresh isolated PostgreSQL 17.11-alpine in ephemeral, network-disconnected, tmpfs-only Docker container: bootstrap, migration 280, positive, negative, admin authorization/independent approval/replay/retraction/immutable receipts all PASS. Container removed. No shared development/production-linked 5433 database writes.
- `pnpm typecheck`, `pnpm lint` (0 errors, 1,131 existing warnings), backend build, frontend Next.js 16 webpack build with 2GiB heap, bot 8/8 tests PASS. Initial bot test missing local symlinked dependency; rerun PASS without source changes.
- **Release BLOCKED:** full dependency audit FAIL (2 Critical, 8 High); bot audit FAIL (1 Critical, 5 High). Exact-SHA official Test authenticated E2E, independent backup restore, browser a11y/SEO and GitOps release gates unverified. Route-ledger CLI requires explicit inventory/ledger inputs; not treated as PASS. Feature switch OFF.

## Branch, rollback, and release
- Before repair: 340 remote non-main branches, 333 open PRs (318 Draft); 322 diverged, 6 unique ahead, 2 ancestors of main, 10 object-unavailable. PR checks with failures/cancel/timeouts: 205; 26 conflicting PRs. No branches deleted: all unique changes, PR links and uncertain objects protected.
- Worktree and GitHub updates recorded in the separate report. No main merge, official Test promotion, production deploy, migration apply, feature enable, finance transaction, or data deletion. Rollback not needed for environments; revert candidate commit or close Draft PR if superseded. Production RELEASE HOLD.
