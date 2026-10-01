# v2026.10.01.494 — P0 Admin Audit Member Search Hotfix Worklog

**Status:** INVESTIGATING  
**Priority:** P0 / emergency  
**GitHub issue:** #765  
**Branch:** `hotfix/admin-audit-member-search-v2026.10.01.494`  
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
