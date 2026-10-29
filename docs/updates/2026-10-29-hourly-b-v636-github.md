# B v636 — durable owner-only wallet transfer receipt lookup (DRAFT/HOLD)

Implements `GET /api/v1/wallet/transfers/receipts/:idempotencyKey` with owner-scoped, read-only ledger evidence. Returns committed UUID, recipient and exact integer WLD only when both ledger postings verify; otherwise `unknown` (not safe for a new-key retry) or fail-closed 503. No migration, balance write, or new grant. P0 #1854 **partially** addressed; C #1864 must integrate receipt confirmation and preserve frozen payload; Android parity and exactly-once notifications remain open.

Tests: 12 RED→GREEN, 4 HTTP, 23 wallet E2E, 4 isolated PostgreSQL 17.11 least-privilege; root test/typecheck/lint/build PASS. Security audit FAIL on pre-existing `qs@6.16.0` Moderate (#1687). Official Test exact-SHA, full concurrency/retry and release gates incomplete. **Do not merge or deploy.**
