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

## Finished — source candidate, release blocked
- Code SHA: `78cb06c6f1070978c2f23438cf633b0fcfc3ba68`; main still `1c5b84a1c45baafcca83f375a6f99698121e9bb5` after a second fetch and English/Korean plan re-read.
- Changed `backend/src/core/problem.filter.ts` and `.test.ts`: production explicit HTTP 500–599 now uses generic detail, omits validation arrays, retains only bounded identifier-like machine codes. Client 4xx and nonproduction diagnostic behavior preserved. No route, DB, migration, grant, financial balance, ledger, or frontend source changes.
- RED: 2 regression failures on main; GREEN: 15/15 focused. Full backend: 1,317 PASS / 398 SKIPPED; contract 38 PASS; database package 15 PASS / 3 SKIPPED. Full frontend: 1,397 PASS / 6 FAIL (4 suites). Root test FAIL.
- Lint PASS (0 errors, existing warnings); typecheck PASS; full build PASS; API contract PASS. Production audit FAIL (2 High: body-parser/multer); full audit FAIL (2 Critical / 10 High / 11 Moderate / 3 Low).
- Real PostgreSQL full ACL/finance E2E: not performed for this HTTP-only code change; official isolated Test exact-SHA and authenticated core-user-flow: BLOCKED. Read-only Test version `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production version `6a989b5ac0c6155587d43426d64f6def6b62c917`; neither matches candidate.
- Draft PR #1430; no merge, Test promotion, Production release, DB mutation, service restart, feature switch or cleanup. Release gate HOLD until all required checks pass. Root filesystem 97%, data filesystem 87%; preserve other worktrees.
- Worklog update is a separate documentation-only commit after tested code SHA; code tree remains byte-identical. Latest candidate SHA is recorded in the host end log.
