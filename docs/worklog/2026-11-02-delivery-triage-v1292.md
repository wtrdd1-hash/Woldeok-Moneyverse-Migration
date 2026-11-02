# v1292 — Admin Discord Delivery Triage (P1, HOLD)

## Before work — 2026-11-02 10:44 KST
- Baseline: `a8541927c3a351d980454c66e95a3356c47e0722` (`origin/main`). Separate worktree; base checkout has unrelated uncommitted `implementation_plan.md` and must remain untouched.
- Verified seven miniPC services active and PostgreSQL connected. QA v1460 route ledger and production-mode backend checks fail. Existing Draft PRs for bot authentication #2449 and notifications #2431 are separate; this change touches only the admin Discord delivery read view.
- Confirmed `GET /api/v1/admin/discord-outbox-events` is guarded by `AdminSessionGuard` and reads `admin_recent_discord_outbox_events(actor, limit)`; existing parser verifies at most 30 recent records. UI cannot narrow the 30-row sample to outstanding/failed/retried deliveries, so operators must manually scan the table.
- Scope: read-only status and event-type triage of the **verified recent 30 rows only**, shareable GET filters, accurate matched count, keyboard/screen-reader accessible controls and reset. Do not claim whole-history delivery statistics, create writes, alter bot secrets, database privileges, or financial ledger.
- Plan: RED tests for filter parser/semantics and SSR; GREEN implementation; full gates and real PostgreSQL read-model proof; remote CI; PR in DRAFT until every gate passes. No Production promotion without exact-SHA Test and GitOps approval.

## In progress
- [x] RED regression reproduced (focused test fails before implementation).
- [ ] Verified filter implemented and tested.
- [ ] Mid-run main/plan fetch and source overlap checked.
- [ ] Full exact-SHA gates and isolated DB checks recorded.

## Finished
- Pending verification. Merge/production forbidden until all gates pass.
