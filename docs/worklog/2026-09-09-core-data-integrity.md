# 2026-09-09 — Core data-integrity hardening

## Status

In progress on `hardening/data-integrity-20260909` / PR #138. Production promotion and `main` merge remain gated on CI and test-server validation.

## Scope

This change hardens the database integrity boundary for the service economy and persistent account data.

### Implementation

- Add deferred PostgreSQL constraint triggers for account/balance completeness.
- Add balanced-ledger transaction checks.
- Add a read-only persistent data-integrity verification gate covering ledger/balance drift, negative-balance policy, invalid constraints/indexes, and protected-table privilege regressions.
- Run the integrity gate in CI immediately after migrations.
- Document the database integrity contract and operational verification path.

## Data-integrity impact

The migration is additive and uses deferred checks so legitimate multi-statement transactions can complete before invariants are evaluated. No production data mutation is part of this candidate change.

## Documentation contract for this work

This work follows the project-wide documentation rule: implementation, validation, test deployment, production deployment, and final completion status must be recorded in the work log and release/changelog documentation before the task is considered complete. English is the canonical developer-facing document; a Korean companion document is maintained alongside it.

## Validation record

- CI: pending/current workflow result must be recorded here before completion.
- Database migration verification: pending/current result must be recorded here before completion.
- Data-integrity verification gate: pending/current result must be recorded here before completion.
- Test-server verification: required before production promotion.
- Production verification: required after promotion and before final completion.

## Deployment gates

1. Keep `main` unchanged while this candidate is under validation.
2. Sync/reconcile upstream changes before final validation if `main` moves.
3. Pass CI and migration/integrity checks.
4. Validate on the test server.
5. Promote the validated revision to production.
6. Verify production integrity and service health.
7. Update this work log and release/changelog with the final result.
8. Merge the validated work to `main` and clean up the feature branch.

## Completion

Not complete yet. Final commit SHA, test-server result, production deployment result, and release/changelog reference must be appended here before closing the work.
