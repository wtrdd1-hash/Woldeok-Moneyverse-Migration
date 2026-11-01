# C v1265 — Global Search Query and Access Integrity

## START — 2026-11-01 16:13 KST
- Source: origin/main `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`; isolated `auto/hourly-c-global-search-integrity-v1265-20261101-1613` worktree. Existing main checkout contains unrelated uncommitted implementation_plan.md; untouched.
- Read AGENTS.md, README.md, README/README.ko.md, canonical docs/planning/PROJECT_PLAN.md and Korean pair, active PR/CI, QA and A/B/C branches. Planning v1608 is draft, not a merged API contract.
- Proven P1: `frontend/src/app/search/page.tsx` assumes `q` is a string, but Next searchParams can be a string array for duplicate query keys. `q.slice()` then returns an array and `query.trim()` throws, yielding a 500. The public navigation also includes `/wallet` and `/bank`, both of which call `requireMember`, yet guest search labels them public. The current viewer helper silently converts API failure into signed-out status, so an outage can produce a false empty search result.
- Boundaries: no ledger/DB/schema/production changes. Use the existing authenticated Nest `/api/v1/auth/viewer` contract via `viewerOrUnknown` (not a fabricated API); only show verified member/admin navigation, preserve public search on outage. Responsive/keyboard/screen-reader/SEO regression coverage.
- Isolation: do not alter A/B/QA/Gemini branches or open PRs. Draft/hold until all exact-SHA gates pass.

## PLAN
- [x] Write failing query/visibility and server-render tests; observe RED (8 failures, 5 existing passes).
- [x] Implement bounded query parsing, correct access labels and outage state; observe GREEN (13/13 focused tests).
- [ ] Run focused and whole-repo gates, PostgreSQL/auth/app-api/E2E where available; capture exact SHA and blockers.
- [ ] Re-fetch origin/main at mid/end, update EN/KO logs, push branch and Draft PR; no release without full gates.

## MID — 2026-11-01 16:17 KST
- TDD RED: 8 failed/5 passed; duplicate q and malformed viewer SSR, and guest `/wallet`/`bank` public classification reproduced. GREEN: 13/13 focused tests PASS.
- Existing authenticated `viewerOrUnknown` reads Nest `/api/v1/auth/viewer` rather than synthesizing auth state; invalid payload or transport outage is unknown and never treated as verified member/admin. No new backend/DB route needed; no fake success.
- Input accepts a single valid Unicode query of up to 80 code points; duplicate query keys, control characters, lone surrogates and non-string values fail closed with a keyboard-accessible correction prompt. A separate status/retry distinguishes auth API outage from verified empty results. Public masthead links to actual `requireMember` pages `/wallet` and `/bank` are not shown as public search results.
- Next: full HEAD gates and isolated auth/DB checks; CI and release policy remain blocking until proven. GitHub PR is kept draft.


## END
Pending.
