# A 2026-10-30 15:57 — Public board recent-title search QA

**Verdict: TARGETED PASS / FULL TEST FAIL / OFFICIAL TEST BLOCKED / RELEASE HOLD.**

## Scope and provenance
- Base main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; branch `auto/hourly-a-20261030-1557-board-title-search`, independent linked worktree. Existing dirty A support worktree and B/C PRs untouched.
- Public `/board` GET title search (`q`), optional stock symbol preserved; case-insensitive literal substring within **latest 50** public posts, not full-archive search. No authenticated member data, no new migrations, no WLD ledger writes.
- Nest public board controller rejects duplicate, array, unknown, blank, >80, control/HTML-bracket query parameters (400). Service binds query as PostgreSQL `$3::text` and uses `strpos`, not LIKE wildcard interpolation. DB read remains in existing `SECURITY DEFINER member_board_public_list_with_stock(50)`; no app-role direct table SELECT.
- Next accessible labeled GET search, explicit 50-post scope, invalid/empty/unavailable states, canonical base and noindex on search variants. Android app-api forwards q, strips cacheability and adds noindex for q responses. Swagger query annotations included.

## Fresh evidence
- RED: Backend 13 failed, 2 passed; Android q indexing regression failed. GREEN: Backend target 15 PASS, Frontend target 11 PASS (including board advertising regression).
- `pnpm --filter @moneyverse/contract build` PASS; backend/frontend TypeScript PASS; full ESLint 0 errors / 1,043 warnings; backend Nest build PASS; Next build PASS; generated mobile API contract 183 endpoints PASS.
- Full backend Vitest **2,576 PASS / 119 FAIL / 495 SKIP**; full frontend **2,616 PASS / 53 FAIL**. Failures include treasury reconciliation and central-bank status. Counts match earlier A baseline, but complete failure-name equivalence not independently established.
- Database unit **56 PASS / 4 SKIP**; production dependency audit: **no known vulnerabilities**.
- Isolated PostgreSQL 17: test role provisioning blocked full 305 migration replay at migration 020 (security-role membership). Separate feature SQL smoke applied up through 181 with 020 skipped; this is **not full migration parity certification**. App role can EXECUTE SECDEF function and cannot SELECT member_board_posts. 52 synthetic posts -> recent 50, WLD query 2, literal `%_` query 1, older-than-50 query 0. Synthetic ledger transactions/postings both 0. Test-only container removed.
- Test/Production public GET `/api/v1/board/public/stock-posts` both HTTP 200 on 2026-10-30 16:16 KST, but **neither was deployed at candidate SHA**. Official exact-SHA authenticated Test E2E, real full migration parity, independent backup restore and GitOps release gate BLOCKED.

## Release / rollback
- No main merge, Test/Production deployment, production DB migration, service restart, finance mutation or rollback. Feature is not released. Rollback is to leave draft PR unmerged; if ever released, revert only this code via reviewed GitOps path after gate approval.
- No existing branch/PR deleted. All unique unmerged changes preserved. Dedicated test container only was removed.
- Detailed local logs: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-30-1557-board-title-search/`.
