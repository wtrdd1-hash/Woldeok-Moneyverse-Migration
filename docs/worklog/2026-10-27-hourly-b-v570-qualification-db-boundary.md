# Backend B v570 — Qualification certification database boundary

## Before work — 2026-10-27 03:35 KST
- Base main SHA: `0fe614b2ca1a7bc0df540514e54db78130479e2a`; branch: `auto/hourly-b-qualification-db-boundary-v570-20261027-0335`.
- Read AGENTS.md, README.md, English/Korean planning, open PRs, QA #1477/#1469 and CI. Prior Backend containment is Draft PR #1478, **not merged**; this independent DB-only follow-up must not replace or bypass its HTTP 503 behavior.
- P0 root cause: applied migration 234 leaves `job_certify_qualification` callable by app/PUBLIC while its SECURITY DEFINER body mutates balances without canonical double-entry postings. It also granted app direct DML on qualification rows.
- Scope: forward-only migration 280 that fails closed at the database boundary and revokes app writes to qualification rows; preserve SELECT and other work features. No modification to migration 234, shared DB, balances or applied checksums.
- RED/GREEN: add SQL source regression tests first; then implement migration; verify in isolated PostgreSQL as moneyverse_app and privileged caller, plus repository gates.
- Release gates: CI, audit, actual Test exact-SHA, finance E2E and migration drift remediation remain mandatory; never merge/deploy without all PASS.

## In progress — 2026-10-27 03:36 KST
- RED: 3/3 new regression assertions failed before migration 280 existed (log: `mv-b-v570-logs/red.txt`).
- Implemented additive migration 280: replace unjournaled SECURITY DEFINER body with unconditional SQLSTATE 55000 refusal; revoke PUBLIC/app EXECUTE; revoke direct app qualification INSERT/UPDATE/DELETE while preserving SELECT.
- Pending GREEN, isolated PostgreSQL app-role and privileged-role probes, repository gates and GitHub CI.

## Finished
- Pending.

### Midpoint verification — 2026-10-27 03:38 KST
- GREEN: 3/3 new Vitest assertions passed on implementation commit `184919b23604287701eadf577d4f4eb9a30d7029`.
- Isolated PostgreSQL 17.11-alpine, `--network none`, tmpfs DB: migration 280 applied twice successfully. App EXECUTE revoked (42501), privileged invocation unconditionally rejected (55000), app qualification INSERT/UPDATE/DELETE revoked, SELECT retained, unrelated work function callable, no balance mutation or new qualification rows. Fixture was synthetic and did not apply the full 001–279 migration history. Container removed.
- Current main and both language plans rechecked. Integration dependency: Draft #1478 HTTP 503 containment must land before this SQL boundary to avoid changing an active route to generic 42501/500. Existing migration parity drift #1469 remains unresolved.
