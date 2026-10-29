# Owner Wallet Activity Direction Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development, then verification-before-completion.

**Goal:** Allow a signed-in member to filter all wallet ledger activity by incoming, outgoing or neutral WLD movement without leaking other members' records or breaking cursor pagination.

**Architecture:** The NestJS controller validates a strict allow-list and passes it to the service. The HMAC cursor binds the direction to the session and period; PostgreSQL filters the aggregate signed owner deltas in HAVING *before* applying the 51-row lookahead. Next.js renders accessible direction links; the Android gateway forwards the same query and sets no-store/noindex.

**Tech Stack:** PostgreSQL 17, NestJS, Next.js, TypeScript, Vitest.

**Spec:** Existing owner wallet history and integrated planning master, with a narrowly scoped additive direction filter. No new migrations or ledger mutations.

## Global Constraints

- Exact WLD amounts remain decimal strings; neutral means the sum of all owned cash/bank posting deltas is zero.
- Query is owner-scoped before aggregation; no user-provided SQL fragments, no new direct table grants.
- Cursor cannot cross owner, session, period or direction; reject malformed/expired tokens before SQL.
- Existing unfiltered cursor tokens remain valid only in the default direction.
- Android results must be `private, no-store`, `noindex`; SEO metadata remains private.
- Never merge or deploy without full quality and exact-SHA Test/Production release gates.

## Review Focus

1. Direction applied after LIMIT gives incorrect 50-row pages: test SQL HAVING before LIMIT and real PG with mixed entries.
2. Cursor replayed under another direction leaks stale pages: test HMAC binding before SQL.
3. A net-zero bank transfer must be neutral, not a debit or credit: test exact aggregate delta.
4. Invalid/duplicate direction query must fail rather than silently change meaning: controller and gateway tests.
5. Direction changes must reset cursor, preserve period and remain keyboard accessible: Next helper and page tests.

## Tasks

- [x] Add failing Nest service/cursor/controller tests for valid directions, strict validation and replay denial; run RED.
- [x] Add failing repository SQL and isolated real-PG tests for owner/direction aggregate filtering before pagination; run RED.
- [x] Implement minimal repository/service/cursor/controller changes; run GREEN.
- [x] Add failing Next navigation and Android privacy/forwarding tests; run RED.
- [x] Implement direction UI and Android response protection; run GREEN.
- [x] Recheck latest main/plan/PR/QA and verify targeted, build/lint/typecheck/unit/integration/PG/security/a11y/SEO/app-api/E2E gates.
- [ ] Write bilingual QA/release/worklog, exact SHA/branch evidence, push Draft PR, no merge or Production without all PASS.
