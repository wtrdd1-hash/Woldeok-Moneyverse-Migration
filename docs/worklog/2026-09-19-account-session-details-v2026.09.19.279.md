# Account session details v2026.09.19.279

- Base: `3b1dfdc27a8abfcfede57c05544c4c507d2bb269`.
- Branch: `auto/hourly-a-session-details-v2026.09.19.279`.
- User flow: Account → Security now identifies active sessions with a privacy-safe device category and last activity time before the existing per-session/all-other-session revoke actions.
- Backend/DB: migration 213 adds a least-output session read function that derives last activity from existing request activity and converts raw user-agent data into a coarse device label. Raw user-agent, IP, token and CSRF material are not returned.
- Frontend: active-session cards show device category, recent activity, login time and expiry while preserving current-session and administrator-session badges.
- Validation before push: backend focused 3/3, frontend focused 3/3, backend/frontend typecheck, diff check. Full CI, exact-SHA isolated Test and Production promotion remain mandatory.
