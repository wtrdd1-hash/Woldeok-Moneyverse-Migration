# Planning v1386 — F675-152 Security Event Source and Authorization Integrity

**Status:** IN PROGRESS / DRAFT / RELEASE HOLD (2026-10-28 KST)

- [x] START: miniPC Debian 13, latest main and prior stacked PR checked; skills connector empty, local using-superpowers/brainstorming/writing-plans/worktrees/verification read.
- [x] READ: canonical main AGENTS.md, README.md, English/Korean PROJECT_PLAN, prior v1384 and QA v1328.
- [x] DISCOVERY: migration 214 arbitrary user UUID, event owner nullable on delete, session revocation on password reset/email change, source-event IDs missing from current member history response, latest main duplicate 283 and QA draft CI distinction.
- [x] MID: recheck main and canonical plan, confirm cross-worker isolation and write detailed bilingual specification/backlog.
- [ ] VERIFY: bilingual IDs, exact files, documentation diff, GitHub PR/issue updates, release gate and final remote SHA.

Previous Cycle: Feature Addition v1384. Current Cycle: Feature Improvement v1386. Next Cycle: Feature Addition v1388 (provisional). v1380/v1382 are independent blog cycles. No runtime, DB, finance, Test, Production or automation mutations.

## MID — 2026-10-28 KST
Source and main rechecked; bilingual integrated plans/review/project plans/update logs updated, 10 matching P0/P1 identifiers; Draft #1611 stacked on #1598. QA v1328 exact-head CI distinction recorded. No code or DB modifications.

### Read-only development DB evidence
`account_recent_security_events(uuid,integer)` exists and app EXECUTE=TRUE; auth_security_events FK ON DELETE SET NULL and event UUID confirmed. Effective app-role privileges on auth_security_events SELECT/INSERT/UPDATE/DELETE all TRUE; auth_sessions SELECT/UPDATE TRUE. No SQL writes or member rows read. P0 grant-origin/negative test; no production exploit inferred.
