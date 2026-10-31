# Owner shop holdings attention repair — implementation plan

## Source evidence and choice
The member shelf currently sends `status=attention` while the Nest endpoint reads only `filter`. The existing database read is `shop_my_items_v2(actor)`, and the preexisting `filterShopHoldings` helper already preserves bigint precision for positive arrears. Use the existing read model, not a new SQL migration or a direct table grant.

## RED → GREEN → review
1. Add failing Nest tests for positive arrears with zero unpaid weeks and unsupported/duplicate filter.
2. Add failing Next page URL tests and Android app-api tests for invalid query, stale 200, privacy headers and no forwarding on 400.
3. Implement strict controller parsing and use the existing precision-safe helper. Route member page to `?filter=attention`; fail closed on unverified filtered payloads.
4. Add Android gateway strict validation and private headers for all holdings responses; validate successful attention rows before returning them.
5. Recheck latest main, run targeted/full gates and real PostgreSQL owner function read; record exact SHA and CI, then Draft PR only if release gates incomplete.

## Acceptance
Only authenticated member's `shop_my_items_v2(actor)` rows are used. Filter includes suspended, unpaid weeks or positive canonical arrears, without JS Number conversion. No user ID is accepted from the query. Android never exposes a stale success-shaped unfiltered response. Empty verified results and upstream failures remain distinguishable. Existing purchase/equip and financial idempotency remain unchanged.
