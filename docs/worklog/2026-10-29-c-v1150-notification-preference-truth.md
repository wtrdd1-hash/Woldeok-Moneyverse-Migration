# C v1150 — Member notification preference persistence evidence

## BEFORE WORK — 2026-10-29 09:50 KST
- Base: `2ac90063d45cfab879d4fb36863484d8a423deba` from freshly fetched `origin/main`; independent `auto/hourly-c-notification-preference-truth-v1150-20261029-0945` worktree.
- MiniPC Debian 13.6 reachable; seven services active, development database connected. Read AGENTS.md, README, README/README.ko.md, both living plans, QA v1361 and open PR/A/B/C inventory. Existing A notification inbox PR #1698 is separate; C credential PRs #1793/#1805 are separate.
- P1 evidence: member `saveGoalNotifications` currently ignores the actual `notifications_enabled` PUT receipt and never verifies persisted `GET /api/v1/engagement` state. A 2xx contradictory response could display `saved=1` although the preference did not change. Existing page also treats malformed preference evidence as OFF.
- Scope: fail-closed exact boolean mutation receipt and authoritative readback, distinguish unavailable/malformed state in UI, regression tests. Preserve existing PostgreSQL SECURITY DEFINER preference function, no migration/grants/ledger changes. Accessible responsive form and noindex retained.
- HOLD: QA v1361 reports 5 migration checksum mismatches and 20 unapplied migrations; prior QA reports 18,000 WLD projection drift, app-role grants and backup restore gaps. Official exact-SHA Test/Production release forbidden until all gates pass.

## PLAN / IN PROGRESS
- [ ] RED test malformed/contradictory mutation receipt, stale readback and unavailable UI evidence.
- [ ] GREEN implement strict receipt and readback validation, and visible failure/unknown states.
- [ ] Run focused/full tests, build, typecheck, lint, security, isolated PostgreSQL, app-api, CI and official Test when safe.
- [ ] Re-fetch main and plan, record final SHA, PR, deployment hold and preservation.

## FINISHED
Pending evidence; no merge or deployment authorized.
