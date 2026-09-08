# Living Spec and workflow audit — 2026-09-09

## Status checklist

- [x] Sync current `main` and review recent merged work.
- [x] Confirm the Korean Living Spec gained a product-expansion roadmap not present in the English primary spec.
- [x] Confirm `.github/workflows/test-images.yml` only watches the already-merged product branch while holding `packages: write`.
- [x] Add the product-expansion roadmap to the English Living Spec with implementation-status wording.
- [x] Remove the stale branch-specific image-publishing workflow rather than leave an unused write-capable CI path.
- [ ] Run repository CI after both corrections.
- [ ] Merge only if current-main CI succeeds.

## Findings

1. Documentation parity drift: PR #130 updated `docs/planning/PROJECT_PLAN.ko.md` with the P0–P3 product expansion roadmap but did not update `PROJECT_PLAN.md`, despite the Living Spec declaring English primary and Korean parity.
2. CI/supply-chain drift: PR #130 also left `.github/workflows/test-images.yml` on `main`. Its automatic trigger targets only `docs/product-expansion-plan-20260909`, the branch that has already been merged. The workflow can push GHCR images (`packages: write`) but is not an authoritative deployment/test gate and the residual test environment is not currently a valid release gate (#126).

## Intended correction

Keep the roadmap in both Living Spec languages and remove the stale branch-specific image publisher. A future repaired test environment should receive a purpose-built workflow tied to the authoritative deployment contract, least privilege, immutable image tags, and readiness gates.

## Deployment state

Documentation/CI-only task. No production or database change is planned. Production deployment remains blocked by #126 for code/runtime promotion.

## Changes completed

- Added the P0–P3 roadmap to the English primary Living Spec and recorded the stock watchlist as implemented but still release-gated.
- Removed `.github/workflows/test-images.yml`; it only targeted the already-merged one-off branch and retained `packages: write` without being an authoritative test/deployment path.
- No application code, migration, database role, secret, runtime configuration, or production data changed.
