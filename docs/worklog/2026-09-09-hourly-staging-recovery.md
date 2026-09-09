# Hourly development — staging recovery and candidate gate

Date: 2026-09-09

## Selected improvement

Restore the mandatory isolated staging path and add an exact-SHA candidate-image workflow so future runtime changes can be rehearsed before `main`/Production promotion.

## Infrastructure blocker repair

The previous `wdmv-test` bootstrap failed because the helper path depended on image-specific shell/network utilities. The infrastructure repository was updated in PR #19 to use Python standard-library HTTPS/JSON against the Kubernetes API with the Pod's ServiceAccount credentials. It preserves non-root/read-only execution and cross-namespace RBAC limited to `get` on `wdmvp/ghcr-pull`.

Infrastructure GitOps validation passed and PR #19 was merged as `2ad8cc807ddb86ae4460b610b201dfc754c3bd96`. This changes isolated staging bootstrap only; no Production application/database/image/PVC resource was modified.

## Application repository improvement

Added `.github/workflows/test-candidate.yml` from a fresh branch based on the then-current `main`. The workflow:

- runs the reusable full CI gate before any image push;
- builds immutable `<sha>-test` backend/frontend images only after CI succeeds;
- pins checkout/buildx/login/build-push Actions to immutable commit SHAs;
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
- Application candidate SHA `660280b390c812825b77b2ef8d4ca06402bff4c2`: reusable CI PASS, including secret/control-byte guards, lint, typecheck, production build, PostgreSQL migrations, tests, Prisma mutation guard, and production dependency audit.
- The same candidate workflow successfully built and pushed immutable backend/frontend `<sha>-test` images with SBOM/provenance.
- Application PR #145 merged to `main` as `c7496ab65d4b012d7b51aa34d5857f596bcd1f3a` after confirming upstream `main` had not moved.
- Post-merge CI on exact main SHA `c7496ab65d4b012d7b51aa34d5857f596bcd1f3a`: PASS.
- Direct cluster verification remains required for the repaired staging bootstrap. The authorized remote mini PC was unavailable during this run, so exact running-image parity, Pod health, real staging migrations/user flows/direct-play QA, Flux runtime status, and Production runtime promotion have not been claimed.

## Production state

No Production runtime deployment was required for this CI/release-tooling-only application change. No Production application image reference, database resource, PVC, or data was modified by this work.

## Final status

The release-engineering capability is integrated into application `main`, and the staging bootstrap repair is integrated into infrastructure `main`. The remaining verification item is direct cluster confirmation that the independently reconciled `wdmv-test` stack becomes healthy with the repaired bootstrap. Future runtime candidates must still pass that real staging gate before Production promotion.
