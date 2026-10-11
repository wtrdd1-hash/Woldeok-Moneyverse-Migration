# Development A — Local email account identity full-flow repair (2026-10-12 05:25 KST)

Status: **CANDIDATE / NOT MERGED / NOT DEPLOYED**. Runtime changes must not be promoted before all mandatory exact-SHA CI and isolated Test gates pass.

- Starting main: `35245119f2edb575f5f0e9d2769e80954df3ab91`; non-main branches at initial inventory: 130; open PRs: #801 and #802.
- Branch: `auto/hourly-a-local-email-read-fix-20261012-0525` from the exact starting main. The prior 04:25 test-only branch remains preserved as an independent recovery source.
- User issue: local_email identities returned by the actor-scoped database read were rejected by the OAuth-only validator, potentially making the account identities API fail. Provider discovery also included local_email among OAuth account-link choices.
- Backend: allow local_email in **read-only identity summaries**, keep requireIdentityProvider restricted to discord/google for OAuth mutations.
- Frontend: only offer enabled discord/google providers for OAuth account linking; preserve first-party email sign-in display.
- Tests: reuse the previous failing-first backend account service regression tests, add frontend OAuth-link option regression tests.
- No database migration, ledger, authorization boundary or production secrets changed.
- Prior candidate CI #38168002262 failed at PostgreSQL migration application: migration 266 references absent woldeok_moneyverse_dev. The existing applied migration is immutable; no modification attempted here.
- Branch reconciliation: complete latest-main unique-commit/CI/conflict review of all 130 branches remains incomplete due GitHub call budget. No branch deleted, and PRs #801/#802 preserved; all unverified branches retained pending dependency/CI review.
- Required gates: build, lint, typecheck, unit/integration, real PostgreSQL, security, accessibility, SEO, app-api, E2E, exact-SHA isolated Test and Production smoke are **NOT YET PASS**.
- Merge/deployment/rollback: none. Next: inspect exact HEAD CI, repair environment-specific DB blocker through an additive/non-destructive route, run full gates, isolated Test, then consider integration.

## Follow-up account safety review
- Existing account UI offered `UnlinkButton` for any provider whenever two identities existed, including `local_email`. The database unlink routine can remove such a row; the new UI helper now offers unlink only for OAuth identities while retaining the last-method safeguard. No DB unlink semantics changed; direct API misuse requires separate DB-policy review before any production claim.
