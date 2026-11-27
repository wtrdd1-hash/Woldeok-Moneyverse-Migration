# Independent Administrator TOTP Candidate — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an RFC 6238 TOTP factor whose proofs are bound to actor + session + operation scope, enforced on defined high-risk administrator writes for enrolled administrators.

**Architecture:** Spring verifies codes with a dedicated environment key (only holder of the key); migration 366 SECURITY DEFINER functions decide step plausibility, replay, lockout and mint/check proofs. `AdminApiBoundaryFilter` adds one check after the existing step-up check.

**Tech Stack:** Spring Boot 3.5.16 / Java (JCA `Mac` HmacSHA1, `Cipher` AES/GCM/NoPadding), PostgreSQL plpgsql, JUnit 5 + Mockito.

**Spec:** `docs/superpowers/specs/2026-11-27-admin-totp-candidate-design.md`

## Global Constraints

- Migration file `packages/database/migrations/366-admin-totp-candidate.sql`; template exactly as AGENTS §4 (SECURITY DEFINER, `SET search_path = pg_catalog, pg_temp`, owner `moneyverse_migrator`, REVOKE PUBLIC/app, GRANT EXECUTE app). No `pg_catalog.greatest/least/coalesce/nullif/extract`.
- TOTP: HMAC-SHA1, 6 digits, 30 s period, accept steps now-1..now+1.
- Lockout: 5 consecutive failures → locked 15 minutes. Per-session ceiling: 20 attempts / 15 minutes.
- Proof lifetime 300 s; enrolment needs session re-authentication within 900 s.
- Key env: `MONEYVERSE_ADMIN_TOTP_KEY` (base64, exactly 32 bytes), `MONEYVERSE_ADMIN_TOTP_KEY_ID` (`^[a-z0-9][a-z0-9_.:-]{0,63}$`). No fallback to any other secret.
- Feature switch `admin_totp_required` seeded `disabled`.
- Scopes: `totp.manage`, `role.manage`, `economy.treasury`, `member.lifecycle`, `security.settings`, `backup.restore`.
- Audit metadata keys only: `keyId`, `scope`, `step`, `failedAttempts`, `lockedUntil`, `targetUserId`.
- Never log, return (except the one enrolment response) or persist a clear secret or code. English in code; no co-author/session trailers.

## Review Focus

- Clock-edge codes (previous/next step) must verify; step now±2 must not. → Task 1 test `acceptsAdjacentStepsOnly`.
- A ciphertext copied to another user's row must not open. → Task 2 test `rowSwapFailsBecauseUserIdIsAuthenticated`.
- Path spelling variants (`/api/v1/admin/treasury/...` vs `/api/admin/...`, encoded) must map to the same scope. → Task 4 test `normalisedSpellingsMapToSameScope`.
- An enrolled admin whose key config is missing must be refused on scoped writes, not waved through. → Task 5 test `enforcedButUnverifiableIsRefused`.
- A non-enrolled admin with switch disabled must see no behaviour change. → Task 5 test `notEnrolledAndSwitchOffKeepsTodayBehaviour`.

---

### Task 1: `TotpCodec`

**Files:** Create `spring-backend/src/main/java/com/moneyverse/api/domain/admin/totp/TotpCodec.java`; Test `spring-backend/src/test/java/com/moneyverse/api/domain/admin/totp/TotpCodecTest.java`

**Interfaces — Produces:** `static String code(byte[] secret, long step)`; `static OptionalLong matchStep(byte[] secret, String code, long nowEpochSeconds)` (returns the matched step within ±1, constant-time compare, rejects non-6-digit input); `static long stepAt(long epochSeconds)`; `static byte[] newSecret(SecureRandom)` (20 bytes); `static String base32(byte[])`; `static String otpauthUri(String issuer, String account, byte[] secret)`.

- [ ] Step 1: tests — RFC 6238 Appendix B SHA1 vectors truncated to 6 digits (secret ASCII `12345678901234567890`; T=59 → `287082`, T=1111111109 → `081804`, T=1111111111 → `050471`, T=1234567890 → `005924`, T=2000000000 → `279037`); `acceptsAdjacentStepsOnly` (code for step s matches at now in steps s-1, s, s+1; not s±2); rejects `"12345"`, `"1234567"`, `"12a456"`, null; base32 of RFC secret = `GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ`.
- [ ] Step 2: run `./gradlew test --tests '*TotpCodecTest'` → FAIL (class missing).
- [ ] Step 3: implement (HmacSHA1 via `Mac`, RFC 4226 dynamic truncation, `MessageDigest.isEqual`).
- [ ] Step 4: rerun → PASS. Step 5: commit.

### Task 2: `TotpSecretSealer`

**Files:** Create `.../admin/totp/TotpSecretSealer.java`; Test `.../admin/totp/TotpSecretSealerTest.java`

