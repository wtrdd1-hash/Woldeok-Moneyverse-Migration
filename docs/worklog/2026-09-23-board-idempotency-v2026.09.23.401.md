# Development B worklog — v2026.09.23.401

Base: `7b705e1d37e97ccd05ba12042c3fd8d582e396d0`

Selected P1 replay-safety debt outside the open business/chat/photo work: board HTTP DTOs already required caller-owned UUID idempotency keys, but `BoardService` still generated fresh UUIDs when invoked without a key. That fallback could turn an internal retry or future alternate transport into a distinct mutation.

Implemented:
- removed `randomUUID()` fallback for post create/update and comment create;
- preserved existing caller-owned keys and repository/DB behavior;
- added missing-key regression tests for all three write paths.

Validation:
- focused board service Vitest: 12/12 PASS;
- contract build: PASS;
- backend TypeScript `--noEmit`: PASS after contract build;
- backend build: PASS;
- changed-file ESLint: PASS;
- `git diff --check`: PASS.

Real PostgreSQL is not claimed because this change does not alter SQL and the full DB gate has not run on this exact SHA. Merge and Production promotion remain gated on required GitHub/GitOps checks and exact-SHA isolated validation.
