# v2026.10.28.1401 — Treasury/Mint/Central Bank Audit Worklog

## Start (2026-10-28 KST)
- User request: analyze every treasury, mint and central-bank function and determine whether it actually operates.
- Connected through the authorized mini-PC MCP; production release `/srv/moneyverse-data/releases/prod-v2026.10.22.toss-redesign`; active code Git SHA `a28bed9aa40ff74d492824ae12892a7d52132fdd`.
- Read `AGENTS.md`, `DOCS_INDEX.md`, living project plan, integrated planning master, v523 role separation and v542 integrity correction.
- GitHub remote `main` at start `a28bed9aa40ff74d492824ae12892a7d52132fdd`; existing local integration tree was left unchanged. Isolated GitHub branch `audit/treasury-mint-centralbank-v2026-10-28-1401`.
- No Production data writes, fixture resets, scheduler enablement or fake authenticated requests.

## Middle
- All core services active; actual protected API without credentials correctly 401; public treasury page HTTP 200 contained fake fiscal numbers and mock ledger events.
- Identified parallel legacy in-memory mint and central bank and newer DB policy/certificate backend.
- Read-only DB inventory: 169 CANCELLED policy orders, mint/retirement certificates 0/0, 318 historical regulator events, 5 treasury vaults, 552 treasury records, 6 disbursement records, 1 donation, 3 bonds / zero holdings, coupons, orders and repos. Source-backed reason to withhold full operational claims.
- Monetary DB switch off; SWF DB switch on while production scheduler fail-closed. Liquidation errored twice with inconsistent SQL parameter type, observed at 14:24 KST.
- Lower-case `credit`/`debit` direction correction: 890 canonical transactions, 1,810 postings, **zero** mismatches. Latest reconciliation snapshot 2026-10-24; separate treasury payout receipts appeared 2026-10-28.
- `moneyverse_app` direct money-table DML is enabled; migration 272 absent. Targeted Vitest suites against installed release: **6/6 files, 40/40 tests PASS**; this is not authenticated DB E2E.
- Rechecked remote main before reporting; remained `a28bed9aa40ff74d492824ae12892a7d52132fdd`.

## End / handoff
- Findings in `docs/findings/TREASURY_MINT_CENTRAL_BANK_RUNTIME_AUDIT_v2026.10.28.1401.md` and Korean equivalent. Tracked remediation FIN1401-01 through FIN1401-08.
- Financial readiness HOLD: public fake telemetry, legacy in-memory authorities, direct balance updates, incomplete least privilege, SWF runtime error, missing scheduler data source and missing authenticated exact-SHA finance Test acceptance.
- Source/API/DB reads and mock unit tests only; **no new feature, no code fix, no GitHub main merge, no official Test promotion, no Production cutover, no money mutation**. This documentation branch is not release approval.
