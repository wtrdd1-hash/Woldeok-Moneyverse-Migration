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
- [ ] Reproduce security audit RED.
- [ ] Update lockfile and compatible Next packages only.
- [ ] Run targeted and full checks; record exact failures.
- [ ] Re-fetch main and inspect PR/branch drift.

## Finished
- Pending. No merge, Test promotion, Production deployment, or branch deletion authorized without evidence.

### RED evidence — 05:38 KST
- Baseline `pnpm audit --prod --audit-level high --json` returned nonzero; three Next.js 16.3.8 advisories (2 Critical, 1 High). Evidence: `/tmp/mva_audit_red_0536.json` on miniPC.
- Branch start checkpoint pushed at `bf7c18ba4313e73a75a4e22425e02b41c6e76e4b`.
