# SOE dividend remittance atomicity — implementation plan (v498)

1. TDD: add repository tests that reject multi-query dividend writes and require an idempotent DB function call, canonical key and receipt.
2. Create migration 280 with a key-locked, owner-scoped, period-unique receipt and a SECURITY DEFINER function. Lock the treasury vault and SOEs in deterministic order, insert all ledger/log/vault changes within the same PostgreSQL function transaction. Refuse out-of-range rates and non-admin actors.
3. Update the backend repository/controller to call the function once and return the persisted receipt; retain API response fields and document the retry key contract. Add schema-contract tests.
4. Run full available local gates, CI, isolated PostgreSQL if safely provisioned; otherwise HOLD. Refresh origin/main and docs mid-run; no merge/deploy without all gates.
