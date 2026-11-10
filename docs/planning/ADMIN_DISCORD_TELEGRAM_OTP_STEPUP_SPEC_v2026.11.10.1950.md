# Administrator Discord/Telegram OTP Step-Up — Planning Correction
> Version: v2026.11.10.1950 | Status: PLANNING / NOT IMPLEMENTED | Authority: owner directive 2026-11-10 | Baseline main: `727881420a491bb129a1a97258ea8ae67f62bbf8`
> Korean: [ADMIN_DISCORD_TELEGRAM_OTP_STEPUP_SPEC_v2026.11.10.1950.ko.md](ADMIN_DISCORD_TELEGRAM_OTP_STEPUP_SPEC_v2026.11.10.1950.ko.md)

## Supersession and scope
This correction **supersedes previous owner instructions to remove administrator action reauthentication** only for highly sensitive administrator entry and commands. Routine administrator navigation remains session-based without repeated OTP prompts. It does not reintroduce legacy 15-minute `ReauthGuard` on every administrator action, retired admin-only TOTP, or two-person approval. Existing admin session, roles, CSRF, rate limits, ledger integrity, and audit obligations remain independent and mandatory. Apply this policy to all existing and future web, backend, mobile and automation control paths, not just UI buttons.

## Risk policy
| Classification | Representative operations | Gate |
| --- | --- | --- |
| R0 | Public pages, ordinary authenticated member actions | Existing authentication only |
| R1 | Routine admin read-only dashboards, non-sensitive content maintenance | Valid admin session/role/CSRF as applicable; no recurring OTP |
| R2 | Entering **sensitive admin pages** (security/identity management, financial control console, production deployment, secret or access policy) or exposing protected details | Fresh Discord or Telegram one-time OTP, purpose-bound short elevated session |
| R3 | **Critical command**: treasury mint/burn, government spending, bond/pension/insurance settlement, high-impact ledger adjustment, mass data reset/import, administrator privilege change, access-control or authentication policy change, bulk deletion, production release/rollback or secret rotation | Fresh command-bound OTP immediately before final commit; no elevated-page token alone sufficient |

Any newly introduced sensitive route must be classified before release; default unknown administrator mutations to R3 until security review. R2 entering a protected area and R3 executing its critical command are **separate authorization events**. A successful login alone never approves R2/R3. Read-only monitoring should not be indiscriminately gated.

## Delivery and challenge flow
1. Authenticate the normal administrator session and server-side RBAC. Resolve the **pre-enrolled, verified Discord user ID or Telegram chat ID** from protected server settings tied to immutable administrator actor ID. Never accept a channel/chat ID supplied by the requester at challenge time.
2. Display command, risk tier, target, summarized irreversible effects, and request a channel choice (Discord DM or Telegram private bot message). Do not send OTP to public/group channels. Require proof of channel ownership at enrollment, and protect channel changes with step-up using an existing method plus out-of-band notice.
3. Generate a cryptographically secure 8-digit numeric OTP (or equivalent entropy), bind its server-side verifier to actor, session, target, exact command digest/parameters, challenge ID, channel, expiry and attempt budget. Store only keyed hash/HMAC verifier and metadata with atomic consume. Never store or log the plaintext OTP.
4. Deliver through the chosen channel (both channels may be configured as fallback; **one verified OTP channel suffices**, not two-person approval). Show only masked delivery destination in the browser. Sending success is **not** authentication success.
5. The administrator types the OTP in the original browser. Accept only within 3 minutes, at most 5 failed attempts, and one successful use. Rate-limit by actor, session, IP and destination; do not permit challenge replay or parallel double-commit.
6. On verification, rotate the step-up authorization reference, enforce R2 at protected page load and R3 again **at the backend mutation boundary**; check exact actor/session/command hash, CSRF, RBAC, idempotency and current state in the same trusted transaction boundary. Any change to command inputs invalidates OTP. Record a redacted immutable audit trail.
7. Failure to deliver, bot outage, wrong/expired/used code, session change, account change or command mutation must fail closed for R2/R3. No implicit SMS/email, static bypass code, debug bypass, broad emergency override or lower-privilege fallback. Formal emergency recovery requires separate pre-authorized, auditable process.

## Isolation and security
Use internal API routes behind the existing BFF/server token boundary; never expose the OTP store, bot credentials, internal database functions or verification APIs directly to the browser. Do not alter the database's SECURITY DEFINER/grant or financial transaction constraints. Protect OTP with no-store/noindex/no-referrer on all responses, uniform errors against enumeration, secret-manager bot tokens, redacted alerting, verified Discord/Telegram endpoints, and HTTPS. OTP over chat is **not phishing-resistant MFA**; a future WebAuthn/passkey path is advisable for the most destructive operations without weakening this required channel OTP policy.

## Cross-document reconciliation inventory
Update the English canonical `PROJECT_PLAN.md` and Korean counterpart, both integrated planning masters, `AUTHENTICATION_SECURITY_PRIORITY_SPEC` EN/KO, admin policy/versioning, admin treasury, central-bank/mint, bonds, pension, insurance, admin access/control tower, security model, API catalog, app/API, release/runbook, QA traceability, and Discord/Telegram messaging specifications. Where historical documents describe always-on ReauthGuard or no-admin-step-up, label them SUPERSEDED rather than rewriting historical evidence. Keep operator alerts separate from actual OTP delivery.

## Acceptance / QA
- Positive Discord-only and Telegram-only OTP registration, delivery, verification and execution; each verifies correct actor and channel ownership.
- Negative tests for normal-session-only R2/R3, direct backend endpoint bypass, edited payload, wrong actor/session/channel, replay, reused/expired OTP, 6th attempt, concurrent consume, bot failure, account switch, and CSRF.
- R1 requires no OTP; R2 page access always requires fresh elevation; R3 requires command-specific OTP despite R2 elevation.
- Financial mutations retain ledger proofs, idempotency, DB ACL and reconciliation; privilege changes audited; no secrets/OTP values in event logs.
- Run full auth/backend/frontend tests and real test-server/browser E2E on exact SHA, then production approval and safe promotion. **No tests or deployment claimed by this document.**

## Collaboration and change record
START 2026-11-10 KST: owner correction captured; base main SHA above. Mid-work main recheck required before merge; concurrent agent changes must not be overwritten. Scope is **planning only** with zero production authorization changes. Implementation requires a separate engineering branch and audited release gates.
