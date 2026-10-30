# Owner-private Shop Purchase CSV Implementation Plan
> For agentic workers: use test-driven-development, using-git-worktrees, and verification-before-completion.

**Goal:** Let a signed-in, consented member download up to their latest 100 own shop purchase receipts as safe UTF-8 CSV, optionally filtered by item name.

**Architecture:** Nest GET /shop/purchases/export uses the existing ShopService.myPurchases(owner, { limit: 100, query }), whose PostgreSQL SECURITY DEFINER read function scopes rows to the authenticated owner. Next's dynamic CSV route validates JSON and escapes formula-like names; the browser uses a same-origin link, and the Android app-api receives verified private JSON. No new migration.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL 17.

**Spec:** This plan and `docs/worklog/2026-10-30-shop-purchase-csv.md`.

## Global Constraints
- Never expose a member's receipts in cached static HTML, public endpoints, logs, or a shared CSV.
- All money amounts are canonical integer strings, never JS Number.
- A failed or malformed upstream response is 503, never a fabricated empty CSV.
- Max 100 rows from the existing owner-scoped DB function; not all-time history.
- CSV protects formula injection, control bytes, quotes, CRLF, Unicode; no credentials in output.
- No new migration, table grants, ledger mutation or Production rollout.

## Review Focus
- Forged owner cannot select a different member.
- Duplicate or oversized search rejected before DB.
- Backend error or malformed 200 is never downloaded as a successful CSV.
- Spreadsheet formula injection including whitespace-prefixed = + - @.
- Android must receive no-store/noindex and fail closed on malformed export JSON.

### Task 1: Backend export contract
- [x] Add failing tests for authenticated owner, 100 cap, search, invalid query.
- [x] Verify RED, implement controller read-only method and strict response scope.
- [x] Verify GREEN.

### Task 2: CSV verification and BFF
- [x] Add failing tests for malformed data, 2^53 precision, CSV escaping and formula injection.
- [x] Verify RED, implement parser/formatter and private CSV route.
- [x] Verify GREEN.

### Task 3: Web and Android
- [x] Add failing browser CTA and Android gateway privacy/contract tests.
- [ ] Verify RED, add accessible download link and fail-closed Android JSON contract check.
- [x] Verify GREEN and security/SEO regressions.

### Task 4: Integration and release gate
- [x] Recheck latest main and EN/KO plan.
- [ ] Run targeted, lint, typecheck, build, full tests, app-api, security, accessibility, SEO.
- [ ] Verify owner and app-role ACL against isolated PostgreSQL; rollback synthetic data.
- [ ] Create Draft PR, inspect exact-SHA CI; do not merge/deploy unless all required gates PASS.
