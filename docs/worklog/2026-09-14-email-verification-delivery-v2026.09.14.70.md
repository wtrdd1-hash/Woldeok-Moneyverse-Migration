# v2026.09.14.70 — Email verification delivery hardening

## Scope
Harden first-party email registration after a production verification message was rejected because the submitted recipient domain was mistyped.

## Changes
- Reject a small allowlist of high-confidence provider-domain typos before creating a pending registration and return the corrected address suggestion.
- Preserve normal addresses and unknown custom domains without fuzzy rewriting.
- Add `SMTP_RETURN_PATH` support so the envelope sender used for bounces can be configured independently from the visible `From` header.
- Log SMTP delivery failures with only the recipient domain and SMTP reason; verification tokens, credentials, and full recipient addresses are never logged.
- Keep production fail-closed behavior: unavailable SMTP delivery remains a 503 instead of reporting a false verification dispatch.

## Verification
- Backend test suite: 849 passed, 353 database-dependent tests skipped without a test database URL.
- Backend TypeScript check: passed.
- Isolated Test and Production promotion remain gated by the repository GitHub Actions/GitOps release chain.

## Operations note
DKIM cannot be completed by application code alone. The current relay has an OpenDKIM key mount but no active key was detected; the selector/public key must be configured in the mail relay and DNS before DKIM can be considered complete. Inbound bounce delivery also requires the public MX host to accept SMTP on port 25.
