# QA — Public stock discussion category search (2026-11-01)

**Decision: CANDIDATE IMPLEMENTED; GLOBAL GATE FAIL; RELEASE HOLD.**

- Main `f13bbce273ffc65e8576170992d82ea00c27a1c9`; feature code `e7c18f62704f21a131886acf25871fa7dd1f62a2`; PR #2280 Draft.
- RED-GREEN: backend 3 RED -> 22 GREEN; frontend 4 RED -> 13 GREEN. Final targeted backend 22, frontend+app gateway 28 PASS.
- Full frontend 2905 PASS; backend 2955 PASS, **2 FAIL**, 517 SKIP; the same profile HTTP 401-vs-200 failures reproduced on unmodified main. Existing repair PR #2265. First unconstrained backend run failed with EPIPE; serialized run completed and revealed two failures.
- DB unit 62 PASS, 4 SKIP. Real DEV PostgreSQL as `moneyverse_app` read-only function count=1, analysis=0, transaction ROLLBACK. No seeded positive category fixture; no isolated exact-SHA PostgreSQL Test.
- Full typecheck PASS, lint 0 errors/1022 warnings, full build PASS, 184 Android contract endpoints PASS, 11 security advisory policy tests PASS. Accessibility via form labels and regression tests; dedicated browser WCAG E2E not run. SEO/noindex covered by tests; candidate edge HTTP not deployed.
- P0 DEV ACL violation: users SELECT, user_items DELETE, account_balances UPDATE effective for app role. Do not extrapolate to Production. No schema/ledger/migration changes.
- Test `bc8cd8a6...`; Production backend `353c6d5d...`, frontend build id `1793450413898`. Candidate SHA not deployed, auth/login/DB/rollback smoke not run. Independent restore and GitOps release gate unverified.
- Branches start 52/end 55; PRs start 50/end 53; 54 unique non-main branches, 1 ancestor; 0 conflicts, 0 deletions. Preserve all.
- Evidence: `/srv/moneyverse-data/tasks/mv-a-20261101-0725-board-category/evidence/` (red/green/full/build/lint/typecheck/API/DB/baseline logs).
