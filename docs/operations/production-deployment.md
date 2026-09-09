# Production Deployment

This is the procedure. For what the machine *is* — the cluster, what remains
of the retired Docker host, and the failure modes this arrangement has already
produced — read [`../INFRASTRUCTURE.md`](../INFRASTRUCTURE.md) first.

## Deployment philosophy

`main` is continuously validated, but Production promotion is explicit. The application repository builds immutable release images; Production state is declared in `wtrdd1-hash/kuber-infrastructure` and reconciled by Flux.

Docker Compose is not the Production deployment control plane.

## Expected order

1. Merge validated application code to `main`.
2. Confirm the exact SHA passed repository CI.
3. Build exact-SHA production images with the `Build Production Release` workflow.
4. Record the currently running production image references for rollback.
5. Confirm recovery prerequisites for any schema-changing/destructive release.
6. Update the `wdmvp` backend/frontend image references in `wtrdd1-hash/kuber-infrastructure`.
7. Commit directly to its `main` — that repository takes direct pushes, not branches or pull requests — and wait for Flux reconciliation.
8. Require `kubectl rollout status` success for changed Deployments.
9. Confirm the running image references match the intended SHA.
10. Verify public routes and protected boundaries.
11. Re-run aggregate data-integrity/recovery checks when the release can affect data.

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

After the GitOps PR merges:

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
