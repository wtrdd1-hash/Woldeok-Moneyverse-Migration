# Spring P0 incident recovery plan — v2026.11.18.2

**Plan status:** PARTIALLY EXECUTED / remaining QA-blocked tasks. Original step plan was recorded privately before implementation; this is its sanitized reviewable counterpart. Related issue #3265, Draft PR #3267.

## Task A — Auth/roles/CSRF P0 [SOURCE IMPLEMENTED, ISOLATED NEGATIVE QA]
Files: `spring-backend/src/main/java/com/moneyverse/api/config/AdminApiBoundaryFilter.java`; `domain/admin/service/AdminAuthService.java`; admin users/stocks/economy controllers; focused tests. RED invalid sessions -> GREEN; verify actual signed-in actor, revocation, role changes, MFA and CSRF before release. Keep Nginx temporary deny until verified.

## Task B — Shop canonical DB contract [SOURCE IMPLEMENTED, READ-ONLY QA]
Files: ShopController, ShopService, ShopDtos, two Shop tests. Actual `shop_catalog_list_v2(NULL::uuid)` reads 146 catalogue rows on Test DB. Invalid actor returns 401; no fake successes; retain open action to prove purchase idempotency, signed-in actor, tax receipt, inventory fields and canonical ledger on an isolated ROLLBACK clone.

## Task C — Test deployment [BLOCKED]
Official Test port currently unavailable; localhost read-only canary 4610 is **not** official Test. Deploy exact immutable candidate to independent Test backend/frontend, with correct DB actor permissions and no Discord duplicates, run signed-in E2E and own release identity. Only after full test gates pass, route Test Nginx; never point Test to Production.

## Task D — Spring dynamic user/admin UX [BLOCKED]
Static Next-exported admin HTML bakes error states; replace with authenticated, accessible 320px/390px Spring-served dynamic UI, real admin list and search, live error states, no fake empty/success. Preserve permission, mobile navigation, screen-reader and localization rules.

## Task E — Finance, jobs, Discord [BLOCKED]
Trace pension owner-header direct-table 500 and other private routes. Use existing canonical funded DB wrappers with exact actor, zero direct app DML. Run isolated rollback-only ledger/treasury/banking/stock shop simulations and signed-in result checks. Verify Discord Gateway and voice join/reconnect; never treat Gateway connected as voice joined.

## Task F — Verification and promotion [BLOCKED]
Full Gradle suite currently 136 total/17 fail. Source SHA `72de60d9`; commit only isolated PR branch (based on existing feature head f45ddcb, not canonical main). Reconcile exact remote main and other workers, comprehensive CI, branch approvals, security review, backup/restore, immutable versioned Test and independent Production canary, authenticated E2E, reversible Nginx graceful swap, monitoring and rollback receipts. No automatic promotion of a failing candidate.
