# 2026-10-29 Hourly A — Release-input executable document guard

## BEFORE — 22:48 KST
- MiniPC Debian 13.6, backend/frontend/bot/MCP/nginx/Docker active; DEV PostgreSQL connected. No Production mutation authorized.
- Start main `54b182d2214a15974350701174175f589789613b`; branch `auto/hourly-a-release-input-20261029-2248` in isolated worktree. Original main checkout has unrelated local edits, untouched.
- Read AGENTS.md, README.md, English/Korean project and integrated plans, release classifier/workflow, latest QA v1374 Draft PR #1902, all eight open PR heads, CI failures for #1904. No open PR modifies release classifier.
- Incident #1663 requires preserving all unique branch heads. GitHub cleanup workflows are read-only; no deletion authorized.
- P0 root cause: `classifyPaths()` labels any `docs/` path `DOCS_ONLY` without inspecting file type or Git tree mode. A tracked executable/symlink under docs can bypass runtime candidate classification, violating fail-closed release truth.
- Scope: classifier and regression tests only. No ledger, auth, migrations, Production, Test or feature switches changed. This is P0 release safety, not a new end-user feature.

## IN PROGRESS
- [ ] Reproduce false-green classification with synthetic executable/symlink docs changes (RED).
- [ ] Fail closed for executable-like documentation paths and non-regular/non-0644 documentation tree modes, preserving safe Markdown/images (GREEN).
- [ ] Verify deletes, renames, mixed runtime paths and immutable evidence behavior.
- [ ] Re-fetch latest main/plans and review concurrent PRs before PR.
- [ ] Run local tests, lint, CI and isolated Test release gate as applicable.

## FINISHED
- Pending validation. Release HOLD until all mandatory gates and exact-SHA Test evidence pass.
