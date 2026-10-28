# v2026.10.28.1415 — Blog end-to-end remediation integration

Status: STARTED. Version sequence: 1415.1 audit, 1415.2 source fixes, 1415.3 tests/QA, 1415.4 release assessment.

## Before work / record
- Owner requested implementation after v1413 production audit.
- Authoritative sources: AGENTS.md, latest integrated planning master, v1405 two-hour no-approval/no-auto-withdraw policy, v1412 verified DB publisher, v1413 read-only QA, v1414 source discovery, docs/RELEASING.md.
- Initial main a28bed9aa40ff74d492824ae12892a7d52132fdd. Separate clean worktree protects Gemini/others and original main.
- Concurrent branches: test/blog-verified-release-qa-v1413, fix/blog-verified-admin-v1412-1, feat/blog-auto-source-search-v1414. Selectively reconcile, never blindly merge worktree changes.
- Highest priority defects: legacy JSON POST bypass; public duplicates/test titles/no citations; /api/v1/blog/verified HTTP 500; missing migrated prod backend; public sitemap/SSR and admin links drift.
- Never automatically unpublish existing owner-approved live posts; do not restore 199 owner-withdrawn legacy posts.
- Real Test, DB/auth/security, finance, immutable identity and zero-downtime preflights remain prerequisites for Production cutover.

## In progress
- [ ] Review candidate diff overlap and reconcile latest main
- [ ] Implement fail-closed legacy route, verified SSR/admin/discovery integration
- [ ] Add anti-regression tests for unsafe legacy and SEO, include current branch outputs
- [ ] Full targeted tests and official Test/runtime validation where feasible
- [ ] Re-fetch main; push branch and publish internal/GitHub bilingual update

## Finished
Pending evidence.
