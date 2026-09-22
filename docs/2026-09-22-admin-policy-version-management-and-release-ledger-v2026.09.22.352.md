# Admin Policy Revision Console, Governance Contracts & Release Ledger Rollback Engine (v2026.09.22.352)

- **Date**: 2026-09-22 17:00 KST
- **Release Version**: `v2026.09.22.352`
- **Release Path**: `/srv/moneyverse-data/releases/prod-f609af8-v352`
- **Exact Git SHA**: `f609af8351a0fddc691afe15bb913b6855d6a32e` (Short: `f609af8`)
- **Active Sessions Preserved**: 929 sessions in PostgreSQL (100% loss-free)

---

## 1. Overview & Context

This release implements GPT's v352 governance contracts (G352-01 through G352-04) alongside an enterprise-grade web console at `/admin/controls` that empowers superadmins to publish authoritative Terms of Service and Privacy Policy versions in real time with 2-step text confirmation, permanent audit logging, fail-safe client submission guards, and ledger-based production rollback.

---

## 2. Key Implementations

### 1) Real-time Admin Policy Revision Console (`/admin/controls`)
- **Skills Applied**: `admin-control-tower-craft`, `anti-ai-frontend-craftsmanship`
- **Backend**:
  - `POST /api/v1/admin/controls/consent-versions` endpoint requiring 2-step confirmation (`PUBLISH_NEW_POLICY_VERSION`), logging into `audit_logs`, guarded by Superadmin privileges.
  - `GET /api/v1/admin/controls/consent-versions` to review policy revision history.
- **Frontend**:
  - `frontend/src/app/admin/controls/policy-version-card.tsx`: Status card displaying active policy versions and modal dialog for version publishing.
  - `actions.ts`: `publishConsentVersionAction` server action invoking the backend mutation with path revalidation.

### 2) G352-01 Compliance: Fail-Safe Consent Submission Guard (`ConsentStepUpModal`)
- Submissions are strictly prohibited (`disabled`) when authoritative policy versions are not synchronized from the server, eliminating the risk of recording unverified fallback defaults.
- Added in-modal retry button to facilitate re-synchronization.

### 3) G352-02 & G352-04 Compliance: Immutable Release Ledger & Enhanced Rollback Engine
- Created `docs/releases/ledger.json` containing immutable provenance records (v347, v347.1, v350, v352).
- Enhanced `ops/release/rollback_production.sh` to parse `ledger.json` for verified `promoted` candidates before falling back to filesystem sorting.
- Real-time active session validation (929+ sessions) against Docker PostgreSQL.

### 4) G352-03 Compliance: Path Canonicalization & Whitelist Bypass Prevention
- `frontend/src/lib/path-utils.ts`: `normalizePath` utility handling URI decoding, lowercasing, duplicate slash collapsing, and directory traversal (`..`) resolution.
- Applied `normalizePath` inside `ConsentGuard`.
- 7 Vitest unit tests passing in `frontend/src/components/consent-guard.test.ts`.

---

## 3. Runtime Verification

```bash
=== Staging Release v352 (f609af8) ===
Full Commit SHA: f609af8351a0fddc691afe15bb913b6855d6a32e
Base Release: /srv/moneyverse-data/releases/prod-d67a915-v350
runtime identity coherent: https://test.easy-scraping.com backend=f609af8... frontend=f609af8...
All test endpoints responded 200 OK!
runtime identity coherent: https://easy-scraping.com backend=f609af8... frontend=f609af8...
All production endpoints responded 200 OK!
Active user sessions: 929 (100% loss-free)
```
