# Production Deployment

This is the procedure. For what the machine *is* — the cluster, what remains
of the retired Docker host, and the failure modes this arrangement has already
produced — read [`../INFRASTRUCTURE.md`](../INFRASTRUCTURE.md) first.

## Deployment philosophy

`main` is continuously validated and the normal Test→Production promotion path is automated but fail-closed. The application repository builds immutable release images only after the exact SHA is live and healthy in isolated Test; Production state is declared in `wtrdd1-hash/kuber-infrastructure` and reconciled by Flux.

Docker Compose is not the Production deployment control plane.

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
