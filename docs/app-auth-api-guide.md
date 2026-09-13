# Woldeok Moneyverse App Authentication API Guide

> Version: v2026.09.13.48
> Date: 2026-09-13
> Korean: [app-auth-api-guide.ko.md](app-auth-api-guide.ko.md)
> Public base URL: `https://easy-scraping.com`
> App API prefix: `/app-api/v1`

## 1. Scope

This document is the detailed integration contract for native/mobile first-party registration, email verification, first-party login, session confirmation, logout, and Google/Discord OAuth entry points.

The app talks only to `https://easy-scraping.com/app-api/v1/*`. It must never contain the backend `INTERNAL_API_TOKEN`, database credentials, OAuth client secrets, SMTP credentials, administrator credentials, or any server-only secret.

## 2. Authentication state model

The normal first-party flow is:

`prelogin session -> current policy lookup -> consent -> register -> email verification -> signed-in session -> viewer/session checks`

Both the prelogin and signed-in states use server-issued cookies. Native clients need a persistent CookieJar. Do not copy the cookie value into application logs or analytics.

State-changing requests protected by CSRF must also send the current token in `x-csrf-token`. When the server returns a new CSRF token, replace the old one.

## 3. Password contract

Registration no longer has a numeric minimum password length. The rules are:

- password must be a string and must not be empty;
- maximum: 128 Unicode code points after NFC normalization;
- spaces and Unicode are allowed;
- no uppercase/lowercase/digit/symbol composition rule;
- obvious common passwords are rejected;
- password is normalized and stored only as an Argon2id verifier;
- never log, persist in plaintext, or send the password anywhere except the HTTPS authentication request.

The product policy intentionally differs from the external NIST 15-character recommendation. The server keeps common-password blocking, rate limiting, generic invalid-credential responses, and Argon2id storage.

## 4. Create a prelogin session

### Request

```http
POST /app-api/v1/auth/prelogin-session HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json

{}
```

### Required client handling

1. Store every `Set-Cookie` value in the platform CookieJar.
2. Read the JSON `csrfToken` and keep it only in memory/application secure state needed for requests.
3. Send that cookie and CSRF token on the consent and local-auth mutation calls below.

Example response shape:

```json
{
  "csrfToken": "<opaque token>"
}
```

## 5. Read policy versions

```http
GET /app-api/v1/auth/policy HTTP/1.1
Host: easy-scraping.com
Cookie: <cookie jar sends the prelogin cookie>
```

Use the returned `termsVersion` and `privacyVersion`. Do not hard-code versions into the app.

## 6. Record required consent

```http
PUT /app-api/v1/auth/consent HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json
Cookie: <prelogin cookie>
x-csrf-token: <current csrf token>

{
  "termsCompleted": true,
  "privacyCompleted": true,
  "ageConfirmed": true,
  "termsVersion": "<value from /auth/policy>",
  "privacyVersion": "<value from /auth/policy>"
}
```

Registration will return `403` when the current required consent has not been completed.

## 7. Register with email and password

```http
POST /app-api/v1/auth/local/register HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json
Cookie: <prelogin cookie>
x-csrf-token: <current csrf token>

{
  "email": "member@example.com",
  "password": "my-password",
  "displayName": "Member"
}
```

Fields:

| Field | Type | Contract |
|---|---|---|
| `email` | string | Valid email, max 254 characters |
| `password` | string | Non-empty; no numeric minimum; max 128 code points; common passwords can be rejected |
| `displayName` | string | 2–120 characters |

Normal response:

```json
{
  "accepted": true,
  "verificationRequired": true
}
```

Production does not return the raw verification token. The user receives it through the configured verification-email path. The response is intentionally generic enough not to become an account-enumeration endpoint.

## 8. Verify email and complete registration

```http
POST /app-api/v1/auth/local/verify-email HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json
Cookie: <same prelogin cookie>
x-csrf-token: <current csrf token>

{
  "token": "<verification token from email>"
}
```

