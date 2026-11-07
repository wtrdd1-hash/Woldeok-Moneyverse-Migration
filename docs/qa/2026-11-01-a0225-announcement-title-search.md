# QA — A 2026-11-01 02:25 KST — Public announcement title search

**Status:** P1 code tested; CODE-SHA CI SUCCESS; RELEASE HOLD pending official Test and release gates.

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
- Backend build PASS; isolated systemd Frontend build PASS (webpack compiled, TypeScript, 603/603 static pages); first MCP-cgroup build stalled at TasksCurrent 942/1027 and was terminated after 6 minutes without touching other processes. Full lint 0 errors / 1,022 warnings; 184 Android API endpoints contract PASS; security 11 PASS; dependency audit no known vulnerabilities. Code SHA `fe1d918673d92fcc0c98197c2dd4e15e694a8519` CI #41225039551 SUCCESS. Candidate image #41225034250 pending. Exact-SHA authenticated official Test, independent restore and Production release blocked.
- Official Test `/api/version` `bc8cd8a6c654af0336f550643f23049a58ee1d16`; Production `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; both 200 health but not candidate.
- Public Next build marks `/announcements` as dynamic (same as `/gallery` and `/status`), despite existing `revalidate=60`; no new request-bound `searchParams` were introduced. Do not claim the route is statically prerendered.
- Remote branches 23→24 incl main; open PR 21→22; 23 unique non-main branches preserved. 0 merges/deletions/deployments/rollbacks.

## Rollback
- No deployment. Revert branch/PR only. No schema/data rollback required.
