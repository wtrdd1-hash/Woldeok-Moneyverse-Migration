# Verified Coin/Dice History Export — Implementation Plan

## Scope and design
- User goal: authenticated member downloads their own **verified coin/dice** play history (up to 100 recent entries) as a privacy-safe CSV from the Arcade page. This is read-only, not a claim that other arcade games are settled or exported.
- Backend GET /api/v1/casino/history?limit=N (default 20; 1..100 only) reuses the existing SECURITY DEFINER public.member_casino_history(actor, limit) with actor from authenticated session. Invalid limits return 400 before DB access.
- Frontend GET /arcade/history/export uses the private Next-to-Nest API helper and validates the returned array, UUIDs, timestamps and exact signed integer strings. Fail closed on unavailable/malformed upstream data; do not emit fake/partial receipts. CSV cells are escaped and spreadsheet formula neutralized; numeric strings remain text.
- Arcade UI exposes a keyboard-accessible link; Android app-api forwards the same authenticated JSON history limit query (no public CSV shortcut). Private no-store, attachment, nosniff, noindex. No migration, ledger mutation or production changes.
- Rollback: revert feature branch or disable the export route/link; backend default 20 remains unchanged.

## TDD implementation steps
1. Create isolated worktree from fresh main; audit all branches, PRs and CI; write before-work log.
2. RED backend tests for limit parser and SQL parameters; GREEN controller/repository bounded limit.
3. RED frontend CSV response tests for verified owner history, precision, formula injection, upstream failure, invalid data; GREEN export helper and Next route.
4. RED Android gateway test for limit query forwarding and no-store; GREEN gateway contract or test as needed.
5. Add Arcade UI download link and regression; run focused tests and real isolated PostgreSQL read-only ACL/rollback.
6. Re-fetch main and living plans mid-work and pre-integration. Run complete test/typecheck/lint/build/audit/API/SEO/accessibility gates on exact final SHA, log failures.
7. Draft PR only while any gate fails; preserve all unmerged branches, Test and Production unchanged.
