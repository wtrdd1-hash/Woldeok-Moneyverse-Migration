# v2026.09.12.13 — Automatic Test-to-Production Release Worklog

## Findings
- The isolated `wdmv-test` stack exists and uses a separate namespace/PostgreSQL database, but promotion still depended on manual GitOps PR handling.
- The application and GitOps repositories are separate; no new cross-repository PAT should be introduced only to connect deployments.
- The existing `/api/version` route was suitable for rollout identity but used a time-derived build ID rather than the immutable Git SHA.

## Implementation
- Test and Production frontend images receive the exact application SHA as `BUILD_ID`.
- Production image workflow is triggered by successful `main` Test Candidate completion and waits for that SHA on Test.
- Test verification includes exact SHA, `noindex`, and a real backend→PostgreSQL public-catalog read.
- A successful Production image build emits a GitHub `production-ready` deployment signal for the exact SHA.
- GitOps scheduled reconciliation requires latest `main` candidate parity and a matching successful Production-ready signal before changing Production manifests.

## Safety / rollback
- No kubeconfig, Production database password, or cross-repository PAT is added to the application repository.
- Any Test mismatch/failure stops Production image creation. Any signal/SHA mismatch stops Production GitOps mutation.
- Existing Production image references remain the rollback anchor. Database migration rollback remains forward-fix/verified-backup policy, not blind image rollback.
