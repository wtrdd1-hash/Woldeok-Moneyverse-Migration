# v1250 public enterprise disclosure — bounded implementation plan

1. RED: add Vitest tests proving missing/malformed backend responses cannot render financial figures, and Nest tests proving successful response carries explicit database projection/non-settlement markers and failures return 503.
2. GREEN: implement a small runtime parser for nonnegative exact WLD integer strings, unique SOE identity, valid timestamps and bounded list. Replace public page's fake fallback with accessible unavailable/verified states. Label DB operating projections as estimates, not receipts.
3. Backend: wrap existing public database read in 503 fail-closed response, mark projection source and unverified settlement, no new table grant or write. Reuse existing endpoint; do not invent another API.
4. Run targeted tests, typecheck, lint, build, full test suites, app-api, isolated PostgreSQL, security, HTTP/E2E. Re-fetch main and planning mid/final; record exact SHA and blockers. PR DRAFT until all release gates pass.
