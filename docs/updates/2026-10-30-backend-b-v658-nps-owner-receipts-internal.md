# Internal — Backend B v658 NPS owner receipt ACL

**Scope:** Two existing authenticated member GET endpoints (`/pension/my-contributions`, `/pension/my-payouts`) retain response shape and 20-item default. Backend queries now use `pension_owner_contributions(uuid, integer)` and `pension_owner_payout_logs(uuid, integer)`, with strict owner UUID and 1–50 bounds. Forward-only migration 309 revokes direct app/PUBLIC table access, grants only definer function execution, filters rows by authenticated actor argument, and orders by timestamp/UUID. No DB financial write path or balance changes.

**Validation:** RED 3 / GREEN 3; focused 15 PASS; isolated PostgreSQL 17.11 ACL and exact-numeric PASS; lint/typecheck/build PASS; contract 41 PASS; DB 58 PASS / 4 SKIP; security/release 25 PASS; app-api 183 endpoints PASS; production audit zero known vulnerabilities. Full Backend 119 FAIL and Frontend 53 FAIL. Full original migration chain and authenticated official Test not certified.

**Dependencies:** Stacked Draft #1987 (migration 307) → Draft #1992 (migration 308) → v658 (migration 309). Existing member account GET may still require raw table privileges, and admin payout read remains unaddressed. Coordinate with Frontend C #1982 to avoid treating API failures as zero/empty.

**Disposition:** RELEASE HOLD; no main merge, shared DB migration, Test or Production change. GitHub PR is a candidate only.
