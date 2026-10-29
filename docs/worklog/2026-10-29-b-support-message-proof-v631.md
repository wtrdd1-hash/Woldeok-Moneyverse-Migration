# Backend B v631 — owner-scoped support message receipt

## Before work — 2026-10-29 12:36 KST
- Base main: b84d645a87e8fa0d544ca3ee17e785e737e477ea
- QA v1364: branch cleanup regression, finance provenance and qs audit remain unresolved. Production/Test b44ffd0a; no release authorized.
- C v1153 Draft #1831: support send receipt readback cannot verify messages beyond the first 200; issue #1832.
- Scope: a read-only, owner-scoped exact-message SQL function, NestJS GET endpoint, tests and integration handoff to C. No changes to C branch, app-role table privileges, money, or Production.
- Required: RED-GREEN, real isolated PostgreSQL, unit/contract, security, build, full CI, Test exact-SHA. Any missing gate => HOLD.

## In progress
- [x] RED: 4/4 expected failures in new focused Vitest (missing repository/controller method)
- [x] GREEN: added migration 295, exact-message repository lookup, authenticated UUID GET/no-store
- [x] Verify 205 messages, owner/forged/nonowner, PUBLIC and app-role ACL in disposable PostgreSQL 17
- [x] Re-fetched main/EN+KO plan at midpoint (unchanged b84d645a); full pnpm test/typecheck/backend build/lint PASS; qs audit FAIL, Next.js 1GiB build OOM; 2GiB retry PASS (609 pages). C handoff pending.

## Finished — pending PR/CI finalization
- 12:38 RED 4; 12:39 GREEN 6 focused (including pre-existing guards); 12:40 HTTP 4 PASS.
- 12:40 disposable PostgreSQL 17 205-message/owner/ACL test PASS; container removed.
- 12:42 typecheck, backend build, lint PASS. 12:45 full pnpm test PASS: backend 1963/440 skipped, DB 46/4 skipped, frontend 1910 PASS, contract 38 PASS.
- 12:45 pnpm audit --prod FAIL: existing qs 6.16.0 Moderate. 12:46 Next build 1GiB heap OOM, 2GiB retry PASS. Do not report complete.
- No main merge, official Test exact-SHA, Production or branch deletion.
- 12:48 Next.js 2GiB heap retry PASS, 609/609 static pages. 12:47 C #1831 and issue #1832 received API integration handoff.
- GitHub Draft/HOLD PR #1835 created; CI running. Full official Test exact-SHA auth/member E2E and GitOps remain BLOCKED.
