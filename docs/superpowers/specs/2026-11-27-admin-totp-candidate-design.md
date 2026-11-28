# Independent administrator TOTP — candidate design (2026-11-27)

Status: CANDIDATE. Owner-delegated direction (v2026.11.27.2002.1 item 2): a standards-based
independent TOTP factor instead of removing the requirement or binding an unverified messenger
OTP. Not a live rollout: no real enrolment, key provisioning, key rotation or lockout is part of
this work. Base: integration `9fd5d9047d`; migration number 366.

## Why

Sign-in is OAuth or password; the administrator step-up added on 2026-11-27 re-verifies the
*same* knowledge factor (password) within 15 minutes. Whoever holds a session plus the password
holds every superadmin power. AGENTS §5 records that the second factor was the compensating
control for one-person superadmin; migration 197 (v2026.09.15.125) retired it. This candidate
re-introduces an independent possession factor in a forward-only migration, without rewriting
197's history, and records the reconciliation explicitly.

## Goals

- RFC 6238 TOTP (HMAC-SHA1, 6 digits, 30 s, ±1 step) usable by any standard authenticator app.
- The database never holds a usable factor: the shared secret is sealed in the application with
  AES-256-GCM under a dedicated environment key; the schema stores ciphertext and key id only.
- Replay prevention: a time step, once spent, can never be spent again for that credential.
- Rate limiting: five consecutive failures lock the factor for fifteen minutes; plus a
  per-session failed-attempt ceiling (successes are not counted; see revision).
- Binding: a successful verification produces a proof bound to **actor + session + operation
  scope**, valid for five minutes, invalidated when the session is revoked, expires or logs out.
- Defined sensitive actions require a valid proof for their scope when the actor has a confirmed
  credential (and for every administrator once the owner turns enforcement on).
- Enrolment, self-revocation and superadmin revocation, all audited.

## Non-goals / anti-goals

- No WebAuthn (no credential store/ceremony yet), no recovery codes (110 retired them; see
  Recovery), no trusted devices.
- No change to the messenger (channel OTP) elevation path; it stays labelled as what it is and is
  never counted as the independent factor.
- No weakening of anything existing: verified role, CSRF, password step-up, boundary path
  normalisation and audit all stay exactly as they are. TOTP is added on top.
- Anti-goal: a design where one database dump yields working codes (rejected in 058 for the same
  reason), or where a proof from one session/operation authorises another.
- Anti-goal: a candidate that can lock a real administrator out by being merged.

## Approaches considered

1. **Re-apply 058's model** (actor-wide `last_verified_at`). Rejected: a code verified in any
   session satisfies every session of that actor, and nothing ties it to an operation.
2. **Verify in SQL with pgcrypto `hmac`.** Rejected (as in 058): secret and verifier in the same
   database.
3. **Chosen: application verifies, database decides.** The application (only holder of the key)
   decides whether a code matches; SECURITY DEFINER functions decide whether the step is
   plausibly now, whether it was spent, failure/lock state, and mint/check session- and
   scope-bound proofs. Same split as 058, plus a proofs table.

TOTP library: none added. HMAC comes from the JCA (`javax.crypto.Mac`, HmacSHA1), AES-GCM from the
JCA; the RFC 6238 dynamic truncation is the standard algorithm, verified against the RFC 6238
Appendix B test vectors. This avoids a new dependency for ~20 lines of specified logic. (Builder
call; a reviewed library such as java-otp is an acceptable substitute.)

## Design

### Database (366-admin-totp-candidate.sql)

Tables (REVOKE ALL from PUBLIC, moneyverse_app):
- `admin_totp_credentials(user_id PK → users, secret_ciphertext, key_id, digits=6, period=30,
  created_at, confirmed_at, last_step, failed_attempts, locked_until)`.
- `admin_totp_proofs(id, user_id, session_id → auth_sessions, scope, step, verified_at,
  expires_at)`; scope constrained to the fixed list below.
- `admin_totp_attempts(session_id, attempted_at)` for the per-session ceiling (20 / 15 min).

Audit metadata keys avoid the sensitive-name net (`secret`, `token`, `session_id` ...): only `keyId`, `scope`, `step`, `failedAttempts`, `lockedUntil`, `targetUserId`.

Functions (template: SECURITY DEFINER, `SET search_path = pg_catalog, pg_temp`, owner migrator,
revoke PUBLIC/app, grant EXECUTE app):
- `admin_totp_begin_enrolment(actor, session, ciphertext, key_id)` — administrator role; live
  session owned by actor; session re-authenticated within 15 min; if a confirmed credential
  exists, a valid `totp.manage` proof for this session is required (cannot silently replace).
- `admin_totp_confirm_enrolment(actor, session, step)` — step within ±1 of DB clock.
- `admin_totp_sealed_secret(actor)` — ciphertext/key id/state for verification.
- `admin_totp_verify(actor, session, scope, step)` — confirmed, not locked, step ±1, step >
  last_step (23505 otherwise), live owned session; sets last_step, resets failures, inserts proof
  (expires now+5 min), audits `admin.second_factor.verified`.
- `admin_totp_record_failure(actor, session)` — increments failures, locks at 5 for 15 min,
  records attempt; refuses (55000) when the per-session ceiling is exceeded.
- `admin_totp_proof_valid(actor, session, scope)` boolean — proof exists, unexpired, session
  live/unrevoked/owned.
