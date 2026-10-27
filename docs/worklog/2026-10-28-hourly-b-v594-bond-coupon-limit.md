# B v594 — admin treasury bond coupon history bounded input (DRAFT / HOLD)

## Before work
- Baseline `origin/main`: `656a89947f2261c12de20d4612e88f251ba6c6a6`; independent worktree and branch `auto/hourly-b-bond-coupon-log-limit-v594-20261028-0005`.
- Reviewed AGENTS.md, README.md, English `docs/planning/PROJECT_PLAN.md`, Korean companion, QA v1326 gates, current open PRs, CI and adjacent B v593 enterprise dividend history PR #1590. No overlap with B v593 or C/A/Gemini files.
- P1 risk: `GET /api/v1/admin/bonds/coupon-logs` accepted malformed and unbounded query limits. The repository passed raw limits to SQL. Admin guards remain unchanged.

## In progress / implementation
- Added strict canonical decimal query validation: default 20, permitted 1..100, malformed/duplicate/negative/decimal/exponent/unsafe inputs HTTP 400 before service access.
- Added repository-level safe-integer 1..100 guard before SQL. Kept bound `LIMIT $1`, original route/response and exact WLD numeric text. No DB schema, balance, ledger, auth or frontend changes.
- RED 20 failures / 2 passes in 22 focused tests before implementation; GREEN 22/22 focused unit tests after implementation. Added Nest HTTP integration 2/2 (test-only guard overrides; **not** real authenticated Test).
- Disposable isolated PostgreSQL 17.11 (no network, synthetic schema/data): bounded reads at 1/100, exact 25-digit WLD string and `moneyverse_app` UPDATE privilege absent. Container removed. Not a full production schema/role integration.

## Verification and release blockers
- Local typecheck PASS; lint PASS (0 errors, 1108 existing warnings); default Next build PASS after installing worktree-local dependencies; backend 1712 PASS / 430 SKIPPED; frontend 1681 PASS; bot 8 PASS after isolated offline install; API contract 180 endpoints PASS.
- Full `pnpm test` FAIL due **pre-existing duplicate migration 283** (main baseline); this change adds no migration. Earlier root failure is not masked.
- `pnpm audit --audit-level=high` PASS, but **full `pnpm audit --audit-level=low` FAIL** with 10 findings (2 low, 8 moderate). Mandatory full security gate remains FAIL. Bot offline audit found zero vulnerabilities.
- Official Test exact-SHA authenticated backend/API/DB and core user E2E **NOT RUN**; GitOps release gate **BLOCKED**. Do not merge or promote to Production without required gates. No live DB writes, migrations or deployment.

## Finished / handoff
- Final branch SHA, latest main SHA, GitHub CI and PR status must be appended to PR evidence; no merge or deployment is authorized.
- Existing development A/C/Gemini/QA branches, worktrees, schedules and Production/Test untouched. No cleanup of another worker's branches.
