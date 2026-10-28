# Backend B v624 — Restore Unmerged Venture Finance Truth Boundary (DRAFT / HOLD)

## Before work — 2026-10-29 05:31 KST
- `origin/main=35971c600f25869c96f1c666d4b9f58927202730` confirmed by ls-remote and fetch. New isolated branch `auto/hourly-b-venture-evidence-recovery-v624-20261029-0535`.
- Debian 13.6 miniPC status, shell and file-read tools invoked; file-read returned empty, so source inspected with shell. Disk: data 99%, /tmp 97%. No runtime or DB mutation.
- Read AGENTS.md, README, EN/KO PROJECT_PLAN, QA v1357, open PRs and CI; checked A/C/QA overlaps.
- Root cause: `VenturesController` reports three fabricated funding pitches and a fake member-specific portfolio with 2,500,000 WLD invested and 48,500 WLD claimable. Frontend calls a 60,000,000 WLD hardcoded sample `real-time ledger`.
- Closed, unmerged PR #1374 had the relevant unique fix; this task restores that protection to current main with additional HTTP evidence rather than treating the old closed PR as merged.
- No current open venture PR; existing write endpoints already return 503. No financial settlement or owner-scoped venture persistence exists.

## In progress
- [x] RED: two real NestJS HTTP requests returned 200 instead of required 503; frontend badge still called hardcoded WLD a live ledger. Evidence: `v624-logs/red-backend.log`, `red-frontend.log`.
- [x] GREEN: restored closed PR #1374 Backend fail-closed 503/no-store, contract expectations and frontend preview truth. Added real HTTP tests and extended misleading dividend-label test (additional RED then GREEN). Backend focused 7/7, frontend 5/5 PASS.
- [ ] Full gates, CI, final main sync, and release hold.

## Finished
- Pending. Production promotion forbidden until all required gates pass.
