# A2025 — Bounded member stock trade-history window

## Intent and scoped design
P1 usability gap: the stock history screen silently displays only the latest 50 trades. Allow the signed-in member to select a recent 50, 100 or 200 trade window; keep existing symbol/side/sort filters scoped to that selected window. Do not claim full lifetime history. Android clients may request the same bounded API query. Existing `stock_my_trades(actor, limit)` is the sole DB authority, already owner-scoped and bounded at 200; no new schema, grants or ledger writes. Unknown, repeated or noncanonical API values return HTTP 400 before SQL. Default remains 50. No new endpoint or migration. The Android proxy must not publicly cache owner trade history, even for failures.

## Execution checklist
1. Record baseline main/QA/CI and branch/worktree; add failing controller/repository/frontend/gateway tests.
2. Confirm RED for malformed and 200-window cases.
3. Implement minimal backend `limit` validation, repository 200 cap, frontend bounded selector with truthful labels, and Android private/no-store/noindex.
4. Run focused tests then full build/lint/typecheck/unit/integration/API/security and isolated PostgreSQL read-only proof. Compare final main and overlapping PRs.
5. Publish draft PR and bilingual worklog/evidence. No merge/production promotion absent all mandatory gates.

## Safety and rollback
No direct app table read, no migration, no DB writes, no finance mutation. Retain all other worktrees/branches and original 50 default. Rollback is application commit revert if ever integrated. Official Test exact-SHA/auth/DB/backup and GitOps must PASS before production.
