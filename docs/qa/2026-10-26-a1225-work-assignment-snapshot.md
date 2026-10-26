# QA — A1225 private recent work assignment snapshot
Date: 2026-10-26 (KST). Status: PENDING FINAL GATES / RELEASE HOLD.

## Verified scope
- Source origin/main 1c5b84a1c45baafcca83f375a6f99698121e9bb5, branch auto/hourly-a-work-assignment-snapshot-20261026-1225.
- /work member CTA -> private Next CSV -> authenticated NestJS snapshot -> work_my_assignments(p_actor) -> existing PostgreSQL read model; Android app-api JSON parity.
- Source is **recent 50 only**, never complete history or settlement proof. No new migrations, finance ledger writes or production data changes.
- Red tests: missing backend projection and frontend CSV/route modules observed before implementation.
- Focused backend 45 PASS; frontend 23 PASS; backend/frontend typechecks PASS after repair.
- Real PostgreSQL 17 isolated DB wdmv_v761_test_acl, 281 applied migrations: within one transaction inserted two temporary users and one assignment. SET LOCAL ROLE moneyverse_app; owner=1, foreign=0, function EXECUTE=true, direct work SELECT=false, ledger INSERT=false; ROLLBACK; fixture rows after=0. **No 5433 / Production-linked DB writes.**
- Regression/security/SEO/a11y/contract/full build pending; exact SHA official Test and GitOps release gates pending.

## Full candidate gate run (SHA 9e00fdbc32f4017dc0ff5ea8507eaabc91183d5b)
- API contract generator/check: PASS, 180 app endpoints.
- ESLint: PASS, 0 errors, 1,128 warnings. Typecheck: PASS.
- Backend: 1,331 PASS / 398 SKIPPED; Frontend: 1,410 PASS / 6 FAIL. Failures: SEO/i18n 3, login touch target 1, calculator registration link 1, admin M2 telemetry 1. These failures are outside this feature and are covered by unmerged QA PR #1317; do not duplicate or silently bypass.
- Database package: 15 PASS / 3 SKIPPED; Contract: 38 PASS; Bot: 8 PASS.
- Default Next Turbopack build: FAIL on isolated worktree symlink to node_modules outside filesystem root (build environment limitation, not an asserted product code failure). Explicit Next webpack production build: PASS, including dynamic /work/assignments.csv route. Default build gate remains FAIL until CI verifies a normal checkout.
- Production dependency audit: FAIL 2 High. Full audit: FAIL 2 Critical, 10 High, 11 Moderate, 3 Low. Bot production audit: FAIL 1 Critical, 5 High. No dependency lockfile changes in this feature.
- Accessibility: 44px keyboard-focusable work CTA reviewed; full accessibility regression NOT PASS (login target failure). SEO: private route noindex/no-store headers PASS in targeted tests, full SEO regression FAIL.
- GitHub branch audit: 253 remote branches (252 non-main), no duplicate tip SHA, 250 non-main tips locally available and non-ancestral, 2 unavailable for full unique audit; 248 open PRs, conflict PRs #1107/#1110/#1143, no deletions.
- Host Test identity exact-SHA FAIL: candidate 9e00fdbc..., public Test 6f697e74..., Test manifest/backend/frontend build 9f39f041...; Production public version 6a989b5a...; release identity not matched. No authenticated exact-SHA Test E2E, no Test/Production promotion, no main merge, no GitOps/systemd release.
- Rollback: no migration or ledger writes; candidate branch can remain unpublished and app code reverted without DB change. Preserve all other workers' unique branches.
- Final commit will contain QA evidence; required gates must be rerun on the final SHA. **RELEASE HOLD.**
