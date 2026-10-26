# Backend B v570 — Qualification certification database boundary

## Before work — 2026-10-27 03:35 KST
- Base main SHA: `0fe614b2ca1a7bc0df540514e54db78130479e2a`; branch: `auto/hourly-b-qualification-db-boundary-v570-20261027-0335`.
- Read AGENTS.md, README.md, English/Korean planning, open PRs, QA #1477/#1469 and CI. Prior Backend containment is Draft PR #1478, **not merged**; this independent DB-only follow-up must not replace or bypass its HTTP 503 behavior.
- P0 root cause: applied migration 234 leaves `job_certify_qualification` callable by app/PUBLIC while its SECURITY DEFINER body mutates balances without canonical double-entry postings. It also granted app direct DML on qualification rows.
- Scope: forward-only migration 280 that fails closed at the database boundary and revokes app writes to qualification rows; preserve SELECT and other work features. No modification to migration 234, shared DB, balances or applied checksums.
- RED/GREEN: add SQL source regression tests first; then implement migration; verify in isolated PostgreSQL as moneyverse_app and privileged caller, plus repository gates.
- Release gates: CI, audit, actual Test exact-SHA, finance E2E and migration drift remediation remain mandatory; never merge/deploy without all PASS.

## In progress — 2026-10-27 03:36 KST
- RED: 3/3 new regression assertions failed before migration 280 existed (log: `mv-b-v570-logs/red.txt`).
- Implemented additive migration 280: replace unjournaled SECURITY DEFINER body with unconditional SQLSTATE 55000 refusal; revoke PUBLIC/app EXECUTE; revoke direct app qualification INSERT/UPDATE/DELETE while preserving SELECT.
- Pending GREEN, isolated PostgreSQL app-role and privileged-role probes, repository gates and GitHub CI.

## Finished
- Pending.

### Midpoint verification — 2026-10-27 03:38 KST
- GREEN: 3/3 new Vitest assertions passed on implementation commit `184919b23604287701eadf577d4f4eb9a30d7029`.
- Isolated PostgreSQL 17.11-alpine, `--network none`, tmpfs DB: migration 280 applied twice successfully. App EXECUTE revoked (42501), privileged invocation unconditionally rejected (55000), app qualification INSERT/UPDATE/DELETE revoked, SELECT retained, unrelated work function callable, no balance mutation or new qualification rows. Fixture was synthetic and did not apply the full 001–279 migration history. Container removed.
- Current main and both language plans rechecked. Integration dependency: Draft #1478 HTTP 503 containment must land before this SQL boundary to avoid changing an active route to generic 42501/500. Existing migration parity drift #1469 remains unresolved.

## Finished — 2026-10-27 03:44 KST (PARTIAL / RELEASE BLOCKED)
- Code commit `184919b23604287701eadf577d4f4eb9a30d7029`, GitHub Draft+hold PR #1481; base main `0fe614b2ca1a7bc0df540514e54db78130479e2a` unchanged at start/mid/pre-final. No other worktree, PR or branch modified/deleted.
- Regression TDD RED 3/3 then GREEN 3/3. Isolated PostgreSQL 17.11 app-role, privileged-role, read preservation, unrelated work and reapplication PASS. No shared DB writes.
- On candidate `3831080e4ecb23d900fe3101f7461cf2d582d1d9`: database 18 PASS / 3 SKIPPED; full `pnpm test` PASS (backend 1326 PASS / 398 SKIPPED, frontend 1423 PASS, contract 38 PASS); typecheck PASS; lint exit 0 (0 errors / 1131 warnings); default build PASS; API contract 179 endpoints; repository security, control-byte and Prisma guards PASS; bot tests 8/8 PASS after supplying existing bot dependencies to this isolated worktree.
- Production dependency audit PASS (0 known); full pnpm audit FAIL (2 critical, 8 high, 11 moderate, 3 low); bot audit FAIL (1 critical, 5 high). These are **release blockers**, not waived.
- CI #40379290614 and #40379276786 started; classification/policy PASS but runtime still pending at this log checkpoint. Final candidate CI to be rechecked after final log commit.
- Official Test exact-SHA, full project migrations with app role, authenticated core user flow, ledger reconciliation, historical discrepancies, backup/restore and GitOps release gates NOT VERIFIED / BLOCKED. Applied dev DB checksum drift #1469 remains; do not apply migration 280 to the shared DB while parity fails. Merge order requires Backend 503 PR #1478 first; issue #1477 and PR #1478 notified.
- **Main merge: NONE. Test promotion: NONE. Production: HOLD. Branch cleanup: NONE** (unique changes still unmerged). Scheduled A/B/C/planning/QA automation settings untouched.
- miniPC Debian 13.6; root 99% used (~1.8 GiB free), data volume 93% used (~15 GiB free). Storage pressure remains P0.
