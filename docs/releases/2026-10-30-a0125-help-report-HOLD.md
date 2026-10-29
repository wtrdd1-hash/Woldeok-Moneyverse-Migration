# Release HOLD — A 01:25 Verified Help Issue Report

Candidate PR #1921 is DRAFT. Code is implemented and targeted tests/isolated DB pass, but full lint, full unit/integration and exact-SHA GitHub runtime CI are FAIL; official authenticated Test E2E and independent finance/restore gates are BLOCKED. Therefore **do not merge, enable either verified-help flag, deploy Test or Production, run production migrations, or delete any branch**.

Current read-only public Test and Production version: `c2129625aa6629c616fb31ce790950618b8d92b2`, not the candidate. No Production data or money mutation. No Test or Production rollback was needed or executed.

Rollback design: keep `VERIFIED_HELP_REPORT_V1=false` and/or `VERIFIED_HELP_CENTER_V1=false`; if ever released, revert the code via a new reviewed release without deleting previously created owner-private support threads. Do not reinterpret existing support receipts as deletable temporary data. Resume only after exact final SHA CI, app-api contract, real PostgreSQL authz, official Test login/user-flow, backup restore, financial provenance, frontend/backend identity and GitOps promotion checks all PASS.

Android contract candidate: `v2026.10.30.0125`; not live and not approved for rollout.
