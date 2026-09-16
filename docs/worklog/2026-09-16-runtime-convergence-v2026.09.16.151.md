# Runtime convergence v2026.09.16.151

## Scope

Converge the active public Test and Production runtimes, GitHub release evidence, and GitOps desired references on exact application SHA `3d87165f83bcb60903e85d4f3600fdf40074ef40` without moving public traffic to an unverified Kubernetes database.

## Evidence and actions

- Re-read current `main` and the Living Project Plan before work and again before Production promotion.
- Confirmed the code diff from the previous Production SHA `2b26308a46c1491a73ac1ad7911ce4eab0559b8f` to `3d87165f83bcb60903e85d4f3600fdf40074ef40` contains zero backend/frontend/database/package changes; only recovery workflow/documentation files changed.
- Confirmed both Test and Production PostgreSQL schemas contain 201 applied migration rows through `202-admin-traffic-and-ai-status.sql`.
- Built and promoted exact-SHA Test at `/home/debian/releases/test-3d87165f83bc`; public Test QA passed for version, health, status, shop catalog, game clock, anonymous admin denial, and the Test `noindex` boundary.
- Created a fresh pre-promotion Production backup `wdmv-pre-v150-20260916-162459.dump` with a SHA-256 sidecar.
- Built and promoted exact-SHA Production at `/home/debian/releases/prod-3d87165f83bc`; public version, health, shop API, robots, sitemap, and indexability checks passed.
- GitHub Production Release run `35068561793` passed the isolated exact-SHA Test gate, built/pushed both `-production` images, and emitted the Production-ready deployment signal.
- GitOps Test PR #78 and Production PR #79 were reviewed and merged. Infrastructure main `31673a795096490d280b42ea554c53d30d1964b9` now declares Test and Production `3d87165f83bcb60903e85d4f3600fdf40074ef40`.
- Production Flux `apps` remains deliberately `suspend: true`; no Kubernetes Production rollout was attempted.
- Runtime Drift Watch run `35069150294` passed, independently proving GitOps desired Test/Production SHA equals the public live SHA and that public smoke checks pass.
- Temporary deploy-credential recovery files and the temporary Debian authorized-key entry were removed.

## Remaining infrastructure boundary

The NixOS/Kubernetes host at `192.168.100.186:22` is reachable but rejects the configured deployment credential. Cluster administrative access and cluster-database reconciliation therefore remain unavailable. This does not block the current Debian public runtime, but Kubernetes Production must stay suspended until both are restored and verified.

## Rollback anchors

- Production DB backup: `/srv/moneyverse-data/backups/wdmv-pre-v150-20260916-162459.dump`
- Previous Production release: `/home/debian/releases/prod-2b26308a46c1`
- Previous Test release: `/home/debian/releases/test-cef23d5f0e36`
