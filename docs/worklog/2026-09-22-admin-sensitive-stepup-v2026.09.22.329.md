# v2026.09.22.329 — Admin sensitive-action step-up

## Scope
- Baseline: `7cf972f0ed77711ab4d47b8315d6da8e73c26bce`.
- P0 security backlog: admin step-up verification.
- Runtime change; not documentation-only.

## Change
- Require `ReauthGuard` when replacing an administrator IP allowlist.
- Require `ReauthGuard` when forcing logout of every live session for a member.
- Preserve existing admin-console, CSRF, role, idempotency and audit controls.
- Add controller metadata regression tests for both sensitive mutations.

## Verification
- [x] Focused guard tests: 3/3.
- [x] Backend TypeScript typecheck.
- [x] `git diff --check`.
- [ ] Exact-SHA GitHub CI.
- [ ] Main integration.
- [ ] Production promotion.

## Blockers / follow-up
The orphan database migration `221-stock-halt-cost-basis-settlement.sql` remains unresolved, so no new migration is introduced in this change. Repository-wide DB actor-check verification remains a separate P0 item.
