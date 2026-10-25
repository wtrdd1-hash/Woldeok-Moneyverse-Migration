# A0325 — Verified member stock watchlist CSV export

## Before work (2026-10-26 03:28 KST)
- Main baseline: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; 214 remote branches and 210 open PRs (concurrent counts).
- Debian 13.6 online; backend/frontend/bot/nginx/docker active; root filesystem 99% (1.6 GiB available), data volume 69%.
- Read AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md and .ko.md, integrated planning, open PR inventory, latest CI and previous A QA. Watchlist export is absent from main and no matching open PR was found; stock watchlist persistence work in C #1308 is unmerged and preserved.
- Scope: add authenticated owner-only bounded JSON snapshot API using existing PostgreSQL `stock_my_watchlist`, private CSV web route and keyboard-accessible watchlist link; Android app-api passthrough tests. No new migrations or financial writes.
- Release gate: previous frontend 6 failures, dependency audit vulnerabilities, exact-SHA official Test and isolated authenticated E2E unverified. No merge or Production promotion without all gates.
- [x] Baseline and overlap audit. [ ] RED tests. [ ] GREEN implementation. [ ] Focused validation. [ ] Full gates and isolated DB. [ ] Final QA/release evidence.

## In progress
- Created independent worktree from origin/main. Do not touch Gemini/B/C/QA branches.

- RED tests added for owner scoping, overflow rejection, CSV injection/precision, auth failures and Android cookie passthrough.
- 03:32 KST: RED reproduced (2 backend missing endpoint, frontend missing route). GREEN focused backend 2/2 and frontend/Android 14/14 after correcting the BOM test to inspect raw bytes; source endpoint guards and export shape verified.
- Midpoint main re-fetched: unchanged `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; integrated plan rechecked; C #1308 watchlist persistence is not merged and was not touched.
