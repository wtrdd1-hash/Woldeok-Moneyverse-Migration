# Backend B v720 — Attendance settlement integrity hold

## Before work
- Main: f13bbce273ffc65e8576170992d82ea00c27a1c9 (recheck before merge).
- P0: Attendance status and spin advertise an unverified WLD reward. Repository writes attendance directly before posting a separate ledger transaction, without a single atomic DB-owned settlement; absent DB returns a fabricated success.
- This change must never mutate Production/Test data or claim the reward system is complete.

## Plan
1. Add RED tests for authenticated fail-closed status and spin, including no database writes.
2. Replace unverified attendance status and settlement paths with 503, preserving session/consent/CSRF guards.
3. Verify focused tests, typecheck, lint, build, independent DB and remote CI where available.
4. Coordinate frontend and Android failure states with developer C; keep Draft/HOLD until exact-SHA official Test and all release gates pass.

## In progress
- Isolated branch created; source inspection and regression design underway.

## Finished
- Pending.
