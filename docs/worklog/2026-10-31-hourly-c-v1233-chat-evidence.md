# Development C v1233 — Private chat source-evidence integrity

## START / 2026-10-31 20:45 KST
- Debian 13.6 miniPC system status: seven services active, development PostgreSQL connected. Repository source: canonical origin/main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`.
- Reviewed AGENTS.md, README.md, README/README.ko.md, English canonical and Korean project plans, QA v1420, and active A/B/C/Planning PRs. C v1232 prediction PR #2199 already exists; B v668 chat SQL ACL is separate and not modified.
- Reproduced by source: `frontend/src/app/chat/page.tsx` uses `apiOrNull` and `?? []` for failed conversation lists and messages. This falsely shows 'no messages', and `?peer=` can POST to create a conversation while the list source is unavailable. Existing Nest chat endpoints return `{ conversations, totalUnread }` and `{ messages }` from authenticated repository reads.
- Scope: P1 read-integrity and safe peer creation. Preserve server auth, avoid money/DB writes, validate response shape, distinguish verified empty from unavailable, render keyboard/screen-reader accessible retry, test failed and malformed sources. No new backend/DB API contract.
- Plan: (1) RED tests for source validator, (2) implement read guard + page UI, (3) targeted tests, (4) exact SHA gates and real PostgreSQL if feasible, (5) CI/PR only as Draft HOLD if any gate missing. Preserve all other branches and automations.

## IN PROGRESS
- Pending TDD and implementation.

## FINISHED
- Pending evidence and release disposition.

### TDD checkpoint / 20:47 KST
- RED: `vitest src/app/chat/chat-evidence.test.ts --maxWorkers=1` failed because the validator module was absent (expected). Tests exercise verified empty, malformed, cross-conversation, duplicate and bigint evidence.
- GREEN implementation added validator and fail-closed server render, with no peer creation on unavailable lists. Next.js redirect moved outside catch so successful open redirects correctly. Existing Nest authenticated endpoints unchanged.

### MID / 20:48–21:00 KST
- TDD: initial RED missing validator; GREEN focused 9/9 PASS. Fixed lint test precision literal after first lint failed (1 error). Full lint rerun PASS (0 errors, 1049 existing warnings); typecheck PASS; complete build PASS; app-api contract 184 endpoints PASS.
- First frontend suite 489 failures due to direct Vitest invocation without `NODE_ENV=test`, causing React.act to be unavailable; corrected environment and reran full frontend suite: 2,785/2,785 PASS. Backend 2,786 PASS/501 SKIP. Contract 41 PASS; database 62 PASS/4 SKIP; security/release 33 PASS.
- Isolated PostgreSQL 17.11, no network: first migration attempt failed because test container omitted `moneyverse_migrator` role. Fresh isolated container with correct migrator role applied all 312 migrations. **Critical dependency:** `moneyverse_app` cannot SELECT `private_chat_conversations` or `private_chat_participant_state`; direct repository reads are blocked by PostgreSQL `permission denied`. This task does not grant table SELECT or duplicate Backend B's existing Draft chat ACL fix; chat UI now shows a truthful unavailable state instead of false empty.
- `pnpm qa:route-ledger:check` FAIL: missing `--inventory`; `pnpm audit` reports 3 low + 10 moderate vulnerabilities. These are release blockers, not passes. Main rechecked at `5bccda44...`, unchanged. No shared DB, Test, Production or automation mutations.

## FINISHED / Release disposition
- Candidate preserved on independent branch, pending exact-SHA CI. Official isolated Test authenticated flow/E2E, production promotion, rollback and branch deletion are BLOCKED/NOT PERFORMED. No merge until every gate passes, including B chat ACL dependency, full audit, QA route ledger and official Test exact-SHA.
