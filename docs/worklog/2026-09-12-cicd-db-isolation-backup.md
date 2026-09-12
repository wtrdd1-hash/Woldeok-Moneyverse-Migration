# 2026-09-12 — CI/CD, environment DB isolation, and recovery DB

Update version: `2026.09.12-01`

## Scope

- Integrate the only open non-MCP application PR (#147) into a dedicated integration branch, not `main`.
- Extend the immutable test-candidate workflow to the integration branch.
- Keep `wdmv-test` and `wdmvp` as separate Kubernetes environments with separate PostgreSQL databases.
- Add a recovery-only PostgreSQL target in the GitOps repository and an hourly logical refresh job from Production.
- Add a GitHub Actions GitOps promotion workflow that creates reviewed PRs for exact-SHA test or Production promotion.

## Environment contract

| Environment | Namespace | Database | Application access |
| --- | --- | --- | --- |
| Test | `wdmv-test` | `moneyverse_test` on `wdmv-test-db` | Test only |
| Production | `wdmvp` | `moneyverse_production` on `wdmvp-db` | Production only |
| Recovery | `wdmvp` recovery component | `moneyverse_recovery` on `wdmvp-recovery-db` | No application connection |

The recovery database is a fast logical restore/inspection target. It does **not** replace encrypted separate-media backups. Issue #139 remains a release/recovery risk until the separate backup medium is repaired or replaced and restore verification is observable.

## CI/CD flow

1. Application branch push runs full CI and builds immutable `<sha>-test` images.
2. Infrastructure promotion workflow receives only a full application SHA and target environment.
3. The workflow patches exact-SHA GitOps references on a new promotion branch and opens a PR.
4. Test promotion is merged and verified first.
5. Production promotion requires the explicit `PROMOTE_PRODUCTION` confirmation and must not merge until exact-SHA staging verification succeeds.

## Current validation state

- GitHub application candidate workflow started for the integration branch.
- MiniPC remote execution is unavailable in this session, so direct Kubernetes rollout, backend `/health`, and recovery-refresh verification are still pending.
- No Production GitOps change has been merged.

## Rollback

- Application: revert the GitOps image-reference promotion PR/commit to the previous verified SHA.
- Recovery DB: remove the recovery resources from the Production kustomization; this does not modify the Production database PVC.
- Never delete or rewrite the Production database or ledger as an application rollback mechanism.
