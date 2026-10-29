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

## Finished — 09:37 KST (Draft PR #1807; RELEASE HOLD)
- P0 candidate at `248d2a4779dabde2b6bc72d1daee01a8ffe702cf` before this final log update. Four changed files: workflow, shell gate, five integration tests, and this worklog. No migrations or app/database code touched.
- Isolated temporary PostgreSQL 17.11: init + 290 numbered migrations 002–291 applied successfully; DB tests 46 PASS / 4 SKIP; backend tests 2,542 PASS / 70 SKIP. Temporary container removed. This is not evidence of Production schema parity or official Test acceptance.
- Release Node tests 87 PASS; ESLint targeted PASS; full lint 0 errors / 1,095 warnings; typecheck PASS; frontend/backend build PASS; Android app-api contract 180 endpoints PASS; production dependency audit 0 High/Critical, 1 Moderate; Discord bot 11 PASS after isolated dependency install.
- Full frontend tests **FAIL: 1,906 PASS / 4 FAIL**. All four failures are in blog editorial/publisher tests, unrelated to this workflow guard. Independently reproduced the same four failures on a separate pristine `origin/main` worktree at SHA `2ac90063d45cfab879d4fb36863484d8a423deba`. No unrelated files were modified; this is an upstream baseline blocker, not a candidate regression.
- GitHub candidate workflow #40794077094 SUCCESS but `verify/runtime-check`, image build and production dispatch **SKIPPED** (non-runtime classification); CI #40794773431 SUCCESS with runtime-check SKIPPED. Do not misstate these as full runtime CI or image build PASS.
- Final read-only inventory before this log update: 108 remote branches, 106 open Draft PRs, 106/106 PR head SHA matches remote, zero duplicate heads, 107 non-main branches with unique commits, zero fully contained branches. QA v1361 reported 33 dirty PRs at its own snapshot. No branch deletion or PR closure performed.
- GitHub main rechecked start/mid/pre-integration: `2ac90063d45cfab879d4fb36863484d8a423deba`. This PR stays Draft. The workflow safety fix is **not active on main** until separately reviewed, fully validated, and merged.
- Official Test `/api/version` is `cfb13272beea53c4d8c20eff7f379b6f66343033`; Production reports `unknown`. QA v1361: 18 member account / 18,000 WLD mismatch, 239 app-writable relations, 3 PUBLIC bank EXECUTEs, 5 migration checksum mismatches and 20 unapplied. Independent backup restore and exact-SHA authenticated Test E2E unverified. Test HOLD; Production HOLD; rollback NOT TRIGGERED; no deploy, finance or DB writes.
- Disk usage improved independently of this task: root 59%, data 77%, tmp 28%. No cleanup of co-worker branches/worktrees/backups/volumes. This P0 engineering safety task did **not** deliver the requested new user-facing Full-stack feature; report it as incomplete rather than claiming feature success.
- Preservation decision: delete 0 branches, retain all 107 unique non-main branches; no fully contained branch eligible for safe deletion. Future failures require a separate repair branch and exact-SHA revalidation.
