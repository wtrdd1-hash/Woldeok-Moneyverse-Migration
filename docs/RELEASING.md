# Release Guide

This document is the authoritative release procedure for Woldeok Moneyverse. The Korean translation is `RELEASING.ko.md`.

## Runtime contract

| Environment | Public URL | Namespace | Runtime source of truth |
| --- | --- | --- | --- |
| Production | `https://easy-scraping.com` | `wdmvp` | `wtrdd1-hash/kuber-infrastructure` |

There is one stack. The `wdmv-test` namespace was removed on 2026-09-09, so no
commit is rehearsed anywhere before it reaches production.

The host runs Kubernetes/containerd and is reconciled by Flux. Docker Compose is not the production release control plane.

## 1. Development and CI gate

Before a change can be promoted, the repository gate must pass for the exact commit:

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
scripts/check-control-bytes.sh
scripts/check-secrets.sh
pnpm audit --prod --audit-level=high
```

CI additionally provisions PostgreSQL, applies the numbered migrations, runs DB-backed tests, rejects Prisma schema mutation, and verifies the production dependency audit. A skipped DB test is not a pass.

## 2. Build production artifacts

From the application repository's `main` branch:

```bash
gh workflow run deploy.yml -f enable_ads=true
gh run watch
```

Despite the historical filename, this workflow is now named **Build Production Release**. It intentionally does not mutate the production cluster. It:

1. enforces `main`;
2. re-runs the complete CI workflow;
3. builds exact-SHA backend/frontend production images;
4. pushes them to GHCR;
5. emits SBOM/provenance attestations;
6. prints the exact GitOps promotion targets.

Release identity is the immutable SHA tag, not `latest-production`.

## 3. Production GitOps promotion

Open a branch and reviewed PR in `wtrdd1-hash/kuber-infrastructure`. Update the production image references in:

```text
apps/wdmvp/backend.yaml
apps/wdmvp/frontend.yaml
```

Do not mutate the production Deployment with `kubectl set image` as the normal release procedure. Git must remain the source of truth.

Before merging a production GitOps PR:

- the exact candidate passed CI and the isolated test gate;
- the production images for that exact SHA exist;
- the previous production image references are recorded for rollback;
- a schema-changing or destructive release has a verified recovery path;
- migration ordering/checksums were not altered retroactively.

## 4. Flux and rollout verification

After the GitOps PR merges:

```bash
flux get sources git -A
flux get kustomizations -A
kubectl -n wdmvp rollout status deployment/wdmvp-backend --timeout=5m
kubectl -n wdmvp rollout status deployment/wdmvp-frontend --timeout=5m
kubectl -n wdmvp get pods
```

Kubernetes documents `kubectl rollout status` as the completion check for a Deployment. Do not report deployment success unless the changed workload finishes its rollout and is available.

Confirm the running image references are the intended SHA-qualified production images.

## 5. Public smoke checks

At minimum:

```bash
curl --fail https://easy-scraping.com/ >/dev/null
curl --fail https://easy-scraping.com/status >/dev/null
curl --fail https://easy-scraping.com/robots.txt >/dev/null
curl --fail https://easy-scraping.com/sitemap.xml >/dev/null
curl --fail https://easy-scraping.com/ads.txt >/dev/null
```

When advertising is enabled, verify `ads.txt` and the reviewed AdSense configuration. When SEO indexing is enabled, `robots.txt` must reference the production sitemap and the sitemap must contain the production origin.

## 6. Data and recovery gate

Production data is PostgreSQL-backed. The ledger is the source of truth for balances and production migrations are immutable/checksummed.

A data-changing release must not proceed while the required verified separate-media recovery path is unhealthy. Re-check the aggregate integrity audit after the rollout and never print member-level values or credentials in release logs.

The 2026-09-09 recovery audit recorded a temporary same-host PostgreSQL dump because the designated separate backup SSD required repair. That same-host dump is not a substitute for separate-media recovery. Track the current recovery status in issue #139 before approving schema-changing/destructive production work.

## 7. Rollback

For application/configuration failures, revert the GitOps image/config commit to the previously verified SHA and let Flux reconcile.

Do not delete production PVCs, databases, ledgers, or audit data as part of an application rollback. Migrations are forward-only in normal operation; if a data restore is truly required, follow the verified recovery procedure rather than improvising from image tags.

## References

- Deployment topology: `docs/architecture/deployment-flow.md`
- Backup/recovery: `docs/BACKUP.md`
- Working rules: `AGENTS.md`
- Kubernetes Deployments: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- Flux: https://fluxcd.io/flux/
