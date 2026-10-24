# B v518 — Appraisal ownership enforcement containment (P0, HOLD)

## Before work — 2026-10-25 00:35 KST
- Starting main SHA: `c9a868b1e622341e2daa8b936ddf0988eda9988e`.
- Branch: `auto/hourly-b-appraisal-ownership-hold-v518-20261025-0035` (isolated worktree).
- Source: QA/security issue #1188; C #1187 handles browser-side receipts, but the authenticated Backend appraisal endpoint still trusts caller-supplied item identity, name and rarity. Migration 276 only verifies active actor and ledger settlement, not ownership. An attacker can bypass browser checks.
- Overlap audit: #1187 frontend; #1186, #1143, #1139, #1117, #1105 have unresolved migration-280 collision (#1147). Do not introduce an uncoordinated DB migration. Other A/C/QA worktrees and reservations are protected.
- Plan: write failing service/controller regression tests; make Backend service and HTTP endpoint fail closed with HTTP 503 before SQL/fee; keep existing owner-only certificate reads. Document contract, run focused and broad gates; coordinate a forward-only DB ownership fix with A/C/QA. No merge or deployment without full gates.

## In progress
- [x] RED: 3/3 focused tests fail (unsafe SQL attempted / controller permits forged certificate); evidence in internal `red.txt`.
- [x] GREEN: service + controller reject issuance with HTTP 503 before DB call; owner reads unchanged. 10/10 focused unit and 2/2 HTTP tests PASS. HTTP TDD RED observed HTTP 201 (old code), GREEN HTTP 503 (new code).
- [ ] Verify unit/contract/lint/typecheck/build/PG/security/CI; record failures accurately.
- Midpoint main: `c9a868b1e622341e2daa8b936ddf0988eda9988e` (unchanged); newest planning PR #1195 v1240 still draft.

## Finished
- Pending.

## Finished — 2026-10-25 KST (PARTIAL / BLOCKED)
- Final main recheck: `c9a868b1e622341e2daa8b936ddf0988eda9988e` (no advancement from starting main). Latest canonical EN/KO plan on main remains v1210; planning PR #1195 v1240 is still draft.
- Code: Backend `POST /api/v1/marketplace/appraisals` now returns HTTP 503 before service invocation. Service itself rejects issuance before any SQL/250 WLD fee. `GET /api/v1/marketplace/appraisals` remains owner-scoped. Existing API request DTO/path and DB schema unchanged; no migration or financial data changed.
- TDD: 3/3 initial unit RED, then 10/10 focused unit GREEN; HTTP RED proved forged item HTTP 201 and HTTP GREEN proved 503 + read 200 (2/2). Logs: internal `red.txt`, `green.txt`, `http-red.txt`, `http-green.txt`.
- Local gates: ESLint PASS (0 errors, 1137 warnings); Typecheck PASS; Backend tests 1318 PASS/398 SKIPPED (no database); DB package 15 PASS/3 SKIPPED; API contract PASS (179 endpoints); security scripts 18 PASS; Backend build PASS.
- Blocking gates: Frontend tests 1397 PASS/6 FAIL (locale 1, SEO 3, login touch 1, M2 telemetry 1). Default Turbopack build FAIL (cross-filesystem node_modules symlink); Webpack fallback FAIL (1 GiB heap OOM). Production dependency audit FAIL (2 HIGH: body-parser, multer); full audit FAIL (2 CRITICAL/10 HIGH/11 MODERATE/3 LOW); bot audit FAIL (1 CRITICAL/5 HIGH).
- Real PostgreSQL: disposable loopback-only PostgreSQL 17.11 container was started but the isolated migration command was denied by remote execution safety checks; it was stopped and removed without applying migrations. **Real PostgreSQL application-role/integration tests NOT VERIFIED.** No shared/production database was used for fixtures.
- GitHub: Draft PR #1196, initial implementation SHA `1838ab57dd291a20b5f92296395ffb0dbf8154c4`; final documentation SHA will be recorded in GitHub PR. Required CI workflows were still running at this checkpoint, **not PASS**.
- Public version checks: Test `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `6a989b5ac0c6155587d43426d64f6def6b62c917`; neither matches the candidate. Exact-SHA Test auth/backend/API/DB/core-flow E2E **BLOCKED**.
- Security residual: migration 276 `marketplace_create_appraisal_certificate` still lacks ownership and canonical catalog checks, and its app-role EXECUTE grant is unchanged. This PR is only a Backend API containment, **not** a DB-level fix or complete user flow. Follow up with a coordinated immutable migration after #1147 collision resolution, checking `user_items` quantity/expiry and authoritative `shop_catalog` fields inside the settlement transaction. Coordinate frontend error/disabled CTA with C #1187.
- Operational: root disk 98–99% used (~1.9 GiB free); data volume 40% used. #1170 updated. Existing A/B/C/QA/planning reservations verified enabled and unchanged; no other worktree or branch deleted.
- Merge: NONE. Production deployment: NONE. Rollback: not needed (no runtime change). Cleanup: only own temporary PostgreSQL container removed; Draft branch and worktree preserved with unique unmerged code. Final result: **PARTIAL / BLOCKED**, Production HOLD.
