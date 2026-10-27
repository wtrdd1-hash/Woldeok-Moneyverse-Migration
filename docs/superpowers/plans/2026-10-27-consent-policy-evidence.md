# Consent Policy Evidence Implementation Plan

> For agentic workers: follow test-driven-development and verification-before-completion, keeping this change isolated.

**Goal:** Never display an invented legal policy version or expose a superadmin publish CTA to another admin role.

**Architecture:** Next server page validates the authenticated existing /auth/policy response; current roles come from requireAdminConsole. The existing guarded NestJS publication endpoint remains the only write path. On unavailable or invalid data the UI renders an accessible error instead of an editable form.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, React.

- [x] Add failing tests for malformed/absent versions and non-superadmin access to the publish control.
- [x] Run focused RED tests and capture failure.
- [x] Implement strict version response parser and role-based, fail-closed rendering.
- [x] Run focused GREEN tests and add mobile/keyboard/screen-reader regression assertions.
- [ ] Verify full gates at exact HEAD SHA and record results; create Draft PR only if product code changed.
- [ ] Fetch main/planning again, check release gates and preserve all other worktrees.
