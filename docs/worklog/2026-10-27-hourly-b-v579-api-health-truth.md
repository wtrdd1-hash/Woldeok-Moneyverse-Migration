# Backend B v579 — API Health Evidence Integrity

## Before work — 2026-10-27 11:35 KST
- Start main: `5888176454648f51d5f986be60a22847bd234777` (fetched from origin); branch `auto/hourly-b-api-health-truth-v579-20261027-1135`.
- Read AGENTS.md, README.md, English/Korean project plans, QA #1510 and latest CI/PRs. Existing B v577/#1511 handles season ledger; B v578/#1516 handles moderation; C v1090 handles market reauth. Avoid overlap.
- Target P1 QA #1510: backend invents 100% success/latency for unprobed API domains; frontend displays synthetic 100% even when response absent.
- Scope: preserve guarded read-only database probe, report unmeasured domain metrics as UNKNOWN/null with evidence timestamp and provenance; frontend renders unknown rather than invented values; add red-green regression tests.
- No financial writes, schema changes, service restart, or deployment. Production release HOLD until exact-SHA Test, security, CI and approved GitOps gates PASS.

## In progress
- [ ] Reproduce QA finding with failing tests.
- [ ] Implement backend/frontend truthfulness contract.
- [ ] Validate focused and full tests, build, lint, typecheck, audits and isolated PG.

## Finished
- Pending.