**Interfaces — Produces:** constructor `TotpSecretSealer(@Value("${moneyverse.security.admin-totp-key:}") String base64Key, @Value("${moneyverse.security.admin-totp-key-id:}") String keyId)`; `boolean available()`; `String keyId()`; `String seal(UUID user, byte[] secret)` → base64(nonce12 ‖ ciphertext+tag); `byte[] open(UUID user, String keyId, String sealed)` (throws `IllegalStateException` on any failure). AAD = `user + "|" + keyId` UTF-8.

- [ ] Step 1: tests — round trip; `rowSwapFailsBecauseUserIdIsAuthenticated`; wrong key id fails; flipped tag byte fails; blank/short (31-byte)/non-base64 key → `available()==false` and `seal` throws; invalid key id pattern → unavailable; two seals of same secret differ (random nonce).
- [ ] Step 2: run → FAIL. Step 3: implement with `Cipher.getInstance("AES/GCM/NoPadding")`, 128-bit tag, `SecureRandom`. Step 4: PASS. Step 5: commit (add both properties to `application.yml` mapped from the env names, empty default).

### Task 3: Migration 366 and sandbox SQL verification

**Files:** Create `packages/database/migrations/366-admin-totp-candidate.sql`; Create `packages/database/verify/366-admin-totp-candidate.sql` (synthetic assertions, runs in a transaction and rolls back).

**Interfaces — Produces (all `public.`):**
`admin_totp_begin_enrolment(p_actor uuid, p_session_id uuid, p_secret_ciphertext text, p_key_id text) RETURNS boolean` (true = replaced a confirmed credential);
`admin_totp_confirm_enrolment(p_actor uuid, p_session_id uuid, p_step bigint) RETURNS boolean`;
`admin_totp_sealed_secret(p_actor uuid) RETURNS TABLE(secret_ciphertext text, key_id text, confirmed boolean, locked_until timestamptz)`;
`admin_totp_verify(p_actor uuid, p_session_id uuid, p_scope text, p_step bigint) RETURNS timestamptz` (proof expiry);
`admin_totp_record_failure(p_actor uuid, p_session_id uuid) RETURNS TABLE(failed_attempts integer, locked_until timestamptz)`;
`admin_totp_proof_valid(p_actor uuid, p_session_id uuid, p_scope text) RETURNS boolean`;
`admin_totp_requirement(p_actor uuid) RETURNS TABLE(enrolled boolean, enforced boolean)`;
`admin_totp_revoke(p_actor uuid, p_session_id uuid, p_target uuid) RETURNS boolean`.
Errors: 22023 invalid/out-of-date step/no enrolment; 23505 step already used; 55000 locked/not enrolled/ceiling; 42501 role or proof required.

- [ ] Step 1: write the verify script first (assert each case with `DO` blocks raising on mismatch): enrol→confirm→verify(scope A) proof valid for (actor, session, A) only; same step again → 23505; step now-2 → 22023; other session's proof invalid; scope B invalid; revoke session (`UPDATE auth_sessions SET revoked_at=now()`) → proof invalid; 5 failures → locked → verify 55000; non-admin enrol → 42501; replace confirmed credential without `totp.manage` proof → 42501; superadmin revoke of other admin → credential gone; `has_table_privilege('moneyverse_app', t, 'SELECT')` false for all three tables; requirement = (false,false) for non-enrolled, (true,true) after confirm.
- [ ] Step 2: start owned sandbox container `mv-capacity-sandbox-db-20261126`, apply chain through 365 if not present, run verify → FAIL (functions missing).
- [ ] Step 3: write 366 (tables, switch seed `ON CONFLICT DO NOTHING`, functions per spec).
- [ ] Step 4: apply 366 as migrator, run verify → all assertions pass; run `migration-parity` test (`pnpm --filter @moneyverse/database test`) → 366 contiguous. Step 5: commit.

### Task 4: `AdminTotpScopes`

**Files:** Create `.../admin/totp/AdminTotpScopes.java`; Test `.../admin/totp/AdminTotpScopesTest.java`

**Interfaces — Produces:** `static Optional<String> scopeFor(String method, String normalisedPath)` (normalise `/api/v1/` → `/api/`; GET/HEAD/OPTIONS → empty). Mapping, longest prefix first:
`/api/admin/security/abuse/` → `member.lifecycle`; `/api/admin/security/totp` → empty (own endpoints); `/api/admin/security/sessions` → empty (console open/close); `/api/admin/security/` → `security.settings`; `/api/admin/controls` and `/api/admin/operations/` → `security.settings`; `/api/admin/treasury/`, `/api/admin/fx/`, `/api/admin/kdic/`, `/api/admin/pension/`, `/api/admin/enterprises/` → `economy.treasury`; `/api/admin/backups/` → `backup.restore`. Everything else → empty.

