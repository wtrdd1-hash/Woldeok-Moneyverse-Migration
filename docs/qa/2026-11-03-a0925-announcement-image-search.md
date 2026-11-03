# QA — Development A 2026-11-03 09:25 — Published Announcement Image Description Search

**State: IMPLEMENTED ON ISOLATED BRANCH / FULL GATES FAILED / DRAFT PR #2607 / RELEASE HOLD**

## Scope and source truth
- Base main 109c0322699ce4b8588498ad765d56d09c9dce8e; mid/final sync main e83ad8a6d1b8d477bfbe661ea3cffd46f270509c; code commit 79143689c450da75593fef5195ffa405e50ab1a9; main-sync merge e013e023b5c9f082ae7a8a78a2f3e68b57a9858a. Final documentation SHA in PR head metadata.
- Read-only PostgreSQL SECURITY DEFINER content_list_published_announcements(20) remains the sole approved source. No new table/function/grant, applied migration change, financial operation or personal-data export.
- Web /announcements?imageAlt=, Nest public and content announcement endpoints, Android /app-api/v1/content/announcements?imageAlt=.
- Filter: 2–80 Unicode code points; literal case-insensitive substring in image_alt_text, only rows with image URL; latest 20 published notices, not site-wide. Reject duplicate/unknown/unsafe query with 400. Android rejects unverified 2xx with 503 and strips unapproved response fields. Query-specific noindex/no-store and accessible search.

## TDD and local gates
- RED captured in evidence/backend-red.log and frontend-red.log. GREEN backend parser/repository/service/controller 4 + Nest HTTP 2 = 6 focused PASS; frontend parser 1 + Android 3 + rendered UI/SEO 2 = 6 focused PASS.
- Backend full: 2,986 PASS / 2 FAIL / 518 SKIP. Two unrelated profile-private-response authenticated HTTP tests expected 200 but returned 401. No pass claim for full Backend.
- Frontend full with correct NODE_ENV=test: 2,955 PASS, 562 files. Running vitest without project-required NODE_ENV=test produced 506 React.act errors; that invocation is not a passing gate.
- Database unit: 72 PASS / 5 SKIP. API contract: 184 endpoints PASS. Workspace typecheck PASS; Backend build PASS.
- Frontend first build failed with 1024 MB Node heap OOM. Retried with 2048 MB heap and one build worker: PASS.
- Full lint before final HTTP test: 0 errors / 1,026 warnings; subsequent changed-file lint after fixing one new test variable: 0 errors. Final full lint exit not independently re-proven.
- Dependency audit exit 1: 9 advisories (8 moderate, 1 low; 0 high/critical).
- Real DEV PostgreSQL read-only: SET LOCAL ROLE moneyverse_app; published latest 20 = 1; search 제주 matches = 0; literal special characters %_ check = 1; ROLLBACK. This proves query syntax and privileges, not a positive-match fixture or Production parity.

## External and release blockers
- 2026-11-03 ~09:47 KST live public HTTP: Production / and /announcements 200; /ko and /en 500. Test /, /ko, /en and /announcements 200. This does not certify the candidate feature in official Test.
- QA v1485 P0 FAILED; DEV app role overprivileged and checksum/restore findings unresolved; Production role not independently certified.
- Official isolated Test exact-candidate-SHA auth/DB/app E2E, independent off-host backup restore, complete security clearance, accessibility browser audit and GitOps release gate NOT PASS.
- Git audit: 351 remote refs at mid-check, 24 ancestor refs preserved; 311 open PRs (297 Draft, 1 conflicting, 269 mergeability unknown) before PR #2607. Start counts were not captured; no inferred counts. No branch deletion.
- No merge, deployment, service restart, production data or database write. Preserve unique changes in all other branches. Rollback: revert read-only code if later merged, no schema rollback.

**Final release decision: DRAFT / HOLD.**
