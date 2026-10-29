# C v1124 — Verified Administrator Money Flow Evidence (canonical)

## Before work
- Base main: a28bed9aa40ff74d492824ae12892a7d52132fdd (fetched 2026-10-28 14:42 KST).
- Isolated branch: auto/hourly-c-money-flow-evidence-v1124-20261028-1445.
- Reviewed AGENTS.md, README.md, README/README.ko.md, docs/planning/PROJECT_PLAN.md and .ko.md, active PRs #1691/#1697/#1695, QA #1687, and latest A/B work.
- Confirmed Debian 13.6, seven services active, PostgreSQL connected. Production database must not be modified.
- Correction after inspecting **fetched origin/main worktree** (not the stale integration checkout): those false statistics and rounding problems were already fixed. The remaining P1 is that frontend `validateMoneyFlowResponse()` treats the backend `mf1.<base64url>` keyset cursor as an ISO timestamp. Thus real 50+ posting pages fail closed and no next-page link is available. The NestJS cursor contract is in `backend/src/admin/treasury/treasury-moneyflow-cursor.ts`.
- Scope: one P1 read-only frontend/backend contract integration; no new DB writes or migrations.

## Plan / TDD
1. RED: test real backend `mf1` cursor and SSR next-page link, malformed/legacy cursors, admin gate.
2. GREEN: accept bounded versioned opaque keyset cursor while keeping backend-owned fingerprint and posting checks; preserve existing financial evidence guards and exact WLD rendering.
3. Run focused, full and isolated PostgreSQL gates on exact SHA; re-fetch main before merge; hold PR if any required gate fails.

## In progress
- TDD RED reproduced: 3 failures / 5 passes on the real `mf1` cursor and server-side next-page link; existing main already has financial evidence and WLD formatting.
- Minimal contract fix in `money-flow-data.ts`: bounded `mf1` base64url envelope; server retains authoritative cursor content validation.

## Finished
- Pending exact-SHA verification and release decision.
