# v2026.10.28.1420 — Canonical citizen dividend settlement

Owner accepts current DB access grants; this remediation targets financial invariants, not a general privilege change. Original main `9ff388ab608af99b9ccc806c35ebac5c14bd15e9`, isolated branch `fix/treasury-dividend-ledger-v20261028-1420`.

**Root cause:** Migration 240 executed citizen dividend by incrementing 18 wallets directly and decrementing a treasury vault. On 2026-10-28, 18 × 1,000 WLD distributions generated an 18,000 WLD disparity from canonical postings. The real `TREASURY` ledger account has zero WLD. This is NOT proof of a mint or basis to reissue payouts or forge opening entries.

**Fix candidate:** immutable migration 291 introduces a key-bound 4-argument citizen-dividend function and holds the legacy 3-argument path. It requires actual canonical treasury cash, respects 30% vault reserve, locks account records in deterministic order, sends one balanced multi-party posting to `economy_post_transaction`, persists request-key/ledger transaction/recipient UUID snapshot/certified receipt and vault+audit entries atomically. Backend DTO/repository/service and frontend form/server action preserve one UUID across network retry, resetting on edited input.

**Verification:** TDD RED then backend 53 PASS, DB SQL contract 1 PASS and CI-only disposable PostgreSQL ROLLBACK fixture created. Mini-PC lacked host `psql` and remote migration execution was blocked; **actual DB integration and production promotion NOT verified**. Existing production WLD untouched. Remaining release blockers: real treasury canonical funding provenance, historical beneficiary-ledger reconciliation, migration parity, authenticated exact-SHA Test and release CI.
