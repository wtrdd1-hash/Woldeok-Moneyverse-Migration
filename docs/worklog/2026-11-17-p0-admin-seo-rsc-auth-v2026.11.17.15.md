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

## Final production closeout — 2026-11-17 13:15 KST
- PR #3239 merged main c2b426a901b66e8bd8a805a510247b1ab25c56af. GitHub classify and policy CI PASS; runtime job skipped as ops-only.
- First Nginx reload was probed before graceful worker handover, returned old-worker RSC 503 and triggered automatic rollback. v14 frontend route recovery was preserved. The reviewed auth-header changes were safely reapplied using the retained backup, nginx -t and zero-downtime reload, with a 2-second handover before canary.
- Three consecutive production SEO RSC canaries returned 401. Full smoke: /, /admin, /admin/security, /health, /api/version 200; normal and RSC/prefetch SEO admin and audit anonymous 401 with private/no-store/noindex; external HTTPS RSC 401. Direct Next SEO HTML 200, CSS 200. Four relevant services active.
- Rollback: /srv/moneyverse-data/ops-backups/p0-admin-seo-v2026.11.17.15/seo-v3-edge-auth.conf.before and v14 global config backup. No DB, ledger or WLD mutation.
- Remaining limitations: verified signed-in administrator browser positive E2E and session continuity not performed; /admin/stocks and /admin/settings unrelated 404 remain known. No claim of full application release gate certification.
- Follow-up v2026.11.17.15.1 hardens the operator script for graceful reload timing and idempotent verification.
