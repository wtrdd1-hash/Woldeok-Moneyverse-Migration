# B v504 — Bounded external AI model responses (P1 / release HOLD)

## Before work
- 2026-10-24 12:05 KST: miniPC status/shell/file MCP invoked. Debian 13.6 and services active; file MCP returned empty object; read canonical files via shell.
- Start origin/main: `49788d09494fed3e463651945b83386e87dd47bc`. Independent branch `auto/hourly-b-ai-response-bounds-v504-20261024-1205` and worktree `/home/debian/worktrees/mv-b-v504-20261024-1205`.
- Read AGENTS.md, README.md, EN/KO project plan, QA #1114, active A/C/B PRs and CI. No overlap with P2P #1117, wallet A #1115, search C #1116, QA #1114.
- P1 issue #1073: backend Zod is already patched to 4.6.7 on main, but external AI model JSON response has unbounded `response.text()`, unbounded scenarios/choices/model collections. Fix remaining input-size/cardinality limits without changing financial authority, DB, frontend or migrations.
- Release HOLD: main still has QA test/security failures; official Test exact-SHA, shared Production/dev DB and port 5433 are not safe for mutation.

## In progress
- [ ] Write regression tests for oversize model payload and scenario collection (RED).
- [ ] Implement bounded streaming response and Zod collection cardinality (GREEN).
- [ ] Run focused + full gates, review latest main and planning, push Draft PR.

## Finished
- Pending. No merge or deployment authorized.

### Mid-task checkpoint (2026-10-24 12:04 KST)
- RED: three focused regressions failed on main behavior (oversized JSON body, 21 scenario proposals, 1,001 model entries). Evidence: internal `red.log`.
- GREEN: same three focused regressions passed after bounding response bytes (256 KiB streaming, abort on overflow), scenarios (20), completion choices (4), content segments (32), model IDs (1,000). Evidence: internal `green.log`.
- No DB/API route/financial ledger changes; upstream AI response contract rejects oversized data with existing `ai_news_model_unusable` code.
- Worktree dependency install used `pnpm install --offline --frozen-lockfile --ignore-scripts`; no Production/dev database changes.
