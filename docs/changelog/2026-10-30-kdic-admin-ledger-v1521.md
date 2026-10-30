# Changelog v2026.10.30.1521 — KDIC reconciliation visibility
- Added administrator-scoped read-only GET ledger status with single-statement consistent projection, journal balance check and Treasury orphan-link count.
- Added strictly validated no-store frontend API and responsive dashboard evidence (including unavailable state).
- Added regression tests for malformed observation, failed evidence, non-write SQL and continued settlement hold. No ledger/DB mutation.
- Release: branch-only / official Test and Production not certified. Existing KDIC POST 503 unchanged.
