# Financial Integrity Core v2026.11.03.1701

## Canonical architecture
The PostgreSQL ledger is the only source of WLD truth. No duplicate Treasury/member/market balances are created. Existing authenticated domain commands (Treasury, member, bank, stock) call the canonical economy_post_transaction. Within one transaction the new finance_integrity_assert_and_record validates identical persisted posting multisets, double-entry zero-sum, and for each touched account before + signed delta = after. The canonical posting, account balances, event outbox and domain-classified JSON receipt all commit or roll back together. The receipt includes request digest, transaction ID, account before/delta/after, exact decimal WLD strings and SHA256 evidence checksum.

## Security: internal only
No new public HTTP route, external core API or network port is exposed. moneyverse_app and PUBLIC are denied the raw posting function, proof functions, full scanner and proof table. Only internal role moneyverse_reconciler gets read-only aggregate scanner access. The immutable triggers block UPDATE, DELETE and TRUNCATE of canonical ledger and JSON receipts. SECURITY DEFINER functions use a pinned catalog search path and explicit public table names. Service auth, proxy allowlists, firewall, DB authentication and credential isolation remain mandatory independently; SQL grants do not themselves close exposed database network listeners.

## Boundaries
SQL329 protects NEW transactions routed through economy_post_transaction. Historical receipts are not forged; pre-migration replay is LEGACY_UNVERIFIED. Legacy account-journal drift is detected by finance_integrity_scan and investigated, not auto-corrected. Existing domain functions that directly mutate account_balances, system_treasury_vaults, stock positions, loans or other secondary records are not automatically captured and need separate review/refactoring. A SHA256 inside the same DB is not an independent attestation against a privileged attacker; offsite signed backups are needed. Do not call a transaction proof historic full-account reconciliation.

## Read-only internal check
BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY;
SELECT public.finance_integrity_scan();
COMMIT;

## Validation and release
Disposable PostgreSQL 17.11 SQL tests: 5 synthetic transactions in 4 domains, 20-digit+ exact WLD, replay, rejection/rollback, immutable receipts, detected induced corruption and denied web role, successful. These do not prove exact Production schema, independent restore, official Test backend, CI or safe Production promotion. Keep release on hold until each gate is verified.

**Network finding:** the existing dev database container was observed listening on host 0.0.0.0:5433. The branch changes compose.yml to 127.0.0.1:5433:5432, but the running container was intentionally not recreated. Actual host exposure remains to be remediated and independently confirmed at deployment.

### Correction compatibility v1701.1
SQL083 reverses WLD by appending a new transaction and linking its reverses_transaction_id to the original. The new JSON evidence is **not** a business dependent that prevents correction; all other business FK dependencies remain protected. The ledger_transactions update guard accepts only a one-time non-monetary reversal link with a matching origin reversal outbox event. It rejects changes to type, amount, actor, request hash, and other fields; transaction deletion and posting changes remain prohibited. The independent production-clone SQL regression uses a transaction with ROLLBACK.
