# Admin cockpit evidence plan (C v1100)

1. RED: Add pure evidence-model tests for unavailable/malformed admin API responses, no fabricated healthy counts, bounded member population, invalid wealth amounts and ledger reconciliation.
2. GREEN: Implement validated read model in `frontend/src/app/admin/admin-cockpit-evidence.ts`, using actual NestJS/PostgreSQL response shapes. Preserve bigint string amounts and fail closed on contradictory evidence.
3. Integrate into `frontend/src/app/admin/page.tsx`: never assert 14 APIs online, chain integrity, all controls healthy, or global member count without authoritative evidence; provide bounded ranking and accessible unknown states. Keep noindex and responsive cards.
4. Verify focused tests, full frontend and backend tests, lint, typecheck, builds, app-api contracts, security audit, isolated PostgreSQL CI, exact-SHA Test E2E. Re-fetch main/plan before PR/merge. Only merge/release on all gates PASS.
