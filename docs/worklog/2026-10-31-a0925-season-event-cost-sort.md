# Development A — Season Event WLD Cost Sorting (2026-10-31 09:25 KST)

## Before work — v1
- Source main: `761a55a094fb9dd383d213e817305e68c79fa23c`; separate `auto/hourly-a-20261031-0925-season-cost-sort` worktree.
- Read AGENTS.md, README.md, both integrated planning documents, recent QA and open PR/CI inventory. Planning PRs are DRAFT/HOLD; do not modify their files.
- Scope: member season event discovery sort by exact WLD cost ascending/descending, preserving authenticated/consent-checked GET and existing PostgreSQL `season_active_events()` SECURITY DEFINER function. No migration, ledger, privileges or payment changes.
- Backend GET `/api/v1/seasons/events?sort=cost_asc|cost_desc` with duplicate/unknown query rejection; default existing DB order. Web `/seasons` links and Android app-api proof of exact integer-string ordering. Fail closed on invalid upstream 200, no caching for member requests.
- Test plan: RED->GREEN controller/service + page/app gateway; large WLD exact ordering; invalid/duplicate sort; malformed responses; SQL function/ACL; full lint/typecheck/build/unit/integration, PostgreSQL, candidate CI, official exact-SHA Test. Never merge/deploy without all required evidence.
- Risks: existing Production release path #1984, app-role privileges #993, official Test exact-SHA/backup restore blocked. Preserve all unique branches.

## In progress — v2
- Pending.

## Finished — v3
- Pending verification.

## In progress — v2 (09:31 KST)
- Failing regression reproduced: Backend 3/3 RED, frontend utility/Android 2/4 RED. Initial missing `vitest` was environment-only; installed locked dependencies offline before authoritative RED.
- Implemented backend exact BigInt sort and invalid query rejection, web sort controls with selected-event context, Android no-store/noindex and verified HTTP 200 ordering.
- GREEN targeted Backend 3/3 and frontend 4/4. Full workspace typecheck PASS. No migration, privileges or ledger writes.
- Main SHA rechecked unchanged `761a55a094fb9dd383d213e817305e68c79fa23c`; planning Draft #2113 remains unmerged. All other branches retained.
- Next: full regression, lint, builds, real isolated PostgreSQL 312 migrations, CI, exact-SHA Test and release proof. Release remains HOLD.

## In progress — v3 (09:43 KST)
- External cleanup removed the original `/srv/moneyverse-data/worktrees/...` during full gate execution. Remote checkpoint SHA `e00b01f6579653ef55e4d8695f82a779532e59a1` was preserved. Restored same branch into independent `/home/debian/moneyverse-a-20261031-0925-season-cost-sort` without touching other developers' worktrees.
- Added web server-render regression (2 PASS), improved accessible active-sort indicator and removed unused type.
- Fresh PostgreSQL 17: 311 migrations applied; `moneyverse_app` EXECUTE=true and direct SELECT=false; 3 synthetic event rows verified; ROLLBACK left 0 test rows/ledger postings. SQL cost check disallows >2^53 synthetic event cost, so BigInt boundary is covered by unit tests only.
- Targeted 9 PASS, workspace typecheck PASS, backend build PASS, changed lint 0 errors. Full lint/full test/frontend build are being re-run as independent gates; initial attempts timed out or were interrupted. Draft PR and release HOLD remain mandatory.

## Finished — v4 (2026-10-31 09:46 KST; RELEASE HOLD)
- Functional code delivered in Draft PR #2121: Nest GET + PostgreSQL SECURITY DEFINER read + member Next.js UI + Android app-api. Files changed: 14 including tests, QA, release HOLD and worklog; no migration or ledger writes.
- Targeted RED/GREEN: Backend 3 PASS, frontend utility/app-api 4 PASS, accessible server UI 2 PASS; 9/9 final. Workspace typecheck PASS; Backend Build PASS after contract build. Changed ESLint 0 errors. Full ESLint PASS with 0 errors / 1,049 existing warnings.
- Full test command: policy/security 41 PASS; database unit 62 PASS / 4 SKIP; backend 2,781 PASS / 501 SKIP; frontend did not complete before 190-second overall timeout (SIGTERM), so **full test gate NOT PASS**. Earlier run was interrupted by external worktree cleanup. Frontend build first local 52-second attempt TIMEOUT; longer independent build and exact SHA CI/candidate results must be read from subsequent evidence.
- Fresh PostgreSQL 17: 311 SQL migrations applied; app role EXECUTE allowed and direct SELECT denied; 3 synthetic rows read, rollback 0 rows/ledger postings; ephemeral container removed.
- Public Test version `c2129625aa6629c616fb31ce790950618b8d92b2`, Production version `bf8d0d48f810932b43783d8605dce53954c60cff`. Test public Treasury still synthetic HTTP 200 (P0 #1917); Production Treasury correctly fails closed 503. Test is NOT running this candidate, so authenticated exact-SHA Test E2E BLOCKED. Legacy `moneyverse-backend/frontend` CWDs deleted v1515, while separate `moneyverse-live-prod-*` CWDs point to existing bf8 release; edge upstream attribution/rollback not certified (#1984). Dev ACL #993 remains open.
- Branch audit at 09:42: 59 remote branches, 58 non-main with unique patch commits; 54 open PRs and 6 conflicts before this Draft; after PR creation 55 open PRs. Starting inventory 57 branches; concurrent developers created others. A deleted 0 branches and merged 0 PRs. Preserve all other changes.
- Production/Test changes: NONE; no DB changes, restart, GitOps promotion, rollback or release-switch changes. **HOLD** pending exact SHA full CI, candidate Docker image, full tests, official Test authenticated E2E, independent backup restore, security, accessibility/SEO and rollback provenance. No waiver.
- External report: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-31-0925-season-event-cost-sort/`; PR #2121 carries GitHub update history. English is canonical; Korean QA/release documents are the second language.
