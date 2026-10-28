# Backend B v615 — Treasury bond repo-loan ledger containment

## Before work — 2026-10-28 20:40 KST
- [x] Confirm Debian 13.6 miniPC and service status via miniPC tools; storage 98% used.
- [x] Fetch `origin/main` (`35971c600f25869c96f1c666d4b9f58927202730`) and read `AGENTS.md`, `README.md`, both planning files, QA v1348, PR/CI inventory.
- [x] Confirm issue #1151: `createRepoLoan` directly credits USER_CASH and `repayRepoLoan` directly debits USER_CASH without authoritative ledger postings. Earlier broad containment PR #1152 is CLOSED; active B #1736 only holds subscription.
- [x] Create independent v615 branch/worktree. No live database writes, migrations, branch cleanup or deployment.

## In progress
- [ ] TDD RED: HTTP borrow/repay must return 503 before service access; consent/CSRF guard metadata; service and repository reject before any SQL; owner read route remains.
- [ ] GREEN: remove unsafe repo-loan WLD mutations at controller/service/repository boundaries.
- [ ] Verify focused tests, backend tests, typecheck/lint/build as capacity permits; re-fetch main and planning.

## Finished
- [ ] Record exact candidate SHA, tests, PR, CI, official Test SHA and Production HOLD.

**Scope:** source-level fail-closed containment only. No ledger-backed repo-loan implementation or database privilege repair. Existing repo-loan records remain unchanged. Frontend/Android must display unavailable state before a complete user-flow release. Existing automated bond coupon settlement remains a separate P0 risk.
