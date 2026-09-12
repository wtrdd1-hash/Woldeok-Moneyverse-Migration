# 2026-09-12 — Test-to-Production deployment gate

Update version: `v2026.09.12.10`

## Findings

- The Living Project Plan still requires a dedicated test stack to be used before Production.
- `kuber-infrastructure` currently contains an isolated `wdmv-test` Flux Kustomization and dedicated PostgreSQL database.
- `docs/architecture/deployment-flow.md` was stale and incorrectly claimed that no test gate existed.
- The application test-candidate workflow did not run automatically for `main`.

## Changes

- Added `main` to the `Build Test Candidate` push trigger.
- Updated deployment-flow documentation to the current GitOps test → verify → production contract.
- Preserved exact-SHA image identity and separate Test/Production databases.

## Validation and rollout

- GitHub CI and test-image build are required before test promotion.
- Test promotion uses `kuber-infrastructure/.github/workflows/wdmv-promote.yml`.
- Production promotion is allowed only after the same application SHA passes the test-origin checks.
- Rollback remains a GitOps image-reference revert; Production database/PVC deletion is prohibited.
