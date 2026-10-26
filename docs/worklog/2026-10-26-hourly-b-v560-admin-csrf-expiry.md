# Backend B v560 — Admin CSRF rotation must not extend console session expiry

## Before work — 2026-10-26 18:45 KST
- Starting main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; independent branch `auto/hourly-b-admin-csrf-expiry-v560-20261026-1845`.
- Read AGENTS.md, README.md, English canonical and Korean auxiliary PROJECT_PLAN, QA PR #1412, current open A/C/B PRs and CI; no other worker's branch or worktree touched.
- P1 authn finding: `SessionRepository.rotateCsrf` changes a 30-minute `admin_session_open` expiry to 30 days whenever less than seven days remain. This contradicts migration 057 and its own comment; a CSRF refresh can extend privileged sessions.
- Scope: preserve member sliding expiry; preserve admin absolute expiry; regression tests for both and revoked/expired guards. No API/DB schema change, no real balances or shared DB writes.
- Gates: test RED then GREEN, backend tests, typecheck, lint, build, contract/security, CI, exact-SHA Test; release blocked unless all pass.

## In progress — 2026-10-26 18:44 KST
- Confirmed migration 057 issues a separate 30-minute console session; the current `rotateCsrf` CASE extends it to 30 days. Existing test asserted only the member branch and ELSE, missing this case.

- [x] RED reproduced: 1 failing test / 34 passing (18:44 KST); minimal SQL CASE fix applied; GREEN 35/35 (17 DB tests skipped)
- [x] Focused 35/35 PASS; isolated PostgreSQL 17.11 exact repository UPDATE SQL PASS (admin absolute expiry unchanged, member slides, expired/revoked unchanged); backend full test in progress; typecheck/lint/API contract/database unit checks passed (pending final summary)
- [x] Mid-run origin/main and both plans refreshed: main unchanged at `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; QA PR #1412 reviewed.
- [ ] Final CI/PR and official Test release gates

## Finished
- Pending.

## Code/API/DB contract
- One-line removal of privileged session expiry extension in `SessionRepository.rotateCsrf`. Existing API routes/DTO, cookie/CSRF token behavior, DB schema/migrations, ledger, and WLD unchanged.
- `auth_sessions.expires_at`: member sessions continue 180-day sliding; admin sessions preserve migration 057 absolute 30-minute expiry.
- RED/GREEN evidence: `mv-b-v560-logs/red.log`, `green.log`; isolated real PostgreSQL evidence `isolated-pg.log`.
