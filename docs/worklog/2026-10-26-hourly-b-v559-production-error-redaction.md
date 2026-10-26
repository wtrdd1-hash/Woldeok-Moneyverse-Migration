# Backend B v559 — production 5xx problem response privacy

## Before work
- Main baseline: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fresh fetched 2026-10-26 17:42 KST).
- Reviewed AGENTS.md, README.md, both project plans, QA #1412, latest CI and open B/A/C/QA PRs.
- Priority: a 5xx `HttpException` currently passes `message` and validation errors to public production responses even when they contain internal provider/SQL error details. Unrecognized errors are already redacted. This is a P1 defensive information-disclosure fix, not a confirmed leak.
- Scope: only global ProblemFilter 5xx production presentation, no API path/DB/ledger change.
- TDD plan: add failing 503/500 response redaction regressions; preserve safe 4xx codes, nonproduction debugging and machine-readable 503 codes; implement minimal redaction; run focused, backend, lint, typecheck, build, security, CI and Test gates.

## In progress
- Branch created from clean latest main in an independent worktree. No shared service/DB changes.

## In-progress evidence
- RED on fresh main: 2 new regressions failed; 11 existing assertions passed. A production 503 forwarded a synthetic password-bearing upstream message and validation errors; a production explicit 500 forwarded a synthetic SQL detail.
- GREEN: production 5xx details are generic, arrays suppressed, and only bounded machine codes retained. 4xx and non-production diagnostics remain intact. Focused 13/13 PASS; expanded regression and full gates pending.

## Finished
- Pending.
