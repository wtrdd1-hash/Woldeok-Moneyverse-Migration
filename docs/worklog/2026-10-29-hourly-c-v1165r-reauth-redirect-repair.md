# Development C v1165r — post-integration OAuth step-up repair

## Before work — 2026-10-29 18:32 KST
- Original v1165 started from main `5faa7de1aaa41939260d601496d57dca4175897c` in an independent worktree and found unvalidated external OAuth reauthentication redirects. TDD RED 11 failed, GREEN 15 passed.
- **Unexpected external integration:** Draft/HOLD PR #1879 was merged into main as `ac2b4630dbb63dfaf9886773f0a6aeb9be811aa9` at 18:26 KST despite failing mandatory CI and explicit HOLD. This run did not authorize or execute the merge. Preserve the evidence and avoid direct main mutation.
- Current main `76d63a5840a4a185fcaeb02f8b1132dd145f19e4` includes v1165, including a newly discovered ESLint no-unexpected-multiline failure in the regression test. QA #1878 also confirms duplicate SQL migration IDs on main.
- This independent repair branch fixes the test lint error and validates the OAuth callback origin against the same APP_BASE_URL/OAUTH_ALLOWED_REDIRECT_URIS allowlist already used by the frontend, preventing an attacker-owned callback with a plausible path.
- No migration, shared DB, live service, Test, Production or GitOps change. Do not merge without all required gates.

## In progress
- Second TDD RED: unregistered callback origin accepted (1 fail / 16 pass); GREEN 17/17 in original worktree. Apply the exact patch to fresh main and rerun gates.

## Finished — gate evidence at 18:38 KST (final HEAD pending)
- On repair source: 69/69 account-security tests, 14/14 NestJS OAuth contract tests, focused ESLint and full ESLint PASS (0 errors / 1047 warnings). First-cycle baseline Frontend 2,377 PASS; post-wave main Frontend 2,525 PASS / 50 FAIL across 14 suites.
- Post-wave main Backend 2,026 PASS / 238 FAIL / 809 SKIP; database 52 PASS / 1 FAIL / 4 SKIP. Migration parity fails on duplicates 291 x3, 292 x3, 293 x2, 294 x2, 295 x4 (303 SQL files). Isolated clean PostgreSQL cannot be certified on this source.
- Full typecheck FAIL: five backend TS errors; separate Frontend typecheck FAIL: 11 unrelated errors. Full workspace build FAIL due backend compilation. API contract check FAIL: generated 181 endpoints but tracked schema references differ. Full dependency audit FAIL: 11 findings (3 low / 8 moderate); production-only audit PASS (0 known).
- Official Test and Production frontend/backend both report `c2129625aa6629c616fb31ce790950618b8d92b2` at 18:32 KST; neither runs this source. Exact-SHA authenticated E2E BLOCKED.
- Incident and additional P0 evidence posted to PR #1879, issue #1663 and QA #1878. No C-authorized main merge, shared DB write, GitOps, Test/Production promotion or rollback. Preserve original v1165 worktree/branch and all A/B/QA/Gemini branches. No branch deletion.
- **Release decision: PARTIAL / HOLD.** Do not create a mergeable PR while an external integration process merges Draft/HOLD PRs with failing CI. Keep repair branch independently on GitHub without a PR until release and branch protection are restored.
- Frontend-only Next build FAIL at TypeScript verification (11 pre-existing errors in support/work/backup/casual components); compilation stage completed before failure. Final commit SHA recorded separately after commit.
