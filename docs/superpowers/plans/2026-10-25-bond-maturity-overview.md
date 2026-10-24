# A0120 bond maturity overview — execution plan

1. Verify baseline, isolation, project policy and current authoritative plans. Create worklog before code.
2. Write failing backend tests for actor-scoped read-only maturity summary: exact 100-digit sums, seven-day boundary, matured-but-unredeemed, missing/malformed source, no table DML. Execute RED.
3. Implement pure projection in backend/src/bank/bond-maturity.ts and GET /api/v1/banking/bonds/maturity-overview behind existing session/auth/consent guards. Execute GREEN.
4. Write failing frontend view tests and app gateway route contract; implement private /bank/bonds page with truthful errors, accessible maturity badges, link from bank dashboard, explicit estimate label. Execute GREEN.
5. Validate lint/typecheck/build/unit/integration/real PostgreSQL/security/a11y/SEO/app-api/E2E, check current main at midpoint and before integration. Do not merge or deploy without all release gates.
6. Record SHA, changed files, branch/PR/CI counts, failed tests, rollback and preservation decisions in English/Korean release notes and worklog. Draft PR if blocked.
