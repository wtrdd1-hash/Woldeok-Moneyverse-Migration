# v2026.11.04.1719 — Financial evidence and certificate DML protection

## START
Owner requested real financial recovery, including minimizing database attack surface of money-recording core. Following actual Production SQL329-331 and public cutover from v1718, inspected live app role effective ACL for remaining sensitive non-canonical financial data. Read integrated DOCS_INDEX, AGENTS, Treasury Core, current SQL329-331, mint and central-bank service source and release guide.

Critical live findings: web DB role still has INSERT/UPDATE/DELETE on mint_certificates, retirement_certificates, treasury disbursements, bond orders/coupon logs, policy configuration and tax assessment tables, plus UPDATE/DELETE on treasury_donations. Such privileges permit record/receipt forgery or deletion even though canonical ledger and balances are protected. Mint and retirement issuance controller is already fail-closed; their direct TypeScript DML code is currently unreachable. Central bank monetary policy/decisions have active direct TypeScript writes and are deliberately EXCLUDED, pending DB-owned wrapper redesign. Budget vote submissions are also excluded.

Proposed smallest safe forward-only v1719 SQL332: revoke app/PUBLIC raw record mutations from clearly inactive/DB-owner-write-only financial evidence tables, preserve legitimate SELECT, and verify actual effective table/column privileges after migration. Prove true moneyverse_app treasury donation and NPS escrow positive flows in network-isolated restored Production clone under SQL329-332, use Test and zero-downtime live release only on verified success. Do not synthesize WLD, delete records, or change currently active central bank policy writes.

## MID — pending
## END — pending

## MID — clone privilege and funded-caller validation
- Source test RED on missing SQL332 then GREEN 4/4. Independent schema migration numbered 332 after actual live 331. No prior numbered SQL changed.
- A new network-none PG17.11 clone restored from the actual November 4 Production pre-migration backup, with SQL329/330/331 already proven, successfully applied SQL332 (COMMIT). Read-only SQL verifies 8 protected finance tables, no web-role direct INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER or column-level DML, and no journal projection drift.
- Tested the actual web-role SECURITY DEFINER Treasury donation: 10 WLD one donation, identical receipt on retry, full ROLLBACK. Newly funded NPS app-role 1,000 contribution then 950 refund/50 welfare split, replay IDs identical, full ROLLBACK. Original 891 transactions and 0 new receipts preserved.
- Active Central Bank policy/decision tables deliberately excluded: their current service uses direct DML; revoking this now would disable existing admin policy actions. Mint issuance/retirement endpoints are fail-closed so forbidden direct certificate writes are not currently legitimately needed.
- LIVE Production presently SQL329/330/331, this SQL332 is not yet deployed. The full release of SQL332 needs exact-main Test and operational checks.
