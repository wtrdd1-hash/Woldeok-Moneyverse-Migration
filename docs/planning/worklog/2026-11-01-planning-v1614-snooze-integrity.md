# Planning v1614 — F675-209 Snooze Effective-Day and Early-Resume Integrity (English)

- Date: 2026-11-01; Previous Feature Addition v1612; Current Feature Improvement v1614; Next Feature Addition v1616 (provisional).
- Superpowers: skills__list returned [] so skills__read had no available URI (BLOCKED); installed using-superpowers, brainstorming, writing-plans, worktrees and verification skills read on miniPC.
- Authority: main `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0` checked start/mid; AGENTS.md, README.md, canonical PROJECT_PLAN.md, Korean parity, actual notification service, frontend notification page and app-api paths inspected. Existing expiry snooze is NOT implemented.
- Branch isolation: stacked on open #2355, own docs-only branch; issue #2354 START/MID/FINAL updates and Draft #2361; no A/B/C/QA/Gemini runtime ownership.
- Root issue: single paired DATE 1/3/7-day constraint cannot represent arbitrary early resume by truncation; overwriting active interval with next-day replacement violates today-unchanged rule.
- Proposed base interval + one pending effective-day PAUSE/RESUME transition; GET read-only state resolver, PUT/worker owner-lock normalization, opt-in generation, strict idempotency, KST midnight safety and evidence-only worker suppression.
- Backlog P0 4/P1 6. Latest #2357 season-settlement app EXECUTE added as independent release blocker. Financial, Test provenance, grants, migration collision remain HOLD.
- PostgreSQL 17, API, web, Android, Test exact-SHA and independent restore tests are **proposed, not run**. No schema, runtime, balances, ledger, item, Test or Production changes.
- External independently acquired/deduplicated/classified approved this cycle 0; cumulative UNKNOWN / 10,000, BLOCKED / IN PROGRESS. Final CI and SHA recorded in PR and miniPC FINISH.
