# v2026.11.02.1625 — Verified blog public rendering and sitemap (EN)

## Before
- Owner requested fixing the broken verified blog. Automatic worker v1624 is now published from a self-contained package: a new KR COMPUTER post with immutable receipt was published at 2026-11-02 22:35 KST (public API count 4, systemd exit 0).
- The public Nginx blog routes point to a separate Next.js process on 127.0.0.1:4205; its process environment has no BLOG_API_ORIGIN. The source `frontend/src/app/blog/blog-verified-client.ts` requires this setting and silently falls back to empty verified articles when it is missing. Meanwhile 127.0.0.1:3000/api/v1/blog/verified returns four PUBLISHED posts; outdated 127.0.0.1:3483 returns 500. Public sitemap listed only two legacy KR articles.
- Single source of truth: DOCUMENTATION_POLICY, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, v1405, v1419 and v1624. Main at start `3accc3a739ab18096638968127fa3656316f7f57`. Separate branch `fix/blog-verified-visibility-20261102`; protect other agents' local changes.
- Owner policy unchanged: no time-based withdrawal, no ads on uncurated AI posts, no global economy scheduler.

## Midpoint
- Introduce isolated blue/green blog-only frontend unit on port 4207 with production backend origin 127.0.0.1:3000 and ADS_ENABLED=false; reuse existing exact built frontend release from main 305d7c7fec2e. It does not restart the active 4205 service or touch financial DB.
- Accept only if independent 4207 HTTP tests show US/JP/CN/KR verified content, article detail and sitemap all include same current PUBLISHED slugs, no private posts or unsafe ads, 200 HTML/XML and appropriate canonical. Backup Nginx and swap blog route upstreams only after nginx -t; reload without downtime, keep original 4205 for rollback.

## Final
- Exact runtime and HTTP acceptance recorded on miniPC and GitHub issue. Configuration changes are not a new application build or financial promotion.
