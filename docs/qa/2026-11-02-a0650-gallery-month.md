# Development A 06:50 — Public Gallery Month QA

**State:** P1 code candidate / DRAFT / RELEASE HOLD; exact final SHA gates pending.

## Source and behavior
- Baseline main `a8541927c3a351d980454c66e95a3356c47e0722`.
- Only approved `content_list_published_photos(24)` SECURITY DEFINER rows are filtered by Asia/Seoul publication month; no historical-search claim.
- Web: accessible labelled month input, explicit scope, reset, invalid/error/verified-empty states, noindex on filtered URLs.
- Backend: rejects malformed/duplicate/unknown month parameters before querying; echoes applied month; unfiltered response unchanged.
- Android: rejects ignored filter, malformed payload, wrong Seoul month, duplicate photo IDs; filtered success/errors no-store/noindex/no-referrer.
- No new migration, direct grants, ledger writes, member-private exposure or deployment.

## Test evidence
- RED: helper imports failed; backend integration 3 FAIL; Android/UI 4 FAIL.
- GREEN: backend 10 PASS, frontend helper 2 PASS, Android/UI 6 PASS.
- Full typecheck PASS. Changed lint 0 errors / 1 pre-existing image warning.
- DEV PG17 app-role READ ONLY: approved photos 2; EXECUTE=true; transaction rolled back.
- DEV P0 #993 remains: account_balances UPDATE=true; user_items DELETE=true. Production ACL not asserted.
- Full suites, API contract exact SHA, CI, official Test auth E2E, restore, security audit: PENDING / BLOCKED until independently evidenced.

## Release
HOLD. No main merge, Test or Production deployment, DB migration, service restart, branch deletion or rollback. Rollback is dropping the unmerged read-only branch after preserving evidence.

## Verified code-SHA gates — 2026-11-02 07:05 KST
- Feature SHA: `277a3167e7135963a3c567d77ed0e77b52b2e375`.
- Root full tests exit 0: 34 Node PASS; 41 contract PASS; 62 DB PASS / 5 SKIP; 2,990 backend PASS / 518 SKIP; 2,928 frontend PASS. No skip counted as pass.
- Typecheck PASS, build PASS, lint PASS (0 errors / 1,027 warnings). Mobile API 184 endpoints contract PASS.
- Production dependency audit PASS (0 known); full dependency audit FAIL (9: 1 low, 8 moderate). Existing P0 DEV ACL #993 FAIL.
- DEV PG READ ONLY/ROLLBACK: 2 approved photos, both Seoul 2026-09. No official Test exact-SHA E2E.
- Test and Production public version: `510dbe6bf4d5c2a8089fc06b480776053da7a2e3` (not candidate). Official Test authentication, independent restore and GitOps release gate BLOCKED.
- Remote audit: 191 non-main refs (177 unique-unmerged, 14 ancestors); 174 open PRs, 29 conflicting. Virtual merge conflicts with #2312/#2331/#2371/#2249 and concurrent #2435. No branch deletion.
- **Release verdict remains HOLD.** Final documentation commit, exact final SHA CI and image build still require GitHub evidence; never infer PASS from local results.
