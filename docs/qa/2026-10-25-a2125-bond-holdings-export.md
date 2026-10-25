# Development A QA — v2026.10.25.a2125 (2026-10-25 KST)

**Source implementation complete; release decision: PARTIAL / BLOCKED / PRODUCTION HOLD.** Draft PR #1331. No main merge, Test deployment, Production promotion, live DB write or service restart.

## Scope and provenance
- Main base `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; code tip `f43b1400525a17c421c1ef55912871914ef25baf` before this report commit.
- New owner-only `GET /api/v1/banking/bonds/holdings` reads the existing PostgreSQL `bank_get_my_standing(actor)` SECURITY DEFINER function, which includes **only current holding bonds**. Backend validates shape, exact integer strings and max 100 rows; errors become 503, not invented empty holdings. Existing authenticated/consent guards remain mandatory.
- New `/api/bank/bonds/holdings.csv` validates the caller's viewer session and backend response, escapes CSV formulas/control bytes, returns no-store/noindex/nosniff and a fixed attachment filename. Bank page adds keyboard-accessible CTA with non-settlement disclaimer. Android `/app-api/v1/banking/bonds/holdings` uses the existing session-forwarding native gateway; tests verify cookie and no-store propagation.
- No new migration, new grants, money movement, idempotent mutation, background jobs or synthetic production data. No redemption history or ledger settlement receipt is claimed.

## TDD and exact code-tip evidence
- RED: 4 backend tests failed on absent repository method; formatter and Next route tests failed on missing modules. A further 503 contract test RED (1 failure) was fixed and GREEN.
- GREEN: backend focused 6/6; frontend focused 32/32 (CSV 3, Next route 4, app gateway 11, gateway path 14).
- Typecheck PASS. Lint PASS with 0 errors and 1,128 warnings. Full backend/frontend build PASS.
- Full root `pnpm test` before final 503-only patch: security/backup root 5 PASS; contract 38 PASS; DB 15 PASS/3 SKIPPED; backend 1,317 PASS/398 SKIPPED; frontend 1,404 PASS/6 FAIL. Frontend failures: SEO/i18n 3, login touch-target 1, calculator registration link 1, admin M2 telemetry 1. Final SHA full rerun is mandatory; see PR comment for final SHA evidence.
- `pnpm audit --prod --audit-level high`: FAIL 2 High. `pnpm audit --audit-level high`: FAIL 2 Critical, 10 High, 11 Moderate, 3 Low. `npm --prefix bot audit --audit-level high`: FAIL 1 Critical, 5 High. Bot tests 8/8 PASS after isolated `npm ci --ignore-scripts`.
- `pnpm qa:route-ledger:check`: FAIL (main script requires `--inventory` but package script does not provide it); do not label as pass.

## Real isolated PostgreSQL (not production)
- Docker `moneyverse-test-db`, database `wdmv_v761_test_acl`, PostgreSQL 17.11, 281 migrations.
- `moneyverse_app` can EXECUTE `bank_get_my_standing(uuid)`; cannot directly SELECT `virtual_bank_bonds` or INSERT `ledger_transactions`. Verified using privilege checks and a read-only transaction.
- Verified an existing active actor gets a JSON standing with an empty current holdings array. In a separate transaction inserted **one synthetic test bond**, changed to `moneyverse_app`, observed exactly one owner bond with exact amount string and status, then `ROLLBACK`. Post-rollback holding rows: 0. No committed test fixture or production DB write.
- Actual official Test authenticated member E2E and Test exact-SHA release identity remain BLOCKED.

## CI, Test, Production and rollback
- Draft PR #1331. Earlier candidate CI pending while report drafted; the final head's CI and Test Candidate must be checked independently and recorded on PR. Any failure/skip/pending blocks merge.
- Official Test `/api/version` was `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `/api/version` was `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither equals candidate. No Test deploy, no authenticated E2E, no Production deployment, no GitOps promotion.
- Rollback: no runtime change to revert. The isolated PR can be closed or reverted before merge; no DB rollback/migration needed. Never alter existing deployed images or apply a migration for this candidate.
- Blockers: six frontend regressions (independent QA Draft #1317 addresses them but is unmerged), dependency security advisories, exact-SHA CI/Test E2E, restore/DB environment safety, release authorization. Root disk 98%; live dev DB port 5433 binds all interfaces; do not use it for tests.

## Branch and ownership safety
- Remote branch count 189 at start, 190 after own branch. Open PRs 185 -> 186 after #1331. 189 non-main remote tips retain unique commits. Identical tip/tree groups 0, 187 last patch IDs compared with 0 duplicates. Three conflicting PRs #1107/#1110/#1143 retained. Deleted branches: **0**. All unmerged contributor tips, including Gemini/B/C/QA, preserved.
