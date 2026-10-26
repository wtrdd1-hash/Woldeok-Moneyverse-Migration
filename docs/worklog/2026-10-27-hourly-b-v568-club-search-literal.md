# B v568 — Literal, bounded club discovery (P1)

## Before work
- Start main: `0fe614b2ca1a7bc0df540514e54db78130479e2a` (fetched 2026-10-27 01:40 KST).
- Reviewed AGENTS.md, README.md, EN/KO PROJECT_PLAN, open PRs including A #1464, C #1470 and B #1471, CI and QA issue backlog.
- Root-cause candidate: `PostgresClubRepository.listClubs` passes unescaped client input into SQL ILIKE with `%` delimiters, allowing `%` and `_` to act as patterns. `parseInt` query parameters can yield NaN and HTTP 500.
- Isolation: new branch/worktree; no applied SQL migrations or service database writes.

## In progress
- [ ] Reproduce wildcard and malformed pagination in failing tests.
- [ ] Implement literal search, bounded input and stable pagination without changing API response shape.
- [ ] Validate unit, full workspace gates and isolated real PostgreSQL where possible.

## Finished
- Pending evidence. Release hold; no Test/Production or main changes permitted until required gates pass.

### In-progress checkpoint (2026-10-27 01:43 KST)
- Reproduced 13/13 failing repository tests and 5 malformed-HTTP-query failures (RED).
- Implemented case-insensitive literal `strpos` search for name/tag, max 64 chars, canonical non-negative integer paging, stable UUID tie-breaker and HTTP 400 mapping.
- Focused tests 23/23 PASS. Isolated PostgreSQL 17.11 tested actual repository SQL against synthetic club rows: 6/6 PASS (percent, underscore, backslash, Korean, case-insensitive tag, unfiltered); container removed. No production DB changes.
- Mid-work origin/main and EN/KO planning rechecked; full gates pending.

### Validation checkpoint (2026-10-27 01:48 KST)
- Full `pnpm typecheck` PASS; `pnpm lint` PASS (0 errors / 1,131 pre-existing warnings); `pnpm test` PASS (backend 1,345 pass / 398 skip, frontend 1,423 pass; plus contract 38 and DB 15 pass / 3 skip); `pnpm build` PASS. Focused tests after one added HTTP 400 case: 24/24 PASS.
- API contract check PASS via `pnpm test`; no new routes, DTOs or DB migrations. Repository security, control-byte and Prisma guards PASS. Discord Bot test 8/8 PASS after installing lockfile dependencies offline.
- `pnpm audit --prod --audit-level=high` PASS (0 known vulnerabilities). Full `pnpm audit --audit-level=high` FAIL (2 critical, 8 high, 11 moderate, 3 low). Bot npm audit FAIL (1 critical, 5 high).
- PG isolated SQL fixture validates literal search and stable listing; full applied-migration parity and real `moneyverse_app` ACL on official Test remain UNVERIFIED. QA P0 #1469 reports 5 existing applied migration checksum mismatches in shared development DB; this change does not alter them.
- A PR #1418 also touches club controller/service/repository for different member-pagination methods; coordinate on merge. C PR #1470 is unrelated.

## Finished
- Code changed: `backend/src/club/club.repository.ts`, `backend/src/club/club.service.ts`, `backend/src/club/club.controller.ts`, `backend/src/club/club.literal-search.test.ts`.
- API contract: GET `/api/v1/clubs` returns the same `{clubs}` payload; search is literal, case-insensitive, trimmed and max 64 UTF-16 code units; whitespace-only search removes the filter. Invalid noncanonical `limit`/`offset` and overlong search return HTTP 400; valid page limits still cap at 100. Stable tie-breaking on club UUID.
- DB: no migrations or writes; ledger/WLD/auth boundaries untouched. No Test/Production deployment or main merge.
- Release decision: DRAFT + HOLD. Official isolated Test exact-SHA authenticated club discovery, app ACL and core user flow, full security audit and CI must all pass before merge. Production promotion prohibited while any required gate fails.
- Cleanup: none; no foreign branches/worktrees altered.
