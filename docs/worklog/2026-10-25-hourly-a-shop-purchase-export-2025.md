# Development A — Private Shop Purchase CSV Export (2026-10-25 20:25 KST)

## BEFORE (20:28–20:35 KST)
- MiniPC Debian 13.6 reachable via dedicated MCP; backend, frontend, bot, MCP, nginx and docker active. Root 98% (2.6 GiB available); data disk 62% (72 GiB available).
- Remote `main` SHA `1c5b84a1c45baafcca83f375a6f99698121e9bb5`. Read AGENTS.md, README.md, English canonical `docs/planning/PROJECT_PLAN.md` and `INTEGRATED_PLANNING_MASTER.md`, plus Korean second-language companions. Reviewed latest A QA/worklog and GitHub PR/CI; 184 remote heads, 180 open PRs. Existing unmerged A/B/C/QA/planning work and conflict PRs #1107/#1110/#1143 protected.
- New isolated worktree/branch `auto/hourly-a-shop-purchase-export-20261025-2025` from current main. No production database writes or service restarts.
- Distinct P1 scope: allow authenticated member to export their **own** bounded shop purchase history as safe UTF-8 CSV, using existing `shop_list_my_purchases(actor, limit)` SECURITY DEFINER read function, validated backend GET `limit`, Next private download route, shop CTA, and Android app-api parity. No ledger posting, migration, synthetic receipt, or new account lookup. Purchase CSV is historical data, not a new settlement proof. Other agents' stock/arcade/wallet/inventory exports are out of scope.
- RED/GREEN plan: backend limit/guard tests, Next CSV route injection/error tests, Android gateway query/session tests; implementation; real isolated PostgreSQL ACL/query, complete lint/typecheck/build/unit/contract/security/SEO/a11y and exact-SHA Test if possible. No merge or deploy without every required gate PASS.

## IN PROGRESS
Pending implementation and evidence.

## FINISHED
Pending final SHA/CI/Test/Production/rollback and branch audit.
