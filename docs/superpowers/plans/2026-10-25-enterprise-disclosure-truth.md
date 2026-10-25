# P0 public enterprise disclosure truth — implementation plan

## Decision and alternatives
Existing `/enterprises` is public, already has an actual NestJS read path and database repository, but substitutes fabricated balance/enterprise rows after any API failure. Keep this real source, not a new financial write model or migration. Treat all hourly profit and dividends as **projections from stored operating assumptions**, never posted cash or ledger transactions. On missing/invalid data show an explicit unavailable state and no numbers. Do not infer actual treasury remittance from projected percentages. The API should report provenance and a safe 503 on backend DB failure. Android should use the existing public `/app-api/v1/enterprises/public` gateway without bypassing the origin policy.

## Tasks (RED → GREEN → verify)
1. Add frontend page tests: unavailable/null and malformed rows must not display 365M WLD, 3 fictional enterprises, or 'real-time paid dividends'; valid large integer-string amounts render without JS Number conversion. Observe RED.
2. Add backend controller tests for actual repository-driven result and 503 on DB failure; metadata marks snapshot as source, projected payouts not settled. Observe RED.
3. Implement minimal backend controller response and frontend parser/view; preserve public SEO only for available data, add safe unavailable text and forecast wording.
4. Add Android app-api gateway path/compatibility tests, backend HTTP guard test, real isolated PostgreSQL read-only ACL/provenance check.
5. Run focused/full test, lint, typecheck, build, security, E2E; refresh latest main at start/mid/preintegration. Never merge without every gate PASS; otherwise Draft PR + release HOLD.

## Safety
No migration, financial write, live DB mutation, admin changes, or feature switch change. Preserve all independent branches and unmerged commits. Rollback is reverting the new branch only; no operational rollback needed absent deployment.
