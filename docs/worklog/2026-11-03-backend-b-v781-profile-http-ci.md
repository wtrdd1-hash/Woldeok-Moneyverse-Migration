# Backend B v781 — authenticated profile HTTP test gateway parity (HOLD)

Start main: `07fa93a7781c60e042c59862953bc6f05452e45a`.

P1: the owner profile HTTP privacy tests bypass class-level session guards but still traverse the production-mode global `InternalTokenGuard`. The test sent no `x-internal-token`, so both expected 200 assertions returned 401 before reaching the mocked session/profile controller. Do **not** disable the production token guard. The two authenticated requests now present the existing test-only configured internal token; anonymous rejection tests remain unchanged.

RED: 6 passed / 2 failed (HTTP 401 vs 200). GREEN: 8 passed. Backend full Vitest: 2998 passed, 518 skipped, 0 failed. Backend typecheck/build and changed-file lint passed. No runtime API, schema, auth policy, ledger, or migration changes. Actual PostgreSQL integration, official Test exact-SHA, independent restore, GitOps and production release gates not completed: RELEASE HOLD. No merge/deployment.
