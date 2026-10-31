# A 2026-11-01 05:25 KST — Public Status Attention Filter

## BEFORE WORK
- Base `origin/main`: `f13bbce273ffc65e8576170992d82ea00c27a1c9` (checked 05:27–05:32 KST).
- Independent branch `auto/hourly-a-20261101-0525-status-attention` and worktree; original checkout had a pre-existing modified `implementation_plan.md`, left untouched.
- Remote branches 39, open PRs 37 at start; unique/unmerged work protected, no cleanup.
- Read AGENTS.md, README.md, English/Korean project plans on main and latest planning Draft #2258, QA/worklogs, recent PRs and CI. No overlap with A season/shop, B backend safety, C stock/history and planning expiry-calendar scopes.
- Scope: public status attention filter; keep aggregate headline unfiltered, stale/unknown fail closed. Existing SQL function is SECURITY DEFINER, no new direct table grants or migration.
- Production gate: HOLD until exact SHA Test, authenticated E2E, DB ACL, backup/rollback and GitOps proven.

## IN PROGRESS
- Plan: `docs/superpowers/plans/2026-11-01-public-status-attention-filter.md`.
- RED: 2 backend and 4 frontend new tests failed before implementation (05:29 KST).
- GREEN: backend 2/2 and frontend 4/4 new tests; combined backend targeted tests and frontend 27 targeted tests passed.
- Contract corrected Android status path from `/app-api/v1/content/status` to `/app-api/v1/status`; Nest `/api/v1/status` is canonical. Contract version v2026.11.01.0525.
- Actual DEV PostgreSQL 17.11 `moneyverse_app` read-only query: 3 rows, 0 attention; EXECUTE privilege true; ROLLBACK. No writes or migration.
- Workspace full typecheck PASS, lint 0 errors / 1,022 existing warnings. Full tests/build/CI still pending.
- `api:contract:check` initially flagged expected artifact drift versus HEAD; rerun after committing regenerated contract files.

## FINISHED — code complete; release HOLD
- Initial feature commit `c5ec7f948330e7cc93902ca82acbcb868e0ee168`, Draft PR #2264. Added HTTP integration tests (2 PASS) after this checkpoint; final SHA in PR history.
- Backend targeted 6 PASS; new HTTP 2 PASS. Frontend targeted 27 PASS; full frontend 2,907 PASS / 0 FAIL. Database unit 62 PASS / 4 SKIP, shared contract 41 PASS.
- Backend full on candidate: 2,950 PASS / 517 SKIP / **2 FAIL** (`profile-private-response.http.test.ts`, HTTP 401). Identical 2 failures reproduced on clean main. Separate repair PR #2265 on independent branch fixes only the test's internal-token fixture: focused 8 PASS, backend full 2,950 PASS / 517 SKIP / 0 FAIL. No repair commit included in feature branch.
- Attempted temporary combined validation without committing repair to this branch; restored original file afterward. Backend worker pool hit `EPIPE`, so combined full PASS is **not proven**. No other worktrees modified.
- Full workspace typecheck PASS; lint 0 errors / 1,022 existing warnings; backend and frontend build PASS; mobile contract 184 endpoints and `api:contract:check` PASS after checkpoint; production dependency audit 0 known vulnerabilities.
- DEV PostgreSQL 17.11: read-only `SET LOCAL ROLE moneyverse_app`, 3 public status rows, 0 requiring attention; transaction ROLLBACK. Existing `content_public_status()` EXECUTE PASS. However app role also holds direct SELECT on `content_status_sources`, direct SELECT and UPDATE on `content_status_snapshots`: **P0 least-privilege FAIL**, tracked #993. This is DEV evidence, not Production proof. No SQL migration or DML performed.
- Production `/api/version` advertises `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; Test advertises `bc8cd8a6c654af0336f550643f23049a58ee1d16`, neither is the candidate SHA. Official exact-SHA Test auth E2E not executed; no Test/Production deployment, no rollback.
- Remote branches 39 at start, 41 after feature and independent repair branches; open PRs 37 → 39; all 40 non-main refs hold unmerged/diverged commits; no branch deleted. No conflicting PRs at last check. Latest main remained `f13bbce273ffc65e8576170992d82ea00c27a1c9` at start/mid/pre-final.
- **Release HOLD:** exact final SHA CI/candidate build, official isolated Test auth/E2E, DB ACL remediation, independent restore, Production executable provenance and GitOps release gate outstanding. No merge or production promotion.
