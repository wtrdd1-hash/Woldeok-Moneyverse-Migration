# C v1311 — Privacy request list source integrity

## Before work — 2026-11-02 22:18 KST
- MiniPC Debian 13.6: 7/7 primary services active; dev PostgreSQL connected (observed through designated MCP).
- Base `origin/main`: `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`. Source checkout has unrelated uncommitted OWASP changes: protected by separate worktree.
- Read AGENTS.md, README.md, README/README.ko.md, canonical EN and auxiliary KO PROJECT_PLAN, recent PRs, QA and A/B/C changes. Existing PR #2401 modifies profile only, not `/account/privacy` list. Existing owner backend privacy API returns up to 30 requests, owner-filtered via SQL function; existing web page trusts `requests` without runtime validation, can crash on malformed shape or show unverified details; Android gateway forwards success without validating this source. This is a P1 owner privacy-integrity issue.
- Scope: one member-facing owner request-history source proof, accessible failure/retry, Android GET response proof, private HTTP headers; no DB schema/ledger changes. No duplicate PR identified for this list surface.
- [x] RED test for invalid list, wrong filtered type, duplicate IDs and unsupported fields.
- [x] Implement parser and connect member page + Android gateway.
- [ ] Focused tests, build/lint/typecheck/full tests, isolated PG/CI/E2E as available.
- [ ] Fetch latest main mid-run and before any merge; record hold/deploy/backup status.

## In progress — 2026-11-02 22:24 KST
- Re-fetched `origin/main` at midpoint: still `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`; PR #2537 planning and #2535 B added, no privacy-list overlap.
- TDD RED: Android gateway three assertions failed (unverified 200, duplicated filter forwarded, unsafe referrer). Parser missing-module RED, then GREEN. Resource pressure caused one esbuild process failure and one fork timeout; isolated retries with `GOMAXPROCS=1`, `UV_THREADPOOL_SIZE=1`, `--maxWorkers=1` passed.
- Implemented bounded verified list parser, filtered-type proof, duplicate/unknown-field/status/date checks, web failure/retry and verified-empty distinction, Android 400/503 source validation and private headers, web member-route private edge policy. No database or ledger edits.
- Focused suite: 35/35 PASS across parser, page SSR, mutation receipt and Android gateway. Changed-file ESLint PASS, frontend TypeScript PASS. Full gates pending.

## Verification checkpoint — 2026-11-02 22:33 KST
- Fresh `origin/main` still `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`.
- Full frontend run with one thread completed: 2,959 PASS / 2 FAIL. Both failures were preexisting source-shape test fixtures invalidated by the stronger runtime contract: one asserted the obsolete unsafe `apiOrNull<typed>` text; one expected a malformed upstream 200 to be forwarded. Updated the tests to assert the verified parser and a valid owner response, preserving the cache-privacy assertions. Focused 80/80 PASS after correction.
- Full ESLint 0 errors / 1,027 warnings; frontend/backend TypeScript PASS, backend and contract build PASS; app-api contract 184 endpoints PASS.
- Isolated PostgreSQL 17.11 applied 323 contiguous migrations; `moneyverse_app` can EXECUTE owner privacy function but cannot directly SELECT owner request table; real PostgreSQL backend integration 10/10 PASS; ephemeral DB destroyed.
- Security production/high audit PASS, full audit FAIL (8 moderate, 1 low); full-route QA FAIL (missing `artifacts/qa/full-route-ledger.json`). Full Next build blocked by host `EAGAIN` process exhaustion; retry after concurrency drops. Remote candidate verify/runtime-check FAIL, other required CI pending. No release.
