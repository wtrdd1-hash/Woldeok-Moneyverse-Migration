# C v1288 — Public SOE source-truth plan

1. Reproduce invalid/missing upstream yielding fake public WLD financial totals and invented SOEs; write parser and page tests that fail on baseline.
2. Introduce a bounded runtime parser for the actual Nest PublicEnterpriseController response; validate all monetary strings, dates, rows and duplicate codes without coercion; preserve verified zero/empty.
3. Render verified data only, with explicit unavailable/retry state; distinguish derived hourly dividend estimate from actual settled transfers; use disclosed_at as API response time only.
4. Verify responsive, accessible, no false SEO claims; run focused regression then exact-SHA project gates and real PostgreSQL where feasible; record blockers without treating skips as pass.
5. Re-fetch origin/main and project plans, preserve concurrent PRs, create Draft PR and hold release until all gates PASS.
