# A 2026-11-02 08:25 KST — Public board reply threshold — QA evidence

- Base: `a8541927c3a351d980454c66e95a3356c47e0722` (origin/main at start and mid-run).
- Branch: `auto/hourly-a-20261102-0825-board-reply-threshold` in an isolated worktree.
- P1 implementation: public board users can filter the latest 50 SQL-verified public posts by 2, 5 or 10 replies, combined with stock symbol and literal title query. The SQL function's 50-row boundary is preserved. No table grants, schema changes, migrations, ledger or financial writes.
- Backend: strict canonical `minReplies` query validation; parameterized `comment_count >= $4::integer` after the bounded `SECURITY DEFINER` function; explicit applied filter echo. Invalid and duplicate inputs return HTTP 400.
- Web: accessible selector, invalid-query feedback, noindex, bounded scope explanation; fail closed if the source does not prove the threshold and every row.
- Android App API: rejects duplicate/noncanonical parameters before upstream; verifies JSON media type, applied filter, count safety, UUID identity and uniqueness (case insensitive), max 50 rows; returns HTTP 503 for an unverified HTTP 200; no-store/noindex for filtered results.
- TDD RED evidence: `evidence/backend-red.log`, `frontend-red.log`, `proof-red.log`; GREEN: `backend-green.log`, `frontend-proof-green.log`.
- Full local tests (initial exact working tree): Backend 2,995 pass / 518 skip; Frontend 2,950 pass; Database 62 pass / 5 skip; Contract 41 pass. `pnpm typecheck` pass. See `/srv/moneyverse-data/tasks/mv-a-20261102-0825-board-reply-threshold/evidence/`.
- Real PostgreSQL 17.11: read-only `SET LOCAL ROLE moneyverse_app`; function EXECUTE allowed; recent snapshot 1 row, >=2/5/10 all 0; transaction ROLLBACK. No positive live multi-row data to demonstrate threshold ordering; synthetic read-only PostgreSQL VALUES (0,2,5,10) produced threshold counts 3/2/1. Existing P0: `moneyverse_app` directly UPDATE `account_balances` and DELETE `user_items` (both true) — NOT RESOLVED.
- Gate and release status: **HOLD** until exact final SHA CI, candidate image, isolated Test exact-SHA authenticated E2E, independent backup restore, P0 DB least privilege, dependency audit and GitOps release gate are proven. No production deployment or migration.

- Additional local gates: 34 policy/security/backup/release tests PASS; full ESLint exit 0 with 1,027 existing warnings; Backend/Frontend build PASS (602 static pages); production dependency audit PASS (0 known vulnerabilities); **full dependency audit FAIL** (9 findings: 1 low, 8 moderate). Generated mobile API contract/schema updated; pre-commit checker compares against committed HEAD, so it must be rerun after commit.
- Public Test and Production backend/frontend version endpoints returned `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`; candidate is not running.
