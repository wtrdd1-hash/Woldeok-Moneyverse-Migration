# A0425 — Verified shop upkeep and arrears CSV snapshot

## Discovery and scope correction
The initial generic inventory CSV idea was already implemented in **unmerged Draft PR #1299**. The initial recent-50 PR scan missed it; the full 217-PR audit caught the duplication before integration. Generic export code and tests were discarded. This work is now a distinct P1 **current shop maintenance exposure** export: weekly upkeep, arrears due/cap, unpaid weeks and suspension, not inventory ownership or purchase receipts. PR #1299 and C's inventory integrity PR #1176 are untouched.

## Design
1. NestJS GET /api/v1/shop/holdings/upkeep-snapshot: SessionGuard + AuthenticatedGuard + ConsentGuard. Reuse existing PostgreSQL SECURITY DEFINER shop_my_items_v2(actor) via repository. Reject any malformed monetary, weeks or suspension field before filtering; include only holdings with positive weekly upkeep, positive arrears or suspension. Cap the **relevant** set at 100; reject overflow, never truncate. Return complete:true, server generatedAt and an explicit minimal column allowlist.
2. Next same-origin GET /api/shop/holdings/upkeep-export: guarded internal API call, strict response and canonical bigint-string validation, UUID, bounded text, integer weeks/quantity and timestamps. No actor query, no mutation, no client-side amount inference. UTF-8 BOM, CRLF, quoted cells, invisible-control stripping and spreadsheet formula neutralization. Private/no-store, nosniff, noindex; 401/403/428 propagated, upstream failures 503.
3. Member /inventory link only when source inventory was read; truthful unavailable state; noindex, accessible link. Android /app-api/v1/shop/holdings/upkeep-snapshot preserves member cookie and private cache response, does not invent data on auth failure.
4. TDD RED→GREEN backend/frontend/Android and privacy whitelist. Real isolated PostgreSQL app role ACL + owner/foreign sample + transaction ROLLBACK; no migration, no ledger mutation. Full test/build/lint/typecheck/security/official Test exact-SHA release gates mandatory.

## Acceptance and rollback
Complete current exposure is not a payment receipt, a debt settlement or a historical ledger. Missing source data must never be shown as zero obligations. If >100 relevant items or any malformed field, fail closed. Roll back only the source routes and UI if approved; no database or financial rollback required. HOLD on any failed release gate.
