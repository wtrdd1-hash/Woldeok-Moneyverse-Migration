# Work reward Production promotion — v2026.09.19.269

## English (canonical)

Runtime v2026.09.19.268 was promoted from merged main SHA `d145d85591d5a36816d7f116ce66db3c16555e7a` after the original v267 candidate was blocked by exact-head CI and superseded by PR #543.

## Evidence

- GitHub PR #543 merged after CI run #1406 (`35424883407`) completed successfully.
- Fresh PostgreSQL 17.11 validation passed migrations through 210, backend 1463/1463 tests and frontend 652/652 tests before merge.
- Isolated Test applied migrations 209 and 210, then served `/health` successfully with `/api/version` equal to the exact merged SHA.
- Test immutable release: `/srv/moneyverse-data/releases/test-d145d85591d5-v268`.
- A verified encrypted database/photo backup completed at 2026-09-19 14:55:49 KST before Production database migration.
- Production applied migrations 209 and 210 using the migrator role before application cutover.
- Production immutable release: `/srv/moneyverse-data/releases/prod-d145d85591d5-v268`.
- Public Production `/health`, `/api/version`, and `/frontend-version` passed; both version endpoints returned the exact runtime SHA.
- Nginx host-routing guard passed and backend/frontend services were active with no warning-or-higher journal entries in the post-promotion window.

## Rollback

The previous Test and Production release directories remain intact. Database migrations are forward-only; rollback may repoint application code to the previous release but must not rewrite settled history or remove migrations 209/210.
