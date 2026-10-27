# Owner-scoped Wallet Activity Direction Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

## Bounded read-only design
Extend the authenticated wallet activity page with an all/in/out/neutral direction filter, combinable with all/7d/30d period. Direction is the sign of the sum of the owner's cash and bank ledger postings, not a transaction-type label. Cash-to-bank transfer is neutral. Default behavior and 50-row cap remain; use a 51st row for completeness. Filter PostgreSQL grouped owner postings before LIMIT. Preserve exact WLD numeric strings. No migration, DML, grants, financial commands or feature activation.

## Tasks and acceptance
- [x] Write failing backend repository, validation, API tests; implement minimal query/service/controller and verify GREEN.
- [x] Write failing frontend canonical filter URL tests; implement accessible combined navigation and verify GREEN.
- [x] Write failing Android app-api wallet 502 cache test; implement no-store for all response paths and verify GREEN.
- [x] Execute isolated PostgreSQL 17.11 synthetic schema tests for owner, direction, huge numeric and neutral bank movement.
- [x] Run focused tests and initial project gates; repair new type inference error.
- [ ] Full lint, root test, security, official Test exact SHA, authenticated E2E and independent backup restore must all PASS before integration.
- [ ] Obtain GitHub CI, finance/ACL and GitOps release gates before production.

## Rollback
Before merge: close Draft PR; main untouched. After approved merge: revert application-only commit through reviewed PR. No migration rollback, ledger reversal, or other worker branch deletion.
