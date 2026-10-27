# Backend B v590 — P0 #1502 SQL-boundary containment (DRAFT / RELEASE HOLD)

Date: 2026-10-27 20:38–20:50 KST. Baseline main: `59cdc2e02f0e83e5401049309c4cb89ff57c2d4c`.
Branch: `auto/hourly-b-space-sql-ledger-hold-v590-20261027-2035`.

## Source and coordination
- Read AGENTS.md, README.md, PROJECT_PLAN.md (canonical EN), PROJECT_PLAN.ko.md, QA v1323, issues #1502/#1469, open PRs, CI and other agents' ongoing branches.
- Main still has two files numbered 280. A's Draft PR #1564 proposes a 282 help-center migration; **do not reuse 282**, do not modify applied 223/231, do not merge this 283 independently of a verified 280/282 repair.
- QA v1323 reports 235/241 app-mutable tables, three PUBLIC bank EXECUTE grants, five applied checksum drifts, 24 root dependency advisories, and missing official Test exact-SHA. None of those gates is waived.

## Actual changes
- Forward-only 283 replaces three unjournaled SECURITY DEFINER WLD mutations (`space_purchase`, `city_project_contribute`, `space_pay_property_tax`) with explicit SQLSTATE 55000 failures, revokes PUBLIC/app EXECUTE, and removes broad app INSERT/UPDATE/DELETE on the four associated tables.
- Preserves legitimate owner space-layout edits via a narrow SECURITY DEFINER `space_update_layout(actor,space,jsonb)` that updates only `layout` and `updated_at` for matching owner, with JSON object and size bounds; PUBLIC denied, app EXECUTE granted.
- Repository uses the new owner-scoped function, not direct app-table UPDATE. Existing read-only endpoints and response shape remain. No financial settlement, fabricated receipt, historical balance adjustment, or migration rewrite.
- API/DB contract: unsafe purchases/contributions/tax continue HTTP 503 `SPACE_LEDGER_SETTLEMENT_UNAVAILABLE` at backend and now fail SQL-side with 55000 when privileged; owner layout update remains `{ok:boolean}`. No new public endpoint.

## TDD and verification
- RED: SQL fixture test 4/4 failed on missing 283; layout repository test 1/2 failed on direct UPDATE.
- GREEN: focused SQL 4/4 and layout 2/2 passed.
- Disposable PostgreSQL 17.11 synthetic fixture: migration parsed/applied, role-negative ACL, cross-owner denial, authorized layout update, 100 sequential attempts per function and **100 concurrent transactions (20 clients x 5; 300 function attempts) all denied**; balances 100000→100000, ledger transactions/postings 0→0. Container removed. **Not a full production-schema or official Test validation**.
- Backend: 1,546 PASS / 412 SKIP. Frontend: 1,485 PASS. Typecheck PASS. Lint 0 errors / 1,122 warnings. Build PASS. API contract 179 endpoints PASS. Bot 8 PASS after installing offline dependencies.
- Root `pnpm test` FAIL: existing main duplicate migration 280 and missing 282 sequence. Database tests 23 PASS / 1 FAIL / 3 SKIP; **do not count root suite as passing**.
- Full pnpm audit FAIL: 2 Critical / 8 High / 11 Moderate / 3 Low. Bot initial local run failed due missing package; rerun passed after offline install.
- GitHub CI and official Test exact-SHA / authenticated E2E / GitOps release gates: not yet passed at preparation time; final status is recorded on the PR.

## Deployment and protection
- No main merge, no Production/Test deployment, no live database writes, no historical migration edits, no branch cleanup, no changes to Gemini/A/C/QA workspaces or core scheduled automations.
- PR remains Draft + hold until migration parity, applied checksums, full security audits, complete exact-head CI, real PostgreSQL full-schema/ACL, official Test authenticated E2E, and approved GitOps gates all PASS.
- This is a **P0 safety containment**, not implementation of atomic double-entry space settlement or proof of Production readiness.
