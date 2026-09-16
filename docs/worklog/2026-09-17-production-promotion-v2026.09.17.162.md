# v2026.09.17.162 — Production exact-SHA promotion and runtime convergence

- Date: 2026-09-17
- Branch: `ops/production-promotion-v2026.09.17.162`
- Application release: `18c7a1324013099e47b2d6e22c5108c4d378139c`
- Test/Production release workflow: `35113806254`
- GitOps production reconcile workflow: `35117875121`
- Infrastructure production commit: `bb7f683d7b0a494d41dcbf35dda5dcd793c2e164`
- Korean counterpart: [2026-09-17-production-promotion-v2026.09.17.162.ko.md](2026-09-17-production-promotion-v2026.09.17.162.ko.md)

## Scope
Promote the already validated current `main` exact SHA from isolated Test to Production without bypassing the Test, production-ready, database-backup, migration, or public-smoke gates. This operation also records the runtime-routing fact discovered during promotion: the public edge is currently served by host systemd services while GitOps remains the declarative release authority.

## Release evidence
- Application `main`, public Test `/api/version`, public Production `/api/version`, and GitOps Production manifests converged on `18c7a1324013099e47b2d6e22c5108c4d378139c`.
- `Build Production Release` passed the exact-SHA Test gate, built backend/frontend production images and published a successful `production-ready` signal (deployment `6484314782`).
- `Auto Reconcile Woldeok Moneyverse` updated Production manifests to the same SHA and completed its public Production smoke successfully.
- Production DB backup created before schema mutation: `/srv/moneyverse-data/backups/prod-before-18c7a1324013-20260917-005112.dump` (9.2 MiB observed).
- `203-work-reset-convergence.sql` was applied to Production through the exact-release migration runner and recorded with checksum `1371d66027bc62bbbdac71b0b7a0a9a771ea1782362941674768ce1a2fc1ba54`.
- Previous host systemd drop-ins were preserved at `/srv/moneyverse-data/backups/prod-systemd-20260917-005707` before switching the public host runtime.

## Public verification
- `/`, `/login`, `/work`, `/casino`, `/shop/catalog`, `/status`, `/robots.txt`, `/sitemap.xml`, and `/ads.txt` returned HTTP 200.
- Public catalog returned 146 items through the backend/database path.
- Production emitted no `X-Robots-Tag: noindex`; Test retained its `noindex, nofollow` boundary before promotion.
- `moneyverse-backend`, `moneyverse-frontend`, and `moneyverse-economy-ai` were active after cutover; recent severe-log scan found zero matching fatal/uncaught/OOM/panic entries.
- Economy controls remained enabled: `economy_ai_policy_review=enabled`, `economy_auto_policy=enabled`; selected local models remained `llama3.2:3b` and `gemma3:1b`.

## Runtime convergence rule
GitOps manifests remain the declarative release authority, but the current public Nginx edge reaches host systemd services (`3000/3001` Production and `3100/3101` Test). A release is therefore not complete when GitOps manifests alone change: the public host runtime must report the same exact SHA and pass the public catalog/status/SEO probes. This host mirror is an operational compatibility layer until public ingress is moved wholly onto the reconciled cluster runtime.

## Rollback
Keep the previous Production release and unit configuration available. For an application rollback, restore the previous systemd drop-ins, restart backend/frontend, verify public `/api/version`, catalog and status, and separately assess whether a database restore is required. Do not restore the database merely to roll back code when the forward migration is backward-compatible; use the pre-release dump only when data/schema recovery is actually required.
