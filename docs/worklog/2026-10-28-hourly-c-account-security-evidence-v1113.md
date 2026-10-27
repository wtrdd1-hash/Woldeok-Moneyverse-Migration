# C v1113 — Account security read evidence and safe session controls

## START — 2026-10-28 05:45 KST
- miniPC Debian 13.6; seven core services active, development PostgreSQL connected. Production/shared database is not a test fixture.
- Baseline `origin/main`: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`; read AGENTS, bilingual README and canonical/KO PROJECT_PLAN, open PRs, CI, QA v1333 and A/B/C development work.
- Scope correction before product implementation: the older primary checkout did not match `origin/main`. Admin pension truth and payout hold were **already implemented on main** by C v1085; no pension product changes were made. Abandon pension duplicate and use a fresh main-based worktree for a distinct verified P1.
- Current main `frontend/src/app/account/security/page.tsx` treats unvalidated API JSON as trusted typed session, identity and security-event arrays. An HTTP 200 with malformed `sessions`/`identities`/`events` can crash account security, fabricate a 0-device state or expose a revoke button for an invalid/misidentified session. Current active session is inferred from unchecked `current` flag. A missing identity list silently suppresses local-password and email-change controls as if not linked.
- Existing Backend owner-scoped `account_active_sessions` and `account_recent_security_events` SECURITY DEFINER reads and linked identity API are authoritative; frontend must validate their exact contract. No schema or backend write changes. A PR #1383 for session CSV and auth PRs #1395/#1434 do not cover this read-evidence UI contract.
- Bounded design: fail closed on invalid/duplicate UUID, missing fields, unsafe timestamps, ambiguous current-session flags, unknown providers, duplicate identities or malformed events; preserve verified zero vs unavailable; hide session-specific revoke and bulk revoke controls on unverified data; keep password/email actions only when local identity is verified; retain all-device signout independently of session listing; keyboard/screen-reader/mobile/noindex. No backend contract widening or fake success.
- TDD: RED on invalid session/identity/event payload and unsafe UI, GREEN minimal parser + page gating, then fresh exact-SHA tests/CI, isolated real PostgreSQL ACL read where feasible. No Test/Production promotion without all gates.

## IN PROGRESS
- [x] RED regression reproduced (4/5 behavioral tests failed on original main; parser import also failed before implementation)
- [x] GREEN focused 10/10 tests; read-only parser and member security UI fail-closed changes
- [ ] Re-fetch main/planning and full release gates

## MIDPOINT — 2026-10-28 KST
- Re-fetched `origin/main` and bilingual plans; focused tests 10/10 PASS, no DB/ledger change. Next: full exact-SHA verification, CI and isolated PG ACL evidence.

## FINISHED
- Pending; Draft/HOLD until all gates pass.
