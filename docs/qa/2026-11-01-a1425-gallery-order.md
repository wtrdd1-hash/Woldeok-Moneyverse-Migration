# A 14:25 KST — Gallery recent-24 sort QA (2026-11-01)

Status: P1 implemented in isolated branch; **RELEASE HOLD**. Baseline `9052076301bf1975422731ab50a8b7770dbbe951`.

- Contract: only latest 24 approved public photos from existing `public.content_list_published_photos(24)` SECURITY DEFINER; `sort=oldest|newest` orders within this bounded result, never all-time oldest. Duplicate/unknown parameters 400; unverified Android HTTP 200 -> 503; filtered results no-store/noindex/no-referrer; no private table reads or writes.
- RED/GREEN: Backend 3 failing then 3 passing; Web 3 failing then 3 passing; Android 3 failing then 4 passing.
- Local full: Frontend **2909 PASS** with NODE_ENV=test; Backend **2964 PASS, 2 FAIL, 518 SKIP** (existing profile 401 vs expected 200, repair PR #2265); DB unit **62 PASS, 4 SKIP**. First frontend run without NODE_ENV=test had 496 invalid-environment failures and was superseded, not a pass.
- Typecheck PASS; Lint 0 errors / 1022 existing warnings; Backend build PASS; Frontend Next.js build PASS after fixing PageProps; Android API contract PASS (184 endpoints).
- Real DEV PostgreSQL READ ONLY + ROLLBACK as moneyverse_app: function EXECUTE true, direct photos SELECT false, 2 approved photos. **P0 ACL FAIL:** account_balances UPDATE true, user_items DELETE true. Production ACL not inspected.
- Missing gates: isolated Test exact candidate SHA / authenticated E2E / real-DB integration under exact SHA / full security and WCAG browser E2E / backup restore / GitOps release identity. No production promotion.
- Protected concurrent B/C/planning/QA branches; no branch cleanup, no applied migration edits, no DB writes, no rollback needed. Rollback: revert candidate commit; no DB schema rollback.

## Traceability and branch review
- Feature SHA `ebef822c9e6c5685f6643f896f9d62b9768a6844`; 18 changed files, no migration. Final docs-only SHA and exact-SHA CI status in Draft #2331.
- Main `9052076301bf1975422731ab50a8b7770dbbe951` unchanged at start/mid/final. Remote branches 98 non-main: 93 unmerged, 5 ancestor/equal; open Draft PRs 91, conflicting 22, mergeable 69. Deleted 0; preserve all unique and other-agent branches.
- Security script tests 17 PASS; SEO/color contrast/sitemap targeted tests 12 PASS; production dependency audit no known vulnerabilities. These do not substitute for authenticated browser E2E.
