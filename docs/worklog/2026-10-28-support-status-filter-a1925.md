# A1925 — Member support conversation status filter

- Start (2026-10-28 19:25 KST): main `35971c600f25869c96f1c666d4b9f58927202730`; isolated branch `auto/hourly-a-support-status-20261028-1925`.
- Baseline: 57 remote heads including main; 55 open PRs. Existing A PR #1676 searches titles; this task adds a distinct status filter and does not modify its branch. P0 release blockers from QA v1346/A1825 retained.
- Planned: RED tests for invalid status, owner-only SQL filtering and 100-item window, status selection on web, Android query propagation and no-store on all response paths. GREEN implementation, isolated PostgreSQL read function, full gates, CI and exact-SHA Test if available.
- Release policy: no applied migration edits, no direct DML, no financial writes, no merge without all gates; preserve all other branches and 352 recovery refs.
- State: IN PROGRESS. No Test or Production changes.

- Midpoint (19:25 KST): main=35971c600f25869c96f1c666d4b9f58927202730; RED backend 3/3 fail, frontend 5/31 fail (26 pass). Source of failure is absent member status query and Android cache fence. No other workspace touched.

## Implementation and verification — 19:38 KST
- RED/GREEN: backend 3 failing -> 3 passing; frontend/app-api 5 failing -> 31 focused passing.
- Implemented `GET /api/v1/support/threads?status=open|waiting_user|resolved`, rejecting unknown/blank/duplicate values with 400 before database access. Missing status preserves recent 50. A selected status queries existing actor-scoped `support_my_threads(actor,100)` SQL function and filters/limits inside PostgreSQL to 50 rows; no new migrations, table grants or WLD effects.
- Next.js member support page has a labelled, keyboard-operable GET status filter, retains status in links, and never opens a thread outside the filtered list. Android app-api forwards status and forces private/no-store/noindex for member support success and error responses.
- `pnpm test` PASS; backend 1942 PASS/440 SKIP, frontend 1877 PASS, database 46 PASS/4 SKIP, bot 11 PASS after isolated dependency setup. Full lint 0 errors/1100 warnings; typecheck both PASS; Nest and Next.js Webpack builds PASS; Android API contract PASS; root audit 0 high/critical (9 moderate, 3 low); bot audit 0 vulnerabilities.
- Isolated PostgreSQL 17.11 (private, network-none, ephemeral) PASS using the exact unchanged SQL `support_my_threads` function from migration 196: 50 default/100 recent window, 50 filtered, actor isolation, app role cannot SELECT table. Full migration replay was not certified in the local custom harness (role ownership/privilege checks at migration 020); do not mislabel it PASS. GitHub CI must independently validate the full migration sequence.
- Rechecked main `35971c600f25869c96f1c666d4b9f58927202730` before integration. Existing Draft #1676 touches the same support surfaces for title search; retain both unique changes and review eventual integration conflict, no cherry-pick or overwrite.
- QA v1347 P0 HOLD: 18,000 WLD account-vs-ledger drift, 235 app UPDATE/DELETE tables, 3 PUBLIC bank EXECUTE, 5 migration checksum mismatches, 20 unapplied source migrations, independent backup restore missing, official Test exact-SHA mismatch and data disk 97%. Production symlink `/srv/moneyverse` broken. No authorization for release.
- No main merge, official Test/Production deploy, shared DB/ledger write, PR closure, branch deletion, service restart or rollback. Keep branch Draft/HOLD pending CI and official Test.
