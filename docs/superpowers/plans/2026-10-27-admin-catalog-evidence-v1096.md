# Admin catalog evidence integrity — implementation plan

## Decision
Use existing authenticated NestJS/PostgreSQL catalog GET endpoints; do not add DB grants or simulate rows. Parse their unknown JSON strictly at the Next server boundary, with separate failure handling for each section. Keep independent verified sections available and withhold actions in unverified sections. No changes to existing season-event write behavior, which is separately covered by Draft #1521.

## Tasks
1. Add `frontend/src/app/admin/catalog/catalog-evidence.test.ts` with malformed top-level, missing arrays, duplicate UUID/symbol, invalid WLD, invalid flags, and valid/empty cases. Run focused test to observe RED.
2. Add `frontend/src/app/admin/catalog/catalog-evidence.ts`: `parseBusinessCatalog(unknown)` and `parseSeasonCatalog(unknown)` returning typed validated arrays or null; preserve canonical bigint strings; reject unsafe points, duplicate identities and impossible dates.
3. Change `frontend/src/app/admin/catalog/page.tsx` to fetch `unknown` with existing `apiOrNull`, parse each independently, show retry link for unavailable data and explanatory `role=alert`, and hide `NewSeasonEventForm` when season evidence unverified. Preserve noindex, responsive table and existing server actions for verified records.
4. Verify RED→GREEN, full frontend/backend/DB/contract/lint/typecheck/build/bot/audits and GitHub exact-SHA CI. Re-fetch main and plans mid-run and before merge consideration. Never merge/deploy without full security and official isolated exact-SHA Test authentication E2E PASS.
