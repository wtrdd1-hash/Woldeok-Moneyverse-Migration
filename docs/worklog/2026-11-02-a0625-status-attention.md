# Development A — Status source-specific drill-down (2026-11-02 06:25 KST)

## Before work
- Source: fresh `origin/main` at task start, independent `auto/hourly-a-20261102-0625-status-attention` worktree.
- Goal: P1 public status source-specific drill-down on web and Android, backed by the existing read-only `content_public_status()` PostgreSQL function. Do not add migration or grant any table privilege.
- Plan: RED tests for strict sourceKey query validation, fail-closed source filtering and stale Android responses; GREEN Nest service/controller + Next status page + Android gateway; regression checks; compare main again; PR Draft/HOLD unless all release gates pass.
- Scope: no financial writes, auth changes, production changes, or other agents' branches.

## In progress
- Previous attention-only feature already exists as PR #2264; discarded duplicate uncommitted changes. Distinct source-specific drill-down implemented from current main.
- RED evidence: backend and frontend targeted tests failed before implementation; GREEN backend 10 PASS, frontend 13 PASS (including prior freshness regressions).
- Backend returns sourceKey proof (null for unfiltered), validates exact canonical key; read-only `content_public_status()` output filtered after normalization. Android rejects ignored/legacy HTTP 200 including empty responses. Web retains full overall headline and links to per-source detail.
- DEV PostgreSQL 17.11 `moneyverse_app` READ ONLY: 3 public sources (`api`, `database`, `web`), function EXECUTE=true, ROLLBACK. Existing P0 app-role `account_balances` UPDATE and `user_items` DELETE remain true; no production ACL inference.
- English/Korean integrated plans rechecked against unchanged origin/main; mobile contract regenerated (184 endpoints). Full gates pending.

## Finished
- Pending final evidence, SHA, gate status, branch/PR audit, Test/Production and rollback.
