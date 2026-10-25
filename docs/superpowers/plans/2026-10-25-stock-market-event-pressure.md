# C v1047 implementation plan — verified market event pressure
1. Baseline: inspect existing fabricated poll and actual NestJS `GET /api/v1/newspaper/pulse` PostgreSQL projection. Confirm no overlapping PR.
2. RED: component tests for verified non-vote pressure, unavailable and empty, malformed payload, accessible source link, no localStorage or fabricated counts.
3. GREEN: replace fabricated per-symbol poll with market-wide event-pressure readout, preserve stock symbol context and responsive layout; pass only validated API response from stock page.
4. Review: confirm API remains server-only via `apiOrNull`, no DB mutations, no WLD; inspect SEO and keyboard semantics.
5. Verify: focused tests and backend contract, full lint/typecheck/frontend/backend/real PostgreSQL CI/build/security/app-api; record failures, rerun on final HEAD. Check main/plan hashes mid/end; only merge after all gates including exact-SHA Test pass.
