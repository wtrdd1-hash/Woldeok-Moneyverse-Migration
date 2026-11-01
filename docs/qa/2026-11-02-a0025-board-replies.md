# Development A QA — Public Board Replies Filter — 2026-11-02

**Verdict: P1 IMPLEMENTED / LOCAL TESTS PASS / REAL DEV POSTGRESQL READ PASS / OFFICIAL EXACT-SHA TEST BLOCKED / RELEASE HOLD.**

## Authority, scope and provenance
- MiniPC: Debian 13.6, systemd backend/frontend/Discord/Nginx/Docker active. Shared checkout with pre-existing `implementation_plan.md` edit untouched.
- Base `origin/main`: `510dbe6bf4d5c2a8089fc06b480776053da7a2e3` (start/mid/pre-close checked). Isolated branch `auto/hourly-a-20261102-0025-board-replies`; PR #2399 Draft/HOLD.
- Code checkpoint `3bd7ba3b602845a4abdff31302c36d2b658f5ac0`; Android contract regenerated checkpoint `f817b25dbe4f55210ddc150c1fd2f85c058049c0`. Final PR head is tracked by GitHub; no claim of a Test deployment.
- Prior QA v1448 (2026-11-01 23:25 KST) had P0 Production least-privilege, provenance, migration, restore and broad-policy blockers; QA v1449 start was reviewed. This run did not re-audit Production DB.

## End-to-end functional change
- Nest GET `/api/v1/board/public/stock-posts?replied=1` accepts only one exact opt-in value; duplicate, malformed and unknown parameters are HTTP 400.
- PostgreSQL query applies a bound boolean `comment_count > 0` **after** `public.member_board_public_list_with_stock(50)` returns its bounded public list. Stock and literal title filters remain composed. No new function, direct table grant, applied migration change or ledger write.
- Web `/board` offers a labelled `댓글 있는 글만` checkbox, truthful 50-post scope, verified-empty and unavailable states, noindex filtered URLs and no-cache filtered API request.
- Android `/app-api/v1/board/public/stock-posts?replied=1` requires `appliedFilters={repliedOnly:true,scope:'latest50'}`, a <=50 row array, unique UUID post IDs and positive safe integer `commentCount`. Legacy success-shaped 200, malformed JSON, duplicate filter and unfiltered results are rejected (400/503). Filtered responses are no-store/noindex.

## Fresh local gates
| Gate | Result |
| --- | --- |
| TDD RED then GREEN | Backend RED 2 failed; frontend RED 9 failed; GREEN backend 22 PASS / frontend+Android 19 PASS |
| Backend full `NODE_ENV=test` | **2,987 PASS / 518 SKIP**, exit 0 |
| Frontend full `NODE_ENV=test` | **2,941 PASS**, exit 0 |
| Database package | **62 PASS / 5 SKIP**, exit 0 |
| Backend + Frontend build | PASS / PASS |
| Workspace typecheck | PASS |
| Workspace lint | 0 errors / 1,027 warnings, exit 0 |
| Security and release subset | 14 PASS |
| SEO + board search subset | 17 PASS |
| Production dependency audit | 0 known vulnerabilities |
| Android API contract | 184 endpoints, `api:contract:check` PASS after regenerated EN/KO artifacts |
| Actual DEV PostgreSQL 17.11 | `moneyverse_app` READ ONLY/ROLLBACK; 1 recent public row, 0 replied rows; bound SQL executes, EXECUTE allowed |
| Actual multirow positive PostgreSQL proof | **NOT VERIFIED**: only one public post and zero replied posts in DEV |
| Official isolated Test candidate exact SHA + authenticated E2E | **BLOCKED**: Test `/api/version` advertised main `510dbe6...`, not candidate |
| Independent external restore, Production least privilege, GitOps | **BLOCKED / P0** |

## P0 security findings and release hold
- In DEV, `moneyverse_app` still has effective `account_balances UPDATE=true` and `user_items DELETE=true`, despite intended least privilege. Existing issue #993; this read-only check does not imply Production has identical grants.
- Prior QA v1448 separately reported Production ACL/provenance/migration defects. None is resolved by a public read-only filter.
- Production `/api/version` advertised `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, not the candidate. No deployment, service restart, database write, financial action, rollback or branch deletion occurred.
- Preserve every branch with unique unmerged commits. Ancestor-only branches also remain because other worktrees/PRs may own them; no destructive cleanup without ownership confirmation.

**Release decision:** DRAFT/HOLD. Only merge after final exact-head CI and full required gates, official Test exact SHA backend/frontend/DB/auth/mobile E2E, independent restore and finance/ACL/GitOps approval. Candidate code has no migration to roll back; reverting the feature commit after review removes the optional filter without altering ledger data.
