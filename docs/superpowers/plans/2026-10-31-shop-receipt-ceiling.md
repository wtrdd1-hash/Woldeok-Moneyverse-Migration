# Shop purchase receipt WLD ceiling — implementation plan
Date: 2026-10-31. Base: 761a55a094fb9dd383d213e817305e68c79fa23c.
Scope: P1 owner-only maxAmount filter for recent shop receipts. Existing public.shop_list_my_purchases(actor, limit) is the owner-scoped DB source; no new DDL, grants or financial writes. Filtering is limited to latest 100 owner receipts; unfiltered defaults to 30. Keep integer strings, inclusive upper bound and existing summary of displayed rows.
Security: SessionGuard/AuthenticatedGuard/ConsentGuard, strict 1..30 canonical positive digits, no duplicates, min<=max, fail closed on forged 200, private/no-store/noindex on web and Android, no user data in logs. No feature flag is needed for read-only filter; rollback by reverting branch.
Tasks:
1. Write failing Nest service/controller tests for exact max WLD, combined floor/ceiling, invalid/duplicate/reversed range; run RED.
2. Write failing Next BFF and Android gateway tests for forwarding, invalid input, unverified upstream; run RED.
3. Implement minimal Nest controller/service and Next BFF/gateway validation; run GREEN.
4. Add accessible maximum amount field and validation to MyReceipts; test range helper and UI semantics.
5. Run targeted tests, typecheck, builds, lint, API contract, security, isolated PostgreSQL function and ACL, full suites and CI. Recheck latest main/plan mid and preintegration.
6. Draft PR with exact SHA, release HOLD if any required gate fails; record EN/KO QA/worklog and branch retention.
