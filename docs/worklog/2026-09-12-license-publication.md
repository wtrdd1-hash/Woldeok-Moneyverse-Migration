# License publication worklog

Update version: `2026.09.12-02`

## Scope

- Prepare the application repository for public visibility.
- Add a root Apache License 2.0 file aligned with the infrastructure repository.
- Declare `Apache-2.0` in the root package metadata.
- Preserve the existing release/test gate; this change does not alter runtime behavior, database schema, or deployment manifests.

## Findings

- The application repository was private at the start of this work.
- GitHub reported no detected repository license before this change.
- The infrastructure repository already uses Apache License 2.0, so the application repository now follows the same licensing baseline.

## Validation / release state

- Changes are isolated on `license/public-reopen-20260912`.
- CI must pass before this change is merged into the active integration/release branch.
- Repository visibility is an administrative GitHub setting and is not changed by this commit.
- Runtime test and Production promotion remain governed by the existing pre-production gate.

## Remaining risk

Before making the repository public, re-check that no secrets, private credentials, private user data, or internal-only artifacts are present in Git history or the current tree.
