# A1648 QA — National pension historical payout receipt integrity (2026-10-25)

**Verdict: PARTIAL / BLOCKED. Production RELEASE HOLD.** No deployment or financial mutation was authorized.

## Source and isolation
- Baseline `origin/main` `1c5b84a1c45baafcca83f375a6f99698121e9bb5` at start and mid-task. English README/AGENTS and living English/Korean project plans/integrated master reviewed; no cross-worker edits.
- Branch `auto/hourly-a-pension-receipt-truth-20261025-1648`, isolated `/srv/moneyverse-tasks/hourly-a-pension-receipt-truth-20261025-1648`. Initial remote branches 165 / open PRs 161. Later audit 167 / 163; all 166 non-main branches retain unmerged unique changes. No identical SHA or tree duplicates. Existing conflict PRs #1107/#1110/#1143 preserved. Deleted 0.
- Code checkpoint `2d33e8b37b04b1db3784a5fd43466bbab05604eb`. Draft PR #1303. P0 read-path follow-up #1302.

## P0 finding and behavior
- Migration 275 documents 98 unjournaled 45-WLD pension payouts; historical payout rows contain no canonical ledger transaction ID. They cannot be represented as settled WLD.
- Member API now annotates original owner-scoped payout rows with `ledgerVerification: UNVERIFIED_LEDGER`, `ledgerTransactionId: null` without rounding the amount. SQLSTATE 42501 maps to explicit 503, not a false empty success.
- Web pension portal no longer substitutes an invented 25,000,000 WLD vault or treats read failures as signed-out/zero balances or no history. Payout totals/rows are clearly **historical unverified records**. Android app-api preserves cookie, exact integer strings and private no-store/noindex.
- No applied migration modified; no new schema, no ledger write, no payout release, no service restart.

## Verification evidence (code checkpoint)
- TDD RED reproduced 6 focused failures across backend, member page and Android; GREEN backend 4 PASS, frontend/app-api 16 PASS. Total focused **20 PASS**.
- Full workspace typecheck **PASS**. ESLint **PASS with 0 errors / 1,128 existing warnings**. Contract 38 PASS; database package 15 PASS / 3 SKIPPED; backend 1,316 PASS / 398 SKIPPED; frontend 1,403 PASS / **6 FAIL** (SEO 3, login touch target 1, calculator registration link 1, admin M2 telemetry 1). Bot 8 PASS.
- Production dependency audit **FAIL: 2 High**. Full dependency audit **FAIL: 2 Critical / 10 High**. Bot npm audit **FAIL: 1 Critical / 5 High**.
- First build failed from a worktree-local `node_modules` symlink escaping Turbopack's filesystem root; after offline, frozen local install, the unmodified code checkpoint **Backend + Frontend Turbopack build PASS**. This was an environment fix, not a bypass or code change.
- Isolated PostgreSQL 17 read-only `wdmv_v761_test_acl`, `SET LOCAL ROLE moneyverse_app`: `national_pension_payout_logs` SELECT false, INSERT false; `national_pension_accounts` SELECT false. Owner-filtered payout SELECT raises **42501 permission denied**. No row fixture or SQL mutation; transaction rolled back. Full authenticated real-data pension E2E **BLOCKED**. Must add reviewed owner-scoped SECURITY DEFINER read functions in forward-only collision-free migration; no direct SELECT grant.
- Host exact-SHA Test identity **FAIL**: candidate `2d33e8b3...`, Test manifest/backend/frontend/build `9f39f041...`, public Test version `6f697e74...`. Public Test not running candidate; no authenticated Test finance E2E.
- CI / Build Test Candidate for the code checkpoint were pending/failing at report time; **no overall PASS attestation**. See PR #1303 checks/comments for latest exact SHA.

## Rollback and release gate
- Test: no release staged. Production: unchanged. No DB changes, migrations, feature switch edits, service restarts, or branch deletion.
- Rollback for this unmerged candidate: close/revert Draft PR; keep all historical payout records and finance hold. Do not re-enable legacy pension settlement.
- Merge/Production blocked by real-PG 42501, six frontend regressions, security audit, exact-SHA Test identity and authenticated E2E. A passing build alone is not authorization. GitOps/zero-downtime release gate not reached.
