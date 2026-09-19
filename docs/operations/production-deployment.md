# Production Deployment

This is the procedure. For what the machine *is* — the cluster, what remains
of the retired Docker host, and the failure modes this arrangement has already
produced — read [`../INFRASTRUCTURE.md`](../INFRASTRUCTURE.md) first.

## Deployment philosophy

`main` is continuously validated and the normal Test→Production promotion path is automated but fail-closed. The application repository builds immutable release images only after the exact SHA is live and healthy in isolated Test; Production state is declared in `wtrdd1-hash/kuber-infrastructure` and reconciled by Flux.

Docker Compose is not the Production deployment control plane.

## Current public-edge runtime

GitOps remains the declarative release authority, but the current public Nginx edge on the mini PC still proxies to host systemd services: Production backend/frontend on ports `3000/3001`, and Test backend/frontend on `3100/3101`. Until ingress is fully moved onto the reconciled cluster runtime, every promotion must mirror the approved exact SHA into these host services and verify the public `/api/version`. A GitOps manifest update by itself is not evidence that the public site changed.

The host mirror must use the same approved SHA, preserve the previous unit configuration for rollback, and pass the same catalog/status/SEO probes before a release is reported complete.


### Stable Test environment ownership — v2026.09.19.263

Persistent Test services must not load `backend/.env` or `frontend/.env.local` from a release directory. systemd loads `EnvironmentFile=` values late enough that a stale release-local `PORT` or `BUILD_ID` can override a candidate value and silently bind the wrong listener or report the wrong release identity.

Use stable secret-bearing files `/etc/moneyverse/test-backend.env` and `/etc/moneyverse/test-frontend.env`, then load generated release-scoped files `/etc/moneyverse/test-backend-release.env` and `/etc/moneyverse/test-frontend-release.env` last. Generate the latter pair with `ops/systemd/write-test-release-env.sh <exact-sha> /etc/moneyverse`. The reviewed unit drop-ins are `ops/systemd/test-main-backend-release.conf.example` and `ops/systemd/test-main-frontend-release.conf.example`.

Both Test services must resolve through the same `/srv/moneyverse-data/releases/test-current` root. Before restart, verify that root contains a built backend and frontend from one exact SHA; after restart require backend `:3100/health`, public Test `/api/version`, frontend BFF catalog and `X-Robots-Tag: noindex` to pass. A mixed backend/frontend release is a failed gate even when both processes are individually healthy.

## Frontend runtime cache ownership

The host systemd frontend runs as `debian`, while Next.js updates `.next/cache` at runtime for server-side fetch revalidation. A release copied or built as root must therefore prepare only that mutable cache subtree before canary/start; do not recursively change ownership of the immutable application release.

Run `ops/systemd/prepare-frontend-runtime-cache.sh <release-dir> debian debian` on Test first. The helper refuses paths outside `/srv/moneyverse-data/releases` by default, limits ownership changes to `frontend/.next/cache`, and verifies a real write as the runtime user. After requests that exercise revalidation, confirm the frontend journal has no new `EACCES` cache-write errors before Production promotion.

## Backend session continuity

Production backend promotion must not log members out. Member sessions are PostgreSQL-backed in `auth_sessions`; browser and server-side member-session lifetime are both 30 days. A backend process restart or release-directory change therefore must reuse the same Production database and must not revoke, truncate, recreate, or re-key live session rows. Administrator console sessions retain their separate short lifetime and are not extended by this rule.

For the host systemd mirror, keep secrets and `DATABASE_URL` outside immutable release directories in `/etc/moneyverse/backend-production.env`, keep release identity in `/etc/moneyverse/backend-release.env`, and point `WorkingDirectory` through `/srv/moneyverse-data/releases/production-current/backend`. The reviewed drop-in template is `ops/systemd/moneyverse-backend-session-continuity.conf.example`. Before Production promotion, Test must prove that a cookie issued before a backend restart is accepted after the restart without a new session, and the real-database auth test must prove an authenticated session survives repository/process recreation. Rollback changes code/runtime pointers only; it does not mutate `auth_sessions`.

## Mandatory rollout continuity and cache freshness

All runtime-affecting frontend/backend promotions use a zero-downtime handoff: start or roll the replacement, wait for readiness, then remove the previous instance. Never create an avoidable public gap by stopping the only healthy Production process first. Member auth continuity is a release gate, not a best-effort check: pre-restart member cookies must remain valid after the backend restart against the same `auth_sessions` store.

Cache invalidation must make the new application shell effective without user action. Version-sensitive HTML/bootstrap responses must revalidate instead of being served indefinitely from browser/proxy cache, while content-hashed immutable assets may keep long cache TTLs. Promotion verification must confirm the public version/SHA and fetch a fresh document that is not the prior release shell. Cache cleanup must not touch PostgreSQL member sessions.

## Expected order

1. Merge validated application code to `main`.
2. CI automatically builds exact-SHA `-test` images.
3. The GitOps auto-reconciler pins isolated Test to the latest successful `main` SHA.
4. `Build Production Release` waits until `test.easy-scraping.com/api/version` reports that exact SHA and the public catalog backend/database path plus noindex boundary pass.
5. The workflow builds same-SHA `-production` images and publishes a successful `production-ready` deployment signal.
6. The GitOps auto-reconciler accepts only a signal matching the current successful Test/main SHA, re-runs the Test smoke gate, and updates the Production manifests.
7. Flux reconciles Production. The reconciler waits for the public Production version to report the exact SHA and verifies `/status` plus the backend/database catalog path.
8. Keep the previous Production image references available for rollback. Schema-changing/destructive releases still require their recovery prerequisites; automation does not waive database safety rules.

## Images

Backend and frontend production images are built in GitHub Actions and pushed to GHCR as immutable commit tags:

```text
ghcr.io/wtrdd1-hash/wdmv/backend:<sha>-production
ghcr.io/wtrdd1-hash/wdmv/frontend:<sha>-production
```

The GitOps manifests must reference the exact SHA-qualified tags. Mutable `latest-*` tags are not release identity.

## GitOps source of truth

Production application declarations live under:

```text
wtrdd1-hash/kuber-infrastructure
  apps/wdmvp/backend.yaml
  apps/wdmvp/frontend.yaml
```

Normal releases must not use `kubectl set image` or host-local manifest edits because those create drift from Flux/Git.

## Rollout verification

For direct cluster diagnosis after GitOps reconciliation:

```bash
flux get sources git -A
flux get kustomizations -A
kubectl -n wdmvp rollout status deployment/wdmvp-backend --timeout=5m
kubectl -n wdmvp rollout status deployment/wdmvp-frontend --timeout=5m
kubectl -n wdmvp get pods
```

Do not report success until the changed workload is Ready and running the intended image SHA.

## Database/data safety

Normal application deployment:

- does not recreate/drop the Production database or PVC;
- does not erase ledger/audit history;
- does not retroactively rewrite existing economic contracts without an explicit migration;
- does not run schema-changing/destructive promotion while the required verified recovery gate is unhealthy.

The current separate-media recovery risk is tracked in issue #139.

## Post-deploy probes

At minimum verify:

```text
/
/login
/work
/quests
/casino
/wallet
/shop/catalog
/progression
/terms
/privacy
/status
/announcements
/robots.txt
/sitemap.xml
/ads.txt
```

Also verify internal-only/forbidden probe paths remain unavailable externally, and re-run the aggregate data-integrity audit for data-affecting releases.

See `docs/RELEASING.md` and `docs/RELEASING.ko.md` for the operator checklist.
