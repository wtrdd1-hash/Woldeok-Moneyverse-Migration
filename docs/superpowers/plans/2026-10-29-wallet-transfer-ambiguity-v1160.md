# Wallet ambiguous transfer containment — C v1160 implementation plan

> For agentic workers: use test-driven-development and verification-before-completion. This plan records the autonomous, bounded P0 containment path and its remaining dependencies; it does not authorize a production release.

**Goal:** Never silently rotate a transfer idempotency key after an unknown outcome, and never show success without a verifiable backend transaction ID.

**Architecture:** Keep a member-scoped browser session record of the exact command before dispatch. Hold the original key and payload across ambiguous responses and reloads; server action rejects mutations while held. Backend transfer returns durable ledger transaction ID; stable websocket IDs let Sonner dedupe toast display. This does not replace a read-only durable status endpoint.

**Tech stack:** Next.js React server actions, NestJS wallet service, PostgreSQL 17.11 ledger, Vitest, Sonner.

- [x] Inspect issue #1854, source, active PRs and main; preserve A/B/QA/Gemini worktrees.
- [x] RED tests for key fallback, unknown HTTP outcome, changed retry payload, malformed receipt and restored browser state.
- [x] GREEN server action, member-scoped UI state, explicit same-key retry, validation and accessible pending state.
- [x] RED/GREEN backend stable notification ID tests and client toast ID propagation.
- [x] Run local full lint, typecheck, build, API contract and PostgreSQL-backed tests; independently install missing worktree-only dependencies and rerun.
- [x] Verify isolated PostgreSQL migration parity and application-role finance grants; remove disposable container.
- [ ] Add owner-only read-only durable transfer receipt endpoint and server-side exactly-once notification outbox/delivery, then 100-concurrent same-key proof (follow-up, not claimed complete).
- [ ] Final exact-SHA authenticated isolated Test, audit remediation and release gate before any merge or production promotion.
