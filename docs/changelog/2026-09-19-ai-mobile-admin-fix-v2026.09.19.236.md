# v2026.09.19.236 — Economy AI shadow health, adaptive-limit safety and mobile/admin fix

- Added a daily non-authoritative Economy AI shadow-health scheduler job that records model evidence in a separate append-only table and never authorizes policy application.
- Added default-disabled `economy_job_limit_tightening`; negative profession-limit deltas are DB-blocked until explicitly enabled, and effective task limits remain at least 2/day.
- Expanded administrator Economy AI status with operational state, model reachability, proposal eligibility/block reasons, authoritative/shadow review counts and recent scheduler outcomes.
- Added mobile stacked cards for AI agent evidence, traffic series and activity logs while retaining desktop tables.
- Added migration 205 and regression coverage for shadow isolation, tightening guards, failure state and responsive layouts.
- Isolated PostgreSQL 17.11 accepted migrations 002–205; full local test suite passed (contract 23, database 7, backend 1451, frontend 629), with lint zero errors, typecheck and production build passing.
- Production auto-policy remains disabled under the v235 operational baseline; Test exact-SHA verification is required before Production promotion.
