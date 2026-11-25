# Spring backend audit checkpoint

The Korean report [2026-11-25-spring-backend-audit.ko.md](2026-11-25-spring-backend-audit.ko.md) records source-backed banking, identity boundary, financial truth, and explicit unavailable-function findings at main `9876c09888ec84034eec183cf1309c85df3d7447`.

This is a partial review. Source existence does not establish functional parity or deployment. Full requirements-to-endpoint-to-database-to-client mapping, isolated PostgreSQL checks, authenticated testing, runtime SHA identity, and production exposure remain open.

Prioritise the bank controller's caller-controlled identity and the bank service's fabricated balances and success receipts. The permissive security chain and committed fallback secrets increase the importance of independently verifying the effective edge and production configuration. Do not infer a confirmed production exploit from source alone.

The first optimisation stage is correctness and access control; measure query counts, execution plans, pool waits, latency percentiles, heap and GC in isolated Test before making performance changes. Preserve the PostgreSQL ledger function boundary and validate receipts and idempotency under concurrency.

104 Gradle test result XML files contained 662 tests, zero reported failures, errors, or skips, but the test run's exit status and completion were not confirmed. The default Gradle task excludes tagged PostgreSQL tests.
