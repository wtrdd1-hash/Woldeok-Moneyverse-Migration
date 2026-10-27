# v571 Treasury backup evidence — bounded plan

1. Reproduce false-positive snapshot and status in focused Vitest tests. Assert no storage artifact is produced and direct repository access must fail.
2. Make both service entry points return structured HTTP 503 and repository entry points reject calls before DB reads, while preserving route and guard metadata.
3. Run focused tests, full typecheck/lint/test/build, API contract, security checks and isolated PostgreSQL where applicable. Inspect all skipped/failing gates and final exact SHA.
4. Push an independent Draft/HOLD PR; do not merge, deploy, or modify another worker's branch. Record final test, CI, security and release blockers.

Acceptance: no fabricated cloud backup receipt or verified snapshot count, no financial or DB mutation, truthful unavailable response, backward-compatible endpoint paths, explicit BLOCKED release status.
