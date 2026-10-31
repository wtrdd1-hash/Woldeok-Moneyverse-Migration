# QA — owner holdings attention filter, 2026-10-31

**Candidate:** `auto/hourly-a-20261031-1812-holdings-attention-repair` from main `5bccda44d6db56aff05fa5623ef7f72b2ec0263c`; code SHA `5f7460daa681af836d99e67b207c9fea987891f4`.

## Scope and result
Member `/shop/catalog?mine=attention` previously called `/api/v1/shop/holdings?status=attention`, which Nest silently ignored. It now calls `?filter=attention`. The controller uses its existing bigint-safe attention helper and owner-scoped `shop_my_items_v2(actor)`; arrears-only records are included. Android rejects invalid/duplicate/ignored filters, refuses stale unfiltered 200 payloads and enforces private/no-store/noindex/no-referrer headers. No migration or financial write.

## Evidence
- RED backend 2 FAIL; frontend 5 FAIL / 2 PASS. GREEN backend targeted 7 PASS, frontend/Android targeted 7 PASS.
- Full backend 2,788 PASS / 501 SKIP, database unit 62 PASS / 4 SKIP, frontend 2,781 PASS, lint 0 ERROR / 1,048 WARN, typecheck PASS, build PASS, API contract 184 endpoints PASS, security/release 20 PASS, production audit no known vulnerabilities.
- First `pnpm test` timed out (124) in frontend after backend passed. A frontend retry without `NODE_ENV=test` produced 489 failures from test-environment React.act; corrected `NODE_ENV=test` two-worker rerun: 2,781 PASS / 0 FAIL. These are test execution corrections, not evidence of an application fix.
- PostgreSQL 17.11 read-only transaction: function exists, app EXECUTE=true, unknown synthetic actor returns 0; ROLLBACK. **P0 ACL failure:** app direct `public.user_items` SELECT=true, DELETE=true. This is DEV only, not a Production claim.
- Official Test and Production public backend/frontend SHA `bc8cd8a6c654af0336f550643f23049a58ee1d16`, not candidate. Authenticated exact-SHA E2E, independent restore, least-privilege and Production gates are BLOCKED.

## Disposition
DRAFT / HOLD. Do not merge or deploy. All 111 non-main branches preserved; 103 with unmerged commits and 8 main ancestors pending ownership review. No runtime/DB change, branch deletion or rollback.
