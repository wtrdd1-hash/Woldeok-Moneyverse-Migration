# C v1319 — Verified Host Storage Evidence

## Before work — 2026-11-03 04:15 KST
- Base: origin/main `f5c3fbedae1c3b3ec2374882b049aac43a655eb4` (fetched); separate worktree and branch, shared checkout has unrelated uncommitted security audit changes and must not be modified.
- MiniPC Debian 13.6: seven core services active; development PostgreSQL connected.
- Reviewed AGENTS, bilingual README and integrated plans, open PRs/CI and recent A/B/C/QA. No open PR specifically fixes host storage snapshot date parser; backend signed evidence endpoint exists.
- Candidate parser concern was disproven: existing storage view and page tests 4/4 PASS. Confirmed P1 instead: `frontend/next.config.ts` globally emits `X-Robots-Tag: index, follow` when indexing is enabled, while the private storage document has only metadata robots=noindex; its private API response is correctly no-store/noindex. Add a route-specific document HTTP privacy rule without changing the verified backend source.
- Scope: restore valid evidence rendering without relaxing host signature, freshness, admin authorization or least-privilege boundaries. Add exact date edge cases, accessible unknown state, private HTTP policy, run gates.
- Release policy: no merge, Test or Production deployment until all gates pass.

## In progress
- [x] Reproduce storage document header privacy gap (RED): missing route rule; 1 failing test, plus two API referrer tests failed
- [x] Add explicit root/localized private HTTP headers and API referrer protection; 15/15 focused tests GREEN; parser untouched after 4/4 baseline PASS
- [x] Verify backend signed-source boundary and real PostgreSQL (328 migrations, 23 targeted DB/auth tests), and Next HTTP document privacy for six routes; subsequent HTTP probe found API headers overridden by global config, now patched and regression-tested
- [x] Re-fetch main, inspect CI/QA, record release blockers; final candidate SHA verification tracked in PR comments

## Finished — release held
- Original parser suspicion was false; do not claim a parser fix. Corrected only HTTP header precedence for administrator storage evidence documents and API endpoints. TDD RED demonstrated missing route and referrer protections; focused GREEN 15/15.
- Isolated PostgreSQL 17.11: 328 schema SQL files (init plus numbered migrations) applied, no shared DB mutation; app role denied SELECT on users/audit_logs and INSERT on ledger_postings. Real DB + storage HTTP backend tests 23/23 PASS; temporary container removed.
- Initial full checks: lint PASS; build PASS; typecheck failed due missing worktree-only package dependency symlinks (fixed); frontend 2947 PASS / 1 FAIL due task's build-worker override leaking into test process (runner corrected); backend 2983 PASS / 2 FAIL (profile private HTTP expected 200, received 401, unrelated to this frontend-only change); database package 72 PASS / 5 SKIP; app-api 184 endpoints matched; security audit 9 findings (8 moderate, 1 low); full route QA BLOCKED (missing full-route-ledger.json). Bot initial run failed due missing worktree dependency symlink (fixed). Exact final SHA retest is required, with evidence in PR comments.
- Isolated Next.js production build HTTP verified noindex, no-store, no-referrer on base and five localized storage document paths. Separate probe revealed API route header precedence failure, addressed in follow-up code and unit test. Final HTTP retest follows new build.
- Official Test public frontend version 2dd507030dc1e461cbcf18f060260959f4c26a8f; Production 305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b; neither matches candidate. No official Test candidate deployment, authenticated E2E, merge, GitOps or Production release. Rollback not applicable. Branch/PR preserved; other agents' worktrees and all five automations untouched.
- Final status: PARTIAL / RELEASE BLOCKED; do not merge or deploy until every required gate passes.
