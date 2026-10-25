# Development A — verified private inventory CSV snapshot (2026-10-26 04:25 KST)

## BEFORE WORK
- Debian 13.6 mini-PC MCP status: backend/frontend/Discord/MCP/nginx/docker ACTIVE; PostgreSQL connected. Root filesystem 99% used, data volume 70%. Do not deploy or restart services.
- Source of truth: origin/main 1c5b84a1c45baafcca83f375a6f99698121e9bb5. Worktree/branch: auto/hourly-a-inventory-snapshot-export-20261026-0425, created from main. No other worktree modified.
- GitHub initial snapshot: 219 remote heads, 215 open PRs. Existing QA, AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md, PROJECT_PLAN.ko.md and INTEGRATED_PLANNING_MASTER.md reviewed; open A/B/C and QA PRs retained. Do not delete any branch with unproven unique history.
- Known baseline failures from prior A runs: six frontend tests (SEO/i18n, login a11y, calculator signup, M2 telemetry); security audit Critical/High; Test exact-SHA and authenticated E2E unavailable. These are release blockers.
- Selected isolated P1 user feature: authenticated member can export a **complete, current inventory snapshot** as CSV; no stale or truncated success. Existing owner-only PostgreSQL function shop_my_items_v2 is reused, no new migration, ledger write or additional DB grants. Backend enforces maximum 100 holdings (fails closed above cap), frontend verifies payload/quantity/date/IDs and escapes spreadsheet formulas. Android app-api forwards owner session, refuses unauthenticated requests.
- No overlap with active B backend integrity fixes, C frontend fixes, QA regression PRs or other A CSV exports. This is an inventory snapshot, not a shop purchase receipt.
- Release policy: all full gates, isolated real PostgreSQL owner/ACL and exact-SHA authenticated official Test E2E required before merge or Production. Any failure => HOLD.

## IN PROGRESS
- [x] RED tests: backend 3 failed (missing exportSnapshot), frontend module import failed (missing route). Evidence /srv/moneyverse-data/reports/a0425-{backend,frontend}-red.log.
- [x] Initial backend guarded snapshot, Next CSV BFF, inventory UI and Android gateway regression tests implemented; GREEN verification pending.
- [ ] Mid-work origin/main + integrated plan reread, QA/security regression and DB ACL.
- [ ] Final branch audit, exact SHA gates, PR and release evidence.

## FINISHED
- Pending.
