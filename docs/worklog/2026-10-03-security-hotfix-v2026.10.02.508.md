# Security Hotfix Worklog — v2026.10.02.508

- Status: LOCAL VERIFICATION COMPLETE / BRANCH VALIDATION PENDING
- Started: 2026-10-03 (Asia/Seoul)
- Branch: `security/p0-next-og-ci-v2026.10.02.508`
- Base and mid-work authority: `5a7c658b38853f564983d19f961c689a494dc4b6` (origin/main unchanged at the mid-work refresh)
- Trigger: v2026.10.02.507 security audit found an urgent Production framework exposure plus a broken CI policy gate.
- Scope: framework patch, dependency remediation, CI security gate repair, CORS hardening, baseline lint unblock, exact-SHA Test validation, then zero-downtime Production promotion.
- Safety: no exploit payload was executed against Production.

## Implementation record
- Upgraded Next.js and matching Next lint packages from 16.3.4 to 16.3.8.
- Added root pnpm overrides: Multer >=2.4.0 and js-yaml >=5.4.1.
- Added the reviewed CORS policy module and regression tests.
- Added Node repository-security and control-byte scanners plus tests; CI now calls these maintained scanners.
- Control-byte scanner followed TDD: initial test failed because the module did not exist, then passed after implementation.
- Removed the existing 25 lint errors that would have blocked the restored runtime CI lane.

## Verification record
- Repository scanners: 4/4 tests pass; live scan passes.
- CORS focused regression: 3/3 pass.
- Root lint: exit 0, 0 errors / 456 warnings.
- Root typecheck: pass.
- Root full tests: pass.
  - contract: 31/31
  - database: 7/7
  - backend: 1053 passed, 391 DB-gated skipped
  - frontend: 984/984
- Root production build: pass on Next.js 16.3.8.
- Production dependency audit at moderate threshold: no known vulnerabilities.
- `git diff --check`: pass after EOF normalization.

## Remaining release gates
- Push branch and obtain exact-head Build Test Candidate success.
- Open PR and integrate only the validated head.
- Main exact-SHA candidate must pass isolated Test identity/health/noindex checks.
- Only after Test evidence may the zero-downtime Production promotion run.

## GitHub branch-validation repair
- Exact-head candidate `f92c75d87aa55d96b6d2755d8c976f88d48fe082` proved the replacement secret scanner works, then exposed a second stale CI boundary: the policy job still referenced systemd/nginx shell helpers removed by the public-repository sanitization.
- Audited all workflow references and found the runtime lane also referenced removed `packages/database/ci-apply.sh` and `scripts/reject-prisma-migrate.sh`.
- Added non-shell replacements: `packages/database/ci-apply.mjs` for fresh-CI PostgreSQL migration application and `scripts/security/reject-prisma-migrate.mjs` for the Prisma mutation guard, both with Node tests.
- The retained nginx blue/green port switcher already has a Python regression test, so CI now tests that tracked helper instead of deleted shell files.
- TDD evidence: both new Node test files failed with module-not-found before implementation, then passed 5/5 after implementation.
## Database security boundary repair
- GitHub DB-backed runtime validation applied all 241 existing migrations successfully, then exposed two real privilege regressions introduced by treasury migrations 240-242.
- Six new SECURITY DEFINER treasury functions were executable by PUBLIC, and moneyverse_app had new direct INSERT/UPDATE privileges on treasury evidence/governance/tax tables.
- Added immutable follow-up migration `243-treasury-security-boundary-repair.sql` instead of rewriting historical migrations.
- Migration 243 re-closes PUBLIC execution for SECURITY DEFINER routines, removes direct app writes to treasury disbursement and wealth-tax evidence, and moves citizen budget vote writes behind `treasury_cast_citizen_budget_vote`.
- Updated both wallet and administrator treasury repositories to call the narrow DB function rather than writing the governance table directly.
- Targeted local verification after the repair: changed-file lint pass, root typecheck pass, database static suite 7/7, CI-helper tests 5/5, repository/control-byte/Prisma scanners pass, diff-check pass.
