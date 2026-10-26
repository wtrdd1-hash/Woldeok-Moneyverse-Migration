# Development B v567 — fail-closed applied migration checksum parity (P0 / HOLD)

**Date:** 2026-10-27 KST. **Base main:** `0fe614b2ca1a7bc0df540514e54db78130479e2a`.
**Tracking:** #1469. **Status:** code implemented; release **BLOCKED**, not a schema repair.

## Selection and isolation

Read AGENTS.md, README.md, PROJECT_PLAN.md (canonical English) and PROJECT_PLAN.ko.md, current main, open PRs and QA/CI evidence before selecting the new P0 migration-history mismatch. Separate B v567 worktree and non-main branch. Existing A/C/Gemini/QA worktrees and automation schedules remain untouched.

## Code / release contract

- Add `packages/database/verify-applied-checksums.mjs` to compare *raw* SHA-256 bytes of each applied `public.schema_migrations` filename with the exact checkout.
- The PostgreSQL query is **SELECT only** and `PGOPTIONS` enforces `default_transaction_read_only=on`. Explicit target identity is required. The tool never writes a checksum, creates a migration, changes grants, or touches money.
- Missing/duplicate/malformed applied records, changed bytes, inaccessible PostgreSQL, or empty migration history fail closed with exit 2. New source SQL not yet applied is reported separately, not treated as checksum drift.
- CI runs the real-database gate from the root test suite **after** fresh PostgreSQL migration application; it activates when the CI migrator connection is present. Without a configured database it is explicitly skipped, not reported as a pass. Unit tests run in the same root test suite. No workflow file edit is required.
- No HTTP API/DTO, runtime DB schema, finance/ledger, authentication or application user-flow change. No applied SQL files were edited.

## RED / GREEN / real PostgreSQL evidence

- RED: test module missing before implementation, nonzero; GREEN: 9 unit tests pass (exact bytes, CRLF, malformed/duplicate, missing, read-only execution, error redaction and CI wiring); the real-DB integration test is explicitly skipped when no migrator connection is configured.
- Isolated PostgreSQL 17.11 (`--network none`, no published ports): a reader with SELECT-only grant verified source-matching checksum **PASS (exit 0)**, then synthetic checksum drift **BLOCKED (exit 2)**. Integrated root-test check against the isolated reader passed 10/10 with matching bytes and failed as required when the synthetic checksum was changed. Temporary container removed.
- Read-only audit against current configured development database: 266 applied, 261 matched, **5 mismatched**, 12 source files unapplied; no DB mutation. Mismatches: 219, 220, 221, 234, 266. This development database is shared with a running service, so only migration metadata SELECT was used.
- Historical Git blob search matched the stored SHA for 221 to commit `793347fd`, 234 to `5e1de651`, 266 to `310cb701`. No matching historical file blob found for 219 (5 file commits searched) or 220 (2 file commits searched). These are provenance clues, not permission to replace applied bytes.

## Verification and release restrictions

- `pnpm lint`: PASS, 0 errors, 1,131 existing warnings. `pnpm typecheck`: PASS. `pnpm build`: PASS.
- `pnpm test`: PASS; backend 1,326 passed / 398 skipped; frontend 1,423 passed; contract 38 passed; DB package 15 passed / 3 skipped. Skipped tests are not accepted as passes.
- Discord Bot: 8/8 tests PASS after offline dependency installation.
- Production-only dependency audit PASS. Full dependency audit FAIL (2 critical, 8 high, 11 moderate, 3 low); Discord Bot audit FAIL (1 critical, 5 high).
- This gate **detects** checksum drift; it does not reconcile the five applied migrations. Full production/Test immutable history, real app ACL, official Test exact-SHA authenticated E2E, finance and GitOps release gates remain BLOCKED.
- Initial direct workflow-file update was rejected by GitHub OAuth permissions; no remote workflow change occurred. CI integration was instead placed in the existing root test command, which CI runs after migrations.
- No PR merge, shared schema mutation, Test promotion, Production promotion or branch cleanup. Keep Draft + hold until full approval and verified gates.

## Follow-up

Recover authoritative applied bytes for 219 and 220 from trusted backups or signed release artifacts; compare each changed function/index with present schema; design only forward-numbered corrective migrations as necessary, coordinating competing unmerged migration 280 proposals. Never rewrite `schema_migrations.checksum` or edit an already-applied SQL migration.
