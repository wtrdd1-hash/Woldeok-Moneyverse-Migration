# Work career switch proof — v1162 implementation plan

1. Confirm main and overlapping PR inventory, and write RED tests for the existing HTTP-success false-positive path.
2. Implement strict runtime validation of POST `/api/v1/work/active-job` receipt and GET `/api/v1/work/profile` owner readback; no success without both.
3. Run focused frontend/backend and isolated real PostgreSQL regression, plus full lint/typecheck/build/tests/security/app-api and GitHub CI at the exact HEAD.
4. Re-fetch main and planning before any integration. Preserve PR as Draft/HOLD if any mandatory gate or official Test exact-SHA is missing; do not promote Production.
