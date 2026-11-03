# v2026.11.03.1715 — Treasury auxiliary vault direct-write hardening

## BEFORE — 2026-11-03 KST
User repeatedly requested real finance recovery. First financial core SQL329 and account ACL SQL330 from merged main 96f643456e9ae945e7ee646ca06d3bbfe83247d7 now run in official Test (backend/frontend Test SHA gate passes; Test DB backup and SQL330 applied; financial-readiness read-only gate passes). Actual Production v1705 still accepts existing direct web-role INSERT/UPDATE/DELETE on accounts, account_balances and system_treasury_vaults. Post-SQL330 alone would leave vault DML and fail the strict financial gate. All historic balances and archive were verified (891 transactions, 1829 postings, 42 accounts, 1546 archive records, member 4,841,510 WLD).
Read latest DOCS_INDEX, AGENTS, TREASURY_CORE, RELEASING, v1714 worklog, v1701 integrity proof, latest migration and owner-approved existing privilege exception. Scoped backend direct vault UPDATE appears only in legacy NationalPensionRepository paths already guarded by PensionLedgerSettlementHoldError before accessing DB. This change will **not** enable unfunded legacy NPS/SOE/KDIC payments, forge issuance or alter canonical WLD.

## PLAN
1. Add a source regression test of no direct web-role Treasury vault DML; demonstrate RED before implementation.
2. Add strictly forward-only SQL331 revoking raw vault mutations and checking effective table and column UPDATE rights; no new permissions for finance authors, no public API.
3. Verify SQL329→330→331 on restored real Production backup clone with full ledger/archive conservation and app role table privilege denial.
4. Run source/CI; merge from current main only on green CI, then official exact-SHA Test and read-only finance gate.
5. Production only after Test authenticated session continuity and funded workflow controls are verified, full backup/restore and zero-downtime readiness.

## DURING — pending
## END — pending
