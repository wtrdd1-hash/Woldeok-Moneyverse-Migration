# Moneyverse Migration Postmortem & Engineering Error Prevention Guide

- **Date**: November 17, 2026
- **System**: Woldeok Moneyverse Production (Next.js 15 + Spring Boot 3.3 Unified Backend)
- **Objective**: Document root causes of past migration errors, Nginx misroutes, UI banner leaks, and audit sequence sorting bugs to establish deterministic prevention standards.

## Summary of Mistakes & Resolutions
1. **Frontend Banner Leak**: Removed promotional "Spring Boot engine" banners from client view.
2. **Nginx Admin Route Misdirection**: Corrected `/admin/blog` and related UI locations to route to `prod_frontend` (4501) rather than the backend, eliminating white fallback screens.
3. **Audit Log Sequence Sorting**: Enforced numerical BigInt casting on ledger sequence ordering to prevent alphabetical inversion.
4. **Client Error Telemetry & Log Ingestion**: Built `/api/v1/telemetry/client-error` streaming into `/var/log/moneyverse/frontend-errors.log`, bound directly to Spring Boot's `FRONTEND_ERRORS` system log view.
5. **Session Resilience & Auto-Recovery**: Bound global error boundaries (`error.tsx`, `global-error.tsx`) to auto-navigate to home (`/`) after 3 seconds while strictly preserving authentication tokens across refreshes.
