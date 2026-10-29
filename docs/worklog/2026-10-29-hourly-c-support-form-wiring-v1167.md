# C v1167 — Member support form integration (HOLD)
## START — 2026-10-29 19:45 KST
- Source: origin/main 69c486777d023ee45a216528e7a0c8b7dd1d7ea7; independent worktree and branch.
- Evidence: frontend/src/app/support/actions.ts requires (previousState, FormData) and verifies CSRF + backend receipt + owner readback; frontend/src/app/support/page.tsx still directly binds these two-argument actions to form action, which Next's single-argument form action contract cannot invoke correctly. The existing member-support-forms.tsx uses useActionState but is disconnected from the route.
- Existing backend contract: authenticated, consent-checked support POST and member-only readback via PostgreSQL functions. No new endpoint, DB migration, ledger action, or unsafe client API call required.
- Coordination: A #1885 owns SQL migration lineage; B #1886 owns backend typecheck; QA #1883 owns lint parseability. Avoid their files and all unmerged C branches.
- Release blockers: main #1878 duplicate migration IDs, #1884 typecheck, failing CI, official exact-SHA Test E2E unavailable. Never merge or promote without full PASS.
## PLAN
- [x] RED: add page-level regression verifying member forms use the verified stateful wrappers (2 RED).
- [x] GREEN: replace direct bindings with existing client wrappers; preserve server auth, responsive layout, accessibility and noindex (17/17 focused PASS with NODE_ENV=test).
- [x] Recheck latest main and planning; run focused tests, lint, typecheck, build, API/DB/security/E2E gates; record failures without masking.
- [x] Final English/Korean evidence and GitHub update. Hold unmerged branch because mandatory gates failed.
## IN PROGRESS
- TDD RED: 2 route integration tests failed against direct two-argument form binding. GREEN: 17/17 focused tests passed. Host NODE_ENV=production caused React.act unavailable in existing jsdom test; rerun with NODE_ENV=test resolved the environment-only failure. Re-fetched main and planning. Full gates remain unverified.
## FINISHED — 2026-10-29 19:53 KST / PARTIAL, RELEASE BLOCKED
- Runtime code candidate tested: 597076da6271d33853da402e5f1287fcd1ec46e5. Final documentation-only evidence commit will follow; the candidate runtime files remain unchanged.
- Focused member frontend: 17 PASS / 0 FAIL (NODE_ENV=test). Existing backend support contract subset: 6 PASS; exact-message support tests 4 FAIL because unmerged repository.exactMessage/controller.message contract is missing (#1832). Contract package: 41 PASS. Changed-file ESLint: PASS.
- Disposable PostgreSQL 17.11 (network disabled) initialized migration 001 and successfully applied all migrations 002–196; synthetic owner thread creation/readback, initial message, reply, idempotent replay and owner-only readback PASS. Other user list empty; moneyverse_app direct table SELECT refused. Disposable container removed. This is not full 303-migration / official Test proof.
- Full frontend suite timed out after 100s amid unrelated failures (NOT PASS). Full backend: 1,659 PASS / 207 FAIL / 458 SKIP. DB parity: 5 PASS / 1 FAIL (duplicate 291–295). Root lint: FAIL 2 errors (1046 warnings), root typecheck: FAIL 6 backend errors, frontend typecheck: FAIL JSX parse errors in central-bank-panel, build: FAIL, app-api: FAIL generated 181 endpoints vs tracked docs. Production dependency audit: 0 known vulnerabilities; full audit: 11 (3 low / 8 moderate).
- GitHub Build Test Candidate run #40860148939: FAILURE in runtime-check lint; no successful build/promotion. No CI full success.
- Main re-fetch at start, middle and finish: 69c486777d023ee45a216528e7a0c8b7dd1d7ea7 unchanged. EN/KO canonical planning rechecked; planning Draft #1882 and A/B/QA #1885/#1886/#1883 remain unmerged.
- Official Test and Production both serve c2129625aa6629c616fb31ce790950618b8d92b2, not candidate; exact-SHA authenticated API/DB/member E2E BLOCKED. No main merge, PR, Test/Production deploy, GitOps change or rollback. Rollback is to leave branch unmerged; no live state changed.
- Preserve independent branch and all other contributors' unmerged branches/worktrees. GitHub issue update follows. Evidence: /srv/moneyverse-data/reports/Moneyverse-C-2026-10-29-1945.
- Known separate support defects not claimed fixed: member status filter query ignored by backend, reply readback beyond first 200 messages (#1832).
