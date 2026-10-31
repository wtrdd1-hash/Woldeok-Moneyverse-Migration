# QA — A 2026-11-01 02:25 KST — Public announcement title search

**Status:** P1 code checkpoint; RELEASE HOLD pending final exact-SHA gates.

## Provenance and scope
- Base origin/main: `f13bbce273ffc65e8576170992d82ea00c27a1c9` (checked start and mid).
- Branch: `auto/hourly-a-20261101-0225-announcement-search` in independent worktree.
- Published-only DB function `content_list_published_announcements` unchanged; no migrations, ledger writes, table grants or production mutation.
- Public GET `announcements` default 20, optional canonical limit 1..50, optional literal q 1..80. Search runs over the function's most recent bounded published rows, not all history. Web searches latest 50 via accessible client-side title filter while retaining ISR; Android app-api validates filters and 200 payload shape.

## Evidence
- TDD RED: backend 4 failed, Android 3 failed, web import failed before implementation.
- TDD GREEN: backend targeted 4 PASS; frontend target 20 PASS after app-gateway contract test correction.
- Backend full: 2,954 PASS / 517 SKIP, 0 FAIL (02:27 run).
- Frontend first full: 2,904 PASS / 1 FAIL; exact cause: new documented Android group missing in expected contract group list; fixed and target 20 PASS; full rerun pending.
- Contract build, backend and frontend typecheck PASS; target ESLint 0 errors, 1 existing Next img warning.
- Real development PostgreSQL 17: app role can EXECUTE published-only function; query with `strpos(lower(title), lower($q))` executed in READ ONLY transaction, 1 published row and 0 matches for synthetic q; ROLLBACK. **P0 ACL anomaly:** app role can directly SELECT `public.announcements`, contrary to least-privilege policy; do not infer Production ACL.
- Build, full lint, mobile contract, security and candidate CI pending. Exact-SHA authenticated official Test, independent restore and Production release blocked.

## Rollback
- No deployment. Revert branch/PR only. No schema/data rollback required.
