# Inventory owner-read truth and Android privacy — bounded P1 repair
Baseline: origin/main 353c6d5d6ddbc14b1067e84f9c4a127bab1c3834, 2026-11-01 KST.
User goal: owner inventory must never present upstream failure as empty holdings. Android owner holdings must override upstream public caching/indexing.
Existing contract: authenticated GET /api/v1/shop/holdings; SECURITY DEFINER shop_my_items_v2(p_actor); /inventory and /app-api/v1/shop/holdings.
No new route, migration, direct DB grant, financial write or raw actor disclosure.
TDD: (1) pure parser verified-empty vs malformed (2) frontend page error/retry vs empty (3) app-api private/noindex/no-referrer on success/error and malformed 200 -> 503 (4) backend controller malformed source -> 503 (5) full test/build/typecheck/lint/contract/real PG/exact SHA CI, then hold for official Test/restore.
Rollback: revert candidate branch; no data mutation. Release HOLD until all gates.
