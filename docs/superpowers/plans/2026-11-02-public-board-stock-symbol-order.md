# Public Board Stock Symbol Order — Implementation Plan

> **Goal:** Add a bounded, opt-in `stock-symbol` sort for latest 50 public board summaries, preserving default behavior and all security boundaries.

### Task 1: Backend HTTP and database ordering
- Test: add `sort` validation cases to `backend/src/board/stock-community.http.test.ts` and SQL order contract cases to `backend/src/board/stock-community.service.test.ts`; run and observe RED.
- Implement: allow only `sort=stock-symbol` in `stock-community.controller.ts`; extend `StockCommunityService.publicList` with optional sort and `ORDER BY` only when requested, after source snapshot/filter. Return `sortApplied` only for requested sort. No schema migration.
- Verify: focused Nest tests GREEN, SQL parameterization and default response unchanged.

### Task 2: Web discoverability and SEO
- Test: extend board title-search tests with accessible sort selection, filtered robots and latest-50 scope; run RED.
- Implement: parse sort, add native select to GET form, propagate to public API, show scope and invalid input. Preserve q and stock. Filtered URLs noindex.
- Verify: focused frontend tests GREEN.

### Task 3: Android API source proof
- Test: Android proxy rejects missing sort proof, malformed stock symbols, unsorted/duplicate IDs and invalid query; accepts verified empty and correctly ordered results.
- Implement: fail-closed verifier, validate before returning success; no-store/noindex/referrer protection. Preserve default unfiltered responses.
- Verify: focused Android tests GREEN, app-api contract tests.

### Task 4: Integration, QA and release hold
- Run typecheck, lint, unit/integration, build, database read-only SQL, security audit, accessibility/SEO and app-api tests. Check latest main and planning before integration.
- Record exact SHA, changed files, pass/fail/blocked gates, Test/Production/rollback and branch preservation; open Draft PR only, no merge/deploy without complete evidence.
