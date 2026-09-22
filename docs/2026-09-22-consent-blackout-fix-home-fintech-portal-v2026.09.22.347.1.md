# Release Notes v2026.09.22.347.1 — Consent Step-Up Modal Blackout Recovery & Main Portal FinTech Rebuild Complete

- **Timestamp**: 2026-09-22 12:50:00 KST
- **Branch**: `main`
- **Production Release Path**: `/srv/moneyverse-data/releases/prod-854d777-v347`
- **Exact Git SHA**: `854d777d204b66164ac5043e9bd9be3a7bee4498`
- **Database Active Sessions**: 927 (100% losslessly preserved)

---

## 1. Problem Diagnosis & Root Cause
- **Symptom**: Upon entering the site, only the toast notification `서비스 이용을 위해 이용약관 및 개인정보처리방침 동의가 필요합니다.` appeared while the main home page body completely blacked out into a dark screen.
- **Root Cause**: `ConsentGuard` (`consent-guard.tsx`) called `router.replace('/login?error=consent_required')` when `consentCurrent === false`, abruptly cancelling Next.js client-side page rendering and unmounting the main component tree.

---

## 2. Solutions & Implementation Specifications
1. **Toss-Style In-Place Consent Step-Up Modal (`ConsentStepUpModal`)**:
   - Replaced abrupt redirection (`router.replace`) with an in-place modal dialog.
   - Required 3 checks (14+ age confirmation, Terms of Service, Privacy Policy) with WLD disclaimer banner.
   - One-click submission bound atomically to backend `PUT /api/v1/auth/consent` (`auth_grant_current_user_consent` RPC).
2. **`ConsentGuard` Overhaul**:
   - Completely eliminated `router.replace`, rendering `ConsentStepUpModal` inline to prevent blackout bugs.
3. **Main Home Portal (`/`) FinTech Overhaul**:
   - Applied `anti-ai-frontend-craftsmanship` and `fintech-responsive-layout-engine`.
   - Real-time net worth hero card (`WalletGlance`).
   - 2-column asymmetric FinTech live console: 3 hot stocks (WDG, FNAK, CHIMU) and Career Station (daily reward progress, 8 professions).
   - 4-pillar 18-domain service directory.
   - Zero-clipping responsive layout adapted across 320px to 1440px.

---

## 3. Verification & Runtime Results
- `verify-runtime-identity.sh`: Backend & Frontend exact SHA `854d777` 100% coherent.
- All endpoints responded 200 OK (`/`, `/login`, `/stocks`, `/casino`, `/developer`, `/admin`).
- PostgreSQL 927 active user sessions preserved losslessly.
