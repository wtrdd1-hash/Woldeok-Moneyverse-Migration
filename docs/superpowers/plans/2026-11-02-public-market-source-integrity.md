# Public stock-market source integrity implementation plan

**Goal:** Render only verified public stock quotes, preserve exact WLD integer prices and honest unavailable/empty states, and correct unsupported SEO claims.

**Architecture:** Keep the existing Nest `GET /api/v1/stocks` → PostgreSQL `stock_market_overview()` read path. Add a pure frontend response validator with bounded row count, stable symbol/ID uniqueness, canonical integer strings and known halt states. Render verified rows using BigInt math. Fail closed on malformed or unavailable responses, no synthetic fallback or new DB/API contract.

**Task 1 — RED parser/math tests:** Add `frontend/src/app/stocks/stock-market-evidence.test.ts` asserting verified empty, malformed arrays/rows/duplicate symbols, huge WLD precision and correct signed one-decimal change. Run Vitest and record RED.

**Task 2 — Implement parser/math:** Add `stock-market-evidence.ts` with exported `parsePublicMarket` and `marketDayChange`. Re-run focused tests GREEN.

**Task 3 — Wire UI/SEO:** Update `stocks/page.tsx` to use `apiOrNull<unknown>` and the parser; show role=alert and accessible retry link for unverified source, honest verified-empty message, exact formatted WLD price, and accurate SEO copy. Add integration/source contract test, run RED then GREEN.

**Task 4 — Verification/release:** Run focused test, lint, typecheck, build, unit/integration, app-api, security, isolated real PostgreSQL, browser E2E and remote CI when possible. Re-fetch main/plans at midpoint and before any merge. Draft PR and HOLD on any failed/missing gate. Record exact SHA, Test/Production/rollback and safe preservation.
