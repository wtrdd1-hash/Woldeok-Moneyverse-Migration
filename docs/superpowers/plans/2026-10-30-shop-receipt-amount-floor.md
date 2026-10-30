# 2026-10-30 — P1 owner-private shop receipt minimum WLD

## Problem and acceptance
Members can search their recent receipts by item name, but cannot constrain the displayed results by a minimum amount paid. The new optional minAmount is a canonical positive decimal integer of 1–30 digits; no leading zeros, signs, exponent, decimals or duplicate parameters. It combines with existing q and searches only the newest 100 owner-scoped receipts, never all history. Unfiltered requests retain the newest 30. The feature is a read-only convenience, not an all-time financial statement.

## Design and isolation
1. Existing PostgreSQL SECURITY DEFINER shop_list_my_purchases(actor,limit) remains the only read path. The application receives an authenticated actor from the session; never accept an owner ID from the query. Do not add migrations, table grants or ledger writes.
2. Nest ShopService validates minAmount before the DB call and filters normalized integer-string WLD using BigInt; controller passes only the optional validated parameter. Search q remains unchanged.
3. Next private BFF rejects invalid/duplicate values and fails closed on inconsistent filtered upstream 200; private no-store and noindex on every result. Web receipt panel offers an accessible numeric input, clear scope disclosure, and no request for invalid input.
4. Android app-api forwards the parameter, rejects invalid/duplicate values before proxying, and rejects a filtered upstream 200 that violates the requested floor. Preserve cookies and private response headers.
5. TDD red/green targeted tests, full gates, isolated PostgreSQL synthetic owner/stranger/ACL/precision ROLLBACK, then Draft PR. No merge, official Test or Production deployment without full exact-SHA CI and GitOps release proof.

## Review and rollback
The existing owner SECURITY DEFINER function is not altered; the filter only narrows already authorized receipts. Read-only rollback: revert this isolated PR; no data migration or financial reversal. The release remains HOLD if baseline full tests, isolated full-migration DB, official Test exact SHA, backup restore or security/SEO/a11y gates are missing.
