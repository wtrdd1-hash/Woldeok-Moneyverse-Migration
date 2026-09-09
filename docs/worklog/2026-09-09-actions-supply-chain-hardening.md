# 2026-09-09 — GitHub Actions supply-chain hardening

## Finding

Severity: **Medium**.

The CI workflow referenced reusable GitHub Actions through mutable major-version tags (`actions/checkout@v7`, `pnpm/action-setup@v6`, `actions/setup-node@v7`) and did not explicitly reduce the workflow-level `GITHUB_TOKEN` permissions. GitHub's secure-use guidance recommends pinning third-party actions to full-length commit SHAs and explicitly granting the minimum token permissions required.

This is a CI/CD supply-chain exposure rather than an application runtime vulnerability. A moved/compromised action tag could change code executed inside CI. The CI job only needs repository read access.

## Decision

Keep the reviewed upstream major releases, but pin the exact commits currently referenced by those tags and make `contents: read` the workflow-level token permission. Comments retain the human-readable major release next to each SHA.

This does not change the product Living Spec or runtime architecture; it tightens implementation of the existing CI/CD least-privilege and supply-chain security requirement.

## Changes

- `.github/workflows/ci.yml`
  - added workflow-level `permissions: contents: read`;
  - pinned `actions/checkout` v7 to `3d3c42e5aac5ba805825da76410c181273ba90b1`;
  - pinned `pnpm/action-setup` v6 to verified commit `0977fd99725f1db4007ccb2928dbb4e90d06cc86`;
  - pinned `actions/setup-node` v7 to `820762786026740c76f36085b0efc47a31fe5020`.

## Validation

- Upstream tag targets were resolved directly from the respective GitHub repositories before editing.
- Current `main` CI run for `567dbaab0b4a609986c2cf343530ac1b81398c4f` completed successfully before this branch was created.
- Branch CI is the pre-production gate for this workflow-only change. No dedicated Moneyverse test server exists; the retired test stack must not be reported as passed.
- No database migration, production data mutation, secret change, or Kubernetes workload change is included.

## Production / rollback

No production deployment is required for this CI-only change. Rollback is a normal Git revert of the workflow commit if the pinned action revisions fail unexpectedly.

## Remaining work

- Extend immutable SHA pinning to the production image-build actions in `deploy.yml` (`docker/setup-buildx-action`, `docker/login-action`, `docker/build-push-action`) in the same hardening stream after branch CI proves the base change.
- Review repository/organization Actions policy and branch/ruleset enforcement where the GitHub App has sufficient administration visibility.
