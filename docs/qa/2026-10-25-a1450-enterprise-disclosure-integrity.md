# QA A1450 — public virtual enterprise disclosure integrity

**Decision: PARTIAL / BLOCKED — Production RELEASE HOLD.** 2026-10-25, Asia/Seoul.

## Provenance and scope
- Fresh isolated worktree `auto/hourly-a-enterprise-disclosure-truth-20261025-1450`, start main `54702642e05790de787f1a8e6f098d520dfbf445`, refreshed mid-run through `8d80d36c`, then `669d1b85`; final main refreshed before PR integration.
- The original public `/enterprises` page invented a 365,000,000 WLD holding, 3 enterprises, 108,000 WLD hourly dividends and a live disclosure timestamp whenever the API failed. These were hard-coded fallback records and **not** a DB-confirmed response. It also called projected dividends actual treasury remittance.
- New UI shows only source-validated, bounded, exact integer-string data, or explicit unavailable status with retry. DB-backed hourly operating figures are labelled *projections* and `settlementStatus=NOT_VERIFIED` prevents claiming a ledger-confirmed payment. Backend returns sanitized HTTP 503 on repository failure; Android app-api preserves exact strings and upstream 503. No new migration or financial writes.
- Backend public repository still queries enterprise tables directly; **moneyverse_app cannot SELECT them** in isolated PostgreSQL. Issue #1287 tracks the forward-only SECURITY DEFINER read-function prerequisite. No broad GRANT or migration was applied.

## Red/green and gate evidence
- RED: frontend 3 failing source-truth tests; backend 2 failing provenance/503 tests. GREEN: focused frontend 4 PASS, Android route 2 PASS, backend 2 PASS. React test runner must use NODE_ENV=test (host defaults to production).
- Full backend: **1315 PASS / 398 SKIPPED**. Full frontend: **1403 PASS / 6 FAIL**. Known failing groups: SEO 3, calculator registration 1, login touch target 1, admin M2 telemetry 1. No full frontend PASS.
- Database package: **15 PASS / 3 SKIPPED**. Contract package: **38 PASS**. Bot: **8 PASS** after isolated `npm ci --ignore-scripts` (initially missing bot dependency). Android contract generation/check **PASS**.
- Backend/frontend typecheck **PASS**, workspace build **PASS**, ESLint **0 errors / 1127 warnings**.
- Production dependency audit **FAIL: High 2**. Full dependency audit **FAIL: Critical 2 / High 10** (26 total). Bot audit **FAIL: Critical 1 / High 5**.
- Isolated PostgreSQL 17.11 `moneyverse_audit_v855`, READ ONLY and ROLLBACK: migrator-role positive fixture 3 SOEs, 365000000 WLD stored assets, 108000 WLD **projected** hourly dividend, 5 private enterprise rows. `moneyverse_app`: SELECT on SOE and private enterprise tables DENIED (42501); enterprise INSERT/UPDATE/DELETE DENIED; ledger posting UPDATE DENIED. Therefore app-role real DB E2E is **BLOCKED**, not PASS. No Production-linked 5433 writes.
- Official Test backend `/api/version` reported `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, not this candidate. Official Test `/app-api/v1/enterprises/public` returned HTTP 500 before this branch. Exact-SHA authenticated/anonymous Test acceptance and GitOps release gate **BLOCKED**.
- Accessibility: unavailable section has `role=status` and retry link; focused DOM tests PASS. Global login accessibility test FAIL. SEO: public metadata updated to avoid financial settlement assertions; global SEO tests FAIL. Neither is a full PASS.

## Rollout and branch audit
- At start: remote heads 154, open PRs 150; no overlapping open PR modifies public enterprise disclosure. B's SOE admin work is separate. No other branch/worktree touched.
- Candidate branch is unmerged and retained. Other non-main refs contain unique unintegrated work; no branch deleted. Competing unmerged migration `280-*` proposals make choosing a new migration number unsafe without coordination.
- No merge to main, official Test promotion, Production deployment, GitOps action, service restart, financial write, live migration, or rollback executed. Rollback plan if later merged: revert this read-only code; no schema or ledger changes to undo. Retain all branches pending explicit verified merge/substitution.

## Blockers to remove before release
1. Implement and verify least-privilege public SOE SECURITY DEFINER read model in an approved non-conflicting forward migration (#1287), preserving app-role table access denial.
2. Resolve all six full frontend failures, production/full/bot security findings, and any additional CI failures.
3. Rebuild and verify the exact final SHA in isolated Test including anonymous public GET, DB/ACL and Android E2E; confirm release identity and required GitOps approvals. No PASS evidence means no merge or Production promotion.

### Final preintegration snapshot
- Latest main `1c5b84a1c45baafcca83f375a6f99698121e9bb5`, merged into isolated candidate before the full recheck. Code/report test SHA `a45929d2138af4fb07a0ad6e97b65110b1d9d5a8`.
- Remote heads 154 → 155; open PRs 150 → 151; new Draft #1288. No branch deletion. CI #40167713915 and Test Candidate #40167704222 were IN_PROGRESS, never treated as PASS.
- The candidate remains unmerged and Production RELEASE HOLD. Any later documentation-only commit has its exact final head SHA in the PR, not in a self-referential file.
