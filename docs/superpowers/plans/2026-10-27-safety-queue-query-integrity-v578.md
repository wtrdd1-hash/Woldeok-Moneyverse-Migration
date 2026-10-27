# Safety moderation queue query integrity implementation plan

> **For agentic workers:** Use superpowers test-driven-development, executing-plans and verification-before-completion. No release without all gates.

**Goal:** Ensure invalid administrator safety queue query parameters fail closed rather than broadening access or changing requested pages.

**Architecture:** Validate both GET handlers through explicit Zod schemas before service calls; use per-queue status enums and a shared strict decimal pagination parser. Keep authorization guards, SQL parameterization, and response envelope unchanged.

**Tech Stack:** NestJS, Zod, Vitest, PostgreSQL.

**Spec:** docs/worklog/2026-10-27-hourly-b-v578-safety-queue-query.md

- [ ] Add controller unit tests: invalid status, fractional/negative/NaN/oversized/unsafe offset, valid default and boundary cases; verify zero service calls on invalid.
- [ ] Run RED focused Vitest, record failure count.
- [ ] Implement shared strict pagination Zod schema in safety.dto.ts, validate both controller handlers; reject malformed queries with BadRequestException.
- [ ] Run GREEN focused and existing guard tests; review API contract and role protections.
- [ ] Run full lint/typecheck/test/build/security checks, isolated PG read-only probe if safe.
- [ ] Commit and push exact SHA, open Draft/HOLD PR, verify CI, record Test/Production hold and coordination.
