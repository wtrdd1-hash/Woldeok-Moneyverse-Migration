# v2026.10.28.1421 — Canonical treasury dividend release attempt

Owner explicitly requested Production promotion and accepts current application role DML authority. Financial ledger invariants, provenance and exact-SHA Test remain independent gates. Parallel blog deployment and official shared Test are preserved.

Initial PR #1706 SHA `52623008` Github CI passed lint/typecheck/build and 290 PostgreSQL migrations, then failed one synthetic SQL test because ledger transaction `policy_version='treasury.v1420'` violates the foreign key to actual `economy_policies`. Modified migration 291 to use `NULL` policy_version (consistent with existing canonical donation flows), added regression assertion and stronger SQL negatives.

Independent isolated Docker PostgreSQL 17.11 applied core schema and all 290 migrations, then successfully ran the v1420 synthetic SQL fixture: recipient +1,000, Treasury -1,000, vault -1,000 WLD, exactly balanced ledger postings, one immutable receipt, replay unchanged; unauthorized, unfunded, altered-key and legacy payouts rejected. `ROLLBACK` prevents retaining synthetic users, balances or audit records. No real Test/Production funds changed.

**Deployment gate:** Production had 18 unposted wallet dividend credits (18,000 WLD) and zero certified Treasury ledger funds. User-approved app DML is not by itself proof of ledger reconciliation. Financial readiness remains BLOCKED pending audited historical account evidence, certified treasury funding, exact-SHA official Test/authenticated E2E, backup restoration and zero-downtime replacement smoke. Do not claim complete Production promotion without live evidence.
