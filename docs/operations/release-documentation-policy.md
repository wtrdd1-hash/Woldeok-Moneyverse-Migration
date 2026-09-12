# Release and Change Documentation Policy

This document defines the repository-wide documentation rule for meaningful code, configuration, deployment, and documentation changes.

## Language priority

GitHub-facing official documentation is **English-first** so external contributors and international developers can understand the project without relying on machine translation.

Required order:

1. **English — canonical/official version**
2. **Korean — maintained translation**

Other translations are optional. Whenever both English and Korean versions exist, they must describe the same behavior, operational state, and release scope.

## Documentation branch rule

Documentation-only edits are committed **directly to `main`**. Do not create a separate feature branch or pull request solely for documentation changes unless repository protection rules make that technically impossible.

This exception applies only to documentation. Code, configuration, database, infrastructure, deployment, and runtime behavior changes continue to use the normal development flow: a separate branch, validation on the Test environment, backend/runtime verification where applicable, Production deployment, and then integration according to the repository workflow.

When a documentation edit describes a code or deployment change that has not yet been validated, the document must state the real status and must not claim Test or Production completion early.

## Version format

Each meaningful change set receives a version in this format:

```text
vYYYY.MM.DD.N
```

Examples:

```text
v2026.09.08.1
v2026.09.08.2
```

Increment the final number for additional change sets on the same date. A version may be assigned before deployment completes, but its document must clearly state whether it is under validation, pending deployment, deployed to Test, deployed to Production, or merged to `main`.

## Per-version release documents

Each version keeps at least these two files under `docs/releases/`:

- `vYYYY.MM.DD.N.md` — canonical English document
- `vYYYY.MM.DD.N.ko.md` — Korean translation

The structure and level of detail should follow the repository's GitHub Release style, using `v2026.09.07 — Gameplay, UX and Economy Stability` as the baseline reference.

Each release document should include, where applicable:

1. Version title and short release summary
2. Highlights
3. Detailed changes grouped by feature or subsystem
4. Files/components materially affected
5. Validation and test results
6. Database migrations
7. Operational safety notes
8. Test deployment status
9. Production deployment status
10. `main` merge status
11. Remaining issues or follow-up work

## Changelog synchronization

Whenever a version document is created or materially updated, synchronize the same version into:

- `docs/changelog/CHANGELOG.md` — canonical English changelog
- `docs/changelog/CHANGELOG.ko.md` — Korean translation

The changelog is a concise summary; the full release document remains the detailed source of truth.

## GitHub Release publication

After the change is validated on the Test environment and the Production deployment is confirmed, publish or update the GitHub Release using the same version/tag. The Release body should be written in English first and should match the canonical English release document. Korean remains available through the corresponding `.ko.md` document.

Do not publish a Production-complete release description before the Production deployment has actually been verified.

## Deployment discipline

For runtime-affecting changes, the documentation must reflect the real deployment state:

```text
feature/fix branch
  -> CI / local checks
  -> Test deployment
  -> Test verification
  -> Production deployment
  -> Production smoke verification
  -> merge/integrate to main as defined by repository workflow
  -> finalize release documentation and GitHub Release
```

Documentation-only changes are the explicit exception and may be committed directly to `main`.

Never mark Test, Production, or `main` integration as complete before verification.

## Operational traceability

Every meaningful change should remain traceable through the same version across:

- commits
- pull request, when the change requires one
- release document
- changelog
- GitHub Release/tag when published
- deployment/test evidence when applicable

Do not delete previous release records when publishing a new version. Release history is cumulative.
