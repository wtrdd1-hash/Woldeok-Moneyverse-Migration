# Plan: Admin traffic evidence v1283

1. Reproduce malformed dashboard handling with Vitest parser and server page integration tests (RED).
2. Implement strict bounded source parser: request granularity/periods, finite safe counts, ordered bucket dates, consistent sums, bounded rank lists, and valid timestamps (GREEN).
3. Integrate into guarded admin page; verified empty remains distinct from unavailable; keyboard-accessible retry and aria-live alert; existing mobile layout, noindex and Nest/SQL contract unchanged.
4. Verify targeted tests, full lint/typecheck/build/test, security, app-api, isolated PostgreSQL and E2E where possible at exact HEAD; record any blocker without claiming pass.
5. Re-fetch main, preserve code and EN/KO logs in draft PR, merge only if every required gate passes; never promote on incomplete evidence.
