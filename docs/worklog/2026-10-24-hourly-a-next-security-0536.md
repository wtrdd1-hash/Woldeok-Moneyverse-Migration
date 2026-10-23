# Development A — P0 Next.js security remediation (2026-10-24 05:36 KST)

## Before work
- Baseline main: `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede`; remote branches: 39; open PRs: 37.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, integrated master, issue #1067, QA v1205 and prior A releases.
- Host Debian 13.6 services active. Production/dev PostgreSQL isolation is unproven; do not perform destructive DB tests.
- Issue #1067: Next.js 16.3.8 has two Critical and one High advisories; root Next ESLint plugins pinned 16.3.8.
- QA #1061 owns CSV lint/blog-test repairs; A #0525 owns wallet direction filter; B/C own backend/admin/privacy. This branch touches dependency security only.
- Scope: upgrade Next.js and compatible ESLint packages; preserve application behavior, database, migrations, and other worktrees.
- RED: `pnpm audit --prod --audit-level high` should fail before upgrade. GREEN: fresh audit with zero high+ findings after upgrade.
- Release gate: full lint/typecheck/build/test/CI/exact SHA Test; HOLD if any fails.

## In progress
- [x] Reproduce security audit RED.
- [x] Update lockfile and compatible Next packages only.
- [x] Run targeted and full checks; record exact failures.
- [x] Re-fetch main and inspect PR/branch drift.

## In progress — implementation and gates
- `next` upgraded 16.3.8 -> 16.4.2; root Next ESLint packages 16.3.8 -> 16.4.2; pnpm lockfile regenerated, no migrations.
- New security-floor regression `scripts/security/next-advisory-floor.test.mjs` included in `pnpm test`; against `origin/main` 1 test FAILED (expected RED), against working branch 2/2 PASS.
- Production dependency audit on patched lockfile: PASS, 0 advisories at high+ severity.
- `pnpm typecheck`: PASS after full workspace install. `pnpm build`: PASS. `pnpm api:contract:check`: PASS (179 endpoints).
- Frontend tests: 1,383 PASS, 1 FAIL (pre-existing `src/app/blog/blog.test.tsx:53` title expectation), 258 files PASS, 1 FAIL.
- Backend tests: 1,313 PASS, 398 SKIPPED. Database package: 15 PASS, 3 SKIPPED.
- Full lint: FAIL, one existing `frontend/src/app/wallet/export-ledger-csv.tsx:19` `no-control-regex` error, 1,124 warnings. QA #1061 owns lint and blog-test repair.
- Early typecheck/build failed due missing workspace `node_modules` in new worktree; `pnpm install --frozen-lockfile` fixed setup, then both gates PASS.
- Main re-fetched at 05:44 KST: still `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede`; open PRs 38; remote branches 41 including this task. No other branch modified or deleted.
- Real PostgreSQL mutating/E2E checks prohibited: QA issues #1053 and #1060 report Production/dev DB coupling and public port exposure. No DB or Production writes.

## Finished — code candidate, not release
- Dependency remediation and regression test implemented. Full lint/frontend suite fail; exact-SHA CI and isolated authenticated Test not yet PASS.
- Draft PR only; no main merge, official Test/Production promotion, database change, rollback or branch deletion.
- Preserve all non-main unique commits, especially B/C/QA/Gemini and concurrent A wallet direction worktree.


### RED evidence — 05:38 KST
- Baseline `pnpm audit --prod --audit-level high --json` returned nonzero; three Next.js 16.3.8 advisories (2 Critical, 1 High). Evidence: `/tmp/mva_audit_red_0536.json` on miniPC.
- Branch start checkpoint pushed at `bf7c18ba4313e73a75a4e22425e02b41c6e76e4b`.

### GitHub exact-SHA CI checkpoint — 05:46 KST
- Code candidate `a3eaf294950e295c52186b62b5023aa577e4ae3a` was pushed and Draft PR #1069 created.
- CI run #40021478928: **FAIL**. Build Test Candidate run #40021473152: **FAIL**.
- Both runtime-check jobs stopped at the pre-existing `frontend/src/app/wallet/export-ledger-csv.tsx:19` `no-control-regex` lint failure. Downstream build/release jobs SKIPPED; not PASS.
- Local exact code SHA audit: 0 High/Critical; regression test 2 PASS. No CI security/DB/Test PASS claimed beyond observed checks.
- Issue #1067 updated; QA #1061 independent fix left untouched. No branch cleanup; all unique work protected.
- Release decision: **HOLD**. No integration, Test, Production, migration or rollback. Latest main remained `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede` at pre-final check.
