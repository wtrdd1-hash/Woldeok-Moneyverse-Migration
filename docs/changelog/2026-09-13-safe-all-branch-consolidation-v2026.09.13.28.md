# v2026.09.13.28 — Safe all-branch consolidation

## Summary

This release-candidate branch consolidates the still-valid runtime and documentation work found across the repository's active and historical branches onto the current `main` baseline without replaying stale branch history blindly.

- Baseline `main`: `22f8b7a18cd778ddf6a754cc6d28dd0206847885`.
- Final candidate branch: `integrate/final-safe-all-v2026.09.13.28`.
- The audit observed 59 refs before this final branch was created; this branch became the 60th visible ref.
- `main` and Production are unchanged by this consolidation.

## Consolidated runtime

- Account Security Center and its session-revocation backend/UI.
- Admin edit-state preservation.
- Business Settlement Boost runtime/idempotency repair.
- Trusted client IP hardening.
- Stock-tagged community and discovery.
- Banking safety UI and marketplace workbench runtime.
- Local-email verification SMTP sender and `/verify-email` flow.
- Conditional virtual-stock alerts, Personal Dashboard, and Portfolio Analysis.
- Economy Scenario Lab.
- Event Calendar with navigation reconciliation.

## Documentation consolidated

- Casino Game System specification.
- AI Economy Controller specification, English canonical with Korean parity.
- Event Calendar and Economy Scenario Lab release/worklog records.
- Current `main` Living Project Plan and current documentation baseline remain authoritative; stale planning histories were not allowed to overwrite them.

## Database migration reconciliation

The candidate intentionally preserves one coherent migration sequence:

- `179-business-settlement-v2-boost-runtime-fix.sql`
- `180-local-email-auth.sql`
- `181-stock-tagged-community.sql`
- `182-conditional-stock-alerts.sql`

The concurrent `integrate/final-all-v2026.09.13.27` branch was **not** merged wholesale because it contains identical local-email-auth SQL at both `179-local-email-auth.sql` and `180-local-email-auth.sql`. Replaying that history would reintroduce duplicate migration numbering/content.

## Branch policy

Lower stacked branches that are already represented by a later consolidated branch are treated as covered/superseded rather than replayed one by one. Older documentation/auth integration branches that diverge from the current baseline and carry obsolete migration state (including the former `163-local-email-auth.sql` layout) are preserved for history but are not allowed to regress the current repository.

## Validation / release gate

GitHub CI must pass on the exact final candidate SHA. The exact SHA must then be deployed to isolated Test and backend/database/API/UI smoke checks must pass before any merge to `main` or Production promotion. The authorized `@미니pc홍` remote host is currently offline, so exact-SHA Test runtime verification cannot be claimed yet.