- [ ] Step 1: tests — table-driven for every mapping above (e.g. `POST /api/v1/admin/treasury/mint-topup` → `economy.treasury`, `POST /api/admin/security/abuse/suspend-permanent` → `member.lifecycle`, `POST /api/admin/backups/trigger` → `backup.restore`, `GET /api/admin/treasury/x` → empty, `POST /api/admin/shop/items` → empty, `POST /api/v1/admin/security/sessions` → empty); `normalisedSpellingsMapToSameScope`. Step 2 FAIL. Step 3 implement. Step 4 PASS. Step 5 commit.

### Task 5: Boundary enforcement

**Files:** Modify `.../admin/service/AdminAuthService.java`, `.../config/AdminApiBoundaryFilter.java:71-80`; Test `spring-backend/src/test/java/com/moneyverse/api/config/AdminTotpBoundaryTest.java`

**Interfaces — Consumes:** Task 3 functions, Task 4 `scopeFor`. **Produces:** `AdminAuthService.boolean secondFactorEnforced(HttpServletRequest)` (true when `admin_totp_requirement(actor).enforced`; lookup failure → true, fail closed); `AdminAuthService.boolean hasSecondFactorProof(HttpServletRequest, String scope)` (session id by token hash; `admin_totp_proof_valid`; failure → false); `Optional<UUID> currentSessionId(HttpServletRequest)`.

- [ ] Step 1: tests with mocked `AdminAuthService` (role, CSRF, step-up true): scoped write + enforced + no proof → 401 body code `second_factor_required`; with proof → chain called; `notEnrolledAndSwitchOffKeepsTodayBehaviour` (enforced false → chain called, proof never queried); unscoped write → proof never queried; GET never checks; `enforcedButUnverifiableIsRefused` (enforced true, proof lookup false) → 401; step-up missing still answers `reauthentication_required` first.
- [ ] Step 2 FAIL. Step 3 implement (check placed after step-up). Step 4: rerun plus existing `AdminApiBoundaryFilterTest`, `AdminStepUpBoundaryTest`, `EncodedPathBoundaryTest` → PASS. Step 5 commit.

### Task 6: `AdminTotpService` + `AdminTotpController`

**Files:** Create `.../admin/totp/AdminTotpService.java`, `.../admin/totp/AdminTotpController.java`; Test `.../admin/totp/AdminTotpServiceTest.java`, `.../admin/totp/AdminTotpControllerTest.java`

**Interfaces — Consumes:** Tasks 1–3, `AdminAuthService.resolveVerifiedAdminActor`, `currentSessionId`. **Produces:** routes under `{"/api/v1/admin/security/totp","/api/admin/security/totp"}`: `GET /status` → `{enrolled, enforced, available}`; `POST /enrolment` → `{otpauthUri, keyId}` (`Cache-Control: no-store`); `POST /enrolment/confirm {code}` → `{confirmed:true}`; `POST /verify {code, scope}` → `{scope, expiresAt}`; `DELETE` (self) and `DELETE /{userId}` (superadmin) → `{revoked:true}`. Errors: sealer unavailable → 503 `totp_unavailable`; wrong code → `record_failure` then 401 `invalid_code`; 23505 → 409 `code_already_used`; 55000 → 423 `second_factor_locked`; 42501 → 403; unknown scope → 400.

- [ ] Step 1: service tests with mocked `JdbcTemplate` + real codec/sealer (test key): enrol seals with AAD of actor and never passes clear secret to SQL; confirm computes the matched step and calls `admin_totp_confirm_enrolment` with it; wrong code calls `record_failure` and not verify; unavailable sealer → 503 without any SQL; scope outside the fixed list → 400 without SQL. Controller tests: status shape; no-store header on enrolment.
- [ ] Step 2 FAIL. Step 3 implement. Step 4 PASS; `WriteRouteBoundaryRatchetTest` still passes (new routes are behind the admin boundary). Step 5 commit.

### Task 7: CI Postgres test, regression, worklog

**Files:** Create `spring-backend/src/test/java/com/moneyverse/api/domain/admin/totp/AdminTotpPostgresIntegrationTest.java` (tag `postgres-totp`, same guard pattern as `AdminShopPostgresIntegrationTest`); add tag to the CI job that runs postgres tags (check `.github/workflows/ci.yml`); update `docs/worklog/2026-11-26-security-hardening{,.ko}.md`.

- [ ] Step 1: integration test — service against real functions: positive verify, replay 409, cross-session proof false, member refused.
- [ ] Step 2: full Spring `./gradlew test` → 0 failures (report skipped); frontend untouched (no FE run needed unless files changed); migration parity.
- [ ] Step 3: Codex read-only review of the branch diff; address findings test-first.
- [ ] Step 4: worklog EN/KO with exact SHA, results, blockers (key provisioning, enrolment, switch, UI). Commit, push task branch.
