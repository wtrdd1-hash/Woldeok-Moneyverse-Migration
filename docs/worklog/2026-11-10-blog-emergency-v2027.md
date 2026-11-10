# v2026.11.10.2027 — P0 emergency blog publication restoration

## START — 2026-11-10 13:40 KST
- Owner directive: urgently verify and restore actual blog publication, public visibility, SEO and authorized advertising.
- Mandatory priority: live minipc gateway, integrated master and v1946.2 owner override, blog v1946 worklog, AGENTS and RELEASING. Keep UNVERIFIED articles truthful; never enable economy scheduler.
- Source: current origin/main 3a7c34507a; local main has unrelated modifications and is untouched. Distinct isolated worktree fix/blog-p0-publication-v2026.11.10.2027; other agents' work untouched.
- Live snapshot: frontend/backend and Nginx active; public /blog HTTP 200 but /api/blog shows 6 static seed entries; /api/v1/blog/verified count 0. Nginx sends blog to port 4595 generic v1949 frontend. Dedicated v1946.3 blog frontend active but not serving public requests. v1946.3 publisher timer disabled/inactive with no journal entries; historic v1419 disabled. No actual successful automatic publication confirmed.
- Checklist: [x] gateway; [x] docs and isolated worktree; [ ] verify blog candidate and publication sources; [ ] reproduce Test publisher; [ ] root cause fix; [ ] tests and exact-SHA Test QA; [ ] Production canary/rollback; [ ] public API/sitemap QA; [ ] EN/KO internal and GitHub update; [ ] re-fetch main and review CI.
- Boundaries: no financial DB/ledger, withdrawn records, unsafe legacy publisher, secret output, or non-blog Nginx changes. No false Production completion claim.
## IN PROGRESS — 2026-11-10 13:46 KST
- Root cause chain: public v1949 API count 0 (database name confirmed with process environment metadata only, no secrets); Test API count 3 with a separate Test database. The public blog's count 6 is seed-only, not evidence of scheduled publication. Worker timer v1946.3 is definitively inactive, though isolated publisher has the required enable flags. Ollama model service responds 200.
- Nginx currently routes blog to regular v1949 frontend on port 4595, not isolated v1946.3-main frontend 4583. Both candidates return the same six seed posts until actual publication.
- Verified that Test backend port 3100 uses database with name suffixed test_acl_v1544_restore, distinct from Production port 4594's moneyverse_dev. Next: isolated Test one-shot using Test backend environment, enforced Test channel and worker's immutable v1946.3 runtime. No Production data mutated at this checkpoint.
## IN PROGRESS — Test acceptance 2026-11-10 13:51 KST
- Test one-shot ran exactly worker release v1946.3-main-10d1edf44845 with Test backend process environment. Guard refused non-Test DB; channel was forced to test; no Production data touched.
- Actual output: period 2026-11-10T12:00+09:00, CN/COMPUTER, inserted:true, status PUBLISHED, verificationState VERIFIED, receipt 162b0cc6-fc66-4ed3-8969-8255fbdc1f4e, exit 0.
- Test API count 3 -> 4; Test frontend :4582 count 11 including new article; /ja/blog native unverified page visible with truthful AI/unverified warning; nonindexable Test sitemap 503.
- Same worker code paths as remote main (no backend/src/blog-editorial diff since v1946.3 candidate). Production will require zero-downtime timer activation, Production post receipt and public edge validation. No Nginx switch required if current v1949 blog routes render correctly.

## FINISHED — 2026-11-10 13:59 KST (operational repair complete)
- Production one-shot same worker successfully published verified CN/COMPUTER at 13:55:52 KST; receipt c5fa1145-c244-40fe-aa93-982c4e88624e, DB 0 -> 1, public list 6 -> 7. HTTPS canonical native article and sitemap 200, sitemap contains new slug; all four blog hubs and public API respond 200. Legacy unsafe /api/blog/generate deliberately returns 503.
- Enabled active moneyverse-blog-v1946.3-publisher.timer via systemctl; next observable schedule 14:05 KST. Subsequent recurrence is not yet proven. Re-run returned SLOT_ALREADY_CLAIMED and API retained exactly one article.
- Test 4 verified posts after the one-shot; Test frontend 11; focused Vitest backend 13 PASS and frontend 9 PASS. Production web/backend/Nginx remained active, no routing switch or financial service edits. Sidecar pre-change snapshot under /srv/moneyverse-data/backups/blog-v2027.
- Rollback: sudo systemctl disable --now moneyverse-blog-v1946.3-publisher.timer; manually withdraw offending post only through protected moderation, never delete financial data.
- Source main refresh confirmed origin/main 3a7c34507a at mid-work. Branch documentation, bilingual internal/GitHub changelog and PR contain operational evidence. Pending external CI, subsequent timer proof, third-party ad display and authenticated browser E2E are explicit UNKNOWN. This is an operational fix, not a new source artifact promotion.
