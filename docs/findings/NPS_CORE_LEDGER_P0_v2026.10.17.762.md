# P0 pension settlement hold — v2026.10.17.762

**English canonical** | [한국어](NPS_CORE_LEDGER_P0_v2026.10.17.762.ko.md)
**Status:** implementation candidate; NOT yet the public Production version.

## Proven actual cause
An authentic October 11 Production backup restored to an isolated Test PostgreSQL, compared with October 17 current Production using READ ONLY transactions, showed exactly one USER_CASH account gained 4,410 WLD without a corresponding Core ledger posting. Its real pension payout receipts show 98 × 45 WLD = 4,410 WLD within the period, including the final account update time. No private account identifiers are released. The older 4,774,778 WLD unexplained balance delta remains distinct and uncertified.

## Unsafe source writers
NationalPensionRepository.contribute, liquidate, distributeHourlyPensionPayouts and the retirement-state toggle left an unbalanced cash/fiscal boundary. AutoSovereignWealthFundService independently had a second NPS payout loop that credited USER_CASH and inserted pension payout logs in a direct DO block.

## Implemented
1. Four repository mutations fail closed before SQL with Nest HTTP 503 and stable code PENSION_LEDGER_SETTLEMENT_UNCERTIFIED. No environment flag escape. Existing read/history functions remain.
2. Remove the separate direct NPS payout block from auto-SWF. Other unsafe fiscal and bond writers still require follow-up, not implied fixed.
3. Pension portal offers truthful suspended-state notice, no guarantee of automatic WLD, disabled mutation buttons and handler guards.
4. Forward-only PostgreSQL migration **275-pension-ledger-settlement-hold.sql** revokes app role pension-payout and contribution log writes and pension account UPDATE/DELETE; preserves payout history SELECT. It does not alter wallets or ledger entries.

## Evidence and operational limits
New backend TDD RED 5 → GREEN 5, auto-SWF safety RED 1 → GREEN 1, UI RED 1 → GREEN 1. Full backend 1,243 PASS / 396 DB-dependent SKIPPED, Nest build PASS, frontend 1,256 PASS and TS PASS. Real isolated restored Production database accepted forward SQL 269–275; 40 balances, 1,692 Core postings unchanged; role-negative pension UPDATE rejected (SQL permission denied). Live Production money, DB schema, grants and release not changed by this candidate.

Replacement requires an explicitly funded, idempotent, balanced Economy Core payout, immutable receipts, manual/admin authorization review and concurrent retry negative tests. No invented backdated postings or permission to pass the existing 19 historical discrepancies. Full exact-SHA Test, authenticated v530 five-pass QA and zero-downtime Production host promotion remain independent gates.
