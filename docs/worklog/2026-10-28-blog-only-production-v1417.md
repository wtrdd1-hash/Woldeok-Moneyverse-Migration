# v2026.10.28.1417 — Blog-only zero-downtime Production deployment

Status: STARTED. User explicitly requested isolated blog-only Production promotion.
Before work: reconcile current integrated master, v1405 two-hour owner policy, AGENTS, docs/RELEASING and v1415.7–v1416. Finance gate remains BLOCKED and must never be recorded as passed. Do not change finance/member traffic or Production app pointer. Candidate app SHA 4688e84be0f831a3f6e5e16040b3764dff6d78bf, CI #3971 and official Test PASS; latest main 9ff388ab608af99b9ccc806c35ebac5c14bd15e9. Parallel collaborators untouched.
Preserve all 13 old JSON posts and immutable backup. Original model writer failed 125-second timeout, no claim of successful unattended publication. Apply only separately inspected blog SQL 288–290 after authenticated backup and negative tests; no financial schema/grants mutation. Switch only blog-specific Nginx URLs and static resources with rollback preflight.
Intermediate / end evidence pending.
