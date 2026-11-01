# Development C v1259 — Pension source integrity (DRAFT / RELEASE HOLD)

## Before work — 2026-11-01 12:48 KST
- Debian 13.6 miniPC MCP: seven services active, development PostgreSQL connected. Origin/main `f13bbce273ffc65e8576170992d82ea00c27a1c9` fetched; unrelated main checkout `implementation_plan.md` is modified and MUST remain untouched.
- Read AGENTS, README, Korean README, English canonical and Korean project plans; reviewed open PRs through #2313, A/B/QA v1436, CI and prior C work. No open pension-source PR. Separate new worktree based on origin/main.
- P1 observed: `/pension` trusts public overview and member receipt/account JSON without runtime validation; both owner receipt API failures are converted to `[]` and displayed as 'no records'. The backend already provides authenticated owner-scoped receipt functions and settlement hold. Public pension overview already fails closed at the Nest repository, but the frontend boundary does not.
- Bounded design approved by existing automation mandate: validate public and member read payloads; distinguish verified empty from unavailable; preserve owner-only Nest API, zero new DB or financial writes, responsive/accessible retry, no new public indexed member data. Keep the legacy settlement hold.
- Other PRs, branches, and release environments protected. No main edits, merge, or production change before all gates PASS.

## In progress
- [ ] RED tests reproduce malformed payload and false-empty error handling.
- [ ] GREEN runtime guards and explicit error states; verify backend contracts unchanged.
- [ ] Re-fetch main and plan; record final SHA and tests.

## Finished
- Pending. Release HOLD until every required gate and official exact-SHA Test passes.
