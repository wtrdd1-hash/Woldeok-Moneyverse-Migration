# v2026.11.17.15 — P0 SEO admin Next.js RSC authorization header fix
Issue: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3238

## Before work — 2026-11-17 13:09 KST
- Production v2026.11.17.14 upstream misroute restored to Next :4521 (PR #3237, main b8e6b6c5852db9484d0170a481a4c4bd0278a2b5), services remain active.
- New observed issue: public anonymous `/admin/seo?_rsc=smoke` with `RSC: 1` responds 503; the Next auth JSON BFF on :4501 returns 307 (versus normal 401) if the RSC header is forwarded. Nginx auth_request rejects 307.
- Change scope strictly the internal auth subrequest's RSC/navigation headers, never the user request, session cookie, auth_request directive, or privileged endpoints.
- Canonical integrated plan requires preserving Next.js UI and backend auth; do not change DB, money, user sessions, or Spring service.
- New dedicated branch from exact latest origin/main and independent worktree; no changes to Gemini/other worker branches.

## In progress
- [ ] Demonstrate RED isolated Nginx RSC denial failure, GREEN after stripping RSC only on internal authorization.
- [ ] Create guarded script with immutable rollback and separate loopback-only Nginx test config.
- [ ] Recheck origin/main; review, commit, push, and PR.
- [ ] After CI and Test, authorized Nginx reload and HTTPS negative/positive source checks.

## Finished
Pending fresh observed evidence, authenticated-positive test if available, and production closeout.

### In-progress checkpoint — 2026-11-17 13:11 KST
- RED: isolated Nginx :18521 anonymous standard 401 vs RSC 500; direct Next JSON auth RSC 307. Production RSC 503.
- GREEN: isolated Nginx :18522 two SEO admin routes standard/RSC/prefetch all anonymous 401; backend /health 200, direct Next UI 200; Nginx syntax and patch --check PASS.
- Only internal auth subrequest rendering headers are cleared. Source/cookie/real auth-request unchanged.
