# A 2026-11-03 — Minimum replies in recent public board (DRAFT / HOLD)

## Before work
- Source: origin/main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`; new isolated `auto/hourly-a-20261103-0355-board-replies` worktree. Start: 2026-11-03 03:55 KST.
- Read AGENTS.md, README.md, English canonical and Korean project plans, release guide, recent A QA and open B/C/A PRs. No existing open A PR offers an explicit minimum-reply threshold; the separate most-discussed ordering PR is not this feature.
- P1 scope: optional `minReplies=1|5|10` on the **latest 50 public board posts**. Combine with existing title/stock filters, never imply archive-wide search. PostgreSQL read function remains authoritative, no table access grant or migration. Android rejects an ignored threshold in successful upstream payloads. No money or authenticated data changes.
- Host health: Debian 13.6 services up; disk near 100% (~793 MiB free). Avoid full clone/build or touching other agents' evidence. Any gate without actual proof remains BLOCKED.
- Plan: tests first (Nest controller + SQL query, Next query parser + accessible form, Android request validation and upstream proof); implement minimal read-only path; rerun exact-SHA checks; update QA/release/worklog and open Draft HOLD PR only if verifiable.

## In progress
- TDD RED confirmed: 3 new backend assertions failed, 22 existing passed; no source changes yet. Rechecked origin/main and both plans before implementation.

## Finished
- Pending. Production and official Test unchanged; rollback is omit the optional parameter / revert branch. No cleanup of unique branches.
