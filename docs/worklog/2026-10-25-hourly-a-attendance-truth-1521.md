# Development A — Verified attendance status and unsafe reward hold (2026-10-25)

## Before work — 15:21 KST
- Debian 13.6 miniPC reachable; Backend/Frontend/Nginx/Docker active; root 92% used, data 55% used.
- Source `origin/main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; independent `auto/hourly-a-attendance-truth-20261025-1521` worktree.
- Read AGENTS.md, README.md, canonical English/Korean project plans and integrated master; inspected open PRs/CI. Other A/B/C/Gemini branches remain untouched.
- P0: `/tools` displays client-only fabricated attendance streak and 1M–100M WLD rewards; `POST /engagement/dopamine/attendance/spin` can insert attendance before ledger posting and has a fake success fallback when repository is unavailable. Financial settlement cannot be asserted without atomic DB receipt.
- Scope: authoritative read-only attendance status via existing PostgreSQL path, explicit unavailable/guest states, disable unsafe claim in backend and web gateway, Android app-api propagation, regression tests. No schema change, no Production DB write.
- TDD: write failing tests first, then implement; verify focused/full gates, record exact SHA and blockers. Do not merge or deploy without all gates.

## In progress
- [ ] RED regression tests
- [ ] Backend/API/frontend/app-api changes
- [ ] Isolated real-PostgreSQL read/ACL test
- [ ] Build, typecheck, lint, unit/integration, accessibility, SEO, security, CI

## Finished
- Pending evidence. Production release hold.

### RED checkpoint — 15:24 KST
- Backend new tests: 3 failed / 1 passed; Frontend new tests: 7 failed / 1 passed, demonstrating fabricated status/claim and UI assertions.
- Midpoint main re-fetched; plan EN/KO rechecked. Implementation follows in same isolated worktree.
