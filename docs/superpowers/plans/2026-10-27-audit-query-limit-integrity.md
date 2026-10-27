# Audit query limit integrity — B v580 (draft, HOLD)

Baseline: exact fetched origin/main; no migration, no ledger writes.

Risk: GET /api/v1/admin/audit/events silently truncates malformed `limit` via `Number.parseInt` (e.g. `2junk` -> 2, `1e2` -> 1). This can misrepresent the completeness of a privileged audit review. AuditRepository validates the coerced integer, not the original wire value.

Approach: TDD test the controller with a stubbed repository. Reject non-string, noncanonical decimal, non-safe and out-of-range limits before DB invocation; preserve omission default 30 and valid 1..100. Do not change unrelated audit filters, SQL, or frontend C's integrity work. Add regression evidence and API contract notes. Verify focused and full gates, isolated read-only PostgreSQL, exact SHA CI. Keep PR draft/hold and Production blocked unless all official gates pass.
