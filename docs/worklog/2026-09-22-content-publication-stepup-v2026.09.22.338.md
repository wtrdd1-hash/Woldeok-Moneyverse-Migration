# Content publication step-up worklog — v2026.09.22.338

Public-facing content state changes were still possible with an administrator session and CSRF token after the operator's recent identity proof expired. Added `ReauthGuard` to announcement publication, photo publication, and pending member-photo approval. Draft editing remains unchanged. Focused tests (4/4), backend typecheck, and diff checks pass locally.
