# RELEASE HOLD — Development A public board author order

Candidate: `auto/hourly-a-20261102-1525-board-author-order` (base `a8541927c3a351d980454c66e95a3356c47e0722`). Feature code and tests exist, but a passing targeted test is not release evidence.

**Blocking gates:** Existing profile HTTP authentication regression (401 vs expected 200, #2265), broad dev PostgreSQL application DML grants (#993), dependency audit findings, exact-SHA isolated official Test authentication/E2E, independent backup restore and signed GitOps release authorization. Real production runtime/rollback identity must be reattested. No test/production release, schema change, service restart or rollback was executed.

**Safety:** All financial and session writes unchanged. No applied migration modified. Retain draft PR and all unique branches. Do not merge or promote without a complete green exact-SHA gate set. Rollback is a reviewed code rollback/feature suppression only after future deployment; no data rollback needed now.
