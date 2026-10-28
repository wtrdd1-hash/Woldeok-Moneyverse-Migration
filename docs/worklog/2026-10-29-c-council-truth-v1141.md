# Development C v1141 — Verified council debate provenance (HOLD)

## BEFORE — 2026-10-29 02:46 KST
- MiniPC Debian 13.6 and seven system services active; development PostgreSQL reachable. Root 96%, data disk 98%; no shared disk cleanup or live DB writes.
- Baseline origin/main: `35971c600f25869c96f1c666d4b9f58927202730`. Read AGENTS, README English/Korean, English canonical and Korean living/integrated plans, latest QA1354, A/B/QA and all open PR titles; no open council-debate PR.
- Existing `/api/v1/admin/economy/council-debate` synthesizes a timestamped `prop_live_*` proposal with fixed rates and fixed `faucet_ratio=1.0`, `sink_burn=0.95`; it runs a deterministic debate on these invented inputs. Admin card independently renders 14 affirmative votes and 89% confidence if API fails. This is a source-level unverified decision display, not proof of financial loss.
- Isolated branch/worktree: `auto/hourly-c-council-truth-v1141-20261029-0245` at `/home/debian/mv-c-council-truth-v1141-20261029-0245`. Protect all A/B/Gemini/QA branches and environments.

## DESIGN / IN PROGRESS
- P1 containment: authenticated backend endpoint must return 503 `COUNCIL_DEBATE_UNVERIFIED` without querying DB or constructing fake proposal; leave existing guards intact. Future evidence-backed council evaluation requires separate reviewed implementation.
- UI must render an accessible unavailable state, never fabricated votes, consensus, risk, or recommendation when the API has no verified evidence. Preserve responsive layout and admin noindex.
- TDD: RED controller test and client component test; GREEN minimal code; focused/full test, lint, typecheck, build, API contract, security audit, isolated PG and exact-SHA CI if safe.
- Deployment gates: no merge, official Test or Production until every required check including exact-SHA authenticated Test and outstanding P0 release blockers passes. No shared/production DB changes.

## MID — 2026-10-29 02:48 KST
- TDD RED backend: 1 failed/1 passed because existing controller did not return evidence-specific 503; frontend: 1 failed because no accessible unavailable state and synthetic votes were displayed. Direct Vitest without `NODE_ENV=test` initially hit the React test-mode harness; reran in correct test mode to confirm behavioral RED.
- TDD GREEN: backend 2/2 PASS, frontend 1/1 PASS. Backend now fails closed with HTTP 503 `COUNCIL_DEBATE_UNVERIFIED` before any repository access; admin guards unchanged. Frontend removes the 14-agent unanimous fallback and shows responsive `role=status` with no decision claim.
- Midpoint `git fetch origin main`: `35971c600f25869c96f1c666d4b9f58927202730`, unchanged. No overlapping council PR; no DB writes or release changes.
- Next: exact-HEAD full gates, isolated DB only if safe, CI, and final main recheck.

## AFTER
- Pending exact-SHA validation, CI, Test/Production disposition and cleanup rationale.
