# v2026.09.23.408 — Consent policy fail-safe

Changed the frontend consent guard to fail closed when the published-policy API is unavailable. The client no longer substitutes a hard-coded policy version as authoritative: the root layout propagates the unavailable state to the existing consent step-up modal, which disables consent submission and offers retry until server authority is restored. Existing backend published-policy and audited-consent authority remain unchanged; no schema, migration, ledger, auth privilege, or DB integrity behavior changed.
