# Runtime identity release gate — v2026.09.22.336

## Scope
QA-335-01 exposed a release-control gap: the Production build gate verified backend `/api/version` but did not prove that the frontend served the same exact application SHA. Added a reusable fail-closed runtime identity verifier and wired it into the isolated-Test gate before Production artifact construction.

## Verification
- Executable regression covers coherent identity plus frontend/backend split-release failures.
- Workflow checks out the attested repository head before executing the verifier.
- `git diff --check`.
