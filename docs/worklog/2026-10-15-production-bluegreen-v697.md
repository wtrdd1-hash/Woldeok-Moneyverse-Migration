# v2026.10.15.697 — Blue/green Production worklog (English)

## START — 23:10 KST, 15 October 2026
- User explicitly requested actual Production release with all CI and branch integration. Source `a5a1e9da6fc55ac71c44c4cf6ee138e9442f4e73`, exact public Test v696 and PR #874 passing CI. Began with master planning/deployment docs, active host services, GitHub main and rollback review. Existing PUBLIC DB grants are open; no Production DB mutation authorized or attempted.

## MIDDLE — 23:16–23:32 KST
- Discovered Production Nginx actually pointed frontend at legacy v635 canary :3203 rather than `production-current` frontend :3001; backend :3000. Avoided false pointer-only deployment.
- Root-restricted `pg_dump` at `/srv/moneyverse-data/backups/release-v697-preprod/prod-20261015.dump`, integrity hash and pg_restore table-of-contents verified. Restored temporary Production shadow into Test PostgreSQL; candidate backend health/version/stocks 200 and DB-backed auth continuity pass, then shadow DB removed. Current production database not modified.
- Immutable Production v697 staged with exact source; two temporary new canaries booted on :3205/:3206 and verified. Nginx prior config backup, tested Nginx syntax and atomically rerouted public hosts to candidate; 5 repeated HTTP/same SHA passes. Previous services retained for rollback.
- Replaced temporary-only runtime with permanent enabled `moneyverse-release-v697-backend.service`(:3213) and `moneyverse-release-v697-frontend.service`(:3214), boot-tested via active/readiness and public cutover. Original backend/frontend systemd fallback WorkingDirectory pinned to `prod-v600`, `production-current` symlink moved atomically to v697. Stopped temporary :3205/:3206 canaries.
- Created immutable Git tag `prod-v2026.10.15.697` on exact runtime source. PR #874 marked ready and merged to main commit `143689121c4eef6e69fa64270c7390db4a947de2`; Git trees match exactly.

## END
- Live Production backend and frontend exact source identity and representative public endpoints verified. Permanent systemd active and enabled. No Production SQL migration, app-role privileges, balances, real member sessions or bot/AI services changed. Old production fallback survives. Release succeeded at routing/code level; financial least-privilege and full real-user acceptance remain unresolved; see [release limitations](../releases/v2026.10.15.697.md).
