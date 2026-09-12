# v2026.09.13.2 — Trusted Client IP hardening re-home

- Re-homed the validated Trusted Client IP hardening onto the newest reconciled runtime baseline.
- Baseline: current `main` `7f2e59b0faf627376f9dd8066be2bf0642e31981` plus active Business Settlement candidate `73756378915fe5d9bc74aeef4116664854436aa2` so the known migration-number repair is preserved.
- Backend client identity accepts only a syntactically valid edge-overwritten `CF-Connecting-IP` when trusted-proxy mode is enabled; `X-Forwarded-For` is never used as caller identity.
- Missing or malformed trusted edge IP fails closed to a validated socket peer, otherwise `unknown`.
- Frontend server/API proxy paths no longer relay `X-Forwarded-For` to the backend.
- Focused rate-limit/throttler regressions are preserved.
- No database schema or stored data change is introduced by this security slice.
- Production remains blocked until CI and exact-SHA isolated Test verification confirm real proxy behavior.
