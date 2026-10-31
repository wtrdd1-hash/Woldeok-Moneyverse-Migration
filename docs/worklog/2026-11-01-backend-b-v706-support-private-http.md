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
