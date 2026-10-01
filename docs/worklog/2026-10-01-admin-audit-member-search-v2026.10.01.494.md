# v2026.10.01.494 — P0 Admin Audit Member Search Hotfix Worklog

**Status:** TEST ACCEPTED / PRODUCTION PREPARATION
**Priority:** P0 / emergency  
**GitHub issue:** #765  
**Branch:** `fix/admin-audit-member-search-v2026.10.01.494`
**Start origin/main:** `91efe427cccbc012cd71c082d3c9caeb246dcf98`

## Start record

A production administrator screenshot shows `/admin/logs` returning an empty result while filtering by target member UUID. This work unit treats a false-empty audit trail as an operational integrity defect.

Initial source inspection confirms the page sends the member filter to `GET /api/v1/admin/audit/events`. The current repository already contains migration `174-audit-member-target-search.sql`, which is intended to search both `subject_user_id` and `target_id`.

## Investigation plan

1. Verify authoritative Test and Production database migration state and exact function definition.
2. Reproduce the target-member query against database evidence without mutating audit history.
3. Add a regression test before any code/database repair that proves the observed failure.
4. Apply the smallest forward-only repair required; never edit an applied migration.
5. Re-fetch `origin/main` mid-work, reconcile concurrent changes, then run exact-HEAD checks.
6. Materialize the exact candidate on isolated Test and verify backend, DB, admin flow, and responsive page behavior.
7. Promote with the current zero-downtime release procedure only after Test acceptance.
8. Record internal and GitHub-facing update notes with exact SHA and runtime evidence.

## Mid-work record

- Re-fetched `origin/main`: `91efe427cccbc012cd71c082d3c9caeb246dcf98`; no drift from the start baseline.
- Production migration `174-audit-member-target-search.sql` is applied and the live search function includes the `target_id` fallback.
- The screenshot member exists, but has zero `audit_logs` rows as actor, subject, or target. The empty operational-audit result is therefore correct.
- The same member has 44,676 `user_activity_logs` rows: 41,548 API requests, 1,803 dwell events, 899 page views, and 426 button clicks.
- Root cause: the UI did not clearly separate administrator-operation audit evidence from member activity telemetry, and the activity page did not expose the backend's existing `userId` filter.
- TDD RED: new `admin-member-log-routing.test.ts` failed all 3 intended assertions before implementation.
- GREEN: per-member activity filter/link/empty-state semantics implemented; targeted routing + admin mobile tests now pass 10/10.

## Public isolated-Test acceptance

Application source `7080738e656aca099d5c871278d178d69a984fcc` was materialized as `/srv/moneyverse-data/releases/test-v494` on the Debian 13 authoritative host. The public Test pointer was switched from `test-v489` to `test-v494`.

Acceptance evidence:
- backend `/health`: `{"status":"ok"}`;
- public `/api/version`: exact application SHA `7080738e656aca099d5c871278d178d69a984fcc`;
- public `/frontend-version`: the same exact application SHA;
- public `/`: HTTP 200 with `X-Robots-Tag: noindex, nofollow`;
- public `/status`: HTTP 200;
- public catalog backend/database path: 146 catalog items;
- changed administrator activity route reaches the expected login gate for an unauthenticated request;
- no new fatal/critical/uncaught/unhandled service log entries during the acceptance window.

The Test database's existing `seo_crawler_logs` missing-table warning was also observed on the pre-existing Test service before v494 and is therefore not attributed to this change.

## GitHub control-plane note

GitHub `Build Test Candidate` run `36819176468` is intentionally not reported as passing. Its policy job fails before runtime checks because current `.github/workflows/ci.yml` invokes `scripts/check-secrets.sh` and other shell helpers that were intentionally removed by commit `58cdcafd`, while current `.gitignore` prohibits tracked `*.sh` operational tooling. This unrelated main/control-plane inconsistency is tracked as GitHub issue #768; the purged scripts were not restored in this emergency runtime branch.
