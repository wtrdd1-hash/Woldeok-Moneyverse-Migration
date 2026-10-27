# Backend B v579 — API Health Evidence Integrity

## Before work — 2026-10-27 11:35 KST
- Start main: `5888176454648f51d5f986be60a22847bd234777` (fetched from origin); branch `auto/hourly-b-api-health-truth-v579-20261027-1135`.
- Read AGENTS.md, README.md, English/Korean project plans, QA #1510 and latest CI/PRs. Existing B v577/#1511 handles season ledger; B v578/#1516 handles moderation; C v1090 handles market reauth. Avoid overlap.
- Target P1 QA #1510: backend invents 100% success/latency for unprobed API domains; frontend displays synthetic 100% even when response absent.
- Scope: preserve guarded read-only database probe, report unmeasured domain metrics as UNKNOWN/null with evidence timestamp and provenance; frontend renders unknown rather than invented values; add red-green regression tests.
- No financial writes, schema changes, service restart, or deployment. Production release HOLD until exact-SHA Test, security, CI and approved GitOps gates PASS.

## In progress
- [x] Reproduce QA finding with failing tests.
- [x] Implement backend/frontend truthfulness contract.
- [x] Validate focused and full tests, build, lint, typecheck, audits and isolated PG.

## Finished
- Pending.

### Midpoint — 2026-10-27 11:40 KST
- Fetched main again: `5888176454648f51d5f986be60a22847bd234777`; no shared branches/worktrees modified.
- RED evidence: backend 3/4 failed before fix; frontend 2/2 failed. Additional missing-DB-ping RED 1/5.
- GREEN evidence: backend 5/5; frontend 2/2. All route-level status, success, latency unmeasured; measured DB probe remains separate. No schema, ledger, or WLD changes.
- Remaining: full repository gates, isolated PG, security audits, CI, official Test exact-SHA and release holds.

### Validation checkpoint — 2026-10-27 11:51 KST
- Before main advanced: full `pnpm test` PASS (backend 1,331 PASS / 398 SKIPPED; frontend 1,426 PASS; contract 38 PASS; DB package 15 PASS / 3 SKIPPED); `pnpm build`, `pnpm lint` (0 errors / 1,129 warnings), `pnpm typecheck` PASS.
- TDD additional page copy RED 1/1 then GREEN 1/1; removed misleading live/verified page description.
- Isolated PostgreSQL 17.11-alpine PASS: SELECT 1, pg_stat_activity, pg_stat_database with read-only role; forbidden CREATE rejected. Container removed.
- Security: full pnpm audit FAIL (2 Critical, 8 High, 11 Moderate, 3 Low); production pnpm audit PASS; bot npm audit FAIL (1 Critical, 5 High). Bot test initially blocked by missing local youtube-dl-exec dependency, not an application assertion failure.
- Main advanced during validation from 58881764 to 584f01a9 (admin market reauth, session, planning). Rebase on latest main required before final gates and PR. No overlapping changed files detected.

## Finished — 2026-10-27 11:56 KST
- Main advanced mid-run to `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`; rebased own three commits and verified branch merge-base equals latest main again before PR. No merge conflict or changes to A/C/Gemini/QA worktrees.
- Post-rebase exact-source validation: `pnpm build` PASS, `pnpm lint` PASS (0 errors, 1,129 existing warnings), `pnpm typecheck` PASS, `pnpm test` PASS: backend 1,331 PASS / 398 SKIPPED, frontend 1,430 PASS, contract 38 PASS, DB package 15 PASS / 3 SKIPPED. `npm --prefix bot test` PASS 8/8 after temporarily linking pre-existing local dependencies; link removed afterward. Full pnpm audit FAIL (2 Critical, 8 High, 11 Moderate, 3 Low), production pnpm audit PASS, bot audit FAIL (1 Critical, 5 High).
- API contract: existing GET `/api/v1/admin/api-health/status` path/guards unchanged. `status` can be UNKNOWN/DEGRADED; domain `latencyMs`/`successRate` and global aggregate become nullable; `measurementSource`/`measuredAt` and `dbProbe` explicitly separate route evidence from read-only DB probe. Next admin page/dashboard handles null and refresh failure without false live-success claims. No migration, money, ledger, auth grants or production data changed.
- Isolated PostgreSQL 17.11-alpine (network disabled) read-only SELECT 1/statistics PASS, write denied; container removed. This does not replace authenticated official Test exact-SHA E2E.
- Official Test public SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production SHA `6a989b5ac0c6155587d43426d64f6def6b62c917` (read-only); neither is candidate. Official Test exact-SHA and approved GitOps release gate BLOCKED; Production HOLD.
- Draft PR / CI: see PR discussion and CI checks; no main merge, Test promotion or Production release. No branch cleanup (unique unmerged changes remain). Follow-up: add authenticated privacy-safe route-level SLI probes before displaying actual global success rate; clear security/release gates.
