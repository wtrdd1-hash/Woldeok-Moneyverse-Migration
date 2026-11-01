# A 01:55 — Recent Unanswered Public Board QA (2026-11-02)

**Status:** DRAFT / RELEASE HOLD. English authoritative; Korean translation in the companion file.

## Scope and code
- Isolated `auto/hourly-a-20261102-0155-board-unanswered`, base main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`.
- Nest validates optional `unanswered=1` and applies `comment_count=0` *after* the existing bounded `member_board_public_list_with_stock(50)` read; combines stock/title filters. No new table, migration, role grant or monetary write.
- Next labelled GET checkbox, noindex for query results, no-store fetch, explicit bounded scope and error vs verified-empty distinction.
- Android app-api rejects duplicate/unknown/malformed filtered queries, enforces `appliedFilters: {unansweredOnly:true, scope:'latest50'}` and zero comment counts with unique case-normalized UUIDs before forwarding 200; no-store/noindex.

## Verified gates
- TDD RED: Backend 3 failures, Frontend 8 failures; GREEN targeted Backend 22 PASS, Frontend/Android 15 PASS (after additional negative tests).
- Workspace Typecheck PASS; changed-file ESLint PASS.
- Actual development PostgreSQL 17.11 read-only as `moneyverse_app`: function EXECUTE=true; latest 1 public post, unanswered 1, replied 0; ROLLBACK. This verifies one positive row but not a multiple-row production-like fixture.
- Root `pnpm test` first run FAILED at API contract drift because generated files were uncommitted; committed the generated contract and reran. **Second root test PASS (exit 0):** preflight 34 PASS, contract 41 PASS, database 62 PASS / 5 SKIP, Backend 2,987 PASS / 518 SKIP, Frontend 2,937 PASS. Existing simulated-error messages in stdout did not fail the test runner.
- Full `pnpm build` PASS; full `pnpm lint` PASS with 0 errors / 1,027 pre-existing warnings; full `pnpm typecheck` PASS. Mobile API contract regenerated: 184 endpoints; drift check PASS after commit.
- Supply-chain audit: production dependencies PASS (0 known advisories), full development dependency audit **FAIL (9: 1 low, 8 moderate)**. Do not call this an all-security PASS.
- DEV DB least privilege **P0 FAIL**: `moneyverse_app` effective `account_balances.UPDATE`, `user_items.DELETE`, `users.SELECT` all true; public board read function owner is `postgres` rather than policy `moneyverse_migrator`. Source function is SECURITY DEFINER and EXECUTE granted. Production role state not inferred.
- Virtual merges **CONFLICT**: 9 files against Draft #2399, 6 files against Draft #2407. Preserve their unique commits; do not merge this branch until coordinated resolution and full rerun.
- Public Test `/api/version` and `/frontend-version` both report main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, not this candidate. Production backend reports `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, frontend `1793450413898`. Exact candidate authenticated Test E2E and rollback remain BLOCKED.

## Outstanding / blockers
- Final documentation-inclusive SHA CI, isolated Test authenticated E2E, real-browser accessibility/SEO E2E and independent rollback evidence remain pending/BLOCKED. Static source a11y/SEO and gateway noindex tests passed; no browser E2E claimed.
- Existing P0 DEV database least-privilege discrepancy #993 and Production provenance #1984 not repaired here.
- Potential source overlap with other Draft board PRs #2399/#2407; no cherry-pick, force push, deletion, merge or production change.
