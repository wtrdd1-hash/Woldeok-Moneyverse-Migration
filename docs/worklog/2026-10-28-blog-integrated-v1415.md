# v2026.10.28.1415 — Blog end-to-end remediation integration

Status: SOURCE QA FINISHED / RELEASE BLOCKED. Version sequence: 1415.1 audit, 1415.2 source fixes, 1415.3 tests/QA, 1415.4 release assessment.

## Before work / record
- Owner requested implementation after v1413 production audit.
- Authoritative sources: AGENTS.md, latest integrated planning master, v1405 two-hour no-approval/no-auto-withdraw policy, v1412 verified DB publisher, v1413 read-only QA, v1414 source discovery, docs/RELEASING.md.
- Initial main a28bed9aa40ff74d492824ae12892a7d52132fdd. Separate clean worktree protects Gemini/others and original main.
- Concurrent branches: test/blog-verified-release-qa-v1413, fix/blog-verified-admin-v1412-1, feat/blog-auto-source-search-v1414. Selectively reconcile, never blindly merge worktree changes.
- Highest priority defects: legacy JSON POST bypass; public duplicates/test titles/no citations; /api/v1/blog/verified HTTP 500; missing migrated prod backend; public sitemap/SSR and admin links drift.
- Never automatically unpublish existing owner-approved live posts; do not restore 199 owner-withdrawn legacy posts.
- Real Test, DB/auth/security, finance, immutable identity and zero-downtime preflights remain prerequisites for Production cutover.

## In progress
- [x] Review candidate diff overlap and reconcile latest main
- [x] Implement fail-closed legacy route, verified SSR/admin/discovery integration
- [x] Add anti-regression tests for unsafe legacy and SEO, include current branch outputs
- [x] Full and focused tests; official Test identity attempted (BLOCKED)
- [x] Re-fetch main; push branch and publish internal/GitHub bilingual update

## Finished
Source branch builds/tests passed; official Test/Production release remains blocked as documented below.

## v1415.2 implementation checkpoint (2026-10-28 KST)
- Combined scoped changes from existing owner branches v1413, v1412.2 and v1414 in a fresh origin/main worktree; no concurrent developer/Gemini branch mutation.
- Retired authenticated legacy JSON writer (admin/cron now fail-closed 503, anonymous 403); no direct JSON overwrite/fabricated receipt/AI disclosure spoofing in that endpoint.
- Verified DB articles now appear in native SSR hubs and canonical metadata; admin can list PUBLISHED/WITHDRAWN DB posts, and BFF delegates explicit DB edit/withdraw via existing authenticated API.
- Added dynamic source discovery and independent primary-source gate; fixed broken CN central bank economy URL with checked official source.
- Corrected isBlogDiscoverable to reject WITHDRAWN even for older manual posts; legacy owner withdrawal remains authoritative; no automatic timed withdrawal introduced.
- Real sitemap re-check CORRECTS earlier v1413 assumption: ordinary /sitemap.xml has no blog article slugs, but /sitemap-blog.xml does include active live slugs, and /sitemap-index.xml lists that blog sitemap, while robots references the index. No main sitemap inclusion defect proven.
- Live production woldeok_moneyverse_dev database lacks blog_verified_articles, blog_publish_verified, blog_admin_moderate (read-only query). This explains an important likely reason for new verified GET HTTP 500; no production migrations were applied.
- Focused 39 backend and 19 frontend tests PASS, contract build + both TypeScript + changed-file lint PASS. Full suite/build/official Test pending.

## v1415.3 full local QA
- All backend 1,934 PASS / 440 environment-dependent skipped (234 passed files, 70 skipped).
- All frontend 1,868 PASS (352 files; NODE_ENV=test). First run without explicit test environment failed existing safety fixtures; corrected invocation passed all, not a product change.
- Database 45 PASS / 3 skipped. Contract build, backend/frontend typecheck, changed-file lint zero errors, backend Nest production build and frontend Next production build PASS.
- Read-only public E2E tool's Production-origin refusal test PASS. Real Test endpoint was not bound to this candidate.

## v1415.4 finished source-level QA, release BLOCKED
- Official Test identity preflight for candidate cb6bc27bb0734b6fe5ad2a6b103cddbc0f3886d2 returned nonzero: missing /srv/moneyverse-data/releases/test-current. Test API exposes older unrelated version.
- Production dev-db queried read-only: missing verified table and both SQL functions. Do not apply migrations to live financial shared DB outside official Test/release gates.
- GitHub CI for cb6bc27 was still IN_PROGRESS when observed. No merged main, no official Test exact-identity PASS, no Production promotion.
- The current live 11 publicly accessible unverified articles remain unchanged. No automatic takedown; owner-controlled moderation requires appropriate authorization.
- Latest origin/main rechecked, SHA unchanged a28bed9aa40ff74d492824ae12892a7d52132fdd at last checkpoint; independent worktree avoids overwriting collaborator changes.

## v1415.5 — User-ordered PR/CI/Test/Production promotion attempt (started 2026-10-28 14:24 KST)
- User explicitly requested completion through PR CI and Production promotion; no new policy override for finance/DB identity or session safeguards.
- Latest origin/main a28bed9aa, PR #1695 draft head 9f11360a; GH CI #3969 classify/policy PASS and runtime-check IN PROGRESS on first inspection.
- Observed Test test-current symlink points to immutable 2026-10-21 test generation, not candidate; published Test /api/version 9f39f041...; verify live symlink and target rather than trusting one prior host preflight exception.
- Read release guide's financial/identity/backup contract, identify actual service/DB before migrations or traffic switches. Never take over someone else's Test/production release workstream without compatibility evidence.

## v1415.6 CI build failure investigation
- GitHub PR CI #3969 failed run pnpm build, NOT lint/policy. GitHub job log: Next 16.4.2 Turbopack emits 496 font resource errors (Noto Sans KR), specifically next/font/google queries have exactly one entry.
- Reproduced alternative production build using Next explicit Webpack backend: compilation PASS, TypeScript PASS, generation of 609 pages PASS; local timeout 110 s occurred in trailing build-trace collection, not code compilation. Final build completion is not yet certified.
- Scoped code change: frontend package build script uses next build --webpack until upstream Turbopack CJK font loader fixed. Does not change CJK font CSS or runtime content. Rerun full CI and complete local build required.
- Remains blocked by official Test/Production identity and three finance app-role DML grants until independent gates pass.
