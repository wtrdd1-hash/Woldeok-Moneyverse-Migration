# v2026.11.19.41 — Scoped Production Admin HTML + Blog Access Protection

**Deployment type:** ACTUAL Production Nginx access guard only; **not** full Java backend/front-end deployment. Owner authorized eventual full promotion, but signed-in financial E2E and official Test remain gated. Date 2026-11-19 KST, target `easy-scraping.com`. No finance, PostgreSQL, Spring process or Gemini-owned source mutation.

## START

Checked owner-approved integrated EN/KO planning master, G442 180-route/5-pass and G0–G6 requirements, active Nginx exact public server block and existing `auth_request /__mv_p0_admin_auth_20261118` (Spring `/api/v1/admin/me` verifies session+role). Main remains `f488088bf50eb4659f59782dc0300a9c3bc74c69`. Confirmed anonymous public `/admin.html`, `/admin-preview*` returned HTTP200 with mock numbers; `/admin` correctly redirected 302.

## Change A — sample HTML guard

Saved original active Nginx site as a mode-0400 **local-only** exact-SHA backup (not GitHub). Added exact `/admin.html`, `/admin-preview`, `/admin-preview.html` and prefix `/admin-preview/` redirects to already protected canonical `/admin`. `nginx -t` passed, graceful `nginx -s reload`, actual public HTTPS and direct Host Nginx checks **4/4 302**. Existing homepage200, `/admin`302, `/api/v1/admin/users`401, public stock200, auth session200 unchanged. Config SHA256 `25a14d928bbe11b000ab2e3887ef6009b39c37cb9099b1f5b1f73ddd02b33934` → `c2c188bc61dc2c64757f4515d3242400d7092e3c36245508cde9978a7d845cf0`.

## Change B — admin blog authorization guard

Public `/admin/blog-verified` returned unauthenticated HTTP200 JSON (~471KB); `/admin/blog/articles` also JSON HTTP200; no claim is made about contents/PII because no payloads were retained. Specific Nginx `location = /admin/blog` and `location ^~ /admin/blog` wrongly bypassed existing generic `/admin/` auth. Added the *same existing* `auth_request` and 401→login callback to both locations, without altering backend actions or weakening session checks. Independent mode-0400 full file backup, `nginx -t`, graceful reload, local+actual public HTTPS `/admin/blog`, `/admin/blog/`, `/admin/blog-verified`, `/admin/blog/articles` anonymous **4/4 HTTP302**. Regression `/`200, `/blog`200, `/admin.html`302, `/api/v1/admin/users`401, `/api/v1/auth/session`200. Config SHA256 `c2c188bc61dc2c64757f4515d3242400d7092e3c36245508cde9978a7d845cf0` → `9b6ad3975288aee753b158786732494ccdcef01b86f6074736972ffbbd2dcdc8`.

## Rollback & verification

Each change was applied by a fail-fast local script with a previous full-site configuration backup, `nginx -t` gate, reload and route-level verification; any failure would restore the previous file and reload. Independent restore test was **not performed**. Backup paths and production config are **local-only**, not published; no credentials or raw private responses in Git. Edge hotfix effective now; original Spring Java binary remains unchanged.

**Release HOLD:** The two security guards are not a full Spring frontend/API rollout. The new integrated Java source (Board, Admin Discord, web UI) needs actual official Test SHA, real authenticated DB/finance/admin workflows, 180 route 5-pass G442, independent restore and zero-downtime approval before general promotion. [QA](../qa/2026-11-19-spring-api-source-truth-v41.md), [한국어](2026-11-19-scoped-admin-edge-v41.ko.md).
