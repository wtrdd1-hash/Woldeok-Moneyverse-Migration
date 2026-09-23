# 인증 & 계정 관리 API (Authentication & Account)

> 회원가입, 로컬 로그인, 세션 검증, 2FA/TOTP 스텝업 인증, OAuth(Discord/Google) 연동, 비밀번호 변경/재설정 및 계정 프로필 관리 엔드포인트

## 📋 목차 (Table of Contents)

- [DELETE /account](#delete--account) - Delete the caller account (`account`)
- [GET /account/identities](#get--account-identities) - Sign-in methods linked to the caller (`account`)
- [DELETE /account/identities/{id}](#delete--account-identities--id-) - Unlink a sign-in method (`account`)
- [POST /account/identities/{provider}/link](#post--account-identities--provider--link) - Begin linking another sign-in method (`auth`)
- [GET /account/security/events](#get--account-security-events) - Recent security events belonging to the caller (`account`)
- [GET /account/security/sessions](#get--account-security-sessions) - Active sessions belonging to the caller (`account`)
- [DELETE /account/security/sessions/{id}](#delete--account-security-sessions--id-) - Revoke one other active session belonging to the caller (`account`)
- [POST /account/security/sessions/revoke-others](#post--account-security-sessions-revoke-others) - Revoke every other active session belonging to the caller (`account`)
- [GET /auth/{provider}/authorize](#get--auth--provider--authorize) - Begin login with a provider (`auth`)
- [GET /auth/{provider}/callback](#get--auth--provider--callback) - Complete an OAuth round trip (`auth`)
- [POST /auth/{provider}/reauthentication](#post--auth--provider--reauthentication) - Begin step-up reauthentication with a provider (`auth`)
- [PUT /auth/consent](#put--auth-consent) - Record the authenticated member policy acknowledgement (`auth`)
- [POST /auth/local/email-change/complete](#post--auth-local-email-change-complete) - Verify and activate a new login email (`auth`)
- [POST /auth/local/email-change/request](#post--auth-local-email-change-request) - Send a verification link for a new login email (`auth`)
- [POST /auth/local/login](#post--auth-local-login) - Sign in with first-party email/password credentials (`auth`)
- [POST /auth/local/password-reset/complete](#post--auth-local-password-reset-complete) - Consume a password reset token and replace the local password (`auth`)
- [POST /auth/local/password-reset/request](#post--auth-local-password-reset-request) - Request a one-time local password reset link (`auth`)
- [POST /auth/local/password/change](#post--auth-local-password-change) - Change the current local password after recent reauthentication (`auth`)
- [POST /auth/local/reauthentication](#post--auth-local-reauthentication) - Confirm current member password (`auth`)
- [POST /auth/local/register](#post--auth-local-register) - Start first-party email/password registration (`auth`)
- [POST /auth/local/verify-email](#post--auth-local-verify-email) - Verify first-party email and activate the account (`auth`)
- [POST /auth/logout](#post--auth-logout) - End the session (`auth`)
- [POST /auth/mobile/handoff](#post--auth-mobile-handoff) - Exchange a one-time native OAuth handoff for an app session (`auth`)
- [GET /auth/policy](#get--auth-policy) - Currently published consent version (`auth`)
- [POST /auth/prelogin-session](#post--auth-prelogin-session) - Create or reuse the pre-login session (`auth`)
- [GET /auth/providers](#get--auth-providers) - Sign-in providers this deployment can offer (`auth`)
- [GET /auth/session](#get--auth-session) - CSRF token for the current session (`auth`)
- [GET /auth/viewer](#get--auth-viewer) - Session state for rendering navigation (`auth`)

---

## 🛠️ 엔드포인트 상세 규격

### DELETE `/account`

**설명:** Delete the caller account

- **분류 태그 (Tag):** `account`
- **엔드포인트 ID:** `AccountController_remove`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **202** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X DELETE "https://easy-scraping.com/account" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/account/identities`

**설명:** Sign-in methods linked to the caller

- **분류 태그 (Tag):** `account`
- **엔드포인트 ID:** `AccountController_identities`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/account/identities" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### DELETE `/account/identities/{id}`

**설명:** Unlink a sign-in method

- **분류 태그 (Tag):** `account`
- **엔드포인트 ID:** `AccountController_unlink`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X DELETE "https://easy-scraping.com/account/identities/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/account/identities/{provider}/link`

**설명:** Begin linking another sign-in method

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthController_startLink`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `provider` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/account/identities/{provider}/link" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/account/security/events`

**설명:** Recent security events belonging to the caller

- **분류 태그 (Tag):** `account`
- **엔드포인트 ID:** `AccountSecurityController_events`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/account/security/events" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/account/security/sessions`

**설명:** Active sessions belonging to the caller

- **분류 태그 (Tag):** `account`
- **엔드포인트 ID:** `AccountSecurityController_sessions`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/account/security/sessions" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### DELETE `/account/security/sessions/{id}`

**설명:** Revoke one other active session belonging to the caller

- **분류 태그 (Tag):** `account`
- **엔드포인트 ID:** `AccountSecurityController_revokeSession`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `id` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X DELETE "https://easy-scraping.com/account/security/sessions/{id}" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/account/security/sessions/revoke-others`

**설명:** Revoke every other active session belonging to the caller

- **분류 태그 (Tag):** `account`
- **엔드포인트 ID:** `AccountSecurityController_revokeOtherSessions`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/account/security/sessions/revoke-others" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/auth/{provider}/authorize`

**설명:** Begin login with a provider

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthController_authorize`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `provider` | `string` | **필수** | - |
| `query` | `client` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/auth/{provider}/authorize" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/auth/{provider}/callback`

**설명:** Complete an OAuth round trip

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthController_callback`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `provider` | `string` | **필수** | - |
| `query` | `state` | `string` | **필수** | - |
| `query` | `code` | `string` | **필수** | - |
| `query` | `error` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/auth/{provider}/callback" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/auth/{provider}/reauthentication`

**설명:** Begin step-up reauthentication with a provider

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthController_startReauthentication`

#### 📌 매개변수 (Parameters)

| 위치 | 이름 | 타입 | 필수 여부 | 설명 |
| :--- | :--- | :--- | :---: | :--- |
| `path` | `provider` | `string` | **필수** | - |

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/{provider}/reauthentication" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### PUT `/auth/consent`

**설명:** Record the authenticated member policy acknowledgement

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthController_consent`
#### 📦 요청 본문 (Request Body)

  - `termsCompleted` (`boolean`) **(필수)**
  - `privacyCompleted` (`boolean`) **(필수)**
  - `ageConfirmed` (`boolean`) **(필수)**
  - `termsVersion` (`string`) **(필수)**
  - `privacyVersion` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X PUT "https://easy-scraping.com/auth/consent" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/auth/local/email-change/complete`

**설명:** Verify and activate a new login email

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `LocalAuthController_completeEmailChange`
#### 📦 요청 본문 (Request Body)

  - `token` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/local/email-change/complete" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/auth/local/email-change/request`

**설명:** Send a verification link for a new login email

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `LocalAuthController_requestEmailChange`
#### 📦 요청 본문 (Request Body)

  - `email` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **202** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/local/email-change/request" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/auth/local/login`

**설명:** Sign in with first-party email/password credentials

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `LocalAuthController_login`
#### 📦 요청 본문 (Request Body)

  - `email` (`string`) **(필수)**
  - `password` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/local/login" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/auth/local/password-reset/complete`

**설명:** Consume a password reset token and replace the local password

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `LocalAuthController_completePasswordReset`
#### 📦 요청 본문 (Request Body)

  - `token` (`string`) **(필수)**
  - `password` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/local/password-reset/complete" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/auth/local/password-reset/request`

**설명:** Request a one-time local password reset link

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `LocalAuthController_requestPasswordReset`
#### 📦 요청 본문 (Request Body)

  - `email` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **202** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/local/password-reset/request" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/auth/local/password/change`

**설명:** Change the current local password after recent reauthentication

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `LocalAuthController_changePassword`
#### 📦 요청 본문 (Request Body)

  - `password` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/local/password/change" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/auth/local/reauthentication`

**설명:** Confirm current member password

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `LocalAuthController_reauthenticate`
#### 📦 요청 본문 (Request Body)

  - `email` (`string`) **(필수)**
  - `password` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/local/reauthentication" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/auth/local/register`

**설명:** Start first-party email/password registration

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `LocalAuthController_register`
#### 📦 요청 본문 (Request Body)

  - `email` (`string`) **(필수)**
  - `password` (`string`) **(필수)** - Non-empty password. No numeric minimum length is enforced.
  - `displayName` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **202** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/local/register" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/auth/local/verify-email`

**설명:** Verify first-party email and activate the account

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `LocalAuthController_verifyEmail`
#### 📦 요청 본문 (Request Body)

  - `token` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/local/verify-email" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/auth/logout`

**설명:** End the session

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthController_logout`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **204** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/logout" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### POST `/auth/mobile/handoff`

**설명:** Exchange a one-time native OAuth handoff for an app session

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthController_mobileHandoff`
#### 📦 요청 본문 (Request Body)

  - `code` (`string`) **(필수)**

#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/mobile/handoff" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/auth/policy`

**설명:** Currently published consent version

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthBootstrapController_policy`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/auth/policy" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### POST `/auth/prelogin-session`

**설명:** Create or reuse the pre-login session

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthBootstrapController_preloginSession`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **201** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X POST "https://easy-scraping.com/auth/prelogin-session" \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_CSRF_TOKEN" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN" \
  -d '{
    "idempotencyKey": "00000000-0000-4000-8000-000000000000"
  }'
```

---

### GET `/auth/providers`

**설명:** Sign-in providers this deployment can offer

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthBootstrapController_providers`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/auth/providers" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/auth/session`

**설명:** CSRF token for the current session

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthController_session`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/auth/session" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

### GET `/auth/viewer`

**설명:** Session state for rendering navigation

- **분류 태그 (Tag):** `auth`
- **엔드포인트 ID:** `AuthBootstrapController_viewer`
#### 📤 응답 스키마 (Responses)

| HTTP 상태 코드 | 의미 | 응답 형식 |
| :---: | :--- | :--- |
| **200** | - | None |

#### 💻 호출 예시 (Example cURL)

```bash
curl -X GET "https://easy-scraping.com/auth/viewer" \
  -H "Accept: application/json" \
  -H "Cookie: __Host-session=YOUR_SESSION_TOKEN"
```

---

