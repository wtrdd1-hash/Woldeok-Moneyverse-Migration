# P1 Private Virtual Loan Statement — A0454 implementation plan
1. RED: test malformed actor, bounded query, GET auth/consent, CSV injection and large integer precision, failure/no-store, app gateway.
2. GREEN: reuse bank_my_loans(p_actor) with SELECT and LIMIT 20 (never direct table grants), GET progression/credit/loans/statement-data, owner-derived actor, fail closed if >20.
3. GREEN: dynamic Next BFF /progression/credit/loans/statement.csv, validate strict schema, escape formula/control injection, CSV with 20 max, private no-store/noindex/nosniff; member CTA on /progression, Android app-api contract.
4. Verify focused tests, full backend/frontend/package/build/lint/typecheck/audit, real isolated PG app-role ACL and rollback; do not claim PASS for skipped/failed.
5. Re-fetch main and living plans mid/integration; open Draft PR, hold merge/Production unless every release gate PASS including official exact-SHA Test.

- DB authority correction: real isolated PostgreSQL function definition of bank_my_loans has an internal LIMIT 20; never advertise 100 or a complete archive. Expose recent_20_only and disclose older records may exist.
