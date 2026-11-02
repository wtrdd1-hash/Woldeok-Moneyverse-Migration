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

### HTTP privacy discovery — 2026-11-02 10:59 KST
- A standalone Next.js HTTP probe of `/admin/logs/delivery?status=outstanding&event=wallet.deposit` returned `X-Robots-Tag: index, follow` despite the page's `noindex` HTML meta tag. Its body had an INTERNAL_API_TOKEN configuration error, so this is **not** a successful authenticated user E2E or evidence of a Production disclosure.
- New RED test confirmed missing actual-edge privacy headers on the base and `/en`/`/ko` localized aliases (3 failures). Narrow proxy fix sets `noindex, nofollow`, `private, no-store`, and `no-referrer` only for the admin delivery page, preserving public routes. GREEN: 21/21 focused tests.
- This route-scoped change does not replace the broader unmerged private-header PR #2225. It is needed for this page to avoid relying on HTML metadata alone.
- A fresh disposable PostgreSQL attempt initially failed due to the container SQL wrapper using host file paths, then a migrator-role ownership mismatch and unsafe test-only worker group membership. Test harness is being corrected without modifying repository migrations or shared databases.

### Validation checkpoint — 2026-11-02 11:03 KST
- Corrected source `7e83f71d1893ec47be3748a66208057d3c028f3d`: production Next build PASS; isolated real HTTP GET on `/admin/logs/delivery?status=outstanding&event=wallet.deposit` and `/en/admin/logs/delivery?status=terminal` returned `X-Robots-Tag: noindex, nofollow`, `Cache-Control: private, no-store`, `Referrer-Policy: no-referrer`. HTTP 200 alone is not authenticated E2E; no real admin session was used.
- Disposable PostgreSQL 17.11 PASS: 322/322 forward-only migrations; admin function returned 3 seeded recent rows with `delivered,pending,retry_pending`, 1-row limit respected, app role EXECUTE true and direct `user_roles` SELECT false. Non-approver actor refused with `approver role required`. Container removed; no shared/Production DB writes.
- Earlier preflight SHA `a6cd0f9`: Lint and Typecheck PASS, Frontend 2,934 PASS, Database 62 PASS/5 SKIP, API contract 184 PASS, security 17 PASS. Backend 2,978 PASS/2 FAIL/518 SKIP (unrelated profile HTTP expected 200, received 401); production-mode same two failures. Route ledger FAIL (missing `artifacts/qa/full-route-ledger.json`); full audit FAIL (8 moderate, 1 low). First Next build failed, corrected build later PASS. These are *not* final-SHA gate results.
- Official exact-SHA authenticated Test browser/mobile E2E, independent restore and GitOps release are BLOCKED. CI runtime checks are pending at this checkpoint. Do not merge or deploy.

## Finished — RELEASE HOLD
- [x] RED tests reproduced and corrected; focused 21/21 PASS.
- [x] Verified status/type triage and actual HTTP edge privacy implemented.
- [x] Mid/end main and EN/KO plan source rechecked (main still `a8541927c3a351d980454c66e95a3356c47e0722`).
- [x] Disposable PostgreSQL 322 migrations, role authorization, and HTTP headers proved; test environment removed.
- [ ] Full **final HEAD** gates and remote CI: rerun after this worklog commit, with results posted on Draft PR #2459. Failures and skips remain blockers.
- [ ] Official Test authenticated E2E, independent restore, main merge, Production smoke/rollback: NOT DONE; no release.
- No changes to A/B/Gemini/QA branches or main. Preserve all unique unmerged branches and Draft PRs. No cleanup or reservation mutation.
