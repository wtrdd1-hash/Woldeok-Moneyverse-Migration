# v2026.11.09.1946 — Blog production restoration (EN)

## START — 2026-11-09 22:32 KST
- Owner directive: repair and promote blog web routes and verified two-hour automatic publication into actual Production.
- Baseline main SHA: 427c5b1eb01c7f6c9ad9920c00e7ab3728eb2450. New isolated worktree `fix/blog-live-restoration-v2026.11.09.1946`; other agents' worktrees and uncommitted root implementation_plan.md untouched.
- Actual Production symlink v1944 SHA 941982719517 and Nginx blog-only upstream :4565. Blog `/blog` and locale routes redirect 308 to `/tools`; `/sitemap-blog.xml` redirects to general sitemap; verified article API 200, count 12, latest published 2026-11-09 06:07 KST. Main next.config has five explicit redirects, metadata noindex, empty blog sitemap. Blog worker v1419 timer disabled; worker failed at 09:26 KST with 80-second model abort, no later verified publication. Legacy file-writer `/api/blog/generate` 503 is deliberately and correctly retired.
- Safety: preserve historical content, unique proof receipts and manual moderation policy; never re-enable old unsafe JSON writing, globally enabled economy jobs, unvetted ads or financial DB writes. Dedicated blog-only Test / blue-green release required; verify receipt and public render, not health alone.
- Plan: restore guarded verified blog frontend route, index/sitemap for independently verified posts only; repair AI publisher deadline with bounded retry and isolated Test; exact-SHA branch tests/build; stage blog-only canary and Nginx atomic route cutover with rollback, verify subsequent auto publication.
- Status: IN PROGRESS; no Production changes performed at START.

## MID — 2026-11-09 22:40 KST
- Rechecked main 427c5b1e, no new owner commit. Confirmed v1944 Next `BLOG_API_ORIGIN=http://127.0.0.1:4504`, SEO true, ads true, and the Nginx :4565 old frontend emits 308 `/tools`; verified API returned 12 receipt-backed public posts.
- Implemented removal of five conflicting Next blog/sitemap redirects; verified article native SEO index/canonical and blog hub canonical; idempotent receipt-only XML sitemap + robots declaration; block Google ad provider and units on all uncurated blog paths; model generation per-section timeout 80→180 seconds, output bound 490→360 tokens, no relaxation of source/locale/duplicate gates.
- Focused branch tests: frontend 47/47 PASS, backend 13/13 PASS after isolated offline install. Added targeted route/sitemap/ads regression tests and model budget assertion. New code remains branch-only; no Test/Production changes, publication timer remains disabled.
- Pending complete build, Test frontend/API, external GitHub CI and blog-only Production cutover. Do not assume that `blog.rotation_2h` hourly `done` implies a published post.

- Test one-shot actual isolated DB publication at 22:51 KST failed `TITLE_TEMPLATE_INVALID` **before model call** for CN/CODING slot 22:00 (slotIndex 9). This is a new source-confirmed defect, not a successful article. v1946.1 adds native-language safe suffixes only to short original templates, preserving the 25-char minimum and unique per-template title; adds focused regression. Worker timer and Production data untouched.

## OWNER OVERRIDE — v1946.2, 2026-11-09 23:12 KST
- Owner clarifies that independently UNVERIFIED AI posts shall also publish without human review, with advertising inventory. Google Publisher Policies explicitly disallow Google-served ads on AI-generated content absent manual review/curation, recorded as external compliance/account risk. No verification receipt forgery.
- Implemented dedicated `UNVERIFIED` JSON sidecar under shared data, separate fixed Test file, atomic 0600 writes, DB leader lock, period idempotency, no global scheduler activation. Native-country public blog, article, list API and sitemap include explicit PUBLISHED unverified posts; WITHDRAWN excluded, AI/non-verified labels visible. Owner-only withdrawal path and advertisement-path implementation updated.
- Local focused tests for store and frontend pass; historic sitemap tests updated to restored product policy. Exact source Test/CI, actual unverified publication and Production cutover not yet proven.

## END
Pending.
