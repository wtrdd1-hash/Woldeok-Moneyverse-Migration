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
- [ ] Recheck latest main and planning; run focused tests, lint, typecheck, build, API/DB/security/E2E gates; record failures without masking.
- [ ] Final English/Korean evidence and GitHub update. Hold unmerged branch if any mandatory gate fails.
## IN PROGRESS
- TDD RED: 2 route integration tests failed against direct two-argument form binding. GREEN: 17/17 focused tests passed. Host NODE_ENV=production caused React.act unavailable in existing jsdom test; rerun with NODE_ENV=test resolved the environment-only failure. Re-fetched main and planning. Full gates remain unverified.
## FINISHED
- Pending.
