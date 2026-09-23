# Consent submission fail-safe — v2026.09.23.414

## Scope
- Preserve the authoritative policy-version fail-closed flow from v2026.09.23.408.
- Do not report consent success when the consent server action throws or its outcome cannot be verified.
- Keep the mandatory consent modal open, restore the submit control, and show an actionable retry error.

## Safety
No backend, database, migration, ledger, auth-session, or permission model is changed. Consent remains server-authoritative.
