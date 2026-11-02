# Development A — Public board stock-symbol ordering (2026-11-02 21:25 KST)

## V1 — Before work (21:27 KST)
- Task: P1 user-facing bounded stock-symbol ordering on public board, across Nest/API/SQL/Next/Android app-api; release default unchanged.
- Source: `origin/main` SHA `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`, `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md` (English canonical) and `.ko.md` checked. Project plan on main is v1518; newer planning PRs are not merged, so no proposed feature is treated as approved. Read latest QA/CI/PR listings. No overlapping PR for stock-symbol ordering found.
- Start remote branch count (including main): 278; open PR count: 256. Other developers' working trees and uncommitted files in the primary checkout are protected; only this isolated worktree may be changed.
- Bounded design (no new database schema): read existing `public.member_board_public_list_with_stock(50)` and sort its bounded, public, source-owned snapshot by ASCII uppercase stock symbol, then stable UUID, with untagged posts last. Keep existing default recent ordering and `stock`/`q` filters. Expose `sort=stock-symbol` through Nest, Next and Android, validate exactly one sort query and reject unsupported parameters. Android requires an explicit source-applied marker and validates the sorted 50-row result, unique UUIDs, valid stock symbols and timestamps. Search-specific pages are noindex/no-store; default public page stays indexable. No private user data, new grants, migration, ledger writes or release.
- Alternative rejected: sort all historical posts, which would change the bounded public contract and require new index/function/migration; avoid an unreviewed applied migration.
- TDD: add failing controller/service/UI/Android tests; implement minimal code; run full gates and real PostgreSQL read-only proof. Preserve exact SHA and report any blocked gates.
- Release: HOLD until complete gates, official Test exact-SHA E2E, backup restore, security and GitOps approval. No production changes or branch cleanup unless provably safe.

## V2 — In progress (21:30 KST)
- TDD RED: Nest 3 failures / 19 passes; Frontend 4 failures / 2 tests files, expected missing sort support and verifier.
- TDD GREEN: Nest focused 22 PASS, Frontend focused 6 PASS. Initial Nest regression (default mock expected two args, received third `undefined`) repaired without changing default API semantics.
- Typecheck: contract build PASS, Nest PASS, Next PASS on this worktree.
- PostgreSQL 17.11: real public read function returned 1 untagged post; app role EXECUTE=true. Read-only synthetic four-row SQL sorted AAA/aaa/WDX/untagged, stable UUID tie. No database write. Existing DEV least-privilege P0 persists: `account_balances` UPDATE=true and `user_items` DELETE=true for `moneyverse_app`; Production unverified.
- Midpoint `origin/main` still `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`; English/Korean plan blobs `c0d71553`/`d9e508a1` unchanged; open PR count 256. No other worktree touched.
- Pending full gates, security audit, final SHA CI, official Test exact-SHA and release hold.

## V3 — Finished
- Pending.
