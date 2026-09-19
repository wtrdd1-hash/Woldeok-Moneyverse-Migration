# v2026.09.19.287 — Account privacy center

- Added a member-only `/account/privacy` surface for data-subject requests and request history.
- Reused the authoritative `GET/POST /api/v1/privacy/requests` flow rather than duplicating privacy state in the frontend.
- Moved the account entry point to a dedicated privacy-center card while preserving the existing request form and server-side CSRF/idempotency handling.
- Privacy writes now revalidate both account settings and the dedicated privacy center.
- Added regression coverage for authentication/noindex boundaries, API binding, navigation and post-write refresh.
