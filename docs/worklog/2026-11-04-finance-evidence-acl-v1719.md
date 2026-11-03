# v2026.11.04.1719 — Financial evidence and certificate DML protection

## START
Owner requested real financial recovery, including minimizing database attack surface of money-recording core. Following actual Production SQL329-331 and public cutover from v1718, inspected live app role effective ACL for remaining sensitive non-canonical financial data. Read integrated DOCS_INDEX, AGENTS, Treasury Core, current SQL329-331, mint and central-bank service source and release guide.

Critical live findings: web DB role still has INSERT/UPDATE/DELETE on mint_certificates, retirement_certificates, treasury disbursements, bond orders/coupon logs, policy configuration and tax assessment tables, plus UPDATE/DELETE on treasury_donations. Such privileges permit record/receipt forgery or deletion even though canonical ledger and balances are protected. Mint and retirement issuance controller is already fail-closed; their direct TypeScript DML code is currently unreachable. Central bank monetary policy/decisions have active direct TypeScript writes and are deliberately EXCLUDED, pending DB-owned wrapper redesign. Budget vote submissions are also excluded.

Proposed smallest safe forward-only v1719 SQL332: revoke app/PUBLIC raw record mutations from clearly inactive/DB-owner-write-only financial evidence tables, preserve legitimate SELECT, and verify actual effective table/column privileges after migration. Prove true moneyverse_app treasury donation and NPS escrow positive flows in network-isolated restored Production clone under SQL329-332, use Test and zero-downtime live release only on verified success. Do not synthesize WLD, delete records, or change currently active central bank policy writes.

## MID — pending
## END — pending
