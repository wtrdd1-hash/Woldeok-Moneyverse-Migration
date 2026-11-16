# SEO Source-Truth Emergency Recovery — v2026.11.17.2 (EN)

## Start record — 2026-11-17 KST
- Owner: approved remediation, including conditional zero-downtime Production promotion after real QA.
- Canonical origin/main at start: `86777fb2d5a1f8bbc680453368c0a5f04b5c7715`.
- Worktree and branch: `fix/seo-node-source-truth-v2026.11.17.2`; isolate from other agents' worktrees.
- Authority read: `AGENTS.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, documentation governance and SEO sitemap/indexing standard; plan says release HOLD subject to evidence.
- Reproduced Production gateway: `GET :4400/api/v1/seo/status/admin` returns 404; public status returns Spring's incompatible hardcoded sample. Direct `:4550/api/v1/seo/gsc/analytics` returns fabricated statistics. Spring SEO POST handler reports success without real remote submission. Do not use fabricated statistics.
- Verified retained NestJS `:4500/api/v1/seo/status` returns contract-compatible live aggregate; unauthorized `status/admin`, `gsc/analytics`, `crawl-audit` all return 401.
- Root cause: Nginx internal gateway `:4400` regex routed `/api/v1/seo` to unfinished Spring Boot while Next BFF and admin audit expect NestJS contract and authorization.
- Strict scope: restore *only* SEO gateway to verified authenticated NestJS source, without changes to ledger, DB, authentication settings or other services. Distinguish observed crawler requests from actual indexation. Preserve Spring SEO implementation as not ready for promotion; separate parity work.
- Starting state: NOT FIXED, no mutation to runtime, staging, Production or data.

## Midpoint — reproduction and independent Test
- Baseline regression RED (8 failures): Spring sample schema, missing admin 404, unauthorized GSC/crawl audit/submission responses. Independent Nginx `:4401` with retained Nest routing, schema/privacy/denial/aliases/IndexNow key parity PASS. Independent edge `:4403` rejects 6 anonymous GET/POST paths, permits 6 simulated authorized paths and preserves unavailable 503.
- Retained frontend Next `/api/admin/seo-audit` produced 200 without cookies. Additional Nest administrator evidence test RED→GREEN; static SEO funnel fabricated 4,870 impressions/651 pings/CTR ranks test RED→GREEN. Related Next tests 50/50 PASS.
- Midpoint `origin/main` unchanged. Preserved pre-existing `v2026.11.17.1` admin-users emergency edge rules created by other agent.

## Closeout — live gateway mitigation, frontend still pending
- First Nginx reload was immediately queried before new workers fully accepted; QA caught stale 404/200, automatic rollback. Added one-time 2-second worker readiness grace. Second zero-downtime reload: SEO 200 canonical schema, protected 401, public Next 200, edge anonymous paths 401 PASS.
- Found intermittent auth_request upstream 503 surfaced as 500. Added explicit fail-closed 503 mapping, verified RED→GREEN in stage and applied another Nginx reload.
- Independent Production read-only checks: **13/13 PASS**, nginx -t PASS, active Node/Spring/homepage healthy. Rollback snapshots: `/srv/moneyverse-data/reports/seo-recovery-v2026.11.17.2/moneyverse-nginx-before-20261117T004603.conf` and `seo-edge-auth-before-failclosed-503.conf`. No real IndexNow submission or database mutation.
- Direct Spring `:4550` still contains hardcoded SEO responses but the operational 4400 gateway routes SEO away. Existing immutable Production Next still displays static funnel; candidate frontend replacement and BFF defense are only on branch, not deployed. Real authenticated admin E2E, actual Google GSC property response, provider IndexNow receipt and full CI NOT VERIFIED. Frontend and Java full Spring SEO migration remain RELEASE HOLD.

## GitHub closeout handoff
- Draft review PR #3206: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3206
- Review pending. Nginx mitigation is operational; candidate frontend and native Spring SEO are NOT promoted.
