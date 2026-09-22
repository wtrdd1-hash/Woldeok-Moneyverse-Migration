# Backend required-CI lint hardening — v2026.09.23.373

## English canonical

- Removed seven stale backend imports that made the repository-wide required lint gate fail.
- Replaced the Treasury repository's `Pool` dependency with the existing least-capability `Queryable` contract, removing an unsafe `any` cast from AdminModule without changing SQL or runtime behavior.
- No API payload, migration, database privilege, or ledger semantics changed.
- Validation: changed-file ESLint PASS; backend TypeScript typecheck PASS; backend Vitest 88 files / 940 tests PASS (52 DB suites skipped where no test DB was configured).
