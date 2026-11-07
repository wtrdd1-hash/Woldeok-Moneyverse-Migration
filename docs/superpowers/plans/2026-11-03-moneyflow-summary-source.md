# Administrator money-flow source-proof implementation plan

1. Reproduce: add negative tests in `frontend/src/app/admin/money-flow/money-flow-data.test.ts` for total volume != debit+credit, zero transactions with nonzero volume, active users > lifetime users, and lifetime transactions < 24h transactions. Run focused Vitest RED.
2. Implement: reject those contradictions in `money-flow-data.ts` with BigInt integer strings, preserve nullable optional counters, avoid invalid conclusions for unverified data.
3. Add page SSR test that malformed source triggers retry and no synthetic numbers. Inspect private admin SEO headers; only add exact route if actual HTTP configuration lacks protection.
4. Validate actual PostgreSQL 17 isolated read path if feasible, full lint/typecheck/unit/build/app-api/security/QA and remote CI on exact HEAD. Re-fetch main at midpoint and before merge.
5. Draft PR and evidence. Do not merge or deploy unless every mandatory gate passes, including exact-SHA Test and authenticated E2E.
