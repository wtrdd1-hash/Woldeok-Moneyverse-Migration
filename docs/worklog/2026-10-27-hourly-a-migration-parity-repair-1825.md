# Development A — Migration 280 collision repair (2026-10-27 18:25 KST)

Status: **P0 repair candidate / DRAFT / RELEASE HOLD**, not a deployed user feature.

## Source and failure
- Authoritative main at start, midpoint, and before commit: `5373c6ae7a0987ebe31cb4cca59823e624eb62d9`. Reviewed AGENTS, README, English canonical/Korean project plans, integrated planning v1368 draft, prior A QA/worklogs and open PRs.
- Main CI `40480263846` failed the real database migration parity test: both `280-qualification-ledger-settlement-hold.sql` and `280-verified-help-center.sql` were present, followed by `281-season-reward-ledger-settlement-hold.sql`.
- Production-linked database and every accessible official Test PostgreSQL database were queried **read-only**: no migration numbered 280 or higher was recorded. Production-linked database latest recorded filename was 268. This is not an authorization to modify any applied migration.
- Start audit: 354 remote branches (353 non-main), 345 open PRs (330 Draft); 348 diverged branches with unique history, four main-contained, one Git object missing; 205 PRs with failed/cancelled checks; no duplicate open PR head SHA. No branch deletion.

## Minimal change / regression
- New isolated `auto/hourly-a-migration-parity-repair-20261027-1825` branch/worktree from latest main. Re-number **only the unapplied** verified-help migration `280` → `282`, after the existing qualification 280 and season 281. No migration SQL behavior or historical applied file changed; only its introductory comment and filename.
- Rename four help-only isolated PostgreSQL fixtures to `282-help-*`. Update the help migration contract test path and add an explicit 280/281/282 noncollision regression.
- RED: `pnpm --filter @moneyverse/database test` failed exactly on duplicate sequence (`280,280,281` instead of `280,281,282`). GREEN: database 21 PASS / 3 SKIP. Isolated PostgreSQL 17.11 ran bootstrap, new migration, admin, positive and negative ACL fixtures with `ON_ERROR_STOP=1` and PASS; isolated container removed. No live DB writes.

## Fresh verification
- Root `pnpm test`: contract 38 PASS, database 21 PASS/3 SKIP, backend 1,544 PASS/412 SKIP, frontend 1,485 PASS. Typecheck, lint (0 errors, 1,122 existing warnings), backend build, Next Webpack build, Bot tests and repository security/control-byte/Prisma guards PASS.
- Root full dependency audit **FAIL** (2 critical / 8 high), Bot npm audit **FAIL** (1 critical / 5 high). Production-only dependency audit PASS; this does **not** waive the full audits.
- The first attempt to run three guards used obsolete paths and returned exit 127; rerunning the current `scripts/security/*.mjs` commands passed. Logs preserve both attempts.
- Official Test `/api/version` still reports `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production `6a989b5ac0c6155587d43426d64f6def6b62c917`; neither is this candidate. Authenticated exact-SHA Test E2E, independent backup restore, full browser WCAG/SEO and GitOps gate are **NOT CERTIFIED**.

## Integration/rollback
- This repair unblocks the duplicate-number parity test **in its candidate tree only**. Existing Draft help PRs, including #1559, must rebase and reconcile their `280-verified-help-center.sql` copies before integration; do not merge them blindly.
- Draft/HOLD PR only. No main merge, feature switch change, production/Test migration, deployment, rollback or branch deletion. Before any application, revert this candidate to roll back; after a future authorized 282 application, its file/checksum must remain immutable and rollback requires a forward-only migration.
