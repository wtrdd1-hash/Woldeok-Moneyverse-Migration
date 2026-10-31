# Backend B v684 — owner holdings App API privacy boundary

**Status:** Draft / RELEASE HOLD. Source base: `761a55a094fb9dd383d213e817305e68c79fa23c` (canonical GitHub main at start and mid-run). No Test or Production deployment.

## Confirmed P1 defect and scope

The Android-facing Next App API proxy at `frontend/src/app/app-api/v1/[...path]/route.ts` explicitly overrides upstream public cache/robots headers for private shop purchases, but not for the owner-scoped `shop/holdings` route. A synthetic upstream `Cache-Control: public, max-age=86400` is returned to the caller unchanged on a successful holdings read; public headers also survive 503 and HEAD 204 responses. This is a conditional caching/privacy exposure, **not** proof of actual Production data disclosure. The English/Korean integrated planning documents had already identified this gap.

## Implementation and API contract

For `/app-api/v1/shop/holdings` and child paths, force `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`, and `Referrer-Policy: no-referrer` on every response status and method. Preserve backend status, response body, owner cookie forwarding, CSRF and existing session/consent authorization. No new API, DB function, migration, grant, WLD or ledger mutation; other shop routes are unchanged. Backend `GET /api/v1/shop/holdings` remains the owner-scoped source of truth.

## Test-driven evidence and gates

- RED: 3/3 new route tests failed on canonical main because the public cache header was forwarded.
- GREEN: 4/4 new tests PASS (owner success, upstream 503, HEAD 204, nested mutation); focused route tests 55/55 PASS before adding fourth test, and final focused 4/4 PASS.
- Final candidate full frontend 2,774 PASS, backend 2,778 PASS / 501 SKIP, database package 62 PASS / 4 SKIP, contract 41 PASS; lint, typecheck, build, mobile 184-endpoint contract, security/release and route-ledger unit tests PASS.
- Isolated PostgreSQL 17.11, network-disabled, 311/311 source migrations applied; `moneyverse_app` ledger_postings DELETE remains denied. Disposable container removed. No shared DB mutation.
- `pnpm audit --prod` PASS; full `pnpm audit` FAIL (13 existing development dependency advisories: 10 moderate, 3 low).
- **Not proven:** real authenticated official Test exact-SHA, full five-pass route ledger, independent restore, live edge/CDN policy, Production provenance. These are release blockers, not passes. No merge or deploy without all gates.

## Isolation and coordination

Independent non-main worktree; B #2130 notification link sanitizer and A/C/QA/Planning worktrees untouched. No stale-branch cleanup. The original QA v1411 and latest v1552 plan remain release HOLD. English is canonical and Korean is supporting context.
