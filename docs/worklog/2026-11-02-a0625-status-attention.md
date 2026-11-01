# Development A — Status attention-only filter (2026-11-02 06:25 KST)

## Before work
- Source: fresh `origin/main` at task start, independent `auto/hourly-a-20261102-0625-status-attention` worktree.
- Goal: P1 public status attention-only view on web and Android, backed by the existing read-only `content_public_status()` PostgreSQL function. Do not add migration or grant any table privilege.
- Plan: RED tests for strict query validation, fail-closed status filtering and stale Android responses; GREEN Nest service/controller + Next status page + Android gateway; regression checks; compare main again; PR Draft/HOLD unless all release gates pass.
- Scope: no financial writes, auth changes, production changes, or other agents' branches.

## In progress
- Source and implementation under review; tests pending.

## Finished
- Pending final evidence, SHA, gate status, branch/PR audit, Test/Production and rollback.
