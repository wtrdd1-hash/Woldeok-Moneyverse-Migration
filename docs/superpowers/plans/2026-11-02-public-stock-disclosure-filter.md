# Public stock-discussion disclosure filter — execution plan

**Goal:** Allow readers to filter the latest 50 public posts by the author's *self-reported* stock position disclosure without implying verified holdings.

**Scope:** Read-only query predicate on the existing `member_board_public_list_with_stock(50)` SECURITY DEFINER result, Nest controller/service, Next public board form and robots policy, Android app API validation. No migration, grants, balance, trade or ledger writes.

1. Add failing service tests for literal, parameterized disclosure filtering after bounded DB function; reject invalid values. Add HTTP tests for malformed, duplicate and unknown parameters; expect applied filter evidence.
2. Implement Nest SQL predicate with parameter `$4`, preserve `stock` and `q`; return `appliedFilters` only for filtered requests.
3. Add web parser tests and implement labelled select, query propagation, explicit self-report caveat, filtered empty state and noindex.
4. Add Android app API tests for duplicate/invalid filter, upstream unverified 200, mismatch, duplicate UUID and verified empty response. Implement fail-closed 400/503 and no-store/noindex.
5. Run target and full test/build/lint/typecheck/security/contract gates; inspect real DEV PostgreSQL read-only transaction and exact SHA CI. Record blockers, keep PR Draft/HOLD if official Test, restore or ACL fails.
