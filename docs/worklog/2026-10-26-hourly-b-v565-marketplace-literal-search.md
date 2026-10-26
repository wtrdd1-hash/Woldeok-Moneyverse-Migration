# Backend B v565 — marketplace listing search literal matching

## Before work
- Started: 2026-10-26 23:00 KST. Authoritative origin/main: `0fe614b2ca1a7bc0df540514e54db78130479e2a`.
- Isolated worktree: `/srv/moneyverse-data/build-workspaces/mv-b-v565-20261026-2300`; branch `auto/hourly-b-marketplace-literal-v565-20261026-2300`.
- Read AGENTS.md, README.md, EN/KO PROJECT_PLAN and integrated planning, recent QA/worklogs, open A/C/B/planning PRs and CI context. Existing open B wallet search PR #1459 is separate; no overlapping marketplace PR identified.
- Selected P1: marketplace listing search treats user-supplied `%`/`_` as SQL LIKE wildcards, widening searches across unrelated ACTIVE listings; unbounded search input can force expensive matching. Only listing read/search behavior is in scope.
- Design: case-insensitive literal substring search on name/description; trim, cap search at 64 characters; deterministic order for equal timestamps; preserve category, active-only, pagination, API shape and all finance writes. TDD RED/GREEN, isolated synthetic PostgreSQL, full repository gates, exact-SHA Test only if release gates allow.
- Superpowers stages: specification and options reviewed (escape LIKE metacharacters vs literal substring; choose literal substring to avoid escape ambiguities), isolated worktree, small-step plan, RED/GREEN, review and verification. No installed Superpowers skill files were found in inspected standard host paths; repository instructions govern.
- Checklist: [x] RED regression; [x] GREEN code; [x] focused and full tests; [x] isolated PostgreSQL search; [x] mid-work main/plan refresh; [x] final log; [ ] PR/CI verification; [ ] full release gates.

## In progress
- 23:02 KST RED: 10/10 focused tests fail against origin/main (literal %, _, backslash, Unicode, trim, whitespace, stable pagination, overlong input/DTO). Baseline query uses ILIKE wildcard matching and unbounded search; failures are expected.
- GREEN: replaced wildcard-sensitive ILIKE with parameterized literal case-insensitive strpos, trimmed search, 64-character service and DTO caps, deterministic id tie-breaker. Focused 15/15 PASS.
- Isolated PostgreSQL 17.11, network none, no published ports, synthetic data, source-extracted SQL: 7/7 PASS (%, _, backslash, Korean, category, pagination, description). Container removed; not full migrations or official Test.
- Mid-work origin/main and EN/KO plans refreshed: 0fe614b2ca1a7bc0df540514e54db78130479e2a unchanged. No other agent branch/worktree touched.

## Finished — Draft PR only / release blocked
- 2026-10-26 23:16 KST. Focused 15/15 PASS (new literal search 10/10 + controller 5/5); original RED 10/10. Isolated PostgreSQL 17.11 exact source SELECT with 7 synthetic scenarios PASS; no production-linked DB writes, no network/host ports, container removed.
- Final candidate checks: `pnpm typecheck` PASS; `pnpm lint` PASS (0 errors, 1,131 warnings); `pnpm test` exit 0: contract 38 PASS, DB 15 PASS/3 SKIP, backend 1,336 PASS/398 SKIP, frontend 1,423 PASS; `pnpm build` exit 0; API contract 179 endpoints/638 methods PASS; repository security, control-byte, Prisma migration guards PASS; bot 8/8 PASS.
- Initial gates failed because isolated worktree lacked workspace package links; `pnpm install --offline --frozen-lockfile` fixed this without touching other workers. The final reruns are the authoritative results.
- Security release blockers: production-only pnpm audit 0 known vulnerabilities; full pnpm audit 2 Critical, 8 High, 11 Moderate, 3 Low; bot npm audit 1 Critical and 5 High. Full audit FAIL. Entire project migration/app-role ACL, independently attested official Test exact-head authenticated backend/API/DB/login/finance E2E, GitOps gates NOT VERIFIED.
- API contract: `GET /api/v1/marketplace/listings?search=` now matches a case-insensitive **literal** substring of name/description, trims whitespace, and rejects nonblank search longer than 64 UTF-16 code units (HTTP DTO + service). Existing active-only, category, limit/offset and response shape preserved; `created_at DESC, id DESC` gives stable ties. No DB migration, permission grant, WLD, ledger, transaction, or write-path changes.
- Main SHA re-fetched before finalization: `0fe614b2ca1a7bc0df540514e54db78130479e2a` unchanged; EN/KO plans re-read. Other A/C/QA/Gemini branches/worktrees and schedules untouched. No unrelated branch cleanup.
- Production HOLD / merge HOLD: Draft PR only until all required CI/security, isolated PostgreSQL ACL/migration and official Test exact-SHA gates pass. No Test or Production promotion.

