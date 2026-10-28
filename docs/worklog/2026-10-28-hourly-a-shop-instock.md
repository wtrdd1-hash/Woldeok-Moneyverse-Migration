# A2350 — Verified in-stock shop catalogue filter (Draft / RELEASE HOLD)
## Before work
- 2026-10-28 23:54 KST; main 35971c600f25869c96f1c666d4b9f58927202730, isolated auto/hourly-a-shop-instock-20261028-2350.
- Existing PostgreSQL SECURITY DEFINER shop_catalog_list_v2(uuid) is the source of member-visible stock quantity; null means unlimited and 0 means sold out. The DB already excludes inactive/out-of-window listings. No migration, direct table privilege, financial command or ledger mutation.
- Other A shop price/category/stock filter Draft PRs are not merged; preserve their heads. This feature is only the available-stock toggle, not sorting or categories.
- Plan: RED backend stock filter validation; GREEN backend query; RED/GREEN web filter and Android query/cache regression; targeted/full gates and isolated PG read-only evidence; no merge without exact-SHA Test/CI/restore.
## In progress
- Tests authored first; verification evidence follows.
## Finished
- Pending.
- RED: backend test failed for missing stock filter module; app gateway test failed because upstream public cache header was preserved. GREEN implementation adds strict stock validation, server filtering of SECURITY DEFINER read results, web GET checkbox/search preservation, and app gateway no-store. Next: run tests and security gates.
