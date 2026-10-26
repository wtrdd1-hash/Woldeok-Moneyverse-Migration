# Backend B v570 — Qualification certification database boundary

## Before work — 2026-10-27 03:35 KST
- Base main SHA: `0fe614b2ca1a7bc0df540514e54db78130479e2a`; branch: `auto/hourly-b-qualification-db-boundary-v570-20261027-0335`.
- Read AGENTS.md, README.md, English/Korean planning, open PRs, QA #1477/#1469 and CI. Prior Backend containment is Draft PR #1478, **not merged**; this independent DB-only follow-up must not replace or bypass its HTTP 503 behavior.
- P0 root cause: applied migration 234 leaves `job_certify_qualification` callable by app/PUBLIC while its SECURITY DEFINER body mutates balances without canonical double-entry postings. It also granted app direct DML on qualification rows.
- Scope: forward-only migration 280 that fails closed at the database boundary and revokes app writes to qualification rows; preserve SELECT and other work features. No modification to migration 234, shared DB, balances or applied checksums.
- RED/GREEN: add SQL source regression tests first; then implement migration; verify in isolated PostgreSQL as moneyverse_app and privileged caller, plus repository gates.
- Release gates: CI, audit, actual Test exact-SHA, finance E2E and migration drift remediation remain mandatory; never merge/deploy without all PASS.

## In progress
- Pending test-first implementation.

## Finished
- Pending.
