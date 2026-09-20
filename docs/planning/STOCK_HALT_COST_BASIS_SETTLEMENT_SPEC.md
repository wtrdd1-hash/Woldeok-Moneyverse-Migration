# Stock Halt Cost-Basis Auto-Settlement Specification

> Version: v2026.09.21.315
> Status: Planning / implementation contract
> Korean counterpart: [STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC.ko.md](STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC.ko.md)

## 1. Product rule
When an individual stock enters the configured sale/trading-halt state, every remaining user holding in that stock is automatically settled back to WLD at authoritative acquisition cost basis. This is a server-side settlement, not a market sell order.

## 2. Settlement price and amount
- Prefer each remaining acquisition lot's recorded adjusted unit cost.
- Legacy holdings may use only the authoritative stored weighted-average cost.
- Splits/merges/transfers must carry adjusted cost basis forward before settlement.
- Halt settlement charges no trading fee, tax, spread, slippage or price impact under this contract.
- Missing/invalid cost basis is never guessed from current, opening or last-trade price; the holding is quarantined and final halt completion fails closed.
- WLD arithmetic uses existing integer/fixed-precision representation; floating-point settlement is forbidden.

## 3. State machine and atomic workflow
Required states: `ACTIVE -> HALTING -> HALTED_SETTLING -> HALTED_SETTLED`.
1. Lock the issuer/halt event and reject new buys/sells.
2. Stop ticker/price mutation for that issuer.
3. Cancel or terminally reject pending orders without execution.
4. Snapshot affected holdings and authoritative cost basis.
5. Lock account+holding rows in deterministic order.
6. Create one idempotent command per `{haltEventId, stockId, accountId}`.
7. In one DB transaction, credit refundable WLD and reduce settled shares to zero.
8. Persist receipt, ledger link, before/after quantity and cost-basis method.
9. Mark the halt settled only after every holding is settled or explicitly quarantined.

Retries after timeout/crash must return the persisted result and must never credit WLD twice.

## 4. Ledger and audit evidence
Each settlement retains at least `settlementId`, `haltEventId`, `stockId`, `accountId`, `quantity`, `basisMethod`, `basisUnitAmount`, `refundAmount`, `ledgerEntryId`, `commandId`, `createdAt`, and `sourceVersion`.
User transaction history labels it as a halt/refund settlement, not a normal sell or realized-profit event.

## 5. Deleting a halted stock even when halt history exists
- After settlement completes, the live stock/catalog row may be archived or tombstoned even if halt-event records exist.
- Settlement, ledger and audit rows must never be cascade-deleted.
- Historical rows keep stable stock identity plus ticker/name snapshot or a tombstone reference so rendering does not depend on a live catalog row.
- Foreign keys use a tombstone or `ON DELETE SET NULL` plus immutable snapshot columns; destructive cascade into financial history is forbidden.
- Admin deletion is blocked while `HALTING` or `HALTED_SETTLING` still has unsettled holdings.
- After `HALTED_SETTLED`, deletion/archive is allowed even with halt records.
- If an operational halt-history row is hidden/deleted from ordinary admin views, the deletion itself is audited and immutable settlement/ledger/audit evidence remains.

## 6. Planned API direction
- `POST /admin/stocks/:stockId/halt`: create/reuse halt event and begin settlement.
- `GET /admin/stocks/:stockId/halt-settlement`: return progress, totals and quarantined errors.
- `POST /admin/stocks/:stockId/halt-settlement/retry`: idempotently retry failed/quarantined accounts only.
- `DELETE /admin/stocks/:stockId`: archive/tombstone only after settlement gate passes.
- User portfolio/transactions APIs expose settlement receipts and remove settled quantity from current holdings.

All admin mutations keep existing privileged authorization, recent-auth where configured, CSRF protection for browser sessions, immutable audit and rate/abuse controls.

## 7. Real-DB concurrency/failure tests
Required cases include concurrent halt requests, a trade racing `ACTIVE -> HALTING`, duplicate settlement replay, 2/10/50-account settlement, competing wallet mutations, failure between ledger and holding updates, partial-batch resume, delete-vs-settlement race, missing cost basis, legacy weighted-average holdings and corporate-action adjusted basis.

Invariant: for each account/stock/halt event, credited WLD equals authoritative refundable cost basis exactly once, and settled share quantity becomes zero exactly once.

## 8. UX and observability
- User: clear halt banner and receipt with quantity/refunded WLD; no misleading market-sell wording.
- Admin: pre-confirm affected-holder count and estimated principal, settlement progress/failures/retry, and delete disabled until completion.
- Metrics: halt start/completion/failure, affected accounts, refund total, replay prevention, quarantined holdings and latency; no raw balances, PII or tokens in logs.

## 9. Implementation sequence / release gate
1. `v2026.09.21.315-01` schema/state/cost-basis/tombstone contract.
2. `-02` transactional settlement + idempotency + ledger.
3. `-03` admin halt/progress/retry/delete APIs and authorization.
4. `-04` responsive user/admin UI and receipts.
5. `-05` real-DB concurrency/failure/security regression.
6. `-06` re-read latest Living Project Plan and verify exact candidate SHA on Test across backend/API/DB/UI.
7. `-07` merge only after Test passes, rebuild exact merged SHA, then zero-downtime Production promotion with smoke/rollback evidence.

Production is blocked by guessed cost basis, duplicate credit, share/ledger mismatch, financial-history cascade deletion, unsettled holdings, authorization bypass or unverified exact-SHA Test.