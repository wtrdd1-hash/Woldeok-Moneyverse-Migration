# v2026.09.13.24 — Account Security Center integration

- Re-homed the previously valid Account Security Center runtime slice onto current `main` instead of replaying stale stacked history.
- Added active-session review, revoke-one-other-session, and revoke-all-other-sessions APIs backed by existing `auth_sessions`.
- Enforced current-session protection in SQL and required CSRF plus recent reauthentication for revocation.
- Added authenticated/noindex `/account/security` UI and member navigation.
- Added repository regression coverage for minimal session exposure, current-session protection, and revoke counts.
- Added no database migration and no economy/ledger mutation.
- Baseline main SHA: `22f8b7a18cd778ddf6a754cc6d28dd0206847885`.
- Test and Production are unchanged until CI and exact-SHA isolated Test verification pass.
