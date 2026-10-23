# v485 GSC ownership-boundary TDD plan
1. Isolate from fresh main and verify existing GSC client baseline.
2. Add regression tests that reject unrelated accessible properties, unrelated configured properties, HTTP-only and path-limited properties, and foreign sitemap URL before any Google API calls.
3. Implement deterministic canonical-property and sitemap validation in `gsc-client.ts` only; preserve exact/domain and HTTPS URL-prefix ownership.
4. Run focused tests, backend full tests, workspace lint/typecheck/build, security/contract, PostgreSQL where available; publish draft PR only. Official exact-SHA Test/Production require all gates.
