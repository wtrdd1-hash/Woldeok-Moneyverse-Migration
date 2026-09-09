# Release Guide

This document is the authoritative release procedure for Woldeok Moneyverse. The Korean translation is `RELEASING.ko.md`.

## Runtime contract

| Environment | Public URL | Namespace | Runtime source of truth |
| --- | --- | --- | --- |
| Production | `https://easy-scraping.com` | `wdmvp` | `wtrdd1-hash/kuber-infrastructure` |
| Isolated staging | `https://test.easy-scraping.com` | `wdmv-test` | independent Flux Kustomization in `wtrdd1-hash/kuber-infrastructure` |

The host runs Kubernetes/containerd and is reconciled by Flux. Docker Compose is not the production release control plane. The test namespace is reconciled independently from the shared Production `apps` Kustomization so a staging failure cannot block Production reconciliation.

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

## 2. Build exact-SHA staging artifacts

Push a runtime candidate on an `auto/hourly-*` or `test-candidate/*` branch. `.github/workflows/test-candidate.yml` first runs the reusable full CI gate and only then builds immutable staging images:

```text
ghcr.io/wtrdd1-hash/wdmv/backend:<sha>-test
ghcr.io/wtrdd1-hash/wdmv/frontend:<sha>-test
```

The workflow pins third-party Actions to immutable commit SHAs, enables SBOM/provenance, builds with staging origin settings, disables Search indexing and ads, and does not mutate either Kubernetes environment.

Deploy those exact images only to the isolated `wdmv-test` namespace. Backend image, frontend image, migration source, and candidate label must identify the same commit. Verify migration/data integrity, service health, user flows, authorization/security, responsive/accessibility behavior, SEO/noindex, and relevant direct-play QA. A stale staging SHA is not a pass.

## 3. Build production artifacts

Only after the exact candidate passes staging, merge the validated application change to the latest `main`, re-run required checks, then build Production artifacts from that exact verified main commit:

```bash
gh workflow run deploy.yml -f enable_ads=true
gh run watch
```

Despite the historical filename, this workflow is named **Build Production Release**. It intentionally does not mutate the production cluster. It re-runs CI, builds exact-SHA backend/frontend production images, pushes them to GHCR, emits SBOM/provenance attestations, and prints the exact GitOps promotion targets.

Release identity is the immutable SHA tag, not `latest-production`.

## 4. Production GitOps promotion

Open a branch and reviewed PR in `wtrdd1-hash/kuber-infrastructure`. Update the production image references in:

```text
apps/wdmvp/backend.yaml
apps/wdmvp/frontend.yaml
```

Do not mutate the production Deployment with `kubectl set image` as the normal release procedure. Git must remain the source of truth.

Before merging a production GitOps PR:

- the exact candidate passed CI and isolated staging;
- the Production images for that exact main SHA exist;
- the previous Production image references are recorded for rollback;
- a schema-changing or destructive release has a verified recovery path;
- migration ordering/checksums were not altered retroactively.

## 5. Flux and rollout verification

After the GitOps PR merges:

```bash
flux get sources git -A
flux get kustomizations -A
kubectl -n wdmvp rollout status deployment/wdmvp-backend --timeout=5m
kubectl -n wdmvp rollout status deployment/wdmvp-frontend --timeout=5m
kubectl -n wdmvp get pods
```

Do not report deployment success unless the intended Flux revision is Ready, the changed workloads finish rollout, and their running images match the intended SHA-qualified Production images.

## 6. Public smoke checks

At minimum:

```bash
curl --fail https://easy-scraping.com/ >/dev/null
curl --fail https://easy-scraping.com/status >/dev/null
curl --fail https://easy-scraping.com/robots.txt >/dev/null
curl --fail https://easy-scraping.com/sitemap.xml >/dev/null
curl --fail https://easy-scraping.com/ads.txt >/dev/null
```

When advertising is enabled, verify `ads.txt` and the reviewed AdSense configuration. When SEO indexing is enabled, `robots.txt` must reference the Production sitemap and the sitemap must contain the Production origin.

## 7. Data and recovery gate

Production data is PostgreSQL-backed. The ledger is the source of truth for balances and Production migrations are immutable/checksummed.

A data-changing release must not proceed while the required verified separate-media recovery path is unhealthy. Re-check the aggregate integrity audit after rollout and never print member-level values or credentials in release logs.

The 2026-09-09 recovery audit recorded a temporary same-host PostgreSQL dump because the designated separate backup SSD required repair. That same-host dump is not a substitute for separate-media recovery. Track the current recovery status in issue #139 before approving schema-changing/destructive Production work.

## 8. Rollback

For application/configuration failures, revert the GitOps image/config commit to the previously verified SHA and let Flux reconcile.

Do not delete Production PVCs, databases, ledgers, or audit data as part of an application rollback. Migrations are forward-only in normal operation; if a data restore is truly required, follow the verified recovery procedure rather than improvising from image tags.

## References

- Deployment topology: `docs/architecture/deployment-flow.md`
- Backup/recovery: `docs/BACKUP.md`
- Working rules: `AGENTS.md`
- Kubernetes Deployments: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- Kubernetes Service Accounts: https://kubernetes.io/docs/concepts/security/service-accounts/
- Flux: https://fluxcd.io/flux/
