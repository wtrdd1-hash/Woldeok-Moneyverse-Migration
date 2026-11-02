# v2026.11.02.1626 — Owner-approved finance reset and recovery

## START — 2026-11-02 KST
Owner explicitly approved full related-finance data initialization and repeated demand for operational recovery.
Read DOCS_INDEX, AGENTS, Treasury Core and the v1611 reset incident; original SQL314 zeroed Treasury vaults only and left 552 Treasury events / 744 SOE dividends / 238 pension payouts active.
Latest main SHA 9cade11af53db9f27c2b9f0ea9d39005ea8d0387; live app SHA 305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b; independent fix/finance-reset-v1626 worktree without touching other contributors.
Real finance: Treasury balance 0, all five Treasury vaults 0, SOE 744 entries have no valid certified journal linkage, pension two legacy accounts include nominal 50000 and unjournaled 10710 paid, KDIC nominal 9005000 without canonical backing, funded NPS escrow 0.
Target: full pre-reset verified backup; independently restore and dry-run archived reset; archive 552+744 old financial source records and legacy 238 payout, 1 contribution and accounts before deactivating projections; KDIC phantom fund reset to actual zero; protect member wallets and canonical ledger. Reset must be auditable and reversible. No invented issuance/settlement. Need independently working funded DB operations, tests and Production release evidence before completion.

## MID
Pending data and test evidence.

## END
Pending release evidence.

### MID — 2026-11-02 23:35–23:45 KST: critical fiscal proof regression discovered in official Test
- Explicit migration SQL325 schema/procedure was applied only after verified pre-reset Test backup (20MB, SHA256 bc6bf12f3fe717b29ba3f676b7de75559c48104e238275f78b900d9e3a2c6ede). Separate Test clone restored, procedure archived 4 old rows and Test authorized session count remained 105. Actual Test DB SQL325 checksum e398935c17a5418b6bb585fccd6f8d595209d67f3b895e5d988cbe5dd67ae117, 4 rows archived, app reset EXECUTE=false, active Treasury 0.
- **Immediate Test regression:** after successful archiving, public Test /api/treasury/overview returned HTTP503! SQL320 fiscal proof erroneously required 3 live old Treasury rows after intentionally archiving them. This was traced to the actual treasury_fiscal_proof_read aggregation and Nest historic-count exact equality, not assumed to be healthy.
- Fix forward SQL326: count old Treasury/SOE source rows from SHA256-validated archive when a verified finance_reset_runs record exists; fail closed (-1) for any mismatched SHA, count or active old rows; otherwise use untouched original pre-reset table counts. Actual Production clone 552/744 and Test clone 3/0 verified.
- TDD new-source regression: under transaction, insert a deliberately invalid post-epoch Treasury event and inspect proof. SQL326 returned historic=-1 because it blocked all current entries. SQL327 only rejects *pre-epoch* unarchived live rows while allowing future canonical new source receipts, and separately leaves invalid_new_sources=1. Test RED then GREEN (historic 552, invalid new 1) and rollback; no false source committed. Tampered archive SHA returned -1 until rollback, then 552/744 proof restored.
- Official Test SQL326 applied checksum 7f08182e44424d1c6333b68eb664ab16510c554ec45282c8a770e3a3a9aca92d and SQL327 applied checksum 61b508e03619beb38f68386c2f8ca1dd638f22d7c571c9a122463dc1df7ba27d. Public Test /api/treasury/overview **HTTP200 RECONCILED 0 WLD**, history 3 archived and 0 active. New static regression 7/7 PASS, DB typecheck PASS. Production remains untouched until full CI and backup gate.
- Actual operational feature payment holds remain (Treasury 0 WLD): archive and complete reconciliation do not themselves create spending capacity. No new issuance or pension payout occurred.
