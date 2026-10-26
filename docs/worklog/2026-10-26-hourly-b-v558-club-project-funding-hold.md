# Backend B v558 — Club Project Contribution API Fail-Closed Containment

**Date:** 2026-10-26 KST. **Status:** PARTIAL / BLOCKED; Draft only, no merge or deployment.

## Source and coordination
- Starting authoritative `origin/main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (rechecked during implementation).
- Isolated branch: `auto/hourly-b-club-project-funding-hold-v558-20261026-1645` from exact main.
- Read AGENTS.md, README.md, PROJECT_PLAN.md and PROJECT_PLAN.ko.md, open PRs, QA #1412, recent CI, issue #1423.
- Overlap: A #1418 changes club service/repository for membership reads; C #1397 changes club creation UI; B #1422 adds forward migration 280 with a SQL-level contribution hold. Preserve all unique changes and coordinate during integration.

## P0 root cause and actual change
- Migration 222 `club_contribute_project` directly updates account balances and writes a ledger transaction without balanced postings or immutable replay receipt. Replaying a key may move money again. Its SQL EXECUTE remains a risk until a reviewed SQL fix is applied.
- Backend `ClubService.contributeToProject` now refuses all requests with HTTP 503 and stable RFC 9457 `code=CLUB_PROJECT_LEDGER_UNAVAILABLE`, without calling the repository.
- `PostgresClubRepository.contributeToProject` independently throws before issuing SQL, protecting internal bypasses of the service.
- Swagger operation description now identifies the funding hold. Club read routes and unrelated operations unchanged. No DB/API success DTO changes, no migrations or account mutations.
- This is **containment, not complete funding implementation**. Frontend still displays a contribution control and may show an error; owner UI hold is a separate A/C integration dependency. SQL callers outside the backend are not protected by this PR.

## TDD and verification evidence (Debian 13.6 miniPC)
- RED: 2/2 new tests failed against unmodified main, proving 503 and no-query defects.
- GREEN: 6/6 focused club tests passed (2 new + 4 existing, one expectation updated).
- Backend full: 1,315 PASS / 398 SKIPPED; database package 15 PASS / 3 SKIPPED; contract package 38 PASS.
- Root `pnpm test`: FAIL — frontend 1,397 PASS / 6 FAIL (3 SEO, login touch, registration link, admin M2 display), consistent with source main; backend passed in same run.
- `pnpm typecheck`: PASS. `pnpm lint`: PASS with 0 errors and 1,128 warnings. `pnpm build`: PASS.
- `pnpm api:contract:check`: PASS, 179 endpoints. Repository security scan, control-byte and Prisma guards: PASS; 6/6 security unit tests PASS.
- `pnpm audit --prod --audit-level high`: FAIL (2 High). Full audit: FAIL (2 Critical, 10 High, 11 Moderate, 3 Low).
- Isolated real PostgreSQL contribution/ledger/ACL certification: NOT RUN for this API-only hold; remains BLOCKED. No shared DB queried or modified.
- Official Test exact-SHA, authenticated wallet/bank/stock/casino E2E, GitOps release gate: NOT VERIFIED / BLOCKED.

## Release decision
- PR stays Draft, do not merge, deploy or re-enable funding until the ledger-first SQL migration, complete CI/security, authenticated exact-SHA Test, and GitOps gates all PASS.
- No Production/Test data, member balances, feature switches, or other agents' branches/worktrees were modified. No branch cleanup.
