# Marketplace source truth — v1225 implementation plan

1. Add `marketplace-evidence.test.ts` with valid, verified empty, malformed, duplicate, and overflow responses. Confirm RED.
2. Add `marketplace-evidence.ts` strict parser of existing guarded Nest GET `/api/v1/marketplace/listings` (no schema/SQL changes). Confirm GREEN.
3. Add server-page tests mocking `requireMember` and `apiOrNull` for verified, empty and outage; confirm RED then implement read-only accessible `/marketplace` page. Do not render old simulated client components or WLD balances.
4. Verify targeted tests, lint, typecheck, build, broader tests, app-api, security, isolated PG and HTTP when possible; record exact SHA and any release blockers. Re-fetch main and plans. No deployment without all gates.
