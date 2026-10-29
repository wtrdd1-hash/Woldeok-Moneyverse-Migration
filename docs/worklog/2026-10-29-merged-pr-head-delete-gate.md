# 2026-10-29 — P0 merged PR head deletion gate (A 09:25)

## Before work — 09:25 KST
- MiniPC Debian 13.6; backend/frontend/bot/MCP/nginx/docker active, dev PostgreSQL connected.
- Starting main: `2ac90063d45cfab879d4fb36863484d8a423deba`; branch `auto/hourly-a-merged-head-gate-20261029-0925` in isolated worktree.
- GitHub initial inventory: 105 open PRs, 107 remote branches. QA v1361 restored 104/104 at-risk heads; five migration checksum mismatches, 20 unapplied; finance/privilege/release gates remain blocked.
- Existing `cleanup-merged-branches.yml` first job deletes a merged PR's head without checking whether its exact SHA is an ancestor of main. A squash/stack merge can preserve patch content but lose exact head ancestry; deletion would discard the only live ref to that head. The second job already checks ancestry and exact merged PR evidence.
- Scope: add a fail-closed exact-head ancestry verifier and tests, wire the first deletion job. No user balance, DB, service, Test, Production, or other developer branch changes.
- [ ] TDD RED reproduction; [ ] guard implementation; [ ] workflow integration; [ ] targeted regression; [ ] broader release tests; [ ] GitHub PR; [ ] final exact-main and CI check.

## In progress
Pending.

## Finished
Pending validation; no release authorization.
