# v1292 — Admin Discord Delivery Triage (P1, HOLD)

## Before work — 2026-11-02 10:44 KST
- Baseline: `a8541927c3a351d980454c66e95a3356c47e0722` (`origin/main`). Separate worktree; base checkout has unrelated uncommitted `implementation_plan.md` and must remain untouched.
- Verified seven miniPC services active and PostgreSQL connected. QA v1460 route ledger and production-mode backend checks fail. Existing Draft PRs for bot authentication #2449 and notifications #2431 are separate; this change touches only the admin Discord delivery read view.
- Confirmed `GET /api/v1/admin/discord-outbox-events` is guarded by `AdminSessionGuard` and reads `admin_recent_discord_outbox_events(actor, limit)`; existing parser verifies at most 30 recent records. UI cannot narrow the 30-row sample to outstanding/failed/retried deliveries, so operators must manually scan the table.
- Scope: read-only status and event-type triage of the **verified recent 30 rows only**, shareable GET filters, accurate matched count, keyboard/screen-reader accessible controls and reset. Do not claim whole-history delivery statistics, create writes, alter bot secrets, database privileges, or financial ledger.
- Plan: RED tests for filter parser/semantics and SSR; GREEN implementation; full gates and real PostgreSQL read-model proof; remote CI; PR in DRAFT until every gate passes. No Production promotion without exact-SHA Test and GitOps approval.

## In progress
- [x] RED regression reproduced (focused test fails before implementation).
- [x] Verified filter implemented and focused tests 17 PASS.
- [x] Mid-run main/plan fetch checked; unchanged a8541927; no overlap with A/B/QA/Gemini PRs.
- [ ] Full exact-SHA gates and isolated DB checks recorded.

## Finished
- Pending verification. Merge/production forbidden until all gates pass.

### Mid-run — 2026-11-02 10:46 KST
- RED test failed on missing delivery filter; GREEN: 17/17 focused tests pass. Status filters and literal event-type substring operate only on the 30-row validated response. Invalid URL arrays, unknown statuses, control characters and overly long searches fail closed.
- Existing guarded NestJS controller, repository and `admin_recent_discord_outbox_events(uuid, integer)` SQL remain the source of truth; no UI-only simulated receipts, writes, new permissions or new endpoints.
- Re-fetched `origin/main` and EN/KO integrated plan; baseline unchanged. Re-evaluate before any merge.

### Build failure and correction — 2026-11-02 10:52 KST
- Initial SHA `a6cd0f939cee12c1c38b7b8213695da0462e189b`: full lint/typecheck passed and frontend unit suite 2934 PASS, but Next.js production build failed: optional *page props object* was inferred as `undefined | PageProps`. This is a real failure, not a pass.
- Correction: make the Next page props object mandatory (while allowing `searchParams` to be omitted) and adapt SSR tests. All required gates must be rerun on the corrected final SHA.
