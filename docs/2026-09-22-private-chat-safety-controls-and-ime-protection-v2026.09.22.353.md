# 1:1 Private Chat Safety Controls, Korean IME Composition Protection & Governance Engine (v2026.09.22.353)

- **Date**: 2026-09-22 17:45 KST
- **Release Version**: `v2026.09.22.353`
- **Deployment Path**: `/srv/moneyverse-data/releases/prod-dc011ee-v353`
- **Exact Git SHA**: `dc011eeebf581cc32d4127754f03010fdaf988f2` (Short: `dc011ee`)
- **Preserved Active Sessions**: 929 PostgreSQL sessions 100% intact

---

## 1. Overview & Background

This release delivers the top-priority P0 emergency deliverables defined in `PROJECT_PLAN.ko.md` and `ONE_TO_ONE_PRIVATE_CHAT_SPEC.ko.md`: **1:1 Private Chat Safety Controls (member block, unblock, conversation mute, and incident reporting)** alongside **Korean IME Composition Protection (`isComposing`)**. The entire stack—ranging from PostgreSQL Migration 227 to Toss-style mobile interactive modals—has been fully implemented, verified, and promoted to production with zero downtime.

---

## 2. Core Implementation Highlights

### ① PostgreSQL Migration 227 (`227-private-chat-safety-controls.sql`)
- **Block Relationship Table (`private_chat_blocks`)**:
  - Unilateral and mutual member block management.
  - Self-block prevention constraint (`CHECK (blocker_id <> blocked_id)`).
  - Unique index for unblock idempotency.
- **Incident Reporting Table (`private_chat_reports`)**:
  - Reporter ID, reported user ID, conversation ID, 4 policy reasons (`SPAM_ABUSE`, `HARASSMENT_THREAT`, `FRAUD_FINANCIAL`, `PROHIBITED_CONTENT`), and description.
  - `evidence_snapshot` (JSONB) capturing the 10 most recent messages at the exact moment of reporting for immutable audit records.
- **Stored Procedures & Fail-Closed Guard**:
  - `private_chat_mute`, `private_chat_block`, `private_chat_unblock`, `private_chat_is_blocked`, `private_chat_report`.
  - Hardened `private_chat_send`: Rejects message delivery immediately with `RAISE EXCEPTION 42501 (Blocked)` if a block relation exists, preventing API bypass.

### ② Backend NestJS Safety APIs (`backend/src/chat/`)
- **Endpoints**:
  - `POST /api/v1/chat/conversations/:id/mute`
  - `POST /api/v1/chat/users/:id/block`
  - `DELETE /api/v1/chat/users/:id/block`
  - `POST /api/v1/chat/conversations/:id/report`
- **Service & Repository**:
  - Maps error 42501 to HTTP 403 Forbidden.
  - Returns `is_peer_blocked` in conversation listing for real-time frontend badge rendering.
  - Integrated with `audit_logs` for governance compliance.

### ③ Frontend FinTech UX & Korean IME Protection (`frontend/src/app/chat/`)
- **Skills Applied**: `fintech-responsive-layout-engine`, `anti-ai-frontend-craftsmanship`
- **Korean IME Composition Protection**:
  - Intercepts `e.nativeEvent.isComposing` to prevent premature message sending while composing Korean Hangul syllables.
- **Toss/Messenger Hybrid Interface**:
  - Header 3-dots action menu with notification mute toggle, block dialog, and 4-reason incident report modal.
  - Contextual banner disabling the input bar when a conversation partner is blocked, offering an instant unblock button.
  - Strict 44px touch targets and responsive UI across 320px to 1280px viewports.
- **Visual Status Badges**:
  - `BellOff` icon for muted rooms; `차단됨` badge for blocked rooms.

### ④ Vitest Unit Tests (`chat-safety.test.ts`)
- 4 comprehensive unit test cases verifying IME composition guard, block banner toggle, report payload structure, and mute state.
- 100% test pass rate.

---

## 3. Runtime Verification & Promotion

```bash
=== Staging Release v353 (dc011ee) ===
Full Commit SHA: dc011eeebf581cc32d4127754f03010fdaf988f2
Base Release: /srv/moneyverse-data/releases/prod-f609af8-v352
Building Next.js frontend with embedded commit SHA dc011ee...
Step 7: Pointing test-current symlink to test-dc011ee-v353...
Step 9: Verifying test environment...
runtime identity coherent: https://test.easy-scraping.com backend=dc011ee... frontend=dc011ee...
All test endpoints responded 200 OK!
Step 11: Updating production-current symlink to prod-dc011ee-v353...
Step 13: Verifying production environment...
runtime identity coherent: https://easy-scraping.com backend=dc011ee... frontend=dc011ee...
Checking production server endpoints...
All production endpoints responded 200 OK!
Step 14: Verifying active user sessions...
   929

=== Release v353 (dc011ee) Promotion Completed Successfully ===
```
