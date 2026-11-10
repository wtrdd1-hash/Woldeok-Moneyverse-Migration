# Administrator Discord/Telegram OTP hardening — v2026.11.10.2026

Status: implementation design; user authorized implementation on 2026-11-10. Base integration candidate c02bdbc884; authoritative policy: docs/planning/AUTHENTICATION_SECURITY_PRIORITY_SPEC.ko.md (2026-11-10 correction), with integration master and project plan cross-checked.

## Goal and boundaries
Keep normal administrator sign-in and console sessions. Require a separate, single-use, five-minute 6-digit OTP delivered to both configured Telegram and Discord administrator destinations before privileged Treasury mint top-up or administrator salary disbursement. Do not restore retired TOTP, the two-person approval queue, or bypass database financial authority. Fail closed whenever delivery, session, account, action, request binding, CSRF, or OTP validation fails.

## Approaches
1. **Dedicated narrow OTP controller + existing Nest guards + same-origin Next proxies (selected):** leaves normal login untouched, enforces business actions on the backend, respects edge routing, no DB migration.
2. Frontend-only OTP modal: rejected; direct API invocations bypass it.
3. New global login MFA: rejected for v2026; would violate the existing console session and broaden risk.

## Trust contract
- Authenticated superadmin with an open console session only; browser cannot supply an admin actor ID.
- Bind code to user UUID, admin session ID, exact Treasury action, amount, reason, target admin UUID or request UUID. Single-use and maximum five failed attempts; at most one issuance per 60 seconds per user/session/action.
- Hash OTP at rest in backend memory; generate with cryptographic random; hold no plaintext OTP in logs or API response.
- Discord DM and Telegram must each confirm successful delivery; if either fails, do not permit verification, report 503.
- All mutations keep existing CSRF and DB financial invariants. Next server-side proxy forwards the authenticated session and verified CSRF token. No public backend API prefix.
- Process-local ephemeral OTPs invalidate on restart and are not safe for multi-replica deployment; rollout requires a single active OTP-verifying backend or shared atomic store before scale-out.
- Failed/missing OTP must never invoke ledger writes. HTTP 401/403/429/503 errors must be distinguishable; no claim of valid OTP from a 200 UI-only response.

## Rollout
Dedicated branch/worktree; TDD security negative paths; backend and frontend build/typecheck; isolated exact-SHA Test running API, administrator session, delivery and negative-path QA; merged exact SHA only then Production zero-downtime promotion and post-promote smoke. Page-access OTP for additional administrator areas and other financial controls is a follow-on gate; do not mark those as implemented without independently testing each page and command.
