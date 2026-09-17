# Release Identity Control Plane — v2026.09.17.186

> Status: IN PROGRESS
> Date: 2026-09-17
> Branch: `fix/release-identity-v2026.09.17.186`
> Exact base: `17801cab463e9c93490b3f93f03c719f95896cb0`
> Korean counterpart: [2026-09-17-release-identity-v2026.09.17.186.ko.md](2026-09-17-release-identity-v2026.09.17.186.ko.md)

## Objective

Implement the current P0 release-identity contract from `docs/planning/PROJECT_PLAN.md`: repository identity must not be treated as application runtime identity. Release classification must happen before privileged release actions, runtime candidates must carry immutable application/image/migration evidence, and Production must verify the attested application source on isolated Test rather than polling the repository head by assumption.

## Checklist

- [x] Re-read authoritative integrated plan and repository operating rules.
- [x] Reconcile exact `origin/main` and current release workflows before implementation.
- [x] Create an isolated task branch/worktree from exact main.
- [ ] Add deterministic release-path classifier and automated corpus tests.
- [ ] Emit immutable release-input and runtime candidate manifests from Test Candidate.
- [ ] Make Production Release consume prior candidate evidence and skip docs/control-plane-only runtime actions.
- [ ] Bind Test/Production runtime verification to `applicationSourceSha`, image digests and migration-set hash.
- [ ] Re-read the living plan and exact main mid-work; reconcile any drift before continuing.
- [ ] Run local release-classifier tests, lint, typecheck/build as applicable, workflow syntax/static checks and diff checks.
- [ ] Push checkpoints and obtain GitHub CI/Test Candidate evidence for the exact branch SHA.
- [ ] Validate the exact candidate on the isolated Test backend/API/noindex path without mutating Production.
- [ ] Merge only after exact-SHA Test evidence is green, then use zero-downtime Production promotion and post-promotion smoke.
- [ ] Write synchronized internal worklog, GitHub changelog and integrated-plan delta with exact evidence.

## Initial evidence

- `origin/main` at task start: `17801cab463e9c93490b3f93f03c719f95896cb0`.
- Current `deploy.yml` resolves `github.event.workflow_run.head_sha || github.sha` as the release SHA and polls Test `/api/version` for that repository SHA before a candidate attestation is consumed.
- Current `test-candidate.yml` builds `GITHUB_SHA-test` images but does not publish a release-input/candidate manifest containing separate repository/application/control-plane identities, image digests, migration-set hash and a Test deployment identifier.
- No application-data migration is planned for this control-plane change.

## Deployment state

- Test: NOT YET VALIDATED for v186.
- Production: NOT PROMOTED for v186.
