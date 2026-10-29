# Member Support Form Wiring Implementation Plan
> For agentic workers: use superpowers:executing-plans and test-driven-development for each step.
**Goal:** Restore verified member support create/reply actions to the rendered Next.js support page.
**Architecture:** Reuse the existing client useActionState forms; do not bypass server receipt and owner readback. Preserve server-side member guard and noindex.
**Tech Stack:** Next.js App Router, React useActionState, Vitest, NestJS/PostgreSQL existing support contract.
**Spec:** frontend/src/app/support/actions.ts, frontend/src/app/support/member-support-forms.tsx, issue #1884.
## Constraints
- Keep English code/tests and Korean product copy unchanged.
- No DB migration, app-role grants, ledger write, or shared runtime changes.
- Independent branch and fail-closed release.
## Review Focus
- Two-argument server action must never be attached directly to HTML form.
- A member's status/receipt must be visible to keyboard and screen reader.
- Existing member auth/consent, CSRF and owner readback must remain intact.
- Thread links remain owner-only and non-indexable.
- No overlap with A/B/QA branches.
## Task 1: Route form integration
- [x] Write page regression test that fails against direct form actions.
- [x] Run RED and capture exit status.
- [x] Render NewSupportThreadForm and SupportReplyForm in page.
- [x] Run GREEN and existing support tests.
- [x] Inspect diff for scope/accessibility.
## Task 2: Verification and handoff
- [x] Fetch main/plan and compare.
- [x] Run full mandatory gates and report exact failures.
- [x] Write EN/KO final worklog and GitHub update; hold if not green.
