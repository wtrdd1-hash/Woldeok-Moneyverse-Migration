# v2026.10.15.678 — Start and decision ledger
- 2026-10-15 KST, user asked for deeper treasury-wide planning and **development**.
- Using miniPC MCP; exact GitHub origin/main moved from f2bf939e to **a24a8ae9e0d14dbd63738f5bb7e4e857ca412c13**. Preserved local main and previous v675/v676 branches. New isolated `fix/treasury-reconciliation-evidence-v2026.10.15.678`.
- Read consolidated planning/standards and domain treasury specs, prod-v600 scheduler/source from previous read-only audit, and existing reconciliation frontend/backend. Production SWF currently had is_enabled=true at prior observed time. This tranche does **not** mutate production.
- Ruling: a fiscal vault is not automatically the Economy Core TREASURY account. Compute independently from fiscal ledger and always mark cross-ledger provenance UNVERIFIED until a transaction-link bridge exists; show DISCREPANCY when subsidiary journal is wrong. No invented spendable value.
- Start milestone: design/plan written before source edit. Intermediate testing and result ledger to follow.

## S1 intermediate verification and runtime diagnosis
- Original v677 branch started from main a24a8ae9; main advanced to b70cedbc for unrelated feature review, then to a37b7338 for AI newsroom. To prevent merge overlap with concurrently edited integrated documents, copied only our owned source + docs into a fresh dedicated v678 worktree based on b70cedbc, later refreshing origin/main before final rebase.
- Read-only SQL verified vault-vs-fiscal journal MAIN 45, EMERGENCY 15,139,250 WLD absolute gap 15,139,295 and MAIN row 45 WLD continuity issue (2026-10-07 03:43 UTC). No automatic balancing or live corrections.
- TDD red: repository five tests returned false RECONCILED; green five tests and 18 existing service tests. Admin UI two tests failed before correction, passed after. Frontend production build original Turbopack failed internal google font aliases; Webpack compiled but Next route failed invalid extra exported loadGrants/saveGrants; new Next build-route module test red confirmed two extra keys. Extracted server-only historical JSON read-only loader, removed write helper, maintained 503; test green.
- Initial isolated worktree full backend tests 1,190 pass / 391 DB skipped; frontend 1,208 pass; backend/contract/frontend typechecks and frontend Webpack build on v678 all exit 0. Final after rebase still required.
- Note: Redis, live Test backend API, authenticated finance/E2E and exact production acceptance were not tested. No Production/Test service or DB mutation.

## S2 final and release status
- Planned after exact-main refresh, full suite and PR evidence. Production remains BLOCKED while live hourly SWF simulation and direct SQL financial mutations persist.
