# Backend B v619 — Treasury ledger audit pagination integrity (DRAFT / HOLD)

Date: 2026-10-29 KST. Baseline and mid-run canonical `main`: `35971c600f25869c96f1c666d4b9f58927202730`.

## Source-backed P1 defect and acceptance

`GET /api/v1/admin/treasury/transactions` previously sorted only by `created_at DESC`, continued with `created_at < cursor`, and serialized the next cursor through JavaScript `Date.toISOString()`. Two ledger entries with an identical timestamp could be omitted on the next page; PostgreSQL microseconds were also truncated to milliseconds. Unvalidated `limit` or cursor values could reach SQL or be silently clamped. This is a **read-only audit completeness defect**, not evidence of ledger corruption or lost WLD.

The new opaque `tl1.<base64url({at,id})>` cursor retains PostgreSQL's exact `timestamptz::text` value and the ledger UUID. The SQL uses `ORDER BY l.created_at DESC, l.id DESC` and `(l.created_at,l.id)<($1::timestamptz,$2::uuid)`. Canonical limit `1..100` (default `30`) and cursor validation reject malformed, repeated, legacy timestamp-only, noncanonical and oversized inputs with HTTP 400 before database reads. Direct repository calls are also guarded. `next_cursor` remains a string or null; the existing ledger item fields and WLD integer strings are unchanged. Previously issued timestamp-only cursors must restart at page one. No migration, grant, ledger write, or frontend change.

## Verification evidence and limits

- RED: 4 new tests failed on untouched main. GREEN: 4 focused unit/HTTP tests pass.
- Isolated disposable PostgreSQL 17 Alpine: 1 integration test passes with two equal-microsecond rows, no duplicate or omitted page, exact `9007199254740993` WLD string. Synthetic minimal schema, **not full production schema**. Container removed.
- Backend suite: 1,943 PASS / 441 SKIPPED; database suite: 46 PASS / 4 SKIPPED; security policy: 23 PASS; API contract: 180 routes PASS; Lint: 0 errors / 1,099 warnings; workspace typecheck PASS after linking existing frontend dependencies; Backend build PASS.
- Frontend full suite: 1,429 PASS / 402 FAIL, mostly existing React test environment errors; dependency audit: FAIL, one Moderate `qs` advisory. Full Next.js build not attempted because shared disk was 97% full. No authenticated admin E2E or official Test exact-SHA.

## Release decision

**DRAFT / HOLD.** Do not merge or promote until required CI, full build/tests, security audit, isolated full-schema PostgreSQL, official Test exact-SHA, authenticated administrator flow and GitOps gates pass. This candidate does not change Production or the shared database. Existing A/C/QA/planning worktrees and scheduled tasks remain untouched.
