# v2026.09.14.70 — Email verification delivery hardening

- Registration now catches known high-confidence email-provider domain typos before sending a verification message and suggests the corrected address.
- SMTP delivery diagnostics now retain actionable failure reasons without logging full recipient addresses, tokens, or credentials.
- Operators can set `SMTP_RETURN_PATH` separately from the visible sender to route delivery-status notifications to a dedicated bounce mailbox.
- Production continues to fail closed when verification email delivery is unavailable.
