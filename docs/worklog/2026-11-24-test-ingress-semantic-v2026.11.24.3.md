# v2026.11.24.3 — Isolated Test ingress semantic defects

**Task ID:** TEST-INGRESS-20261124-01
**Agent:** GPT
**Scope:** Test hostname only; no Production, backend, database, or user-session changes.
**Branch:** `fix/test-ingress-seo-semantic-20261124`
**Source baseline:** `origin/main` at `9876c09888ec84034eec183cf1309c85df3d7447`
**Concurrency:** Gemini is working on Test frontend/legal/title and admin locale branches; this task owns only an additive Test-only Nginx semantic snippet, its isolated installation procedure and dedicated worklog.

## Before work — observed
- Read AGENTS/GEMINI, integrated planning master, UI single reference, release guide and draft strict Test governance. Verify live systemd, Nginx and Test-only frontend 55440 / real Test backend 55438.
- Test public `/robots.txt` and `/sitemap.xml` return HTTP 403; scheduled semantic QA expects HTTP 200. An unknown route also returns 403 instead of 404; that is an independent Spring security/catchall defect and MUST NOT be hidden by special-casing the QA probe path or downgrading authorization.
- Production HTTP QA currently flags 302 redirects on protected bank/wallet paths; these are not proof of a Test failure and are out of scope.
- Current Test frontend version is `7b676e602bc984ab74572d4081655fdb297d176a`, and a separate 55443 scoped legal UI is active. Production remains unchanged.

## In progress
- [x] Add disallow-all, noindex Test-only robots and non-advertising empty sitemap (read-only GET/HEAD; other methods 405).
- [x] Add reviewed, hash-guarded install/rollback process confined to Test vhost, with original bytes retained and byte comparison of Production Nginx sections.
- [x] Validate before/after semantics, authorization behavior and exact original test frontend version; run Nginx syntax test and semantic QA.
- [x] Fresh `origin/main` verification and publish evidence.

## Finished — verified Test-only deployment (partial overall QA)
- **Deployed** v2026.11.24.3 add-on through graceful Nginx reload, no Java restart, DB, auth change or Production cutover. Nginx syntax check PASS, audit backup under `/var/backups/moneyverse-test-ingress-v20261124-3/`.
- Before/after: Test `/robots.txt` **403 -> 200**, `/sitemap.xml` **403 -> 200**. GET/HEAD 200, POST 405, explicit `Disallow: /`, noindex/no-store and empty XML. Public HTTPS confirmed both 200.
- Nginx Production server config suffix is **byte-identical** before/after. Test `/`, `/login`, `/terms`, `/privacy`, `/api/v1/stocks` remain 200; unauthenticated `/admin` remains 302; source version remains `7b676e602bc984ab74572d4081655fdb297d176a`.
- Installer unit tests **5/5 PASS** and standalone real HTTP smoke **13/13 PASS**. Semantic QA moved **4/7 -> 6/7**, **overall still FAIL**, with only missing-path `403 != 404` unresolved. This remaining failure is NOT bypassed; release certification remains BLOCKED.
- Known blockers not repaired in this scope: arbitrary unknown page fallback/403, 180-page browser+real-data coverage, finance/authenticated E2E; Production hourly QA bank/wallet 302 expectations require separate security-preserving review.
- Rollback: `sudo python3 scripts/ops/test_ingress_semantic_v20261124.py rollback --snippet ops/nginx/test-public-crawl-block-v2026.11.24.3.conf` from this worktree; only owned Test include removed, snapshot retained.
- No Production promotion and no change to Production virtual-host bytes. Exact main re-checked before completion.

### Intermediate checkpoint — predeployment
- Added a Test-only include with disallow-all /robots.txt and empty /sitemap.xml, both 200 for GET/HEAD and 405 otherwise; X-Robots-Tag noindex and no-store.
- Added hash-guarded, reverse-only Test section installer; Production Nginx suffix is an explicit byte-preservation invariant.
- Local Python isolated tests: **5/5 PASS**; live configuration dry run: **PREFLIGHT_OK**. Not yet installed.
- Existing unknown 403/expected 404 is intentionally UNRESOLVED; no weakened security and no QA-specific 404 spoof.
