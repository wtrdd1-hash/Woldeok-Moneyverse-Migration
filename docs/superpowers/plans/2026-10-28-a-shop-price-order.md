# A2125 — Verified Shop Price Sorting
## Design / bounded brief
Member shop needs an explicit choice between existing category/default order, price ascending and price descending without silently converting WLD bigint strings into IEEE-754 numbers. Server sorts only the existing authenticated, actor-scoped PostgreSQL catalogue; it is an advisory display ordering, never a purchase quote. The query is a strict enum, and invalid requests return HTTP 400 before DB access. The web search form preserves selected order; the Android app-api transparently forwards it with private/no-store responses, including failures. No SQL schema or finance writes are needed.
## Tasks (TDD)
1. Write backend tests: parse sort default/invalid and exact BigInt ordering including ties. Run RED. Implement helper and guarded controller query. Run GREEN.
2. Write web tests: strict query normalization/preservation; run RED. Implement URL search + sort controls, server API parameter forwarding, accessible labels. Run GREEN.
3. Write Android gateway tests: shop owner-scoped cache and query forwarding. Run RED. Implement private/no-store for shop app API. Run GREEN.
4. Recheck main and integrated EN/KO plan, run typecheck/lint/build/unit/integration/isolated PG/security/contract, verify exact SHA and CI. PR Draft/HOLD if any gate fails. Do not deploy or delete unmerged branches.
## Safety
Never change applied migrations or direct grants. `shop_catalog_list_v2` remains the only DB read for catalogue; server never returns another member's inventory. Query validation happens before DB. Ties sort by code then UUID. Preserve previous behavior when sort is absent.
