# v2026.11.01.1608 — Planning v1608 — F675-208 member expiry digest creation provenance

**Date:** 2026-11-01 KST. **Cycle:** Improvement v1606 → Addition v1608 → Improvement v1610 (provisional). **Authority:** main 1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0, AGENTS.md, README.md, English master, Korean parity. **Predecessor:** unmerged Draft #2335; developer issue #2342; no F675-203–207 runtime implementation verified.

**Source inspection:** account notification settings contains tabs and engagement toggle but no digest provenance. Nest notification controller lists/searches messages, not atomic creation receipts. Numbered DB migrations/init do not establish the inbox table DDL in this read; test fixture SQL is not deployable authority. Proposed F675-205 receipt+notification same-transaction link must be implemented and audited before F675-208 can show a verified record.

**Design:** fixed seven KST dates, owner-only read-only receipt+notification proof; distinguish VERIFIED_CREATED, WINDOW_OPEN and NO_VERIFIED_RECORD without claiming device delivery or missing-worker failure. Fail closed on orphan/mismatched receipts, schema uncertainty, retention gaps, malformed upstream, auth/consent failure. Reuse existing receipt schema, no new table by default, zero WLD/item/ledger changes. Full API/DB/transactions/permissions/Next/Android/SEO/a11y/KPI/tests/rollback in canonical master.

**P0/P1:** four operations/security/finance/release gates and six B/A/C/QA implementation handoffs recorded in master. Treasury v1611 NOT_RECOVERED and crafting #2330 remain separate owners. External independent references new approved 0; cumulative UNKNOWN/10,000 BLOCKED/IN PROGRESS.

**Verification scope:** documentation parity, release classifier and policy tests; no PG17 functional acceptance or exact-SHA official Test; Production RELEASE HOLD. No main merge, runtime code, DB migration or Production deployment in this planning run.
