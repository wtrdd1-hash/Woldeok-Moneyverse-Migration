# Verified Help Reading Time Implementation Plan

> **For agentic workers:** Follow test-driven-development, worktree isolation and verification-before-completion.

**Goal:** Show a conservative, clearly approximate reading-time estimate for independently approved help articles on the web and Android app API.

**Architecture:** The existing PostgreSQL SECURITY DEFINER article function returns only published, unexpired, independently approved article text. The NestJS article endpoint computes a bounded estimate (English whitespace-delimited words at 200/min; Korean non-whitespace Unicode code points at 500/min) and returns an additive integer field. The Next.js article view displays a localized approximation only for a validated integer; the Android BFF preserves the field and disables caching because publication approval can expire. No migration or financial/identity change.

**Tech Stack:** NestJS, PostgreSQL, Next.js, Vitest, Android app-api.

**Spec:** P1 user-facing reading estimate. Earlier result-size work was stopped before PR/push after detecting an existing equivalent Draft PR #1839; this distinct feature avoids duplication.

## Steps
- [x] RED: backend estimate tests (Korean/English, Unicode, empty and long text), controller additive response.
- [x] GREEN: implement bounded pure estimate helper and endpoint field.
- [x] RED: Next.js localized article rendering and safe omission tests.
- [x] GREEN: display approximate time without client-side body analysis or unsafe markup.
- [x] RED: Android article API field forwarding, no-store on success/error.
- [x] GREEN: preserve field and fence upstream cache.
- [x] Validate existing SQL approval/expiry read boundary and run real isolated PostgreSQL migration + rollback-only fixture.
- [x] Full local lint/typecheck/test/build/security/SEO/a11y/app-api gates and main/planning recheck; Draft PR/CI verification tracked separately, release HOLD until exact Test.
