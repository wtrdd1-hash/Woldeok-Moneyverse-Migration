# Event Calendar re-home worklog — v2026.09.12.35

## Goal
Re-home the still-valid Event Calendar runtime slice onto current `main` while preserving concurrent authentication, app-API, mobile UI/UX, and planning work.

## Selection rationale
The Living Project Plan lists Economy/event calendar as a P1 data/community integration gap. The original PR #162 was useful but stale and behind current `main`, so replaying its full branch history was avoided.

## Base and branch
- Base main: `a89e97b818fe4e12060aef9855b8a6df52721756`
- Original feature PR: `#162`
- Integration branch: `integrate/event-calendar-v2026.09.12.35`

## Runtime changes
- Restored `frontend/src/app/calendar/page.tsx` on current main.
- Uses existing `/api/v1/seasons/events`, `/api/v1/early-game/today`, and `/api/v1/engagement/early-game` reads; no duplicate backend state or mutation path was added.
- Added member navigation entries for `/calendar` in full and grouped navigation.
- Page remains authenticated, dynamic, and `noindex`.

## Data and safety
- No database migration.
- No reward, ledger, balance, or event mutation.
- Existing backend APIs remain authoritative.
- Failure states use existing null-safe UI behavior instead of fabricating schedule data.

## Validation state
- GitHub CI must pass for the exact candidate SHA.
- Isolated Test must serve the exact candidate SHA and pass authenticated route/API smoke checks before any merge or Production promotion.
- Production has not been changed by this work.

## Branch audit note
Economy Scenario Lab replacement PR #189 has a successful CI run but remains separately gated by latest-main reconciliation and exact-SHA Test verification. Stale original runtime branches remain cleanup candidates only after their replacement work is safely preserved.

## Next priority
After this re-home: Business Settlement Boost runtime fix, Trusted Client IP hardening, and Admin edit-state refresh, then remaining P1/P2 gaps such as Stock-tagged Community, Stock Comparison, Conditional Alerts, Account Security Center, Personal Dashboard, and Portfolio Analysis.