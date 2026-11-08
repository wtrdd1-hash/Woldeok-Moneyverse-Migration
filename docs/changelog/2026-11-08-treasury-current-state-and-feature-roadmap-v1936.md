# v2026.11.08.1936 — Treasury live inventory and 225-feature sovereign roadmap
> English canonical | [KO](2026-11-08-treasury-current-state-and-feature-roadmap-v1936.ko.md) | Status: DOCS / READ-ONLY / NOT DEPLOYED

## Added
- [Detailed EN plan](../planning/TREASURY_SERVICE_CURRENT_STATE_AND_DETAILED_FEATURE_ROADMAP_v2026.11.08.1936.md) / [KO](../planning/TREASURY_SERVICE_CURRENT_STATE_AND_DETAILED_FEATURE_ROADMAP_v2026.11.08.1936.ko.md).
- [39-source EN map](../research/2026-11-08-sovereign-treasury-feature-reference-matrix-v1936.md) / [KO](../research/2026-11-08-sovereign-treasury-feature-reference-matrix-v1936.ko.md).
- [worklog EN](../worklog/2026-11-08-treasury-current-state-roadmap-v1936.md) / [KO](../worklog/2026-11-08-treasury-current-state-roadmap-v1936.ko.md).
- 21 service areas with 225 numbered Korean functional requirements, proposed API map, settlement state machines, data model, risk and P0/P1/P2 delivery order.

## Verified / corrected
- Production public v1770, Test v1742, main updated from b56fdc748d to 4938d491d9 during analysis.
- Current canonical Treasury balance and five virtual-vault aggregate both 191055911 WLD, 895 ledger transactions, 1854 postings, 0 nonbalanced transaction sums in read-only aggregate; current state ≠ proof of historical full settlement.
- 3 grants including approved-but-unpaid 500000 WLD, actual canonical NPS receipt 0, SWF 276 events, 3 bond products but no holdings/coupons, KDIC fund with no premiums/payouts.
- P0: registered pension payout routine directly updates account_balances; SQL341 has no canonical posting. SQL340 SOE dividend uses MINT against Treasury instead of proven enterprise cash and lacks stable period idempotency. Local migration tracking stops at 339.
- /treasury/portal missing standalone path while /treasury renders grant form; logged-out admin BFF 401 is expected.

## Deferred
No SQL or app change, no actual money transaction, official Test, runtime release, Production promotion or authority adoption. Do not deploy SQL340/341 unchanged. New finance commands require isolated implementation, canonical proof, independent restore and exact-SHA Test/Production gates.
