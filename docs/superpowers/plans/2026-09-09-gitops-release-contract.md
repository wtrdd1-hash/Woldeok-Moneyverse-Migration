# GitOps release contract implementation plan — 2026-09-09

## Goal

Remove the obsolete Docker Compose production mutation path from the application repository and make Kubernetes/Flux GitOps the only documented production release contract.

## Current facts

- Application runtime: Next.js + NestJS + PostgreSQL.
- Production: namespace `wdmvp` on Kubernetes/containerd.
- Test: isolated namespace `wdmv-test` with its own frontend/backend/PostgreSQL/secrets/routing/readiness.
- Runtime source of truth: `wtrdd1-hash/kuber-infrastructure`, reconciled by Flux.
- The old `.github/workflows/deploy.yml` still SSHes to the host and invokes Docker Compose, which is incompatible with the current host.

## Implementation

1. Replace the obsolete rollout part of `.github/workflows/deploy.yml` with a release-artifact workflow.
2. Keep the full CI reusable workflow as a prerequisite.
3. Build only immutable `<sha>-production` backend/frontend tags.
4. Generate SBOM and provenance attestations for production images.
5. Do not mutate production from the application repository workflow.
6. Promote only by reviewed changes to `kuber-infrastructure/apps/minipc/wdmvp/*.yaml`.
7. Require Flux reconciliation, Kubernetes rollout completion, public smoke checks, and data-integrity/recovery gates before reporting success.
8. Update release/deployment documentation in English and Korean.
9. Add a spec amendment because the original planning document still describes SQLite and an older runtime topology.

## Validation

The application PR must pass the repository CI gate:

- committed secret rejection
- lint
- raw control-byte rejection
- typecheck
- build
- PostgreSQL migration application
- tests
- Prisma schema mutation rejection
- production dependency audit

The workflow itself is YAML parsed by GitHub Actions when the PR branch is evaluated and must remain `workflow_dispatch` only for production artifact builds.

## Deployment boundary

This change is release-engineering only. It must not perform schema changes or mutate production data. Production promotion remains a separate GitOps PR, and schema-changing/destructive promotion remains blocked while issue #139's separate-media recovery requirement is unresolved.

## Follow-up

- Close #126 after the GitOps contract documentation and obsolete Compose rollout removal are merged.
- Keep #139 open until separate-media backup/restore is healthy and rehearsed.
- Re-evaluate any remaining host-side image staging/prepull workflow separately; it must not become a second production source of truth.
