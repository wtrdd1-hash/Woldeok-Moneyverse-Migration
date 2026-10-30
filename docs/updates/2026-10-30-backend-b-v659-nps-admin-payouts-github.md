# Backend B v659 — P1 admin NPS payout history least-privilege read

**Status: DRAFT / RELEASE HOLD.** Base: stacked Draft #1998 (migrations 307–309); remote main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef` at start and midpoint.

## Root cause
`GET /api/v1/admin/pension/recent-payouts` had an admin session guard and bounded limit, but its repository selected directly from `public.national_pension_payout_logs`. Migration 309 revokes application-role direct table access. This route would therefore fail with PostgreSQL 42501 even for a valid administrator; granting broad table SELECT would violate least privilege.

## Code/API/DB contract
- New forward-only migration `310-pension-admin-recent-payouts-scoped-read.sql` reasserts direct-table revoke and grants only `EXECUTE` on `pension_admin_recent_payouts(p_actor uuid,p_limit integer)` to `moneyverse_app`.
- The function validates limit 1–100 and an active administrator role in the database, then returns immutable historical payout rows ordered by timestamp and id. Inactive or roleless actors are rejected.
- The existing Nest admin controller now passes the authenticated session actor to service and repository. Existing endpoint, response columns and default limit 20 are unchanged.
- No monetary writes, balances, ledger, existing migrations, member public API or frontend code changed.

## Verification
- TDD RED 2 expected failures; GREEN 34/34 focused backend tests.
- Isolated PostgreSQL 17.11: active admin access, inactive/roleless denial, invalid inputs, direct-table revoke, PUBLIC function denial, stable order, exact large numeric values, unchanged rows: PASS. Container removed.
- Lint PASS (0 errors, 1,043 warnings); Typecheck PASS; Backend and Frontend Build PASS; contract 41 PASS; database static 58 PASS / 4 SKIP; mobile API contract 183 PASS; security policy 16 PASS.
- Backend full suite: 2,570 PASS / 119 FAIL / 496 SKIP. Frontend full suite: 2,607 PASS / 53 FAIL. Remote CI pending Draft PR; no official Test exact-SHA.
- Production and official Test exact-SHA gates: BLOCKED. No merge or deployment.

## Dependencies and release blockers
Stack order **#1987 → #1992 → #1998 → this PR**. Parent PR runtime CI fails; official Test remains at a stale SHA; QA v1390 reports Production runtime/symlink mismatch, migration checksum mismatches and all-suite failures. Preserve all existing branches and release artifacts. Do not merge/promote until independent exact-SHA PostgreSQL, CI, authenticated Test and approved GitOps gates pass.
