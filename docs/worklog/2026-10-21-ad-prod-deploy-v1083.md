# v2026.10.21.1083 — Advertising Production promotion worklog

**Actual result: PRODUCTION DEPLOYED with an explicit, unresolved finance-security hold.** · [KO](2026-10-21-ad-prod-deploy-v1083.ko.md).

## Before work (2026-10-21 19:43 KST)
- Request: user demands deployment of previously implemented advertising PR #979, after prior explicit information about three finance DML grants and missing full Test QA.
- Start `origin/main=22c43a24344a1533ed44737e3a31ad3a36e3ac26`, 15 commits newer than PR original source. Other v1082 planning worktree active; dedicated isolated ad worktree and later separate release/main build worktree. Read AGENTS, DOCUMENTATION_POLICY, DOCS_INDEX, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, v507 advertising authority, v530, RELEASING, v1068 Production risk-accepted report; **prior v1068 exception is scoped to its own release**.
- Captured old Production pointer v1068 SHA `6d4e258a`; official Test v1023. Production finance ACL still uncertified.

## Midpoints
1. Rebased ad commit on latest main → `bd6cc2ffcd3c24ae6049444597c0ebd34f0758bf` (PR #979 head; force-with-lease on owned branch). Frontend in correct workspace: 252/252 files and 1356/1356 tests PASS. Prior four old blog/editorial failures repaired by the intervening v1067 main changes. GitHub Actions CI [#2864](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/actions/runs/39587137305) PASS.
2. Merged [PR #979](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/979), exact main `6a989b5ac0c6155587d43426d64f6def6b62c917`. Re-fetched main, no concurrent conflicts.
3. Isolated detached main build source: copied reviewed node dependencies, built contract, Nest and Next using exact BUILD_ID. Temporary initial Nest build failed because contract/dist had not been built, fixed by building contract first and retrying. Full Next build PASS. Immutable Test and prod releases staged with exact source and frontend build identity.
4. Isolated Test ports 3240 backend and 3241 frontend with scheduler/outbound tasks disabled: health, version, home, tools, blog, guide, login and admin-blog read checks PASS, cache writable. Official public Test unmodified. No member/browser five-pass acceptance claimed.
5. New Production DB backup (81 MB, SHA256 recorded in [release report](../releases/v2026.10.21.1083.md)), `pg_restore -l` 2712 lines PASS. Financial read-only gate BLOCKED on 3 direct app DML grants; 40-account projection zero anomalies is not full financial acceptance. Old Nginx and old v1068 services protected.

## Completion (2026-10-21 20:07–20:10 KST)
- Started persistent new backend/frontend v1083 3343/3344 with backup job scheduler controls disabled and old v1068 still running; actual user site behind reverse proxy switched only after canary readiness.
- Verified home/status/tools/blog/guide/login/admin-blog/robots/sitemap/ads HTTP 200, unauthorized finance/blog POST 401/403, public source version exact.
- Changed precisely four Production backend Nginx destinations and one frontend, left Test unchanged, `nginx -t` + graceful reload PASS. Atomically switched `production-current` to new immutable v1083 release. Read-only official Production identity checker PASS (six SHA identities equal, zero failures). Retained full v1068 rollback configuration and services.
- Before/after Production DB row counts identical (sessions 1873, account balances 40, transactions 851, postings 1732). Services active, no observed new fatal/error journal entries, AdSense ads.txt 200 and unauthenticated `/api/viewer` signed-out 200. Isolated Test instances stopped after acceptance; official public Test remains previous identity.
- No SQL, member balance, session, feature switch, Discord bot or external AdSense account changes.
- **Exception record:** deployed despite known BLOCKED money DML gate at user insistence; this does not certify ledger economics, authenticated mobile five-pass QA or future-waiver authority. Source/no-migration diff versus prior v1068 mitigated but did not remove standing data risks.

[Release evidence](../releases/v2026.10.21.1083.md).
