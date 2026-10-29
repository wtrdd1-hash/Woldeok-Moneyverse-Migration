# Development C v1164 — verified member chat mute (RELEASE HOLD)

## Start / scope
- Base: `9ebc5613845ba2e8179a0051e86db996593c8a19` (`origin/main`, fetched 2026-10-29 17:52 KST). Independent branch `auto/hourly-c-chat-mute-receipt-v1164-20261029-1745`.
- Inspected AGENTS.md, README.md, README/README.ko.md, both canonical planning documents, active PRs (#1872, #1870, #1869, #1868, #1867, #1857, #1852), QA issues and other A/B/C branches. No active PR owns member chat mute truth.
- Proven P1: `frontend/src/app/chat/actions.ts` returns success on any HTTP 2xx for mute; NestJS `ChatController.muteConversation` can return `{ok:false,muted:<requested>}` and UI optimistically sets state. Repository also defaults a missing function row to true. This can falsely claim private message notification mute is active.
- Design: owner-scoped dedicated read-only chat preferences endpoint, strict mutation receipt validation and owner readback before UI success; no financial/ledger or schema mutation. TDD RED/GREEN, focused frontend and backend contract tests, isolated PostgreSQL, build/lint/typecheck/security/app-api/CI, exact-SHA Test when available. No main edit or deployment without all gates.
- [x] Inspect source/PR/QA, isolate worktree.
- [ ] RED tests.
- [ ] Minimal implementation and GREEN tests.
- [ ] Recheck main/planning, full verification and PR.
- [ ] Final EN/KO results and release gate.

## Midpoint
Pending.

## End
Pending; release blocked until evidence is complete.
