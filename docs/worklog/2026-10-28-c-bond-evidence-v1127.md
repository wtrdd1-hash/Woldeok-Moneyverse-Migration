# Development C v1127 — Treasury bond financial evidence (EN canonical)

## Start — 2026-10-28 16:xx KST
- Baseline main: `d12c948ac454b0762cfb7fb0cddf83703a775172`; branch `auto/hourly-c-bond-coupon-evidence-v1127-20261028-1645` in isolated worktree.
- Debian 13 miniPC status: backend/frontend/bot/MCP/desktop/nginx/docker active; development database reachable (do not mutate shared database).
- Read AGENTS.md, README.md, README/README.ko.md, English/Korean living plans; surveyed 40 open PRs and latest CI, including C #1712, B #1710, A #1708, QA #1687, planning #1702. No open bond overview PR.
- P1 root cause A: `bondBenchmarkYield` intentionally returns `—` when a tenor has no active instrument, but admin `parseBondEvidence.percent` rejects `—`, hiding legitimate empty/inactive market states.
- P1 root cause B: `TreasuryBondRepository.getOverview` sums all coupon log amounts without filtering `MATURITY_REDEMPTION` principal, inflating the reported coupon-interest metric.
- Scope: correct validated server-to-UI bond metrics and regression tests only; no new migration, finance writes, GitOps or Production change.
- Plan: RED tests → minimal code fix → targeted unit/SSR/contract → complete HEAD SHA gates → draft PR or hold with precise blockers. Verify main and canonical plans again mid-run and before any merge.

## Mid-run — 2026-10-28 16:15 KST
- Re-fetched main: `d12c948ac454b0762cfb7fb0cddf83703a775172`, unchanged. EN/KO canonical plan SHA256 unchanged (`0dd578b2…`, `ab4fca03…`).
- TDD RED: frontend sentinel test 1 failed (`Invalid bond yield`), backend aggregate test 1 failed (`10042` vs expected `42`), component copy test 1 failed under `NODE_ENV=test` (3 existing pass). Running component tests without `NODE_ENV=test` caused React.act environment errors; corrected invocation, not a product bug.
- TDD GREEN: frontend focused 20/20; backend repository 8/8. Changes are a sentinel allowance for the backend's explicit `—` no-active-tenor value, interest-only SQL predicate, and truthful cumulative interest copy. No migration or runtime mutation.
