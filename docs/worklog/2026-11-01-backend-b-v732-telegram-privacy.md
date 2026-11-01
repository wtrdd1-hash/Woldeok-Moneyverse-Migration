# Backend B v732 — member authentication Telegram privacy

## Before work — 2026-11-01 21:35 KST
- Source: fresh `origin/main` (recorded in host start log); QA issue #2231, planning v1618 draft #2375, latest QA #2378, concurrent A/C/B branches reviewed.
- P1 reproduction target: registration Telegram alert transmits unverified email/name before verification; login alert includes UUID and untrusted forwarded IP without checking `consentCurrent`.
- Safety: no production DB, financial ledger, migrations, shared runtime, or other developer worktrees touched. Preserve login, verification, CSRF, session and email dispatch.
- Scope: fail closed on unverified registration notifications; emit only anonymous generic login notification after current user consent; ensure Telegram service never forwards member-supplied identifiers.

## Planned verification
- RED: controller registration/login consent tests and service transport PII minimization tests.
- GREEN: same tests, auth/Telegram regression, typecheck, lint, build, security, app-api, CI; isolated PostgreSQL if applicable.
- Release gates: full suites and official Test exact-SHA, authenticated E2E, recovery and GitOps required before merge or production. No bypass.

## In progress
- Worktree created from fresh main. Implementation not yet started.

## Finished
- Pending.
