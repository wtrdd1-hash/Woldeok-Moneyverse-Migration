# Most-discussed board snapshot — implementation plan

1. Add red regression tests for invalid/duplicate `sort`, bounded PostgreSQL ordering, and legacy default order.
2. Add Nest allowlisted `sort=popular` and SQL order over `member_board_public_list_with_stock(50)` only. No migration, direct table grant, ledger or mutation.
3. Add verified Android gateway request and response contract: `appliedSort:{order:'popular',scope:'latest50'}`, safe counts, monotone order, unique UUIDs, valid timestamps, reject ambiguous success.
4. Add accessible web sort select preserving existing stock/title query; truthful 50-row scope, explicit error state, noindex/no-store filtered results.
5. Run targeted RED/GREEN, full gates and read-only PostgreSQL proof. Recheck main mid and before PR. Draft/HOLD until official Test exact SHA, independent restore, ACL and GitOps gates pass.
