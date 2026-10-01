# Public Repository Sanitization Plan — v2026.10.01.495

**English canonical** | [한국어](2026-10-01-public-repository-sanitization-v2026.10.01.495.ko.md)

Status: IN PROGRESS
Date: 2026-10-01 KST
Branch: `security/public-repo-sanitization-v2026.10.01.495`

## Goal

Reduce information disclosure in the public repositories without deleting source files that are required for build, database, release, or test correctness.

## Scope

1. Remove files explicitly classified as internal update records from the public tracked tree and prevent them from being re-added.
2. Keep internal security evidence and detailed operational notes outside the public repository.
3. Add public-repository data-minimization and history-aware secret-scanning requirements to security/documentation planning.
4. Restore the required, non-secret database initialization source file that a prior broad script purge removed, and verify migration parity.
5. Remove public mobile signing credential fallbacks and stop debug builds from using release signing configuration.
6. Remove unnecessary public references to private operations gateways from maintained/historical compatibility documentation.
7. Re-fetch both repository `main` branches before final verification and do not overwrite concurrent work.

## Safety boundaries

- Do not publish discovered credential values, private host configuration, or detailed exploit evidence.
- Do not rewrite shared Git history or force-push while concurrent branches are active.
- Treat any credential value previously committed to a public repository as exposed; rotation is an operational follow-up if that value was ever used.
- Current-tree deletion does not by itself erase Git history; the final report must distinguish current-tree sanitization from history erasure.
- No Production deployment is implied by this repository-hygiene change.

## Verification

- No tracked internal update documents remain.
- Required database initialization source is present and migration-parity tests pass.
- Public documentation policy explicitly keeps internal records outside a public repository.
- Android build configuration has no signing password fallback and debug does not use release signing.
- `git diff --check` passes in both repositories.
- Server repository test/lint/typecheck gates are run and every failure is reported.
- Android Gradle verification is run when the Debian host has an Android SDK; otherwise the environment limitation is recorded and GitHub CI is used after branch push.
