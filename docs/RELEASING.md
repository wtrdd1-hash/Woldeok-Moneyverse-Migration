# Release Guide

This document is the authoritative release procedure for Woldeok Moneyverse. The Korean translation is `RELEASING.ko.md`.

## Runtime contract

| Environment | Public URL | Namespace | Runtime source of truth |
| --- | --- | --- | --- |
| Production | `https://easy-scraping.com` | `wdmvp` | `wtrdd1-hash/kuber-infrastructure` |
| Isolated Test | `https://test.easy-scraping.com` | `wdmv-test` | independent Flux Kustomization in `wtrdd1-hash/kuber-infrastructure` |

The host runs Kubernetes/containerd and is reconciled by Flux. Docker Compose is not the Production release control plane. Test is isolated from Production and must not mutate Production state.

## 1. Development and exact-SHA CI gate

Development branches eligible for automated integration are limited to these prefixes:

```text
feat/*
feature/*
fix/*
bugfix/*
integrate/*
ops/*
auto/*
test-candidate/*
```

`.github/workflows/test-candidate.yml` runs the reusable full CI gate and then builds immutable Test images for the exact branch HEAD:

```text
ghcr.io/wtrdd1-hash/wdmv/backend:<sha>-test
ghcr.io/wtrdd1-hash/wdmv/frontend:<sha>-test
```

The gate includes lint, typecheck, build, tests, PostgreSQL migrations and DB-backed tests, control-byte and committed-secret checks, Prisma mutation protection, and Production dependency audit. A skipped DB test is not treated as a pass.

## 2. Automatic branch → main integration

`.github/workflows/auto-integrate-promote.yml` runs hourly and can also be dispatched manually. It integrates at most one branch per run.

A branch is eligible only when all of the following are true:

- its current HEAD is ahead of `main`;
- a successful `Build Test Candidate` run exists for that exact HEAD SHA;
- the branch matches an allowed development prefix;
- GitHub reports the PR as mergeable without conflicts;
- the PR HEAD still equals the SHA that passed the Test Candidate gate.

The workflow opens an integration PR when needed, squash-merges the validated exact HEAD to `main`, requests deletion of the merged source branch, and explicitly dispatches `Build Test Candidate` on `main`.

The explicit dispatch is required because follow-on workflow events created with `GITHUB_TOKEN` are not relied on as a release trigger.

## 3. Automatic isolated Test verification

A successful `main` Test Candidate is consumed by the GitOps reconciler and deployed only to the isolated Test namespace.

The Production release workflow waits for `https://test.easy-scraping.com/api/version` to report the exact `main` SHA and then verifies a real backend/database path through `/app-api/v1/shop/public-catalog`. It also verifies the Test `noindex` boundary.

If Test never serves the exact SHA or the backend/database smoke check fails, Production promotion stops closed.

## 4. Automatic Production artifact and GitOps promotion

After the exact main SHA passes the isolated Test gate, `.github/workflows/deploy.yml` builds immutable Production backend/frontend images for that same SHA and emits a `production-ready` deployment signal.

The GitOps reconciler is the only Production cluster mutation path. It consumes the exact-SHA `production-ready` signal, updates the infrastructure repository, and lets Flux reconcile the Production namespace.

Application GitHub Actions do not receive Production kubeconfig or Production database credentials.

Release identity is the immutable SHA tag, never `latest-production`.

## 5. Branch cleanup

Merged source branches are deleted by the automatic integration workflow. `.github/workflows/cleanup-merged-branches.yml` remains as a second safety net: it deletes a merged PR source branch and periodically removes branches that are already fully contained in `main`.

Protected branches and `main`, `production`, `staging`, `develop`, and `release/*` are excluded from pruning.

## 6. Mandatory continuity and cache-freshness gate

Every frontend or backend runtime change must be promoted without an intentional public outage. The host mirror or cluster rollout must keep the old instance available until the replacement is healthy, then switch traffic through the normal readiness/rolling mechanism. Do not stop the only healthy Production process before its replacement is serving.

Member login state must survive frontend/backend rollout and restart. Production backend instances must keep using the same Production PostgreSQL session store and cookie signing/encryption contract; deployment must not revoke, truncate, recreate, rotate, or re-key active member sessions. Test must prove that a member session created before restart is accepted after restart without issuing a replacement login session.

Frontend delivery must force users onto the newly deployed application shell while preserving safe immutable caching. HTML/document and version-sensitive bootstrap responses must use revalidation/no-cache semantics; content-hashed Next.js static assets remain long-cacheable. A release must not rely on users manually clearing browser cache. After promotion, verify the public document/version endpoint identifies the intended SHA and that a fresh request cannot receive the previous application shell from an intermediate cache.

For the host systemd mirror, prepare only `frontend/.next/cache` with `ops/systemd/prepare-frontend-runtime-cache.sh`; never delete member session rows as a cache-clearing technique. Backend and frontend restart/rollout steps are considered complete only after readiness, session-continuity, version-freshness, and smoke probes all pass.

## 6. Production verification

Production is not considered successfully released until the intended Flux revision is Ready, changed workloads complete rollout, their running images match the intended SHA-qualified Production images, and the public smoke checks pass.

Minimum public smoke endpoints are:

```text
/
/status
/robots.txt
/sitemap.xml
/ads.txt
```

Advertising and SEO checks must match the reviewed Production configuration.

## 7. Data and recovery gate

Production data is PostgreSQL-backed. The ledger is the source of truth for balances and Production migrations are immutable/checksummed.

A schema-changing or destructive release must not proceed while the required verified separate-media recovery path is unhealthy. Re-check aggregate integrity after rollout and never print member-level values or credentials in release logs.

The 2026-09-09 recovery audit recorded a temporary same-host PostgreSQL dump because the designated separate backup SSD required repair. That dump is not a substitute for separate-media recovery. Track current recovery status in issue #139.

## 8. Rollback

For application/configuration failures, revert the GitOps image/config commit to the previously verified SHA and let Flux reconcile.

Do not delete Production PVCs, databases, ledgers, or audit data as part of an application rollback. Migrations are forward-only in normal operation; use the verified recovery procedure if a data restore is required.

## References

- `.github/workflows/auto-integrate-promote.yml`
- `.github/workflows/test-candidate.yml`
- `.github/workflows/deploy.yml`
- `.github/workflows/cleanup-merged-branches.yml`
- `docs/architecture/deployment-flow.md`
- `docs/BACKUP.md`
- `AGENTS.md`

### Ready-only automatic main integration

A development branch is treated as **work in progress** and is never automatically merged, reconciled, or deleted when it has no open PR, when its PR is Draft, or when it carries a WIP/hold/do-not-merge style blocking label. Automatic integration requires an open non-Draft PR to `main`, no blocking marker, a successful exact-HEAD `Build Test Candidate`, and a mergeable PR. Repeated candidate failures retain the branch/PR for repair; the automation does not discard failed work.

[executed on device: debian13 (d2f8c9a2-2e5a-4e57-a99d-1a9389e70b4c)]