# Development C v1242 — Conditional stock-alert source evidence

## BEFORE WORK — 2026-11-01 01:40 KST
- Host: Debian 13.6 miniPC; backend/frontend/bot/MCP/desktop/Nginx/Docker active; development PostgreSQL connected.
- Canonical base: `f13bbce273ffc65e8576170992d82ea00c27a1c9`, fetched from `origin/main`. Existing main worktree has unrelated modified `implementation_plan.md`; untouched.
- Isolated branch: `auto/hourly-c-stock-alert-evidence-v1242-20261101-0140`; own worktree.
- Reviewed AGENTS.md, README.md, README/README.ko.md, canonical English and Korean living plans, open PRs, A #2229, B #2232, QA #2235, C #2234, and recent CI.
- **Verified gap:** member `/stocks/alerts` trusts three runtime-unknown API bodies as arrays. A successful 200 with missing/invalid `stocks`, `alerts` or `events` can crash rendering or show unverified trigger/price/condition data. Existing `apiOrNull` only distinguishes thrown transport errors.
- Scope: add fail-closed runtime evidence validation for the existing authenticated market/alert/event APIs, accessible retry/error state, regression tests. No new endpoints, DB grants, migrations, ledger writes, or synthetic alerts. Separate from C watchlist/season and A inventory/B settlement/QA transport work.
- [x] Source gap and dependencies checked.
- [ ] RED test; [ ] implementation; [ ] GREEN tests; [ ] final exact-SHA verification; [ ] remote Draft PR; [ ] official Test/Production gates.

## IN PROGRESS
- Plan: `docs/superpowers/plans/2026-11-01-c-v1242-stock-alert-evidence.md`.
- Release remains HOLD unless all required gates PASS. Never promote an unverified SHA.

## FINISHED
- Pending exact-SHA evidence, CI, main recheck, Test/Production/rollback status.

### MIDPOINT — 2026-11-01 01:41 KST
- RED reproduced: 2 positive evidence assertions failed (6 negative controls passed).
- GREEN: 8 parser cases PASS, 3 server-rendered member-page cases PASS; frontend TypeScript typecheck PASS.
- Verified owner-scoped existing Nest GET `/stocks/alerts` and `/stocks/alerts/events` use `stock_alert_rules_list(actor)` and `stock_alert_events_list(actor,limit)` SQL functions. No new backend route or DB grant is necessary.
- Re-fetched `origin/main` at midpoint; record SHA from gate output. Existing A/B/QA and other C worktrees remain untouched.
- The page refuses malformed successful 200 payloads and exposes a keyboard-accessible retry. No success-shaped fallback or price coercion.
