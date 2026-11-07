# Development A 06:25 — public service source drill-down QA (2026-11-02)

**Verdict:** P1 implemented in Draft PR #2435; local build/typecheck/unit/contract PASS after regression repair; full dependency security audit FAIL; official exact-SHA Test E2E BLOCKED; **RELEASE HOLD**.

## Scope and source
- Branch `auto/hourly-a-20261102-0625-status-attention`, main baseline `a8541927c3a351d980454c66e95a3356c47e0722` (start, middle and pre-close recheck). Feature SHA `da5b372f9ce29281c0e5a56a0d3aedd7b34bf8d8`; test repair SHA `29b5fe4c519b02961117d505ed549ebf377849e8`.
- Existing attention-only status filter PR #2264 was discovered before committing the duplicate; uncommitted duplicate was discarded. New distinct source-key drill-down was implemented on fresh main.
- Web `/status?sourceKey=api` preserves unfiltered worst-first headline; accessible source links and reset, verified empty vs unavailable; Nest `GET /api/v1/status?sourceKey=api` strict canonical source, exact proof; Android `/app-api/v1/status?sourceKey=api` rejects duplicate/unknown params and stale 200 responses without source proof. Query results no-store/noindex. Database uses existing read-only `public.content_public_status()` SECURITY DEFINER function, no migration or privilege expansion.

## Actual gates
- RED→GREEN targeted: Backend 10 PASS, Frontend 13 PASS. First full Frontend 2,928 PASS / 1 FAIL because documented app-group allowlist lacked newly supported `status`. Updated the contract expectation, not the gate; targeted repair 21 PASS.
- On repair SHA `29b5fe4c...`: Backend **2,982 PASS / 518 SKIP**, Frontend **2,929 PASS**, Database **62 PASS / 5 SKIP**, Contract **41 PASS**; full typecheck PASS; lint **0 errors / 1,027 warnings**; API contract check **184 endpoints PASS**; workspace build PASS; security advisory tests **11 PASS**; production dependency audit **0 known vulnerabilities**.
- Full dependency audit **FAIL**: 9 advisories (1 low, 8 moderate), including dev-tool transitive `deepmerge` advisory. Do not treat production-only audit as clearing the full audit.
- DEV PostgreSQL 17.11 as `moneyverse_app` READ ONLY/ROLLBACK: `content_public_status()` EXECUTE=true; 3 public sources (`api`, `database`, `web`); `api` exact match 1, unknown exact match 0. No DB DML, schema migration, ledger write or session mutation.
- Existing **P0 #993** persists on DEV: app-role direct `account_balances UPDATE=true` and `user_items DELETE=true`. This is DEV evidence only, not a claim about Production ACL.
- Official Test `/api/version` = `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`; Production `/api/version` same. Neither is candidate SHA. Official Test exact-SHA authenticated E2E, independent restore and GitOps release provenance **BLOCKED**. No deploy, merge, DB change, service restart or rollback.
- Virtual merge with existing status PR #2264 conflicts in controller/service/gateway/page/contracts; board PR #2429 conflicts in Android gateway. Unique unmerged changes preserved; no forced integration or branch deletion.

## Release gate and rollback
No main merge or Production promotion until exact final SHA CI, official Test exact-SHA authenticated E2E, security/ACL, independent restore, conflict resolution and GitOps gates all PASS. Rollback for this unmerged read-only feature is to close/revert PR; no DB migration rollback is needed.
