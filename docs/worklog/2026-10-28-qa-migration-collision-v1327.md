# QA v1327 — Duplicate Migration 283 Repair (DRAFT / HOLD)

## Before work
- 2026-10-28 00:19 KST, authoritative main `004be59307e389a4f293a0a0e71ee4144982936d`.
- Read `AGENTS.md`, `README.md`, `docs/RELEASING.md`, integrated EN/KO planning master, and previous QA v1326. Use an independent QA clone and branch; preserve other agents' branches and unfinished files.
- Scope: two SQL files claimed migration 283; forward-only, no applied migration edits or Production/Test changes.

## In progress
- [x] RED: migration-parity test fails on duplicate 283 / missing 285; updated space test fails ENOENT before rename.
- [x] GREEN: move unapplied space-finance SQL to 285; update test reference; DB package 33 PASS / 3 SKIP.
- [x] Root unit suite PASS (backend 1,688 PASS / 430 SKIP; frontend 1,681 PASS); typecheck and build PASS.
- [x] Two isolated PostgreSQL 17.11 instances apply 284 migrations (002..285), receipts verified.
- [x] Read-only SQL ACL checks deny app direct space/city/tax DML and unsafe financial function execution while preserving layout-only function.
- [ ] Real PostgreSQL backend suite: 2,273 PASS / 1 FAIL / 60 SKIP. One stale security-boundary test expects 11 DML grants intentionally revoked by 285; must be repaired without restoring grants.
- [ ] CI exact head: initial PR #1603 runtime-check failed from unrelated blog lint errors; candidate fix in separate Draft #1606.
- [ ] Bot security audit: 1 Critical / 5 High; official Test exact-SHA authenticated E2E and GitOps gate missing.

## Finished state — HOLD, not release completion
- Candidate source commit `de8e7fb6cc22686bcf73b2daf32c7f49a50528b8`; Draft PR #1603.
- No main integration, live DB write, service restart, branch deletion, Test/Production promotion, or WLD change.
- Latest main advanced to `4f5efd1f48615f0112701feec25a9b0fc67d9719` via release documentation; EN/KO master plan unchanged. Rebase and rerun all gates before any merge.
- Internal detailed report: `/srv/moneyverse-tasks/Moneyverse-QA-v2026.10.28.1327.md`.
