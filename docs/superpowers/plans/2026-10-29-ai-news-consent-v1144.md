# AI news publication consent and receipt implementation plan

> For agentic workers: execute the existing-flow bounded change with TDD and verification-before-completion.

**Goal:** Never publish admin-generated market news when immediate publication was not explicitly requested, and never claim publication without a backend receipt.

**Architecture:** Controller validates a boolean flag and passes it to the existing service, which persists generated scenarios but does not publish for draft-only requests. The Next server action validates the backend's actual generated/published/skipped contract and shows the real model/fallback state. Scheduler invocation remains backward-compatible.

**Tech Stack:** NestJS, Next.js server actions, Vitest, PostgreSQL existing security-definer API.

**Spec:** `docs/worklog/2026-10-29-hourly-c-ai-news-consent-v1144.md`.

## Global Constraints
- No new migrations, no live DB mutations, no direct balance changes, no auto-deploy, no unsafe backup root test.
- Preserve CSRF, reauthentication, admin session and responsive accessible checkbox.
- Require exact-SHA tests and official Test before merge or release.

## Review Focus
- Checkbox absent/false cannot publish; true can publish.
- Skipped/no registered stocks is not success.
- Malformed or contradictory receipts are not success.
- Deterministic fallback is not presented as model inference.
- Scheduler's existing explicit auto-publication continues unchanged.

### Task 1 — backend explicit consent
- [x] Add RED tests in service/controller for false/missing/true publication choice.
- [x] Run RED and record failure.
- [x] Add DTO boolean, explicit controller pass-through and draft-only service branch.
- [x] Run GREEN and regression tests.

### Task 2 — frontend receipt truth
- [x] Add RED tests for skipped/malformed/published/draft/fallback.
- [x] Run RED and record failure.
- [x] Parse real receipt and default checkbox off; distinguish generated, published, skipped and fallback.
- [x] Run GREEN and broader frontend tests.

### Task 3 — gates and review
- [x] Re-fetch main and canonical plan, inspect overlap.
- [x] Run safe build/lint/typecheck/unit/integration/security/app-api/E2E; real-PG/CI remain blocked or pending as documented.
- [x] Record PASS/FAIL/BLOCKED and preserve Draft/HOLD until release gates pass.
