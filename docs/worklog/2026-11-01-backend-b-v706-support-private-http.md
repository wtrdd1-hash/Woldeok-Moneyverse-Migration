# Backend B v706 — support conversation private HTTP boundary

## Before work
- [x] MiniPC status/exec/fs_read_file attempted; Debian 13.6 active.
- [x] main, AGENTS.md, README, EN/KO plan, QA v1427, open PRs and CI inspected.
- [x] Isolated branch from main `f13bbce273ffc65e8576170992d82ea00c27a1c9`.
- [ ] RED: reproduce member/admin support HTTP cache and referrer gap on success and guard denial.
- [ ] GREEN: protect all support routes before guards without changing authorization or database.
- [ ] Verify focused tests, full required gates, exact-SHA Test; preserve release HOLD if unavailable.

## Design and scope
Existing support routes return owner conversation content, text transcripts and administrator inbox. Method-level response headers do not cover rejected guards and many endpoints omit them. Prefer a module-scoped pre-guard middleware for both SupportController and AdminSupportController. Keep public endpoints outside scope, no API/DB contract change, no balance/ledger writes.

## In progress

## Finished
Pending.

## Mid-work checkpoint
- RED: seven real Nest HTTP tests failed on missing private/noindex/no-referrer headers; first fixture dependency failures corrected before counting RED.
- GREEN: 7/7 new HTTP tests and 6/6 existing support receipt HTTP tests passed.
- Scope: module middleware covers both owner and administrator support controllers before guards, including 401, successful GET, POST and HEAD. Existing exact-receipt Cache-Control strengthened from no-store to private, no-store.
- No schema, migration, authorization, CSRF, monetary balance, or ledger changes.
- Remaining: full gates, candidate CI, official Test exact-SHA and authenticated E2E.
