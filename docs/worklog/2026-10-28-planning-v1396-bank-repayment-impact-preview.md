# Planning v1396 — Verified Bank Loan Repayment Impact Preview (2026-10-28)

**Cycle:** Previous Feature Improvement v1394 / Current Feature Addition v1396 / Next Feature Improvement v1398 provisional.
**Main authority:** b1cd54fda1123fb07ca81b6e5b3ead70f59f556c at start and midpoint. Stacked predecessor Draft #1634; issue #1639. **DRAFT / RELEASE HOLD**.

## Evidence and design
Read main AGENTS.md, README.md, canonical English PROJECT_PLAN.md and Korean parity; reviewed bank UI SmartLoanCard, NestJS bank controller/repository, migrations 194/211, app API route and QA v1333 #1635. No server-verified preview in main. Designed owner-scoped read-only POST, one MVCC snapshot and exact integer cash/debt impact with no ledger/DB write. This is not a confirmed Production defect. Alternatives considered: client arithmetic (insufficient provenance), owner-scoped SECDEF read (selected), durable quote (over-engineered).

## Development handoff and release conditions
ENV1396-01 SEC1396-02 REL1396-03 LOAN1396-04 LOAN1396-05 LOAN1396-06 LOAN1396-07 LOAN1396-08 LOAN1396-09 LOAN1396-10. A: member web/NestJS/Android; B: SECDEF SQL/ACL; C: aggregate-only admin/privacy; QA: isolated PG, 10,001 synthetic / 100 concurrency / 100 forged, ledger regression, exact-SHA official Test, independent restore and rollback. These tests were **not run** by planning. QA v1333 #1635 isolated candidate exact-head CI PASS, NOT main/Test/Production. Main ACL/migration/checksum/release-link and restore blockers remain. External independent references new approved 0, cumulative dedup approved UNKNOWN/10,000; BLOCKED / IN PROGRESS.

## Change boundary
Existing bilingual integrated master, feature review, project plan, integrated review and update logs updated, plus this worklog. No runtime code, live DB, balances, ledger, feature flags, Test or Production changes. No main merge. Final SHA, PR, and verification recorded in internal planning-v1396-records.
