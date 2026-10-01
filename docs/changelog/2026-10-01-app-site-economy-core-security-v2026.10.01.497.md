# App/Site/Economy Core Security Design — v2026.10.01.497

- Split the future client-facing contract into App Core and Site Core while keeping one authoritative Economy Core.
- Added explicit trust zones, compromise containment and separate workload/user-actor authorization.
- Replaced the final shared-token design with short-lived scoped workload identity and optional proof-of-possession/mTLS for physically separated high-value paths.
- Preserved the database-first `SECURITY DEFINER`/append-only ledger authority and prohibited protected-table writes from BFFs and AI runtimes.
- Added canonical Economy Command Envelope, request hashing, replay controls, endpoint inventory/versioning and App/Site migration rules.
- Added Play Integrity request binding for selected high-value mobile actions without treating device integrity as identity.
- Consolidated economy/work/stock AI tuning into one Economy Policy Registry and one policy executor.
- Defined concrete AI change-size defaults, cooldowns, cumulative drift budgets and prohibited direct balance/price/history mutation.
- Added prompt-injection/excessive-agency isolation, controlled AI egress and no policy-executor credentials in model runtimes.
- Added zero-downtime migration, security test matrix and release gates.
- Recorded a 149,691-record deduplicated discovery corpus and a current primary-source security review.
- Documentation/research only; no runtime, database, Test or Production mutation.
