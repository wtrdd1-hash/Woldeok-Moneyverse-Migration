# v2026.11.09.1946 — Blog production restoration (EN)

## START — 2026-11-09 22:32 KST
- Owner directive: repair and promote blog web routes and verified two-hour automatic publication into actual Production.
- Baseline main SHA: 427c5b1eb01c7f6c9ad9920c00e7ab3728eb2450. New isolated worktree `fix/blog-live-restoration-v2026.11.09.1946`; other agents' worktrees and uncommitted root implementation_plan.md untouched.
- Actual Production symlink v1944 SHA 941982719517 and Nginx blog-only upstream :4565. Blog `/blog` and locale routes redirect 308 to `/tools`; `/sitemap-blog.xml` redirects to general sitemap; verified article API 200, count 12, latest published 2026-11-09 06:07 KST. Main next.config has five explicit redirects, metadata noindex, empty blog sitemap. Blog worker v1419 timer disabled; worker failed at 09:26 KST with 80-second model abort, no later verified publication. Legacy file-writer `/api/blog/generate` 503 is deliberately and correctly retired.
- Safety: preserve historical content, unique proof receipts and manual moderation policy; never re-enable old unsafe JSON writing, globally enabled economy jobs, unvetted ads or financial DB writes. Dedicated blog-only Test / blue-green release required; verify receipt and public render, not health alone.
- Plan: restore guarded verified blog frontend route, index/sitemap for independently verified posts only; repair AI publisher deadline with bounded retry and isolated Test; exact-SHA branch tests/build; stage blog-only canary and Nginx atomic route cutover with rollback, verify subsequent auto publication.
- Status: IN PROGRESS; no Production changes performed at START.

## MID
Pending.

## END
Pending.
