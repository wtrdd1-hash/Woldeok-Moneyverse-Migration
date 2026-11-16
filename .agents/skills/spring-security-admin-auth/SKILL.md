---
name: spring-security-admin-auth
description: Implement or audit Spring Security filter chains, sessions, CSRF, Discord/Telegram admin OTP step-up, webhook signature verification, authorization and audit. Use for Spring authentication, administrator security or public integrations; not for general formatting.
---
# Spring Security and administrator authentication

## Threat model first
- Read current Nest guards, internal API token boundary, session cookies, callback handlers, administrator permission table and accepted OTP plans. Inventory which operations require fresh step-up and which actors are forbidden.
- Separate browser session, mobile API, internal service identity and signed public webhook flows; apply a deny-by-default `SecurityFilterChain` to each matcher.
- Do not disable CSRF globally for cookie-authenticated unsafe methods. Exempt only independently authenticated non-browser routes after evidence-based review. Confirm SameSite, Secure, HttpOnly and origin rules.

## Design
- Keep the backend behind an internal gateway; permit only explicitly approved, signature-verified public paths. Check raw Discord webhook bytes before parsing; verify replay resistance where applicable.
- Admin step-up: server-issued short-lived, single-use challenge; authorization first, current session binding, rate limits and audit. Deliver OTP via approved Discord/Telegram channel without logging or exposing the secret. Reject stale/replayed challenges.
- Enforce user ownership and role policy in the service/database authority, not only controller annotations; deny when policy is unknown.
- Never log session tokens, OTP codes, credentials, webhook signing material or member financial PII.

## Security test gate
Test 401/403, cross-user, wrong-role, expired/reused OTP, missing/forged CSRF, malformed signature, header tampering, direct backend bypass and successful session continuity. Record actual HTTP results and exact SHA.

Reference: https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html
