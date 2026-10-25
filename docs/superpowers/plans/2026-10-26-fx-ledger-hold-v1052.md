# FX settlement safety v1052 — bounded implementation plan

1. RED: update `backend/src/admin/fx/fx.service.test.ts` to assert swaps and forward contracts reject with 503 without invoking the repository; run focused test to observe failure.
2. GREEN: make `FxService` member mutation methods fail closed. No direct account-balance writes, no false receipts.
3. RED: add `frontend/src/app/api/fx/portal/route.test.ts` for missing/malformed FX API data and successful validated public response; verify failing tests.
4. GREEN: implement Next server-only GET proxy `frontend/src/app/api/fx/portal/route.ts` with no-store and no user cookies, strict rate/timestamp/history shape; return 503 for backend errors.
5. RED/GREEN: add frontend source regression test; replace FX page's direct `/api/v1/fx/*` browser requests and fake fallback with accessible read-only portal and explicit transaction hold, no simulated member holdings. Update `frontend/src/app/fx/layout.tsx` SEO to avoid claims of real-world bank affiliation, real USD deposits or live settlement.
6. Re-fetch origin/main and canonical EN/KO plan; run focused tests, lint, typecheck, build, PostgreSQL/contract/security/E2E where available, CI; document failures without bypass. Only merge if all release gates PASS.
