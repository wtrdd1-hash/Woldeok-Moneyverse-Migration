# Verified Shop Purchase History — Development A

## Approved task context
The recurring engineering directive requires one P0/P1 member-facing end-to-end feature, privacy/ledger truth, real DB checks, and no false success. The existing `shop_list_my_purchases` owner-scoped function is the SQL authority; this bounded change activates its previously unmounted web read surface and corrects false-empty failure handling. No schema change, no purchase mutation, no new authorization grants.

## Contract
- Signed-in members see the last 30 authoritative purchases, item, timestamp, exact WLD integer string and transaction reference. Label the limit; do not call it all-time history.
- Signed-out callers cannot obtain another member's data. The Next gateway propagates 401/403, responds 503 on upstream failure/invalid shape, and never returns 200 empty unless the backend actually returned a valid empty list.
- Private/no-store, noindex of any private new surface, accessible retry on failure, and no stale receipts after sign-out/account switch.
- Android app-api continues to proxy `GET /api/v1/shop/purchases` with session, status and no-store semantics. The database function enforces owner filtering; no new SQL grants.

## Implementation and TDD
1. Add gateway regression tests for valid empty and nonempty lists, 401, upstream 503, exception, malformed payload. Run RED.
2. Add component tests for loaded/empty/error/signed-out/late-response cases. Run RED.
3. Implement Next gateway fail-closed behavior and receipt UI with retry and exact data; mount on shop page. Run GREEN.
4. Add backend owner-bound purchase query regression and Android gateway status tests; run focused and broad suites.
5. Verify isolated real PG `shop_list_my_purchases` and app-role permissions under read-only rollback. Recheck latest main and planning docs.
6. Record all build/lint/typecheck/security/SEO/a11y/app-api/E2E and Test exact-SHA gates, PR/CI/branch audit. Merge only if every gate is green; otherwise Draft PR and Production HOLD.
