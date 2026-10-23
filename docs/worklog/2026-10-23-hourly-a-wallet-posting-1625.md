# Development A — verified wallet posting amount repair (2026-10-23 16:25 KST)

Status: **PARTIAL / HOLD**. Production deployment is prohibited until all required gates pass.

## Start / policy / branch
- Debian 13.6 miniPC direct system-status and shell connection at 16:26 KST; backend/frontend/Discord/MCP/Nginx/Docker active, development DB connected.
- Read AGENTS.md, README.md, canonical EN PROJECT_PLAN.md and second-language PROJECT_PLAN.ko.md, INTEGRATED_PLANNING_MASTER.md, prior wallet QA/worklogs and PR #990/#991, CI and Superpowers worktree/TDD/debugging/verification skills.
- Remote main SHA at start, middle and pre-commit: `8a1b466bda4568eb6ff62d75a6e3d1d6bfcde146`.
- New isolated worktree `/home/debian/worktrees/mv-a-20261023-1625`, branch `auto/hourly-a-wallet-posting-repair-20261023-1625`. Shared main and other agents' worktrees not modified.
- GitHub branches observed: 224 at 16:36 KST; 10 open PRs (#975, #977, #978, #981, #985 conflicting, #988, #989, #990, #991, #992). No branches deleted.
- #990 is 2 commits behind current main, 3 unique commits ahead; #991 owns Next.js 16.4.2 lockfile and related security/lint work; do not overwrite its unique changes.

## User-facing defect / scope
- Main wallet and wallet activity passed netAmount into PostingStrip. Zero-net owner bank transfers therefore showed 0 instead of 2,500 WLD.
- Existing owner-scoped backend/API/DB projection provides signed cashDelta and bankDelta; reuse it rather than create duplicate backend/database writes or migrations.
- Preserve the newly merged live-stock wallet portfolio/trading functionality from main 10b130fa.

## TDD RED -> GREEN
- Imported only #990's regression tests into the new worktree. RED: 3 failures / 19 pass across 22 focused tests (wallet page wiring, missing/contradictory pocket values, accessible unknown amount).
- Applied minimal patch to `wallet/page.tsx`, `wallet/activity/page.tsx`, `wallet/sides.ts`, `posting-strip.tsx` and CSV formula-control sanitization. All changes apply cleanly over latest main and preserve stock functionality.
- GREEN: 22/22 focused tests PASS, `NODE_ENV=test` Vitest.
- Root `pnpm test`: PASS. Backend 1,303 PASS, **397 DB tests SKIPPED**; frontend 1,373 PASS. The skipped tests are NOT real PostgreSQL integration proof.
- Root `pnpm lint`: PASS (0 errors, 1,119 warnings). Root `pnpm build`: PASS. Frontend `tsc --noEmit`: PASS. Frontend build PASS. `git diff --check`: PASS.
- Root test includes API contract check; full authenticated Test/browser E2E, a11y/SEO in official Test, real isolated PostgreSQL DB migrations and release gate NOT proven.

## Direct read-only development PostgreSQL checks
- Container `woldeok-moneyverse-dev-db-1` role `moneyverse_migrator`, database `woldeok_moneyverse_dev`; explicit `BEGIN READ ONLY` / `ROLLBACK`.
- Ledger transactions 852, postings 1,734; 0 transactions with fewer than 2 postings; 0 debit-credit imbalances (using lowercase `debit` and `credit` enum values); 0 unknown directions.
- `moneyverse_app` INSERT on 235 public ordinary/partition tables, UPDATE on 235. **P0 least privilege FAIL**. These observations apply to dev only. No SQL writes/role changes or applied migration edits.
- No authenticated end-to-end owner-flow, idempotency or production ledger acceptance was run.

## Security / CI / release
- Local `pnpm audit --prod --audit-level=high`: FAIL, Next.js 16.3.8: 2 CRITICAL RCE and 1 HIGH DoS (GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r). Existing QA PR #991 owns Next 16.4.2 fix, not duplicated here.
- Current main CI #39912474272 FAIL (CSV control-regex lint). This candidate includes the same minimal lint fix as #991; reconcile after #991 lands.
- #990 older CI #39906412577 FAIL. New exact-SHA GitHub CI pending after push. Never infer PASS from local tests.
- Main integration: NO. Official isolated Test exact SHA: NO. Production: NO. Rollback: no deployment to undo. Release: **HOLD**.
- Preserve all other agents' unique changes; no branch deletions, reservations modified, database DML, or production switches.

## Next gate
- Review this draft PR against #990/#991; wait for QA dependency fix and full GitHub CI on exact candidate SHA.
- Run isolated real PostgreSQL/negative app-role permission, auth/owner wallet/API/app-api, idempotency, exact precision, accessibility, SEO and authenticated E2E in official Test.
- Recheck main and integrated master before any merge; require exact SHA PASS. Production needs GitOps release/rollback and reconciliation proof.
