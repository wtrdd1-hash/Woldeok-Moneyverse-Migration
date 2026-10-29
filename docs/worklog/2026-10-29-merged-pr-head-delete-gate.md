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

## In progress — 09:26–09:29 KST
- TDD RED observed: five tests fail with missing guard/workflow; then GREEN: five tests pass. Temp bare Git remote covers exact ancestor, squash merge, moved head, stale main, invalid ref, and verifies no branch mutation.
- Added `scripts/release/verify-merged-pr-head.sh` (fail-closed exact SHA/branch/main checks, fresh Git fetch, ancestry proof), test in `scripts/release/tests/`, and workflow gate before any destructive push.
- Broader release Node suite: 87 PASS / 0 FAIL. Shell syntax, Node syntax, diff whitespace PASS. Applied migrations unchanged; no live DB changes.
- Branch update may require GitHub connector because the miniPC GitHub OAuth token lacks `workflow` scope; keep workflow update isolated and verify remote SHA before PR.
