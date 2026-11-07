# A2235 QA — Public Board Category (DRAFT / HOLD)

- Base `origin/main`: `3accc3a739ab18096638968127fa3656316f7f57`; isolated branch `auto/hourly-a-20261102-2235-board-category`.
- Source: existing `public.member_board_public_list_with_stock(50)` SECURITY DEFINER read, optional exact category SQL filter applied **after** the bounded 50 rows; no migration or ledger writes. Valid categories: analysis, question, journal, business, system. General posts are excluded for selected stock category.
- TDD: backend 3 RED, frontend 7 RED; after correction backend targeted 22 PASS, frontend targeted 10 PASS. Existing unfiltered API signature and shape preserved.
- Full local at code SHA before documentation: backend NODE_ENV=test **2990 PASS / 518 SKIP / 0 FAIL**, frontend **2948 PASS**, DB package **62 PASS / 5 SKIP**, contract package **41 PASS**, lint **0 errors / 1027 existing warnings**, typecheck both PASS, backend build PASS, frontend build PASS.
- Mobile API: generated 184 endpoints / 683 controller methods, optional `category` enum in Android contract. Invalid duplicate/unknown category HTTP 400; stale backend successful response without categoryFilter or mismatched/duplicate rows HTTP 503. Filtered responses no-store/noindex. Web metadata noindex, category label keyboard accessible, unverified results are unavailable rather than verified-empty.
- Real DEV PostgreSQL read-only check: public list latest 50 = 1 general post, question tagged = 0, analysis tagged = 0; SQL function executable by app. This does **not** prove a positive real-row category match; synthetic unit tests cover the predicate.
- P0 security read-only check: DEV app role still can TRUNCATE account_balances and DELETE user_items. Full workspace dependency audit **9 advisories (8 moderate/1 low) FAIL**, production dependency audit 0 known vulnerabilities PASS.
- Latest QA v1473: Production locale HTTP 500, app-role broad TRUNCATE/default ACL, checksum drift, official Test source mismatch, independent off-host restore and authenticated E2E BLOCKED. Main CI includes failure.
- Exact SHA official isolated Test, authenticated mobile/browser E2E, accessibility automated audit, SEO HTTP smoke, independent restore and GitOps gate: **NOT RUN / BLOCKED**. No PASS inferred.
- Release decision: **DRAFT/HOLD**. No main merge, Production/Test deployment, database mutation, service restart, branch deletion, or rollback execution. Existing running version unchanged.

- Final pre-integration sync: latest main advanced to `b1f858c6b3684066bd609b06eebc59d65fb317af` (blog v1625), merged into candidate branch without conflicts. Exact new SHA gates supersede earlier pre-sync results.
