# Bank App API private response headers — B v688

> Status: implementation plan, DRAFT/HOLD. Branch isolated from main.

## Objective
For Android App API `bank/*` and `banking/*` routes, prevent upstream cache, robots, or referrer headers from weakening member financial response privacy on both success and error. Preserve existing request forwarding, authentication and public API behavior.

## Steps
1. In `frontend/src/app/app-api/v1/[...path]/bank-private.test.ts`, add table-driven GET and HEAD tests with upstream `Cache-Control: public`, `X-Robots-Tag: index, follow`, `Referrer-Policy: unsafe-url`, including 200/401/503/204. Expect private/no-store, noindex and no-referrer. Run focused test and record RED.
2. In `frontend/src/app/app-api/v1/[...path]/route.ts`, extend the existing bank/banking response boundary with `noindex` and `no-referrer` overrides. Keep body and status unchanged. Run focused test and record GREEN.
3. Run full relevant repository gates and isolated DB validation; record exact command/exit/SHA. No claims about skipped tests.
4. Update `docs/worklog/2026-10-31-b-v688-bank-app-api-privacy.md` and push Draft/HOLD PR. Do not merge or promote without full CI and exact-SHA Test proof.

## Execution evidence
- RED six failures; GREEN seven passes including public stocks unchanged.
- Focused App API 59 passes, lint/typecheck/build passes, full backend 2778 pass/501 skip, frontend 2777 pass after correct NODE_ENV, isolated PostgreSQL 311 migrations, production audit pass; full audit 13 unresolved advisories.
- RELEASE HOLD: official exact-SHA Test and authenticated E2E unverified; no merge/deploy.
