# Dynamic Policy Version Binding, Inline Tab Accordion & 10s Production Rollback Script (v2026.09.22.350)

- **Date**: 2026-09-22 14:06 KST
- **Release Version**: `v2026.09.22.350`
- **Target Deployments**: Production (`https://easy-scraping.com`) & Staging (`https://test.easy-scraping.com`)
- **Active Sessions Preserved**: 929 sessions in PostgreSQL (100% loss-free)

---

## 1. Overview & Context

This release builds on the emergency consent step-up modal from `v347.1`, removing hardcoded version constants in favor of dynamic server-side policy binding, eliminating hydration flicker, expanding the public SEO and safety routes whitelist, and adding a 10-second one-click production rollback script with automated session integrity checks.

---

## 2. Key Changes

### 1) Server-Side Dynamic Policy Version Binding (`fetchLatestPolicy`)
- **Files**: `frontend/src/lib/api.ts`, `frontend/src/app/layout.tsx`
- Connects to backend `GET /api/v1/auth/policy` to retrieve authoritative `terms_version` and `privacy_version` with 60-second SWR caching (`revalidate: 60`).
- Incorporates graceful fallback to constant defaults on backend connectivity errors.
- Executed in parallel with `currentViewer()` via `Promise.all` inside `RootLayout`, injecting dynamic policy versions during SSR.

### 2) Hydration Guard & 14-Route Exemption Whitelist (`ConsentGuard`)
- **File**: `frontend/src/components/consent-guard.tsx`
- Mounted state guard prevents SSR-client hydration mismatches and transient flicker.
- Strict 14-path exemption whitelist:
  - Legal & Safety: `/terms`, `/privacy`, `/data-deletion`, `/account-deletion`, `/safety`, `/safety/takedown`
  - SEO & Public Assets: `/robots.txt`, `/sitemap.xml`, `/api/og`, `/icon.svg`, `/apple-icon.png`
  - Authentication & Diagnostics: `/login`, `/frontend-version`, `/api/health`
- Introduced `dismissed` state for immediate modal unmounting upon agreement.

### 3) Inline Tab Accordion Viewer & FinTech Toast Notifications (`ConsentStepUpModal`)
- **File**: `frontend/src/components/consent-step-up-modal.tsx`
- In-modal tabbed accordion view for Terms and Privacy summaries, eliminating unnecessary page navigation.
- 200ms smooth fade-in transition (`duration-200 animate-in fade-in-0 zoom-in-95`).
- Toss-style celebratory toast notification (`sonner`) and non-blocking background server refresh (`router.refresh()`).

### 4) Production 10-Second One-Click Rollback Script (`ops/release/rollback_production.sh`)
- **File**: `ops/release/rollback_production.sh`
- Automatic previous release detection.
- Real-time PostgreSQL active session count verification (929+ sessions guarded).
- Atomic symlink switch (`ln -sfn`) and zero-downtime service reload.
- Coherent runtime identity verification via `verify-runtime-identity.sh` and Discord webhook alert integration.

---

## 3. Verification

1. **Frontend Build & Types**: Passing cleanly.
2. **Backend API Compatibility**: 100% compatible with `GET /api/v1/auth/policy` and `PUT /api/v1/auth/consent`.
3. **Runtime Identity**: Identical Git commit SHA across frontend and backend.
4. **Active Sessions**: 929 active user sessions preserved without disruption.
