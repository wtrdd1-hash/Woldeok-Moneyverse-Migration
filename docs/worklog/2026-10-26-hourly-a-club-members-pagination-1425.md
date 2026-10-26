# A1425 — Owner-scoped club memberships, independent pagination

## Before work (2026-10-26 14:25 KST)
- Debian 13.6 miniPC services active; root 96%, data 84%. Remote main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
- 260 remote heads and 256 open PRs; preserve all unique work. #1107/#1110/#1143 remain conflicts. Latest QA #1412 is DRAFT/HOLD; six main frontend regressions and security gates remain.
- Read AGENTS.md, README.md, main PROJECT_PLAN.md/.ko.md and newer planning v1316 Draft #1416; feature not yet implemented. Main `/clubs` derives "my clubs" by filtering the global top 50; memberships outside that page are hidden. No duplicate club-membership pagination PR found.
- P1 slice: separate authenticated `GET /api/v1/clubs/mine?offset=N`, fixed 25-item owner-scoped active-membership page, next/has-more, no-store/noindex, web pagination, Android app-api contract parity. No new grants, migrations, ledger writes, or deployment.
- Security: actor comes exclusively from session; SQL applies membership filter before LIMIT, with stable ordering. Do not imply the response is an immutable snapshot; no fabricated zero on backend error. Existing club tables have broad legacy grants, tracked separately as P0.
- RED/GREEN TDD, focused regression, typecheck/lint/build/full tests, isolated PostgreSQL ACL, exact-SHA Test and CI required. No merge or release without all gates PASS.

## In progress
- [ ] RED tests first for owner-bound paging and error cases.
- [ ] Implement backend/DB read, Next UI, Android route contract.
- [ ] Verify mid-work remote main and planning.

## Finished
- Pending.

## In progress (14:34 KST)
- RED observed: backend 4 failing tests, frontend module missing. GREEN: backend focused 8 PASS, frontend gateway+pagination 14 PASS; typecheck both packages PASS.
- Implemented session-bound `GET /api/v1/clubs/mine`, stable 25-row page + next cursor, Android contract endpoint 180, Next `/clubs` independent owner paging, privacy response headers, integer-string EXP rendering and explicit unavailable state.
- Isolated PostgreSQL 17.11 `wdmv_v761_test_acl` (281 migrations): owner 1 / foreign 0 / ROLLBACK 0. First real query exposed `moneyverse_app` cannot SELECT users; removed unnecessary users join, do not add grants. This is a concrete real-DB ACL regression prevented.
- Mid-work remote main and planning v1316 checked unchanged; no overlapping open club-membership pagination PR. No production DB writes.
- [x] RED tests and GREEN implementation.
- [x] Real-PG owner isolation and rollback.
- [ ] Final complete gates, CI, Test and release decision.
