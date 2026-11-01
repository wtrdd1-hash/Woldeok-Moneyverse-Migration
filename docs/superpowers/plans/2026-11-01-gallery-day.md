# Gallery Publication Day Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Follow red-green-refactor and verify each step.

**Goal:** Search approved recent gallery photos by publication calendar day in Asia/Seoul, including Android API parity.

**Architecture:** Reuse the bounded `content_list_published_photos(24)` SECURITY DEFINER read. Nest filters normalized publishedAt values after DB verification. Next renders a labelled GET date form and fail-closed results. Android proxy rejects invalid/duplicated filters and unverified upstream 200.

**Tech Stack:** NestJS, Next.js, Vitest, PostgreSQL 17.

**Spec:** Existing `docs/planning/PROJECT_PLAN.md` and `.ko.md` source-truth / privacy / release HOLD constraints.

## Global Constraints
- Never mutate applied migrations, financial ledger, privileges, or Production/Test.
- No claims of full-history coverage: only most recent 24 approved public photos.
- Strict `YYYY-MM-DD` with Gregorian date validity, KST calendar day, null publishedAt not a match.
- Android fail closed if filtered 200 cannot be verified; filter pages no-store/noindex.

## Review Focus
- Date rollover 14:59Z / 15:00Z; leap days and impossible dates.
- Repeated day and unknown query parameters; upstream ignored filter.
- Malformed success payloads; unavailable backend versus verified-empty.
- 24-photo truncation, no misleading result totals.
- Non-mutation of finance, auth, schema and public photo authorization.

### Task 1: Nest API and DB-backed read
- [ ] Write failing tests for KST date matching, invalid date and controllers.
- [ ] Run targeted tests RED.
- [ ] Implement validated filter over existing approved-public DB result.
- [ ] Run targeted tests GREEN.

### Task 2: Web and Android
- [ ] Write failing tests for query validation, result verification and UI.
- [ ] Run targeted tests RED.
- [ ] Add accessible day form, clear state and explicit bounded scope.
- [ ] Verify Android proxy rejects unfiltered/invalid responses.
- [ ] Run targeted tests GREEN.

### Task 3: Verification and release decision
- [ ] Re-fetch main and project plans at midpoint/integration.
- [ ] Run lint, typecheck, targeted/full tests, build, DB read-only, security/app-api/SEO/a11y checks as resources allow.
- [ ] Document SHA, branch counts, CI, exact-SHA Test BLOCKED, Production HOLD and rollback.
- [ ] Push independent branch and open Draft PR only; merge only after all gates PASS.
