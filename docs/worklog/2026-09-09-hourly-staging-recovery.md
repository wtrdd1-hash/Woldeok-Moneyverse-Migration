# Hourly development — staging recovery and candidate gate

Date: 2026-09-09

## Selected improvement

Restore the mandatory isolated staging path and add an exact-SHA candidate-image workflow so future runtime changes can be rehearsed before `main`/Production promotion.

## Infrastructure blocker repair

The previous `wdmv-test` bootstrap failed because the helper path depended on image-specific shell/network utilities. The infrastructure repository was updated in PR #19 to use Python standard-library HTTPS/JSON against the Kubernetes API with the Pod's ServiceAccount credentials. It preserves non-root/read-only execution and cross-namespace RBAC limited to `get` on `wdmvp/ghcr-pull`.

Infrastructure GitOps validation passed and PR #19 was merged as `2ad8cc807ddb86ae4460b610b201dfc754c3bd96`. This changes isolated staging bootstrap only; no Production application/database/image/PVC resource was modified.

## Application repository improvement

Added `.github/workflows/test-candidate.yml` on a fresh branch from current `main`. The workflow:

- runs the reusable full CI gate before any image push;
- builds immutable `<sha>-test` backend/frontend images only after CI succeeds;
- pins checkout/buildx/login/build-push Actions to current immutable commit SHAs;
- emits SBOM/provenance;
- disables Search indexing and advertising in the staging frontend build;
- does not mutate staging or Production directly.

Updated the canonical English release guide first and then Korean parity documentation to restore the isolated staging contract and exact-SHA promotion order.

## References

- Kubernetes ServiceAccounts: short-lived projected Pod credentials and namespace-scoped RBAC.
- Kubernetes private images: imagePullSecrets are namespace-local Docker config Secrets.
- GitHub secure-use guidance: pin third-party Actions to immutable commit SHAs.

## Verification state

- Infrastructure `Validate GitOps`: PASS for the bootstrap-repair branch before merge.
- Application candidate branch: GitHub CI/candidate-image build must pass for the final branch SHA.
- Direct cluster verification remains required. The authorized remote mini PC is currently unavailable, so exact running-image parity, Pod health, migrations, user/direct-play QA, and Production promotion have not been claimed.

## Production state

Unchanged by this work so far. No Production image reference or database resource has been modified.
