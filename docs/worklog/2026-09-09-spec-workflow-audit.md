# Living Spec and workflow audit — 2026-09-09

## Status checklist

- [x] Sync current `main` and review recent merged work.
- [x] Confirm the Korean Living Spec gained a product-expansion roadmap not present in the English primary spec.
- [x] Confirm `.github/workflows/test-images.yml` only watched the already-merged product branch while holding `packages: write`.
- [x] Add the product-expansion roadmap to the English Living Spec with implementation-status wording.
- [x] Remove the stale branch-specific image-publishing workflow rather than leave an unused write-capable CI path.
- [x] Run repository CI after both corrections — GitHub Actions CI run 34291522907 succeeded on the branch synchronized with then-current `main`.
- [x] Merge only if current-main CI succeeds — PR #134 merged as `c89b5fcb` after CI success.

## Findings

1. Documentation parity drift: PR #130 updated `docs/planning/PROJECT_PLAN.ko.md` with the P0–P3 product expansion roadmap but did not update `PROJECT_PLAN.md`, despite the Living Spec declaring English primary and Korean parity.
2. CI/supply-chain drift: PR #130 also left `.github/workflows/test-images.yml` on `main`. Its automatic trigger targeted only `docs/product-expansion-plan-20260909`, the branch that had already been merged. The workflow could push GHCR images (`packages: write`) but was not an authoritative deployment/test gate.

## Correction

The roadmap is now present in both Living Spec languages and the stale branch-specific image publisher has been removed. A future repaired test environment must use a purpose-built workflow tied to the authoritative Kubernetes/GitOps deployment contract, least privilege, immutable image tags, and readiness gates.

## Deployment state

This task itself was documentation/CI-only and required no production rollout. The broader runtime deployment state was re-checked separately on 2026-09-09: Flux is now healthy and production is running the `ffcdc5b0...-production` frontend/backend images. The release-engineering issue #126 remains open because repository `deploy.yml` still describes Docker Compose/SSH rather than the authoritative Kubernetes/Flux path, and `wdmv-test` remains broken.

## Changes completed

- Added the P0–P3 roadmap to the English primary Living Spec and recorded the stock watchlist as implemented but still release-gated.
- Removed `.github/workflows/test-images.yml`; it only targeted the already-merged one-off branch and retained `packages: write` without being an authoritative test/deployment path.
- No application code, migration, database role, secret, runtime configuration, or production data changed.

## Final state

PR #134 merged after successful CI. This task changed documentation and removed a stale non-authoritative image-publishing workflow only. The remaining Kubernetes/GitOps deployment-contract and test-environment work stays tracked in #126.