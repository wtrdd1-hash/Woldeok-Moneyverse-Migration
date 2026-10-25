# Development B v541 — Marketplace literal search and bounded pagination

## Before work — 2026-10-25 23:39 KST
- Canonical `main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (remote confirmed before branch).
- Branch: `auto/hourly-b-marketplace-filter-v541-20261025-2335`; independent worktree on the data volume.
- Read: AGENTS.md, README.md, canonical English and auxiliary Korean living plans, relevant Superpowers skills, recent QA and open PR titles/changed files.
- Overlap protection: C #1209 edits marketplace frontend only; planning #1340 documents search semantics only. A #1270 edits auction backend; B #1327 edits P2P backend. This task will touch **only** listing filter/query DTO and focused tests, not auction/P2P paths.
- P1 verified code defect: `listListings` interpolates unescaped `%`, `_`, and `\\` into ILIKE, making user literal search behave as wildcard; created_at-only pagination has unstable ties; DTO has no search/category length cap.
- Scope: literal escaping, stable `(created_at DESC, id DESC)` order, query caps, and RED/GREEN regression tests. No new endpoint, database migration, grants, financial writes or fake ledger receipt.
- Design: treat search as a literal substring, not a SQL pattern; bound resource use at validation edge; preserve current response shape and category semantics.
- Existing blocker: listing read uses direct table SELECT; app-role ACL may reject it. Do not claim official Test E2E or whole marketplace functionality without an independently verified least-privilege DB read contract.

## In progress
- [ ] RED focused regression tests
- [ ] GREEN minimal code change
- [ ] build, lint, typecheck, unit, integration, security, API contract, real PG (isolated), CI
- [ ] re-fetch latest main and planning, PR/QA conflict review

## Finished
Pending.
