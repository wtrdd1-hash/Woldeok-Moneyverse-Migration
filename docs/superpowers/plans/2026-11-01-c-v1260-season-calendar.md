# Verified Season Event Calendar Implementation Plan

> For agentic workers: execute this bounded plan using TDD in the isolated worktree, then verify before claiming completion.

**Goal:** Prevent the web and Android calendar from treating malformed or unavailable season events as verified schedule data.

**Scope:** Existing Nest guarded GET /api/v1/seasons/events and SECURITY DEFINER public.season_active_events() only. No DB or financial writes, no changes to A/B/QA branches.

- [ ] Task 1 RED: add parser tests for valid empty, valid bounded records, malformed array, duplicate UUIDs, bad WLD/points, dates and over-limit payloads; observe failures.
- [ ] Task 1 GREEN: implement pure parseSeasonCalendarEvents(value: unknown): readonly SeasonEvent[] | null.
- [ ] Task 2 RED: add page source tests for parser use, invalid/empty distinction, keyboard-accessible retry, noindex, responsive grid; observe failures.
- [ ] Task 2 GREEN: wire parser to page, remove unvalidated type assertion and render unknown status.
- [ ] Task 3 RED: add app-api GET tests for valid/invalid upstream 200 and non-200 private/noindex; observe failures.
- [ ] Task 3 GREEN: apply the same parser to Android gateway, reject non-JSON/malformed 200 with 503, retain upstream auth error status, fence success/error/HEAD privacy.
- [ ] Task 4: midpoint fetch, fresh exact-SHA focused tests, full required gates, official Test and release gate assessment, documentation, draft PR and backups; never merge or deploy without all PASS.
