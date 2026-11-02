# Private authorization problem responses — implementation plan

> For agentic workers: use test-driven-development, systematic-debugging and verification-before-completion before treating this plan as done.

**Goal:** Fail closed for cache, search indexing and referrer metadata on all NestJS HTTP 401/403 RFC 9457 problem responses, including non-auth guards.

**Architecture:** The global `ProblemFilter` is the final common boundary for guard and controller exceptions. Set `Cache-Control: private, no-store`, `X-Robots-Tag: noindex` and `Referrer-Policy: no-referrer` before serializing 401/403 problems; leave public 404 policy unchanged. Do not modify authentication decisions or response bodies.

**Tech stack:** NestJS/Express, Vitest, supertest. No DB schema, ledger, migrations or API route changes.

**Spec:** QA v1480/v1481 privacy findings; `docs/planning/PROJECT_PLAN.md` and Korean companion; AGENTS.md.

## Tasks

- [x] Reproduce missing protection with failing 401/403 unit tests and existing public-cache simulation. RED: 2 failures.
- [x] Add minimal header enforcement to global ProblemFilter.
- [x] Add real NestJS HTTP 401/403 and public 404 regression tests.
- [x] Fix collision with existing profile `noindex` header contract after full-suite reproduction; do not change profile tests or guard behavior.
- [x] Run focused tests, backend/frontend typechecks, changed-file lint, backend build, frontend and DB tests.
- [ ] Full backend test suite zero failures: blocked by two existing authenticated-profile 401-vs-200 failures tracked separately by development A.
- [ ] Full frontend build, isolated PostgreSQL and official exact-SHA Test E2E: blocked by release HOLD, capacity risk and unverified environment.
- [ ] CI and merge/release gates: review after draft PR, do not merge or promote without all PASS.
