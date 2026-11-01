# A 18:25 Announcement Image Filter — RELEASE HOLD

Candidate branch `auto/hourly-a-20261101-1825-announcement-image` is **not authorized** for Test or Production. Main base `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`; final candidate SHA and CI status are tracked in the PR.

Release gate: full local test/build/lint/typecheck/security/API contract and DEV PostgreSQL read-only verification are necessary but not sufficient. Existing DEV P0 direct table privileges (#993), absent positive image fixture, overlapping announcement Draft PRs, unverified final exact-SHA GitHub CI, unavailable exact-SHA official Test authenticated E2E, independent backup restore and Production runtime provenance prevent promotion.

Official Test backend/frontend `bc8cd8a6c654af0336f550643f23049a58ee1d16`; Production backend `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; Production frontend reports non-SHA `1793450413898`. Candidate is not deployed. No GitOps release, DB writes, restart or rollback was performed. Rollback of this unshipped read-only feature is to close the Draft PR or remove the filter on a new reviewed branch; never modify historical migrations or financial records.
