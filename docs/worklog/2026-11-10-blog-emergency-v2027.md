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
## FINISHED
- Pending.
