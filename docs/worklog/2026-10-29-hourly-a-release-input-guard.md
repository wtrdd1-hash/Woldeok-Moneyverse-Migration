# 2026-10-29 Hourly A — Release-input executable document guard

## BEFORE — 22:48 KST
- MiniPC Debian 13.6, backend/frontend/bot/MCP/nginx/Docker active; DEV PostgreSQL connected. No Production mutation authorized.
- Start main `54b182d2214a15974350701174175f589789613b`; branch `auto/hourly-a-release-input-20261029-2248` in isolated worktree. Original main checkout has unrelated local edits, untouched.
- Read AGENTS.md, README.md, English/Korean project and integrated plans, release classifier/workflow, latest QA v1374 Draft PR #1902, all eight open PR heads, CI failures for #1904. No open PR modifies release classifier.
- Incident #1663 requires preserving all unique branch heads. GitHub cleanup workflows are read-only; no deletion authorized.
- P0 root cause: `classifyPaths()` labels any `docs/` path `DOCS_ONLY` without inspecting file type or Git tree mode. A tracked executable/symlink under docs can bypass runtime candidate classification, violating fail-closed release truth.
- Scope: classifier and regression tests only. No ledger, auth, migrations, Production, Test or feature switches changed. This is P0 release safety, not a new end-user feature.

## IN PROGRESS
- [x] Reproduce false-green classification with synthetic executable/symlink docs changes (RED): 18 PASS / 3 expected FAIL.
- [x] Fail closed for executable-like documentation paths and non-regular/non-0644 documentation tree modes, preserving safe Markdown/images (GREEN): classifier 21 PASS.
- [x] Verify deletes, mixed runtime paths and immutable evidence behavior: release regression 93 PASS, security 17 PASS; rename semantics use `--no-renames` to inspect both paths.
- [x] Re-fetch latest main/plans and review concurrent PRs before PR: main unchanged; no classifier PR collision.
- [x] Run local tests and capture CI/Test release blockers; exact-SHA GitHub CI to be reviewed after final push.

## MID-RUN — 22:5x KST
- Exact main rechecked: `54b182d2214a15974350701174175f589789613b` unchanged. Open Draft PRs: 8; no release classifier overlap; 2 PRs conflicting.
- Root cause confirmed by RED test, then GREEN. Raw NUL-delimited Git diff prevents filename-newline parsing ambiguity. Git mode check includes both revisions to catch deleted symlinks.
- Targeted ESLint with `--no-ignore` initially found `no-control-regex`; changed implementation to character-code check rather than suppressing the lint gate.
- Existing root node_modules is linked read-only for tests; worktree source changes remain isolated.

## FINISHED — 23:02 KST (candidate only)
- P0 code guard: `scripts/release/classify-release.mjs` now uses NUL-delimited diff paths and fail-closed documentation file-type/mode checks on both revisions. New tests reproduce the original 3 false-green cases (RED), then pass; 94/94 release tests PASS, 17/17 security tests PASS, changed-file ESLint with `--no-ignore` PASS, TypeScript typecheck PASS, backend build PASS, frontend build PASS with 1536 MiB Node heap (initial 1024 MiB attempt OOM).
- Full `pnpm lint`: FAIL — 3 pre-existing `no-empty` errors in `frontend/src/components/stale-tab-notice.tsx` (QA PR #1894). Full `pnpm test`: FAIL at generated Android/mobile API contract drift (three docs files; generator output restored). Backend tests 2350 PASS / 240 FAIL / 493 SKIP; frontend test command timed out after 110 seconds with observed failures; database tests 56 PASS / 4 SKIP (no live DB). Initial typecheck missing `undici` was a reused-dependency artifact; fresh offline frozen install corrected it.
- No real-PostgreSQL schema changes or Test E2E; exact-SHA Test/auth/finance/DB evidence remains BLOCKED. This change only affects release classification; no runtime feature implemented. No Production promotion, DB mutation, PR closure, branch deletion or rollback.
- Branch audit after new branch: 14 remote branches including main; 13 non-main; 10 have commits not in main, 3 ancestor; 8 open Draft PRs, 2 conflicting; 0 PR SHA mismatches, 0 duplicated PR head SHA. Main still `54b182d2214a15974350701174175f589789613b`.
- Official Test and Production version APIs both return `c2129625aa6629c616fb31ce790950618b8d92b2`, different from candidate; this is not exact-SHA acceptance.
- Rollback: revert the classifier/test commit after review if needed; no database migration or stateful rollback. Candidate stays Draft/HOLD until full gates pass.
