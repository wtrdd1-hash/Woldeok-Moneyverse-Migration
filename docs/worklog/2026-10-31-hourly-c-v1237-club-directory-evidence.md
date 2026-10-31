# Development C v1237 — Authenticated club directory evidence and pagination (P1)

## Before work — 2026-10-31 23:10 KST
- Baseline: `origin/main` `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; independent `auto/hourly-c-club-directory-evidence-v1237-20261031-2310` worktree. Existing `main` and all A/B/QA/Gemini worktrees untouched.
- Reviewed `AGENTS.md`, README (English and Korean), `docs/planning/PROJECT_PLAN.md` and `.ko.md`, open PRs #2216/#2217/#2218, QA v1422, B v699/v700, C v1236. P0 production DB provenance and ledger bypass remain release blockers.
- Reproduced in source: `/clubs` maps `apiOrNull` failures to `[]` and calls 50 rows the total number of active clubs. Search has no pagination. The advertised `/clubs/new` creation is blocked by `ClubController.createClub()` returning the journal hold, yet UI promises a 10,000 WLD settlement.
- Contract: authenticated `GET /api/v1/clubs?limit=50&offset=N` is backed by the existing Postgres club repository; strict runtime validation and an error state are required before rendering membership. Never treat a failed/malformed response as empty; display page-local counts, accessible paging and a retry link. Creation must not imply a settled WLD payment until ledger-backed endpoint exists.
- Plan: write failing page and parser tests; implement minimal server-only validation, accessible mobile paging, creation hold; run focused and repository gates; check latest main mid/final; no finance/schema writes; Draft/HOLD until all required gates and official Test/restore are green.

## In progress — 2026-10-31 23:15 KST
- RED: five directory/creation tests failed on original behavior. Additional private Android API/header tests failed 3/3 before changes.
- GREEN: eight focused tests pass (5 club directory/creation and 3 privacy/SEO); frontend typecheck and modified-file lint pass. Test mocks preserve authentication before data fetch.
- Changes: bounded 50-row paginated authenticated directory; runtime validation, UUID uniqueness, exact bigint experience, failed read distinct from verified empty; accessible retry/search/paging; no false creation CTA or WLD payment claim. Existing Nest `GET /api/v1/clubs` and PostgreSQL `PostgresClubRepository.listClubs` reused; no schema, ledger, or WLD write. Android `/app-api/v1/clubs` response headers and actual Next `/clubs` paths are private/noindex, including upstream errors.
- Limitation: migration 222 grants broad club-table privileges to app role; do not claim least-privilege DB safety until QA P0 #993 and Backend B fixes are reviewed. Current creation endpoint rejects unjournaled settlement; the UI does not reactivate it.
- Mid-run `origin/main` and canonical EN/KO plan rechecked: `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, unchanged. Open Drafts #2216/#2217/#2218 preserved.


## Finished
- Pending final evidence; no deployment authorized.
