# Recent Public Board Period Filter — Design

## Purpose and bounded scope
Visitors can filter the latest 50 public board posts to the last 24 hours, 7 days, or 30 days, while retaining existing stock-symbol and literal-title filters. This does not search older archive rows and does not modify balances, identities, migrations, or database grants. Existing unfiltered behavior remains unchanged.

## Source and API
Nest `GET /api/v1/board/public/stock-posts?period=24h|7d|30d` validates exactly one optional period. `StockCommunityService.publicList` computes one UTC cutoff and passes it as a parameter to SQL filtering *after* `member_board_public_list_with_stock(50)`; it returns `period` and `cutoffUtc` with posts when a period was requested. This prevents false claims that a historical archive was searched. Android App API validates the applied period, a plausible UTC cutoff, bounded/unique UUID rows and creation times before returning HTTP 200; stale backend 200 must fail closed to 503. Filtered Android and browser responses must be no-store/noindex. The web displays a labelled period selector and truthful scope text, preserving stock/title filters.

## Risks and rollback
Clock differences between API and Android are tolerated by a 2-minute cutoff window; a larger drift returns 503 instead of unverified success. SQL uses a bound timestamptz value, never interpolated user input. Rollback removes the optional period parameter/UI; existing endpoint and DB function remain unchanged. Official Test exact SHA, independent restore, P0 ACL and security gates remain release blockers.
