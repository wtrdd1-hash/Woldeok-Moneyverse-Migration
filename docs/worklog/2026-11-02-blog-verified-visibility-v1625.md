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

## Production closeout — v1625.1 (2026-11-02 22:52 KST)
- GitHub PR #2541 passed CI run #41456383761 and squash merged main `b1f858c6b3684066bd609b06eebc59d65fb317af`. Main was rechecked before cutover.
- Existing verified worker v1624 published KR/COMPUTER slug `2026-11-02-kr-computer-9` at 22:35 KST, success exit 0, receipt-backed `PUBLISHED`; 22:45 retry `SLOT_ALREADY_CLAIMED`, no duplicate. Public verified API count 4.
- Isolated clean-build standalone blog-only frontend on :4207, API origin http://127.0.0.1:3000, `ADS_ENABLED=false`, 4 hubs + 4 article details HTTP 200 and sitemap 10 locs with all four verified slugs. Tests sent Host/X-Forwarded-Proto/X-Forwarded-Host for correct HTTPS reverse-proxy simulation; a plain HTTP request correctly redirects to the HTTPS canonical and is not a test failure.
- Nginx 13 allowlisted blog locations switched only, old :4205 general application locations retained, `nginx -t` PASS and systemctl reload success; live `/blog`, `/en/blog`, `/ja/blog`, `/zh/blog`, four verified detail pages 200 with expected slugs. `/sitemap-blog.xml` has 10 locs and all four verified entries. Root `/`, `/treasury`, `/api/version`, `/robots.txt` also 200. Uncurated article pages did not include AdSense loader.
- Protected Nginx backup: `/srv/moneyverse-data/ops/private/blog-v1625/moneyverse-before-blog-v1625-20261102T135130Z.conf`; old :4205 service remains for rollback. Before/after Nginx config SHA256 `44addfeb34cc69f179332a6307429918744c06e684a69a8137a4f0d03c2a58cd` → `a7db675aca1b3dc785849a285d9860319e24a605fb4c43afb220a6a22ae21dfe`.
- No ledger, user balances, Treasury DB, article withdraw/delete, global scheduler, or all-site proxy change. Blog-only operational promotion **PRODUCTION_VERIFIED**; this does not certify unrelated finance or multilingual /tools routes.
