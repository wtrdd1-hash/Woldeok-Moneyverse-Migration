# Native frontend session CSRF bridge implementation plan

> **For agentic workers:** Use superpowers:subagent-driven-development task1; write failing tests before behavior code. One isolated implementer, then controller dispatches independent review.

**Goal:** Allow native frontend requests to obtain a valid session-owned CSRF token without exposing stored hashes or weakening verification.
**Architecture:** Keep existing random raw token/hash verification. Set a dedicated HttpOnly CSRF cookie when the existing session is created, validate that cookie against the session hash before returning a raw token through the same-origin session bootstrap. Existing sessions remain authenticated; no hash rotation or database privilege/schema change.
**Tech Stack:** Java17, SpringBoot3.3.5, Servlet cookies, JUnit/MockMvc, Gradle.
**Spec:** docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md (verified session/CSRF and no false success); mandatory AGENTS boundaries.

## Global Constraints
- Work only in this isolated MiniPC worktree. Never modify original checkout, environment files, actual credentials, migrations, grants, production data or running services.
- Preserve login/session continuity, current token hashing and fail-closed CSRF. Do not accept stored csrf_hash as a valid browser token.
- No token/hash/cookie values in logs, worklog, commits or report; synthetic ci_ fixtures only.
- Do not spawn subagents. Do not merge, deploy or delete branches.

## Review Focus
- Foreign/malformed/missing cookie never produces a usable token.
- A stored hash cannot be returned as if it were raw CSRF.
- Login, prelogin, OAuth and logout cookie lifecycle remains consistent and secure.
- A failed bootstrap never invalidates an existing signed-in session or rotates other tabs' forms.
- Cross-origin reads, caching or CORS must not expose token/private session data.

### Task 1: Repair native session CSRF bootstrap
**Files:** spring-backend/src/main/java/com/moneyverse/api/domain/identity/service/UserAuthService.java; domain/identity/controller/AuthController.java; focused existing/new identity tests; docs/worklog/2026-11-20-nov18-design-integrate.md append-only checkpoint.
**Interfaces:** AuthController session response keeps signedIn/user semantics, returns raw csrfToken only after a matching session-owned cookie is verified. Missing/invalid proof returns no usable token and authenticated status unchanged. SensitiveApiBoundaryFilter and MemberApiGuard keep sha256(raw)==storedHash unchanged.
- [ ] Read relevant AGENTS, source/controller cookie paths, CORS/security config and session tests. Confirm existing session endpoint currently returns csrf_hash while write guards hash the submitted raw token.
- [ ] Add focused failing tests for returned raw token matching hash, no hash leak, missing/mismatched/malformed cookies, existing auth status preserved, cookie flags/lifetime and cleanup. Include expired-session/anonymous/cross-origin negatives as relevant.
- [ ] Observe logical RED, not compilation failure.
- [ ] Set dedicated HttpOnly Secure SameSite=Lax Path=/ cookie at existing login/prelogin/OAuth token creation, aligned with existing session lifecycle. Validate cookie against hash before returning it. Add private/no-store/Vary:Cookie bootstrap headers. Inspect cross-origin policy and prevent cross-origin bootstrap disclosure. Do not weaken guards, add new privilege or rotate an existing DB hash.
- [ ] Clear the CSRF cookie when the session is cleared, preserving existing logout semantics. Legacy sessions without matching cookie remain authenticated but have no usable mutation proof; record this limitation rather than inventing a token or clearing their login.
- [ ] Run focused tests, then full ./gradlew test bootJar with SPRING_PROFILES_ACTIVE=test SERVER_ADDRESS=127.0.0.1 --offline --no-daemon -Dorg.gradle.workers.max=1. No live DB or network side effects.
- [ ] Self-review, append redacted worklog checkpoint, commit only this task's files and push own branch. Report status, commits and exact RED/GREEN/full-suite counts and concerns. Parent will integrate after independent review.

## Pre-flight
One task, no internal shared-file pairs. Token lifecycle tests and no-rotation/no-weakening constraints agree. Parent UI work consumes only the existing csrfToken response contract and does not edit these identity files. Cross-origin proof must be verified before exposing raw tokens.
