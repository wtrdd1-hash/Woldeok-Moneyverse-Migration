# Public roadmap source-truth implementation plan (C v1229)

## Goal
The public onboarding route must not promise unverified virtual rewards, 30-day outcomes or returns. Provide an honest responsive quickstart with evidence from the existing read-only Nest stocks API, and distinguish source outage from verified empty.

## Steps
1. RED: add `frontend/src/app/roadmap/roadmap-evidence.test.ts` for strict malformed/duplicate/empty/valid stock-list evidence and `roadmap-page.test.tsx` for public server-rendered availability/error states and no fabricated rewards. Run focused Vitest and record expected failure.
2. GREEN: implement pure `parseRoadmapMarketEvidence` in `roadmap-evidence.ts`. Replace route page with accessible public quickstart, verified source count/unknown freshness and no fictional SEO HowTo promises. Existing backend `GET /api/v1/stocks` -> `stock_market_overview()` only.
3. Run focused tests, lint, typecheck, build, full tests, app-api, security, PostgreSQL, E2E and remote CI at exact final HEAD. Re-fetch main mid and before merge. If any gate fails, preserve Draft/HOLD and no deployment.
4. Record English canonical/Korean supplementary worklogs and GitHub progress. Protect A/B/Gemini/QA and all reservations.
