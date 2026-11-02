# 2026-11-03 A — Localized route recovery (P0, DRAFT/HOLD)

## Authority and isolation
- Started 2026-11-03 00:34 KST. `origin/main` = `9cade11af53db9f27c2b9f0ea9d39005ea8d0387`; isolated `auto/hourly-a-20261103-0025-localized-tools` worktree.
- Start remote branches: 295 (excluding local branch); open PRs: 268; conflicting PRs: 29. Preserve all unintegrated branches.
- Read `AGENTS.md`, `README.md`, English/Korean living plans, existing QA/issue #2534 and PR inventory. Existing collaborators own backend/DB/app integration and support workflows; do not touch those areas.
- P0 user-visible outage takes precedence over adding another low-value P1 filter: 2026-11-03 live read-only HTTP probes return 200 `/tools`, 500 `/en/tools`, `/ja/tools`, `/zh/tools`, `/en/stocks`, `/en/roadmap`; physical `/en/blog` and `/en/guide/glossary` return 200. Affected rewrites emit `x-middleware-rewrite: https://localhost:4205/tools?__mv_path_locale=en` while the Next listener is HTTP on 127.0.0.1:4205. Root-cause hypothesis: proxy uses HTTPS forwarded public scheme for loopback internal rewrite, causing Next to attempt TLS on its HTTP listener.

## Plan and checkpoint ledger
- [x] Inspect main, repo policy, existing PRs, live symptom and loopback listener.
- [ ] RED: add executable proxy tests for HTTPS forwarded loopback, locale and query preservation, public HTTPS behavior, physical routes.
- [ ] GREEN: make the minimal loopback-only rewrite correction; avoid insecure rewrites to public hosts.
- [ ] Run focused tests, frontend lint/typecheck/build, full test and CI; inspect exact SHA and PostgreSQL read-only gates.
- [ ] Re-fetch main and re-read integrated plan before PR; do not merge or deploy without official Test exact-SHA, restore and GitOps gates.
- [ ] Publish English/Korean QA, release HOLD, worklog and PR with exact test/CI evidence.

## Safety
No DB migration, financial ledger, app-role grant, Production/Test mutation, service restart or deletion is authorized by this task. Keep other PRs and worktrees intact. Any unresolved full gate is HOLD.
