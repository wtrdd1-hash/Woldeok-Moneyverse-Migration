# Treasury Bond Admin Evidence Implementation Plan
> **For agentic workers:** Execute test-driven development and verification before completion.

**Goal:** Admin bond dashboard never displays invented finance evidence and never triggers uncertified manual coupon payouts.

**Architecture:** Validate read-only NestJS payloads in a shared pure frontend parser used by SSR and same-origin refresh. Treat any failed/untrusted read as unavailable, distinct from a valid empty list. Block the uncertified manual payout at NestJS controller; do not touch scheduled settlement or finance schema.

**Tech Stack:** Next.js, NestJS, Vitest, Node test runner, PostgreSQL CI.

1. [ ] Write RED parser, UI and controller tests; run and record failures.
2. [ ] Implement strict evidence parser, error state, responsive a11y and noindex.
3. [ ] Make Next refresh use parser and no-store, NestJS manual POST return 503.
4. [ ] Run focused and full tests, typecheck, lint, builds, audits, API contracts and CI on exact HEAD.
5. [ ] Re-fetch main/plans, create Draft PR, validate official Test exact-SHA or BLOCK, preserve all other branches.
