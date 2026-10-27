# Planning v1386 — F675-152 Security Event Source and Authorization Integrity

**Status:** IN PROGRESS / DRAFT / RELEASE HOLD (2026-10-28 KST)

- [x] START: miniPC Debian 13, latest main and prior stacked PR checked; skills connector empty, local using-superpowers/brainstorming/writing-plans/worktrees/verification read.
- [x] READ: canonical main AGENTS.md, README.md, English/Korean PROJECT_PLAN, prior v1384 and QA v1328.
- [x] DISCOVERY: migration 214 arbitrary user UUID, event owner nullable on delete, session revocation on password reset/email change, source-event IDs missing from current member history response, latest main duplicate 283 and QA draft CI distinction.
- [x] MID: recheck main and canonical plan, confirm cross-worker isolation and write detailed bilingual specification/backlog.
- [x] VERIFY: bilingual IDs, exact files, documentation diff, GitHub PR/issue updates, release gate and final remote SHA.

Previous Cycle: Feature Addition v1384. Current Cycle: Feature Improvement v1386. Next Cycle: Feature Addition v1388 (provisional). v1380/v1382 are independent blog cycles. No runtime, DB, finance, Test, Production or automation mutations.

## MID — 2026-10-28 KST
Source and main rechecked; bilingual integrated plans/review/project plans/update logs updated, 10 matching P0/P1 identifiers; Draft #1611 stacked on #1598. QA v1328 exact-head CI distinction recorded. No code or DB modifications.

### Read-only development DB evidence
`account_recent_security_events(uuid,integer)` exists and app EXECUTE=TRUE; auth_security_events FK ON DELETE SET NULL and event UUID confirmed. Effective app-role privileges on auth_security_events SELECT/INSERT/UPDATE/DELETE all TRUE; auth_sessions SELECT/UPDATE TRUE. No SQL writes or member rows read. P0 grant-origin/negative test; no production exploit inferred.

Latest-main notification code recheck: `notification.service.ts` still lists with OFFSET but has read-all remaining-unread receipt; security-event-specific review receipt is distinct. Avoid duplicating parallel A/B/C implementation.

## FINISHED — 2026-10-28 KST / PARTIAL / DRAFT / RELEASE HOLD
- Source and main checked at start, midpoint and final: `4f5efd1f48615f0112701feec25a9b0fc67d9719`; main AGENTS/README/English and Korean project-plan blob SHAs unchanged. Prior #1598 remains Draft; this #1611 stacks on it and must not merge independently.
- Read-only development DB effective ACL: app-role auth_security_events SELECT/INSERT/UPDATE/DELETE, auth_sessions SELECT/UPDATE, security-event function EXECUTE; no table data read or SQL writes. Treat as P0 privilege drift; not a proven production exploit.
- Documentation-only 9 files, six EN/KO plan/review documents contain all ten P0/P1 IDs; `git diff --check` PASS; no source/runtime/migration/test environment changes. GitHub PR #1611 and issue #1597 updated.
- QA v1328 Draft #1610 exact-head CI PASS is distinct from main, official Test and Production. Main duplicate 283, bot audit Critical 1/High 5, dev DB grant/checksum drift, Test exact-SHA authenticated E2E and independent restore remain unresolved. Full security, backup restore and production promotion BLOCKED. No acceptance 10,001/100/100 run.
- External independently accepted new 0; cumulative deduplicated/approved UNKNOWN / 10,000. Feature OFF. No Test/Production, DB, WLD, ledger, automation or existing other-worker branches modified.
