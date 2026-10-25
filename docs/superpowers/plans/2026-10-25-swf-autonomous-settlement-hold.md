# SWF autonomous settlement fail-closed plan (B v530)

## Intent and safety
The autonomous SWF cycle synthesizes corporate taxes and directly changes vault, portfolio and member balances. There is no DB-owned balanced ledger receipt or approved exact-SHA Test settlement evidence. The scheduler must not turn these prototype paths into live financial mutations even when both runtime flags are enabled. This is a temporary feature hold, not an implementation of settlement.

## Tasks
1. Add RED test in `backend/src/admin/treasury/auto-swf.service.test.ts`: explicit runtime-enabled call returns `executed:false`, `SWF_LEDGER_SETTLEMENT_UNAVAILABLE`; zero pool queries, pool connects or Discord messages. Preserve disabled-mode and scheduler-delay tests.
2. Remove unreachable autonomous direct SQL and success notification paths from `backend/src/admin/treasury/auto-swf.service.ts`; return explicit unavailable reason without touching DB. Keep read-only APIs and `updateConfig` unchanged. No migrations or live DB access.
3. Replace obsolete simulated-success unit expectations with fail-closed assertions. Run focused tests, backend/full verification, production dependency audit and GitHub CI. Confirm fresh main and EN/KO plans at mid-run. Publish draft PR and hold release without exact-SHA Test, real PostgreSQL, E2E and all security gates.

## Contract
`evaluateAndRebalance()` when runtime flag absent: `{executed:false, reason:'SWF_RUNTIME_EXECUTION_DISABLED'}`. When explicitly enabled: `{executed:false, reason:'SWF_LEDGER_SETTLEMENT_UNAVAILABLE'}`. Never return `executed:true` without authoritative ledger. No DB schema or API route changes.
