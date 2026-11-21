# v2026.11.19.41 — Production OpenAPI vs anonymous GET source-truth audit

**Authority:** live Spring `/v3/api-docs` at 2026-11-19 KST, read-only on mini-PC. OpenAPI yields **973 path entries / 644 GET path entries**, INCLUDING aliases and method duplicates; NOT 973 implemented business functions. The bounded QA generator excluded GET operations that could mutate state, dynamic path IDs, and media/actuator, leaving **581 safe matching paths / 312 de-aliased path families**. **208** anonymous GET requests were actually issued across Production HTTPS, without cookies, credentials or POST/DB writes. Responses were summarized as statuses and shape flags; no actual user payload is committed or logged into GitHub. Raw per-path sanitized results remain local-only at mini-PC `/srv/moneyverse-data/tasks/web-prod-api-qa-v2026.11.19.41/GUEST_API_MATRIX_v41.json`.

## Correct final matrix — after verified scoped Nginx production protections

| HTTP status | Count / 208 | Interpretation |
|---|---:|---|
| 200 | 96 | Response alone is **NOT** API source correctness/financial receipt proof |
| 401 | 71 | Authentication required; expected for protected APIs when anonymous |
| 302 | 29 | Login redirect including administrator pages; **do not** count destination login HTTP200 as API success |
| 403 | 8 | Explicit access denied |
| 301 | 1 | Canonical redirection |
| 406 | 1 | Content negotiation mismatch, needs per-route follow-up |
| 502 | 1 | Discord guild status public `/api/v1/integrations/discord/guilds/status` has invalid upstream routing (Nginx points to Socket.IO port 9092). The raw Spring 4550 controller returns **hardcoded fake** `connected:true`, guild count/latency. **Do not fix by routing 502 to fabricated 200**. Actual gateway-backed DTO implementation required |
| 503 | 1 | `/api/v1/kdic/overview` intentionally held while ledger origin is not certified. 503 is NOT functional parity |

**Untrusted/fabricated source confirmed on still-live Production:** `/api/v1/board`, `/api/v1/board/stock-posts`, `/api/v1/board/stocks` each returned synthetic `post-wld-*` records from legacy `BoardService`. The v41 Spring source fixes canonical read and idempotent session-backed write, but has **NOT** replaced the Production JAR. Do not display the live board as real. Existing public finance wallet summary with HTTP200 needs body/session validation; status alone is not a data leak claim or working-money proof.

## Actual operational fixes performed and retested

1. Scoped Production Nginx admin aliases `/admin.html`, `/admin-preview`, `/admin-preview.html`, `/admin-preview/index.html`: previously 200 with old design samples, now **302 to canonical protected admin login flow**. Nginx backup, `nginx -t`, graceful reload, local HTTP and actual public HTTPS pass for all 4. No Spring restart or DB write.
2. Public `/admin/blog` and `/admin/blog/` (existing admin content paths) plus `/admin/blog-verified` (previous anonymous HTTP200 JSON 471KB) and `/admin/blog/articles` (previous anonymous HTTP200 JSON) now **302 to login when unsigned-in** using existing verified `/api/v1/admin/me` Nginx auth subrequest. Authenticated backend routing is preserved by the `auth_request` gate; positive authenticated E2E not run. Public `/`, `/blog` unchanged 200, `/admin.html` remains 302, `/api/v1/admin/users` remains 401. Source code after protection unavailable to anonymous callers, but no inference that data contained personally identifying items.
3. First QA utility followed 302 login pages and misclassified 27 admin endpoints as HTTP200. This was corrected with a no-redirect HTTP handler; final status matrix above uses **no redirect following**. Before admin-blog second fix: `200=98 / 302=27`; after: `200=96 / 302=29`, exactly two API paths changing 200→302.

## Remaining mandatory defects

- v41 Spring Board controller/service now queries `public.member_board_public_list_with_stock(int)` with real UUID, time and comment counts; rejects invented counters/posts, and uses `member_board_create(uuid,text,text,uuid)` only with verified session actor, CSRF and UUID idempotency key. Actual DEV public function returned 1 verified row and app role had function EXECUTE; this is source inspection, **not a Production user-write E2E**. Stock-tagged write remains explicit 422 rather than pretending a basic post was tagged.
- v41 Admin Discord outbox now requires DB-authenticated admin role even on older `/admin/*` JSON alias; no fabricated `delivered` event/status, no fake UTC time, source failure returns 503.
- v41 new source cannot yet be served in the official public Test environment (`https://test.easy-scraping.com/api/version` => 403). A separate read-only local candidate failed startup because the default JDBC URL pointed to inactive localhost5432; live system uses a different DB port, and **no credentials were copied or bypassed**. Existing `@SpringBootTest`/H2 and direct DEV DB source metadata verification were completed instead. The attempted isolated canary is not evidence of real board API Test E2E.
- Anonymous 208-call sampling cannot certify 644 GET endpoints, 973 paths, authenticated 2-account ownership, finance ledger, 180 PC/mobile web routes, all administrator actions, 5 full-site QA passes, or a zero-downtime application cutover/rollback. Mandatory G442 and G0–G6 remain HOLD.

[Detailed code and QA](../qa/2026-11-19-spring-api-source-truth-v41.md) · [한국어](2026-11-19-public-api-matrix-v41.ko.md) · [Operations](../operations/2026-11-19-scoped-admin-edge-v41.md).
