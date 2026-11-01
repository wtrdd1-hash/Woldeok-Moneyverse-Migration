# Development A 06:50 — Public Gallery Month QA

**State:** P1 code candidate / DRAFT / RELEASE HOLD; exact final SHA gates pending.

## Source and behavior
- Baseline main `a8541927c3a351d980454c66e95a3356c47e0722`.
- Only approved `content_list_published_photos(24)` SECURITY DEFINER rows are filtered by Asia/Seoul publication month; no historical-search claim.
- Web: accessible labelled month input, explicit scope, reset, invalid/error/verified-empty states, noindex on filtered URLs.
- Backend: rejects malformed/duplicate/unknown month parameters before querying; echoes applied month; unfiltered response unchanged.
- Android: rejects ignored filter, malformed payload, wrong Seoul month, duplicate photo IDs; filtered success/errors no-store/noindex/no-referrer.
- No new migration, direct grants, ledger writes, member-private exposure or deployment.

## Test evidence
- RED: helper imports failed; backend integration 3 FAIL; Android/UI 4 FAIL.
- GREEN: backend 10 PASS, frontend helper 2 PASS, Android/UI 6 PASS.
- Full typecheck PASS. Changed lint 0 errors / 1 pre-existing image warning.
- DEV PG17 app-role READ ONLY: approved photos 2; EXECUTE=true; transaction rolled back.
- DEV P0 #993 remains: account_balances UPDATE=true; user_items DELETE=true. Production ACL not asserted.
- Full suites, API contract exact SHA, CI, official Test auth E2E, restore, security audit: PENDING / BLOCKED until independently evidenced.

## Release
HOLD. No main merge, Test or Production deployment, DB migration, service restart, branch deletion or rollback. Rollback is dropping the unmerged read-only branch after preserving evidence.
