# v2026.11.04.1760 — Real finance service recovery and canonical-money settlement

## BEFORE — 2026-11-04 19:50 KST
Owner repeatedly ordered actual SOE Treasury/NPS/KDIC/SWF/Mint/CB functionality in public Production, not cosmetic cards or read-only health. Images show SOE nominal 365,000,000 WLD and modeled dividend 108,000 WLD/hour (NOT real cash); no authorized Mint orders or certificates; Treasury 0 WLD, SWF policy 77/23 yet execution held.

Current authoritative main 8adb48015ab6781f47e339f12af830a6c9d9c63b, public Production v1742 SHA dfb98c7..., 891 journal transactions / 1829 postings / 42 balances / 0 new finance proofs. Actual Production SQL333 dynamic tax migration applied but not present in main; SQL334 Mint bounded read PR #2683 fails CI due missing SQL333, SQL335 KDIC bounded read in separate isolated branch. Other developers own tax PR #2682 and Mint #2683; do not rewrite their branch, preserve main diff, verify each before merge.

Read integration DOCS_INDEX first, then AGENTS, Treasury Core, release guide, migration-parity, previous authorizations and issue #2366. The canonical ledger is the only authority for WLD. No ad-hoc simulated dividends, auto mint to fix zero Treasury, or broad app DB writes.

## PLAN
1. Reconcile already-applied Production SQL333 with source on contributor PR #2682; verify immutable checksum, guard the rollout with full CI and provenance.
2. Restore Mint DB-backed evidence SQL334 and KDIC Test HTTP500 scoped read SQL335 in ordered branches without corrupting concurrent contributor branches.
3. Add new receipt-backed, approved Treasury/Mint financial commands only after genuine separate-approver policy and funded negative/positive tests on fresh isolated Production/Test copies; do not grant web role raw ledger DML.
4. Test backend/frontend source, migration parity, actual Test current schema and user auth/session, then execute zero-downtime production promotion with rollback.
5. Document start/mid/end and bilingual internal/GitHub changes. Explicitly separate backed funded flows from historical phantom profit obligations.
## MID — pending
## END — pending
