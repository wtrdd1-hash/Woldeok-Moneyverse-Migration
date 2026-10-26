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
- [x] Draft PR #1434 created; final CI started, release held because mandatory gates remain failed/blocked.

## Finished — 2026-10-26 18:53 KST
- Outcome: **PARTIAL / BLOCKED**, actual backend authn fix + test in independent Draft PR #1434; no merge, no Test or Production deployment.
- Start/mid/end origin/main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (unchanged). Work branch `auto/hourly-b-admin-csrf-expiry-v560-20261026-1845`; code fix commit `80ac7b36c0f24c7df572c7c62c3f4b31ac532110`.
- Focused RED 1 fail / 34 pass -> GREEN 35 pass / 17 DB skipped. Backend full 1,314 PASS / 398 SKIPPED; DB package 15 PASS / 3 SKIPPED. Actual isolated PostgreSQL 17.11 executes exact extracted repository UPDATE SQL and verifies privileged absolute expiry, member sliding, revoked/expired unchanged (PASS). No shared database accessed or modified.
- Workspace typecheck PASS; lint PASS (0 errors / 1,128 warnings); full workspace build PASS; API contract 179 endpoints PASS; security floor tests 7/7 PASS. Bot first run blocked by missing worktree `youtube-dl-exec`; after local `npm ci`, bot tests 8/8 PASS.
- Full frontend 1,397 PASS / **6 FAIL** (3 SEO, 1 mobile login, 1 calculator registration, 1 admin M2 telemetry), pre-existing on main; QA PR #1412 independently reports integrated fixes but remains Draft. Production dependency audit **2 High FAIL**; full audit **2 Critical, 10 High, 11 Moderate, 3 Low FAIL**.
- Candidate GitHub CI #40302402744 and Build Test Candidate #40302372707 running at report checkpoint; final post-log SHA will start fresh CI. Official Test exact-SHA auth/core-user-flow and full real PG migration/ACL, authenticated financial E2E and GitOps approval **NOT VERIFIED / BLOCKED**.
- Read-only environment version: Test `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production `6a989b5ac0c6155587d43426d64f6def6b62c917`; neither is the candidate. **Production HOLD**. No schema migration, WLD/ledger write, deployment, service restart, or branch/worktree deletion.
- Disk at close: root ~98% / 2.0 GiB free, data ~87% / 26 GiB free. Existing A/C/Gemini/QA branches and schedules untouched. The recurring task remains enabled; no automation settings changed.


## Code/API/DB contract
- One-line removal of privileged session expiry extension in `SessionRepository.rotateCsrf`. Existing API routes/DTO, cookie/CSRF token behavior, DB schema/migrations, ledger, and WLD unchanged.
- `auth_sessions.expires_at`: member sessions continue 180-day sliding; admin sessions preserve migration 057 absolute 30-minute expiry.
- RED/GREEN evidence: `mv-b-v560-logs/red.log`, `green.log`; isolated real PostgreSQL evidence `isolated-pg.log`.
