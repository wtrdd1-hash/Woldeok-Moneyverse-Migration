# Development A — 2026-10-23 18:25 KST — private financial API cache boundary

## Scope, baseline and ownership

- Source: GitHub `main` `b147ed18a7359011f8457ff9748772186588e452`; verified at start, mid-run and before final integration decision.
- Isolated Debian 13 worktree: `/home/debian/worktrees/mv-a-20261023-1825`; branch `auto/hourly-a-wallet-privacy-backend-repair-20261023-1825`.
- Read `AGENTS.md`, `README.md`, `PROJECT_PLAN.md`, `PROJECT_PLAN.ko.md`, `INTEGRATED_PLANNING_MASTER.md`, relevant worklogs, Superpowers worktree/TDD/debugging/verification skills, open PRs and CI.
- Existing PR #1003 has the original Android wallet no-store fix; its single commit was cherry-picked without changing that branch. This repair candidate extends protection to the backend wallet controller and Android bank/reward routes. Keep #1003 open until an accepted replacement is safely merged. PR #1001 owns Next.js security/dependency upgrades, PR #991 owns CSV lint, PR #1006 owns guest homepage regression. No edits to their files except the preexisting #1003 gateway code being extended here.

## RED → GREEN and implementation

1. New backend real HTTP controller test: five authenticated GET routes (`wallet`, recipient search, reward availability, bank loans, tax receipt) had no `Cache-Control` response header. **RED 5 failed, 1 passed**. Missing contract package build was an environment setup failure and was resolved by building `@moneyverse/contract` before the valid RED run.
2. Apply `@Header('Cache-Control', 'private, no-store')` to 13 financial controller endpoints, including transfers, loan repayments and reward commands. **GREEN 6/6**; 38-digit WLD remains an exact string.
3. Cherry-pick existing PR #1003 commit `096948184018a6a3cb02af18861e12948748f66a` into this isolated branch; source becomes `8a2d047dd1bab85a2dae252e9b56ea04b6fba8fa`. Existing Android wallet tests remain.
4. Add Android gateway tests for `bank/loans` and `rewards/availability`. **RED 2 failed, 4 passed** because upstream `public, max-age=600` and ETag were passed through.
5. Extend private financial cache/validator boundary from `wallet` to `wallet`, `bank`, `rewards` while retaining public media caching. **GREEN 16/16 frontend gateway tests, 27/27 backend wallet tests**. Exact large integer strings and cookie forwarding preserved; no financial writes.

## Verification — evidence for this candidate, not a release claim

- Changed-file ESLint: PASS.
- `pnpm typecheck`: PASS.
- `pnpm build`: PASS, including Next.js 593 static pages.
- Focused frontend app-api: 16 PASS; backend wallet: 27 PASS.
- Full `pnpm test`: **FAIL** — backend 1309 PASS / 397 SKIPPED, frontend 1373 PASS / 2 FAIL (`guest-first-home.test.ts`, separately owned by PR #1006); contract 31 PASS, database 15 PASS / 3 SKIPPED.
- Full `pnpm lint`: **FAIL** — 1 existing `no-control-regex` error in `frontend/src/app/wallet/export-ledger-csv.tsx` (QA PR #991 owns), 1120 warnings.
- `pnpm audit --prod --audit-level=high`: **FAIL**, Next.js 16.3.8 with two critical and one high advisories. PR #1001 owns the dependency fix.
- Real development PostgreSQL read-only SQL: 852 ledger transactions, 1734 postings, 0 under-two-posting transactions, 0 unbalanced transactions; `moneyverse_app` INSERT/UPDATE/DELETE privilege on 235 public tables. **P0 ACL FAIL**. No DB mutation or migration.
- Not executed / not accepted: full real-PostgreSQL app-role negative tests, authenticated Test E2E, browser accessibility/SEO audit, app-api real member session, official exact-SHA Test promotion, Production DB reconciliation, rollback rehearsal.
- Changes are source-only. No main merge, official Test/Production deploy, migration, privilege change, feature switch, user ledger modification, branch deletion, or other automation schedule modification.

## Integration and rollback

- Branch started from fresh remote main, not shared local main (which contains unrelated unpushed commits).
- Do not merge until *all* full CI/security and official authenticated Test exact-SHA gates pass. CI FAIL or skipped DB tests cannot be treated as PASS.
- Rollback for this source-only change: revert the repair commit/cherry-picked gateway commit if needed. No data rollback required; no migration applied.
- Preserve all non-main branches with unique commits and all open PRs; remove only proven fully merged/replaced branches after confirmation. No branches deleted this run.
