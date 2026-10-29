# Backend B v631 — owner-scoped support message receipt

## Before work — 2026-10-29 12:36 KST
- Base main: b84d645a87e8fa0d544ca3ee17e785e737e477ea
- QA v1364: branch cleanup regression, finance provenance and qs audit remain unresolved. Production/Test b44ffd0a; no release authorized.
- C v1153 Draft #1831: support send receipt readback cannot verify messages beyond the first 200; issue #1832.
- Scope: a read-only, owner-scoped exact-message SQL function, NestJS GET endpoint, tests and integration handoff to C. No changes to C branch, app-role table privileges, money, or Production.
- Required: RED-GREEN, real isolated PostgreSQL, unit/contract, security, build, full CI, Test exact-SHA. Any missing gate => HOLD.

## In progress
- [ ] RED: prove absent exact-message readback
- [ ] GREEN: add forward-only 295 function and authenticated API
- [ ] Verify negative/owner/201st-message and app-role ACL
- [ ] Re-fetch main and plan, run gates, post C integration handoff

## Finished
- Pending.
