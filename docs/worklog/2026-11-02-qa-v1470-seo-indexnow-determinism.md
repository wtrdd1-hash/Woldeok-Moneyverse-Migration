# QA v1470 — IndexNow unit-test transport determinism (2026-11-02)

## Before work
- Exact origin/main `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`; isolated `qa/v1470-seo-indexnow-test-isolation` worktree, no shared checkout changes.
- GitHub CI run 41435020438 `verify / runtime-check` failed on `SeoService > should handle submitUrls without breaking` due 5-second test timeout. The test calls three real IndexNow endpoints through `safeFetch` with a 10-second network timeout; the unit test has no network stub. Live external response latency is not a valid unit-test prerequisite.
- Scope: test-only deterministic transport mock and assertions for 202 acceptance semantics. No change to production outbound SSRF checks, endpoint lists, DB, or actual indexing behavior. Keep independent SSRF tests intact.
- [x] Reproduce failing CI log and identify unmocked network dependency.
- [ ] RED focused assertion with unmocked transport.
- [ ] GREEN mock only inside affected unit test, restore after.
- [ ] Typecheck, lint, focused suite, full applicable checks, exact-SHA GitHub CI.
- [ ] Recheck main, document release HOLD and preserve other workers.

## In progress — RED/GREEN and focused verification (20:27 KST)
- RED: with outbound transport explicitly stubbed to reject (no real IndexNow calls), new accepted-response contract fails **1/9**, proving the test observes the acceptance outcome rather than a vacuous assertion.
- GREEN: stub `safeFetch` to return HTTP 202 for each of the three documented IndexNow endpoints; `submitUrls` reports accepted notification (not indexing), preserves two URL paths, Google retired ping status 410, and calls exactly the three intended transports. **16/16 focused SEO tests PASS** in 1.39 seconds; no network POST.
- Contract build, backend Typecheck, changed-file ESLint and backend build all exit 0. Full main CI `verify / runtime-check` failure traced to this existing test making real external IndexNow POSTs under Vitest 5-second timeout while `safeFetch` allows 10 seconds; CI run 41435020438 failed 1/3605 assertions on timeout. This is a deterministic test-harness fix, not a production network behavior change.
- Full project QA is separate, ongoing. Official Test exact candidate SHA, authenticated E2E and Production gates are not yet met. No shared DB or service mutation.

## Validation and review before Draft PR (20:29 KST)
- Reviewed exact test diff: only `backend/src/seo/seo.service.test.ts` changes; three external IndexNow transports are mocked locally, restored in finally, and all endpoint URLs are asserted. No production `SeoService` or SSRF code changes. Existing source-truth and unauthorized-origin tests remain intact.
- Final focused SEO 16/16 PASS with canonical production origin; contract build, backend Typecheck, backend build, changed-file ESLint and `git diff --check` PASS. One attempted Test-origin suite run failed an unrelated existing hardcoded GSC sitemap expectation; the modified IndexNow test itself passed. This is not a Test-environment certification.
- Production v1622 16/28 HTTP 500, sensitive DB privileges and official Test DB migrator identity remain P0 release blockers. No merge/Production promotion. Candidate exact-SHA CI will be reviewed after push; this PR stays Draft.
