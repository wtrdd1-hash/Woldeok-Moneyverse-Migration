# Development A QA — 2026-10-28 09:25 — Privacy Request Type Filter

**Status: PARTIAL / RELEASE HOLD.** P1 owner-scoped recent request-type filter across NestJS, PostgreSQL SECURITY DEFINER read, Next.js and Android app-api. Unfiltered legacy latest-30 remains; filtered queries scan latest-100 owner requests and return at most 30. Five allowlisted types, invalid API query HTTP 400, member-only no-store/noindex, no migration or financial write.

RED evidence: Backend 3 failed / 1 passed; Web 2 failed / 3 passed. GREEN focused: Backend 4 passed; Web + Android 31 passed. Full component suites: Backend 1,931 pass / 440 skip; Frontend 1,866 pass with `NODE_ENV=test` and bounded workers; Bot 11 pass after local dependency install; Database 45 pass / 3 skip. Isolated PostgreSQL 17 real function passed latest-100 boundary, limit 30, other-owner separation and app-role direct SELECT denial.

Contract: 180 endpoints pass. Typecheck: Backend/Frontend/DB pass. Backend build and default Next.js production build pass. Full ESLint 0 errors / 1,099 warnings; root and Bot High+ audits pass. Root `pnpm test` exceeded 100-second timeout; first unbounded frontend run hit worker EPIPE. No whole-suite root PASS. No authenticated exact-SHA official Test, comprehensive WCAG/SEO, independent backup restore or release authorization.

Test symlink target absent; Production symlink target absent; Test public version remains `6f697e74...`, Production `/api/version` returned `unknown` at 09:45 KST. No deploy or merge. The external mass-closure incident is tracked in #1663; 352 locally recoverable old PR head commits were protected by non-branch refs, not restored remotely.
