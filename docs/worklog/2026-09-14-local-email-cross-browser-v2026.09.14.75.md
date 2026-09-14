# Worklog — v2026.09.14.75

Root cause: app registration and the email browser used different cookie jars, so verify-email could not see the original prelogin session.

Fix: resolve the original registration session server-side from the hashed one-time token and complete the existing registration transaction. The verification endpoint no longer requires the caller's prelogin cookie/CSRF.