Successful verification activates the account and signs the user in. Replace the CookieJar state with any returned `Set-Cookie` update and save the new CSRF token.

Example response:

```json
{
  "outcome": "signed-in",
  "csrfToken": "<new opaque token>",
  "consentCurrent": true
}
```

A failed or expired verification returns an authentication failure and must not expose internal token state.

## 9. Login with email and password

Start with a fresh/reused prelogin session, then call:

```http
POST /app-api/v1/auth/local/login HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json
Cookie: <prelogin cookie>
x-csrf-token: <current csrf token>

{
  "email": "member@example.com",
  "password": "my-password"
}
```

On success, store the returned session cookie and CSRF token:

```json
{
  "outcome": "signed-in",
  "csrfToken": "<new opaque token>",
  "consentCurrent": true
}
```

Unknown email, wrong password, and disabled/invalid local credentials must be handled as the same public invalid-credentials class. Do not display UI text that tells an attacker whether an email exists.

## 10. Confirm the signed-in user

```http
GET /app-api/v1/auth/viewer HTTP/1.1
Host: easy-scraping.com
Cookie: <signed-in session cookie>
```

The app should consider authentication established only when the server reports the viewer as signed in. Never manufacture a local signed-in state solely because the login HTTP call returned a transport-level success.

For a fresh CSRF token/session state, use:

```http
GET /app-api/v1/auth/session HTTP/1.1
Host: easy-scraping.com
Cookie: <signed-in session cookie>
```

## 11. Logout

Use the current signed-in cookie and CSRF token:

```http
POST /app-api/v1/auth/logout HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json
Cookie: <signed-in session cookie>
x-csrf-token: <current csrf token>

{}
```

After a successful logout, clear local authentication UI state and let the CookieJar process the server cookie invalidation.

## 12. Google and Discord OAuth

Entry points:

- `GET /app-api/v1/auth/google/authorize`
- `GET /app-api/v1/auth/discord/authorize`

The server returns/initiates the provider authorization contract through the BFF. Open provider authorization in a system browser or secure custom tab. Do not embed server secrets, do not ask the user for their Google/Discord password, and do not treat provider callback parameters as trusted without the server completing its own state/PKCE/OIDC checks.

## 13. Status/error handling

| Status | App behavior |
|---|---|
| `200/201/202` | Parse response, update cookies/CSRF/session state as appropriate |
| `400/422` | Invalid request shape/field; show field-level correction without leaking secrets |
| `401` | Invalid/expired authentication; return to login when appropriate |
| `403` | Consent, CSRF, current state, or authorization requirement not satisfied |
| `409` | State/version conflict; refresh server state before retry |
| `429` | Authentication/rate limit; respect retry behavior, do not tight-loop |
| `5xx` | Server failure; show retryable service error and preserve no secret details |

Never log the password, session cookie, CSRF token, email verification token, OAuth token, or internal API token.

## 14. Minimal client pseudocode

```text
cookieJar = persistentSecureCookieJar()
prelogin = POST /auth/prelogin-session using cookieJar
csrf = prelogin.csrfToken
policy = GET /auth/policy using cookieJar
PUT /auth/consent using cookieJar + csrf + current policy versions
POST /auth/local/register using cookieJar + csrf + email/password/displayName
user receives email token
verified = POST /auth/local/verify-email using cookieJar + csrf + token
csrf = verified.csrfToken
viewer = GET /auth/viewer using cookieJar
assert viewer.signedIn == true
```

For login, replace the consent/register/verify sequence with a prelogin session followed by `/auth/local/login`, then confirm with `/auth/viewer`.

## 15. Release verification

Before a mobile release, verify against the exact test-server SHA:

1. prelogin session and cookie persistence;
2. policy and consent;
3. short non-empty password registration is accepted while empty/common passwords are rejected;
4. email verification path;
5. login with the same account;
6. `/auth/viewer` reports signed in;
7. logout and relogin;
8. Google/Discord authorize entry points still respond through the BFF;
9. no app bundle contains server-only secrets.