- `admin_totp_requirement(actor)` → `enrolled`, `enforced` (enforced = enrolled OR feature
  switch `admin_totp_required` is `enabled`). The switch row is seeded `disabled`, so merging the
  candidate changes nothing for non-enrolled administrators.
- `admin_totp_revoke(actor, session, target)` — self (needs `totp.manage` proof) or superadmin
  for another administrator (needs own step-up, and own proof when the caller is enrolled);
  deletes credential row and proofs for the target, audits.
- Session revocation: proofs reference the session; `proof_valid` requires `revoked_at IS NULL`
  and `expires_at > now()`, so logout/revoke/expiry invalidate them without triggers.

SQLSTATEs reuse the existing vocabulary (22023, 23505, 55000, 42501); `pg-error.ts` needs no new
code. Audit actions use `admin.second_factor.*` with context keys already accepted by
`audit_assert_context` (checked during implementation; if a key is missing, the migration adds
it and `audit-context.ts` changes in the same commit).

### Scopes (fixed list)

`totp.manage`, `role.manage`, `economy.treasury`, `member.lifecycle`, `security.settings`,
`backup.restore`. The boundary maps administrator write paths to a scope by an explicit prefix
table; unmapped writes keep today's rule (password step-up only). The table lives in one class
with a test listing every mapping, so widening coverage is a reviewed diff.

### Application (Spring)

- `TotpCodec` — RFC 6238 generate/verify returning the matched step (constant-time compare).
- `TotpSecretSealer` — AES-256-GCM, 96-bit random nonce, AAD = `user_id|key_id`; key from
  `MONEYVERSE_ADMIN_TOTP_KEY` (base64, exactly 32 bytes) and `MONEYVERSE_ADMIN_TOTP_KEY_ID`.
  No derivation from passphrases, no fallback to any other secret. Missing/invalid key → the
  service reports `unavailable`; enrolment/verification refuse (503 `totp_unavailable`).
- `AdminTotpService` / `AdminTotpController` under `/api/v1/admin/security/totp`:
  `GET status`, `POST enrolment` (returns otpauth URI once; secret never logged or stored in
  clear), `POST enrolment/confirm`, `POST verify {code, scope}`, `DELETE` (self) and
  `DELETE /{userId}` (superadmin). All behind the existing boundary (role, CSRF, step-up).
- `AdminApiBoundaryFilter` — after the existing step-up check: if the path maps to a scope and
  `admin_totp_requirement(actor).enforced`, require `admin_totp_proof_valid(actor, session,
  scope)` → otherwise 401 `second_factor_required` with the scope. TOTP endpoints themselves are
  exempt from the TOTP check (not from role/CSRF/step-up). If enforcement applies and the key is
  unavailable, fail closed (the write is refused) — enforcement applies only to enrolled actors
  until the owner enables the switch, so this cannot lock out a non-enrolled administrator.

### Recovery

No recovery codes. A locked-out enrolled administrator is recovered by another superadmin
(`admin_totp_revoke`), or, for the single-superadmin case, by an out-of-band operator procedure
run as `moneyverse_migrator` (documented, audited). That is a deliberate trade: fewer standing
secrets, at the cost of an operator step.

## Verification (synthetic only)

- Unit: RFC 6238 vectors; sealer round-trip, wrong key, wrong AAD (row swap), tampered tag,
  missing/short key; controller refusals.
- Database (owned sandbox, then disposable CI tag): positive, wrong code lock after 5, expired
  step, replayed step, cross-session proof refused, cross-scope proof refused, non-admin refused,
  revoked/logged-out session invalidates proof, revoke by superadmin, member cannot call, app
  role has no table privilege.
- Existing suites unchanged: Spring full, boundary tests, OAuth and console session flows.

## Left to the owner (narrow blockers, not part of this candidate)

- Provisioning `MONEYVERSE_ADMIN_TOTP_KEY` in a real environment, real enrolment, turning on the
  `admin_totp_required` switch, and the frontend enrolment screen rollout.
- Reconciling AGENTS §5 / integrated master text once the owner accepts the candidate.

## Revision after independent review (2026-11-27, Codex REQUEST_CHANGES)

- Replacement is staged in a *pending* slot; the active credential keeps verifying and enforcement
  stays on until the pending one is confirmed, which swaps it in and ends old-factor proofs.
- Every credential carries a version id. Confirmation and verification pass the version the
  application matched against; the database refuses (22023 → 409 `credential_changed`) if it changed.
- The per-session ceiling is a serialised gate (advisory lock on the session) applied to
  confirmation, verification and failure recording, so a correct code after twenty failures is
  refused and concurrent attempts cannot exceed it (sandbox: 30 concurrent calls → 20 recorded).
- Cross-user revocation requires the caller's own `security.settings` proof whenever the caller is
  enforced (enrolled or switch on), not only when enrolled.
- `/admin/**` JSON aliases are judged as `/api/admin/**` for the scope table.
- Known limit (owner blocker): `moneyverse_app` can mint a proof from a claimed step, so the holder
  of the application's database credential bypasses the factor. That credential can already insert
  `auth_sessions` rows and set `reauthenticated_at`, so the factor does not widen the exposure; the
  fix is a separate verifier LOGIN principal, which needs owner provisioning.
- Rollout order: migration 366 before the application, or the fail-closed requirement lookup
  refuses scoped writes for every administrator.
- Re-review: the session ceiling counts failures only, by design (a correct code means the factor
  is already held); revoke now locks the credential row before proofs, the same order as
  confirm/verify, so concurrent confirmation and revocation cannot deadlock.
