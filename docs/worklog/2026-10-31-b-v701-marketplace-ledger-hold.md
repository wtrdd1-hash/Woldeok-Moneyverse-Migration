# Backend B v701 — Marketplace ledger-settlement safety hold (DRAFT / RELEASE HOLD)

## Start / scope
- Started: 2026-10-31 23:35 KST. `origin/main` = `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`.
- Independent worktree: `auto/hourly-b-v701-marketplace-ledger-hold-20261031-2335`.
- QA v1423: Production app role has broad direct account balance DML; marketplace create/buy/bid SQL functions directly UPDATE account_balances without canonical ledger, but main already guards these three service calls; 552 Treasury-unlinked transactions and independent restore/Test identity remain blocked. No claim of actual member loss.
- Other work: B v699 Draft #2216 DB identity; B v700 uncommitted startup ACL gate; QA Draft #2220 host identity; C #2217/#2219, planning #2218. This change does not touch their files or deploy.
- Root cause: existing service holds listing create/buy and bids, **but** auction creation and P2P proposal/accept/confirm remain open. `confirmTrade` marks a trade COMPLETED without atomic asset/WLD transfer. Direct auction/trade proposals create misleading unsettled commitments.

## Plan / checkpoints
- [x] Read AGENTS, README, EN/KO planning, QA, open PR/CI; inspect affected backend + migration 232 and SQLSTATE error mapping.
- [x] RED: write service-level tests proving unsafe money/escrow/trade actions must fail with 503 before any SQL or broadcast; existing read/cancel/appraisal unaffected.
- [x] GREEN: extend existing service-level hold to four unguarded auction/trade mutations, keep explicit temporary hold and truthful HTTP error; preserve read and unwind paths.
- [ ] Focused tests, lint/typecheck/build, broader tests, isolated DB/official Test gates where safe.
- [ ] Re-fetch latest main and EN/KO plan; log exact SHAs, PR/CI and release HOLD. No main merge or Production without all gates.

## Contract / safety
- Affected mutation methods return HTTP 503 with stable code `MARKETPLACE_LEDGER_SETTLEMENT_UNCERTIFIED`, without SQL, WLD or item changes. Read-only listings/auctions/trades and cancellation/unwind remain available. Appraisal uses existing ledger-first SQL function. No API schema, DB migration or financial data changes.
- Backend-only containment is **not** a DB-layer privilege fix: existing direct SQL EXECUTE and Production role grants remain P0, and an independent forward-only migration/review is required before enabling writes.

## Checkpoint 23:38 KST
- RED 4/4 new cases failed before implementation; existing createListing/buyListing/bidAuction were already held in main, so no duplicate rewrite.
- GREEN added service-level holds to auction creation, P2P proposal, acceptance and confirmation; existing 3 holds preserved. Focused service/controller/appraisal suite 16/16 PASS.
- HTTP-level 4 additional route tests added to verify Nest 503 propagation and zero DB calls.
