# PvP ledger integrity containment — v2026.10.17.750

**English canonical** | [한국어](PVP_FINANCE_CONTAINMENT_v2026.10.17.750.ko.md)
**Status:** Isolated source implementation and local verification / **NOT RELEASED**.
**Baseline:** main `fb8112a7df442a7b27da91bcbfd76e5ef84fccee`. Existing financial P0 authority v523/v542/v543, v713 and v737/v743 unchanged.

## Problem / affected domain
`backend/src/casino/pvp-arena.repository.ts:joinAndPlay` contains direct debit of loser's `account_balances`, credit to winner and treasury fee with no certified canonical immutable ledger command; original room creation advertises future settlements. The older settlement description is *not* an actual balanced Core receipt. Keeping that write path available risks a difference between wallet projections and account ledger.

## Implemented narrow safety containment
- New `PvpArenaSettlementHoldError` extends Nest 503 `ServiceUnavailableException`, stable `PVP_LEDGER_SETTLEMENT_UNCERTIFIED` response code.
- **Both** `createRoom` and `joinAndPlay` throw the hold **before a database query**. This is unconditional, not bypassable by a generic environment feature flag. Never replace by feature flag alone.
- `listWaitingRooms`, `listRecentBattles` and creator-owned `cancelRoom` remain available to retrieve evidence and close old waiting rooms.
- Frontend announces the temporary pause, disables all creation/join buttons and protects handler entrypoints from accidental calls; no misleading active matching or success animation.
- Scope does not include the general casino and does not certify financial migrations. Historical SQL remains in repository for reviewed future migration; it is unreachable through repository calls while unconditional hold remains.

## Evidence and release limitations
- Backend new red-green test: **3 failures / 1 passed** before change, **4/4 passed after**. Cover no SQL on create/join, 503 response, cancellation, flag non-bypass.
- Frontend new hold state test: **1/1 passed** when run with correct test environment.
- Entire backend unit suite: **1,230 passed, 396 skipped**. Entire frontend: **1,255 passed**. Backend Nest build and frontend production Next 16 Webpack build **PASS**; 590 static pages rendered in build.
- All skipped DB tests remain release gaps, as do actual finance table DML privileges, 19 uncertified opening/projection balances, migrated schema parity, authoritative isolated finance Test, v530 authenticated route QA ×5, same-SHA session/rollback/canary.
- No privilege, migration, balance, runtime service, backup, Test release or Production release changed here.
- This is **containment, not a completed wagering product**. Replacement requires v713 recommended Model A or reviewed escrow Model B with same-txn balanced posting, idempotency, safe integer amount boundary and separate new Test/Production acceptance. Keep PvP wagering disabled until then.

## Operational next order
1. Preserve current disabled wager behavior in all callers; audit negative requests and existing waiting-room recovery.
2. Obtain certified opening ledger provenance and limited app-role privileges on production-equivalent restored isolated DB; migrate all other direct writers in independent owned slices.
3. Build ledger-backed PvP commands and E2E negative/duplicate/concurrency cases; replace hold only after evidence.
4. Run source-exact CI/Test, authenticated UI and operational zero-downtime promotion with rollback and public version smoke; do not treat PR merge as promotion.
