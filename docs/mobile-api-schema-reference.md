# Mobile App API Request/Response Schema Reference

**English** | [한국어](mobile-api-schema-reference.ko.md) | [Machine contract](mobile-api-contract.json)

Update version: **v2026.09.16.159**

This document records actual request parameters, DTO fields, constraints, success statuses, and success response fields for all 159 app APIs. App developers and code-generating AIs should use this file together with `mobile-api-contract.json` and must not guess field names.

## Common compatibility rules

- Base URL is `https://easy-scraping.com/app-api/v1`.
- JSON responses preserve original keys and recursively add camelCase aliases for snake_case keys. Existing camelCase wins on collision.
- Use one persistent secure CookieJar; send the latest `X-CSRF-Token` on writes that require CSRF.
- Only 2xx is success. Never deserialize 4xx/5xx as a success DTO.
- Never render nullable fields as the literal string `null`.
- Raw image uploads send decoded bytes, not JSON/base64/multipart.

## `DELETE` `/app-api/v1/account` — Delete the caller account

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 202
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AccountController_remove`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| deletedAt | true | string |  |
| revokedSessionCount | true | number |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/account/identities` — Sign-in methods linked to the caller

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AccountController_identities`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| identities[] | true | object[] |  |
| identities[] | true | object |  |
| identities[].identityId | true | string |  |
| identities[].provider | true | string="discord" \| string="google" |  |
| identities[].displayName | true | string |  |
| identities[].linkedAt | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `DELETE` `/app-api/v1/account/identities/:id` — Unlink a sign-in method

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 200
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AccountController_unlink`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| identityId | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/account/identities/:provider/link` — Begin linking another sign-in method

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AuthController_startLink`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| provider | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| authorizationUrl | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/account/security/events` — Recent security events belonging to the caller

- Authorization: 로그인 및 최신 동의 필요
- Success status: 200
- Response mode: json
- After success: 최근 보안 활동 목록을 서버 기준 상태로 교체
- Operation ID: `AccountSecurityController_events`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| events[] | true | object[] |  |
| events[] | true | object |  |
| events[].type | true | string |  |
| events[].createdAt | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/account/security/sessions` — Active sessions belonging to the caller

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AccountSecurityController_sessions`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| sessions[] | true | object[] |  |
| sessions[] | true | object |  |
| sessions[].sessionId | true | string |  |
| sessions[].createdAt | true | string |  |
| sessions[].expiresAt | true | string |  |
| sessions[].reauthenticatedAt | true | null \| string |  |
| sessions[].current | true | boolean |  |
| sessions[].administratorSession | true | boolean |  |
| sessions[].lastSeenAt | true | string |  |
| sessions[].deviceLabel | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `DELETE` `/app-api/v1/account/security/sessions/:id` — Revoke one other active session belonging to the caller

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 200
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AccountSecurityController_revokeSession`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| revoked | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/account/security/sessions/revoke-others` — Revoke every other active session belonging to the caller

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AccountSecurityController_revokeOtherSessions`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| revokedSessions | true | number |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/activity/events` — Ingest client activity telemetry events (page view, dwell, clicks)

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 200
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `ActivityController_ingestEvents`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `IngestActivityEventsDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| events[] | true | object[] |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| recorded | true | number |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/admin/activity/logs` — List user activity logs for administrators

- Authorization: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- Success status: 200
- Response mode: json
- After success: 응답 로그를 관리자 활동 화면에 표시
- Operation ID: `ActivityController_listLogs`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| limit | query | false | integer | minimum=1; maximum=200 |
| offset | query | false | integer | minimum=0 |
| eventType | query | false | string |  |
| userId | query | false | string (uuid) |  |

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/admin/activity/traffic` — Aggregated visitor traffic, landing paths and acquisition sources

- Authorization: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- Success status: 200
- Response mode: json
- After success: 일/월/년 집계와 유입·진입 경로를 표시
- Operation ID: `ActivityController_traffic`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| granularity | query | false | string | enum="day","month","year" |
| periods | query | false | integer | minimum=1; maximum=366 |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| granularity | true | string="day" \| string="month" \| string="year" |  |
| periods | true | number |  |
| rangeStart | true | string |  |
| generatedAt | true | string |  |
| summary | true | object |  |
| summary.pageViews | true | number |  |
| summary.uniqueSessions | true | number |  |
| summary.authenticatedUsers | true | number |  |
| summary.anonymousSessions | true | number |  |
| series[] | true | object[] |  |
| series[] | true | object |  |
| series[].bucket | true | string |  |
| series[].pageViews | true | number |  |
| series[].uniqueSessions | true | number |  |
| series[].authenticatedUsers | true | number |  |
| landingPages[] | true | object[] |  |
| landingPages[] | true | object |  |
| landingPages[].path | true | string |  |
| landingPages[].entries | true | number |  |
| landingPages[].anonymousEntries | true | number |  |
| sources[] | true | object[] |  |
| sources[] | true | object |  |
| sources[].source | true | string |  |
| sources[].entries | true | number |  |
| countries[] | true | object[] |  |
| countries[] | true | object |  |
| countries[].country | true | string |  |
| countries[].entries | true | number |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/admin/economy/ai-status` — Economy AI council status

- Authorization: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- Success status: 200
- Response mode: json
- After success: 스위치·최근 리뷰·에이전트 상태를 표시
- Operation ID: `AdminEconomyController_aiStatus`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/admin/me` — Roles held by the caller

- Authorization: 로그인 + 최신 동의 + 관리자 역할
- Success status: 200
- Response mode: json
- After success: roles를 관리자 UI 권한 상태에 반영
- Operation ID: `AdminController_me`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| roles[] | true | string[] |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/admin/security/sessions` — Enter the operations console, rotating the session

- Authorization: 로그인 + 최신 동의 + 관리자 역할 + CSRF + 관리자 보안 정책
- Success status: 201
- Response mode: json
- After success: 회전된 세션/CSRF를 저장한 뒤 관리자 데이터를 다시 조회
- Operation ID: `AdminSecurityController_openConsole`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| state | true | string="open" \| string="idle_locked" \| string="expired" \| string="closed" \| string="none" |  |
| expiresAt | true | null \| string (date-time) |  |
| idleExpiresAt | true | null \| string (date-time) |  |
| csrfToken | true | string |  |
| loginContext | true | object |  |
| loginContext.decision | true | string="allow" \| string="block" |  |
| loginContext.reason | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/admin/support/threads` — Administrator support inbox

- Authorization: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- Success status: 200
- Response mode: json
- After success: 응답을 현재 화면 상태에 반영
- Operation ID: `AdminSupportController_threads`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| status | query | false | string | enum="open","waiting_user","resolved" |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| threads[] | true | object[] |  |
| threads[] | true | object |  |
| threads[].thread_id | true | string |  |
| threads[].subject | true | string |  |
| threads[].status | true | string |  |
| threads[].created_at | true | string (date-time) |  |
| threads[].updated_at | false | string (date-time) |  |
| threads[].last_message_at | false | string (date-time) |  |
| threads[].user_id | false | string |  |
| threads[].display_name | false | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/admin/support/threads/:id/messages` — Read a support conversation as administrator

- Authorization: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- Success status: 200
- Response mode: json
- After success: 응답을 현재 화면 상태에 반영
- Operation ID: `AdminSupportController_messages`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string (uuid) |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| messages[] | true | object[] |  |
| messages[] | true | object |  |
| messages[].message_id | true | string |  |
| messages[].sender_kind | true | string="user" \| string="admin" |  |
| messages[].sender_user_id | false | string |  |
| messages[].body | true | string |  |
| messages[].created_at | true | string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/admin/support/threads/:id/messages` — Reply to a member support conversation

- Authorization: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션 + CSRF
- Success status: 201
- Response mode: json
- After success: 문의 목록/대화를 서버에서 다시 조회
- Operation ID: `AdminSupportController_reply`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string (uuid) |  |

### Request body

- Content-Type: `application/json`
- DTO: `NewMessageDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| body | true | string | minLength=1; maxLength=2000 |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| message | true | object |  |
| message.message_id | true | string |  |
| message.sender_kind | true | string="user" \| string="admin" |  |
| message.sender_user_id | false | string |  |
| message.body | true | string |  |
| message.created_at | true | string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `PUT` `/app-api/v1/admin/support/threads/:id/status` — Change support conversation status

- Authorization: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션 + CSRF
- Success status: 200
- Response mode: json
- After success: 문의 목록/대화를 서버에서 다시 조회
- Operation ID: `AdminSupportController_status`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string (uuid) |  |

### Request body

- Content-Type: `application/json`
- DTO: `StatusDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| status | true | string | enum="open","waiting_user","resolved" |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| status | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/admin/users` — Members and their status

- Authorization: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- Success status: 200
- Response mode: json
- After success: 서버 회원 목록으로 관리자 화면을 갱신
- Operation ID: `AdminController_users`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| users[] | true | unknown[] |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/admin/work` — The work catalogue, the reward policy in force, and job levels

- Authorization: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- Success status: 200
- Response mode: json
- After success: 직업 카탈로그·레벨·정책 상태를 갱신
- Operation ID: `AdminWorkOperationsController_overview`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| catalogue[] | true | object[] |  |
| catalogue[] | true | object |  |
| catalogue[].task_id | true | string |  |
| catalogue[].code | true | string |  |
| catalogue[].name | true | string |  |
| catalogue[].job_type | true | string |  |
| catalogue[].difficulty | true | number |  |
| catalogue[].base_reward | true | string |  |
| catalogue[].base_experience | true | string |  |
| catalogue[].minimum_duration_seconds | true | number |  |
| catalogue[].daily_limit | true | number |  |
| catalogue[].active | true | boolean |  |
| catalogue[].open_assignment_count | true | string |  |
| catalogue[].awaiting_verification_count | true | string |  |
| catalogue[].approved_24h | true | string |  |
| catalogue[].rejected_24h | true | string |  |
| catalogue[].paid_24h | true | string |  |
| catalogue[].last_assigned_at | true | null \| string |  |
| jobLevels[] | true | object[] |  |
| jobLevels[] | true | object |  |
| jobLevels[].job_type | true | string |  |
| jobLevels[].member_count | true | string |  |
| jobLevels[].average_level | true | string |  |
| jobLevels[].top_level | true | number |  |
| jobLevels[].total_experience | true | string |  |
| jobLevels[].active_7d_count | true | string |  |
| policy | true | object |  |
| policy.policy_id | true | null \| number |  |
| policy.effective_at | true | null \| string |  |
| policy.daily_cap | true | null \| string |  |
| policy.weekly_cap | true | null \| string |  |
| policy.repeat_decay_percent | true | null \| number |  |
| policy.enabled | true | null \| boolean=false \| boolean=true |  |
| policy.reason | true | null \| string |  |
| policy.active_task_count | true | string |  |
| policy.open_assignment_count | true | string |  |
| policy.awaiting_verification_count | true | string |  |
| policy.paid_24h | true | string |  |
| policy.members_paid_24h | true | string |  |
| policy.experience_24h | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/auth/:provider/authorize` — Begin login with a provider

- Authorization: 인증 흐름 전용: 상태머신 준수
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthController_authorize`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| provider | path | true | string |  |
| client | query | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| authorizationUrl | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/auth/:provider/callback` — Complete an OAuth round trip

- Authorization: 인증 흐름 전용: 상태머신 준수
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthController_callback`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| provider | path | true | string |  |
| state | query | true | string |  |
| code | query | true | string |  |
| error | query | true | string |  |

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/auth/:provider/reauthentication` — Begin step-up reauthentication with a provider

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AuthController_startReauthentication`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| provider | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| authorizationUrl | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `PUT` `/app-api/v1/auth/consent` — Record the authenticated member policy acknowledgement

- Authorization: Prelogin 또는 로그인 세션 + CSRF
- Success status: 200
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AuthController_consent`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `ConsentDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| termsCompleted | true | boolean |  |
| privacyCompleted | true | boolean |  |
| ageConfirmed | true | boolean |  |
| termsVersion | true | string | maxLength=64 |
| privacyVersion | true | string | maxLength=64 |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| next | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/auth/local/login` — Sign in with first-party email/password credentials

- Authorization: 인증 흐름 전용: 상태머신 준수
- Success status: 201
- Response mode: json
- After success: 새 쿠키/CSRF 저장 후 /auth/viewer 확인
- Operation ID: `LocalAuthController_login`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `LocalLoginDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| email | true | string | maxLength=254; example="member@example.com" |
| password | true | string | maxLength=128 |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| outcome | true | string="signed-in" | const="signed-in" |
| csrfToken | true | string |  |
| consentCurrent | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/auth/local/password-reset/complete` — Consume a password reset token and replace the local password

- Authorization: 30분 만료 일회용 reset token
- Success status: 201
- Response mode: json
- After success: 기존 세션은 모두 폐기되므로 새 비밀번호로 다시 로그인
- Operation ID: `LocalAuthController_completePasswordReset`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| outcome | true | string="password-reset" | const="password-reset" |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/auth/local/password-reset/request` — Request a one-time local password reset link

- Authorization: 인증 전 공개 흐름; 계정 존재 여부를 노출하지 않음
- Success status: 202
- Response mode: json
- After success: 항상 동일한 접수 안내를 표시하고 이메일 링크를 기다림
- Operation ID: `LocalAuthController_requestPasswordReset`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| accepted | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/auth/local/register` — Start first-party email/password registration

- Authorization: 인증 흐름 전용: 상태머신 준수
- Success status: 202
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `LocalAuthController_register`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `LocalRegisterDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| email | true | string | maxLength=254; example="member@example.com" |
| password | true | string | maxLength=128; description="Non-empty password. No numeric minimum length is enforced." |
| displayName | true | string | minLength=2; maxLength=120 |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| verificationToken | false | string |  |
| accepted | true | boolean |  |
| verificationRequired | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/auth/local/verify-email` — Verify first-party email and activate the account

- Authorization: 인증 흐름 전용: 상태머신 준수
- Success status: 201
- Response mode: json
- After success: 새 쿠키/CSRF 저장 후 /auth/viewer 확인
- Operation ID: `LocalAuthController_verifyEmail`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `LocalVerifyDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| token | true | string | minLength=32; maxLength=512 |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| outcome | true | string="signed-in" | const="signed-in" |
| csrfToken | true | string |  |
| consentCurrent | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/auth/logout` — End the session

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 204
- Response mode: none
- After success: 쿠키 무효화 반영 후 로컬 사용자 상태 초기화
- Operation ID: `AuthController_logout`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/auth/mobile/handoff` — Exchange a one-time native OAuth handoff for an app session

- Authorization: 인증 흐름 전용: 상태머신 준수
- Success status: 201
- Response mode: json
- After success: 새 쿠키/CSRF 저장 후 /auth/viewer 확인
- Operation ID: `AuthController_mobileHandoff`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `MobileHandoffDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| code | true | string | minLength=32; maxLength=512 |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| outcome | true | string="signed-in" | const="signed-in" |
| csrfToken | true | string |  |
| consentCurrent | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/auth/policy` — Currently published consent version

- Authorization: 공개/Prelogin에서 호출 가능
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthBootstrapController_policy`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| termsVersion | true | string |  |
| privacyVersion | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/auth/prelogin-session` — Create or reuse the pre-login session

- Authorization: 인증 흐름 전용: 상태머신 준수
- Success status: 201
- Response mode: json
- After success: CookieJar와 csrfToken 저장
- Operation ID: `AuthBootstrapController_preloginSession`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/auth/providers` — Sign-in providers this deployment can offer

- Authorization: 공개/Prelogin에서 호출 가능
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthBootstrapController_providers`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| providers[] | true | object[] |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/auth/session` — CSRF token for the current session

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthController_session`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| csrfToken | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/auth/viewer` — Session state for rendering navigation

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthBootstrapController_viewer`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| signedIn | true | boolean |  |
| consentCurrent | true | boolean |  |
| adminRoles[] | true | string[] |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/bank/loans` — Outstanding loans for the caller

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_loans`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| loans[] | true | object[] |  |
| loans[] | true | object |  |
| loans[].loanId | true | string |  |
| loans[].principalAmount | true | string & object |  |
| loans[].interestAmount | true | string & object |  |
| loans[].outstandingAmount | true | string & object |  |
| loans[].status | true | string="active" \| string="repaid" \| string="overdue" |  |
| loans[].issuedAt | true | string |  |
| loans[].repaidAt | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/bank/loans` — Borrow from the virtual bank

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_borrow`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `BorrowDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| principalAmount | true | number | minimum=1 |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| loanId | true | string |  |
| principalAmount | true | string & object |  |
| interestAmount | true | string & object |  |
| outstandingAmount | true | string & object |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/bank/loans/:id/repayments` — Repay part or all of a loan

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_repay`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `RepayDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| amount | true | number | minimum=1 |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| loanId | true | string |  |
| paidAmount | true | string & object |  |
| outstandingAmount | true | string & object |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/bank/movements` — Move balance between cash and bank

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_bankMovement`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `BankMovementDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| direction | true | string | enum="deposit","withdraw" |
| amount | true | number | minimum=1 |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| transactionId | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/banking/bonds/:id/redeem` — Redeem matured virtual bond and payout principal with yield

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_redeemBond`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `IdempotentDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/banking/bonds/purchase` — Purchase 7-day or 30-day virtual government bonds

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_purchaseBond`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `BankBondPurchaseDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| bondCode | true | string | example="BOND_7D"; enum="BOND_7D","BOND_30D" |
| amount | true | string | example="10000" |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/banking/borrow` — Borrow smart credit loan evaluated by job level and business value

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_borrow`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `BankBorrowSmartDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| amount | true | string | example="5000" |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/banking/claim-interest` — Claim accrued compound deposit interest into bank balance

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_claimInterest`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `IdempotentDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/banking/deposit` — Deposit WLD cash into bank compound interest deposit account

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_deposit`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `BankTransferDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| amount | true | string | example="1000" |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/banking/repay` — Repay active bank loan

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_repay`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `BankRepayDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| loanId | true | string (uuid) |  |
| amount | true | string | example="1000" |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/banking/standing` — Bank overview: cash, deposit balance, compound interest, loans, bonds

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_standing`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/banking/withdraw` — Withdraw WLD from bank deposit account to cash

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_withdraw`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `BankTransferDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| amount | true | string | example="1000" |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/board/images/:key` — Read an image attached to a visible board post

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: binary
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardImageController_image`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| key | path | true | string |  |

### Request body

_No request body._

### Success response fields

_Binary body. Do not JSON-decode._

## `POST` `/app-api/v1/board/images/uploads` — Upload one image for a board post

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: binary
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardImageController_upload`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/octet-stream`
- Maximum size: 4194304 bytes
- Accepted images: image/png, image/jpeg, image/webp
- Send decoded image bytes directly. Do not send JSON, base64, or multipart.

### Success response fields

_Binary body. Do not JSON-decode._

## `GET` `/app-api/v1/board/posts` — Recent member board posts

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_list`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| posts[] | true | object[] |  |
| posts[] | true | object |  |
| posts[].postId | true | string |  |
| posts[].title | true | string |  |
| posts[].authorName | true | string |  |
| posts[].createdAt | true | string |  |
| posts[].updatedAt | true | null \| string |  |
| posts[].commentCount | true | number |  |
| posts[].mine | true | boolean |  |
| posts[].hasImage | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/board/posts` — Write a post

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_create`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `CreatePostDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| title | true | string | maxLength=120 |
| body | true | string | maxLength=5000 |
| idempotencyKey | true | string (uuid) |  |
| imageStorageKey | false | string | pattern="^[0-9a-f-]{36}\\.(png\|jpg\|webp)$" |
| imageAltText | false | string | maxLength=300 |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| post | true | object |  |
| post.postId | true | string |  |
| post.title | true | string |  |
| post.body | true | string |  |
| post.authorName | true | string |  |
| post.createdAt | true | string |  |
| post.updatedAt | true | null \| string |  |
| post.mine | true | boolean |  |
| post.imageUrl | true | null \| string |  |
| post.imageAltText | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `DELETE` `/app-api/v1/board/posts/:id` — Delete your own post

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 204
- Response mode: none
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_remove`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `DeletePostDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/board/posts/:id` — One post, with its body

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_read`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| post | true | object |  |
| post.postId | true | string |  |
| post.title | true | string |  |
| post.body | true | string |  |
| post.authorName | true | string |  |
| post.createdAt | true | string |  |
| post.updatedAt | true | null \| string |  |
| post.mine | true | boolean |  |
| post.imageUrl | true | null \| string |  |
| post.imageAltText | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `PUT` `/app-api/v1/board/posts/:id` — Rewrite your own post

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 200
- Response mode: json
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_update`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `UpdatePostDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| title | true | string | maxLength=120 |
| body | true | string | maxLength=5000 |
| idempotencyKey | true | string (uuid) |  |
| imageStorageKey | false | string | pattern="^[0-9a-f-]{36}\\.(png\|jpg\|webp)$" |
| imageAltText | false | string | maxLength=300 |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| post | true | object |  |
| post.postId | true | string |  |
| post.title | true | string |  |
| post.body | true | string |  |
| post.authorName | true | string |  |
| post.createdAt | true | string |  |
| post.updatedAt | true | null \| string |  |
| post.mine | true | boolean |  |
| post.imageUrl | true | null \| string |  |
| post.imageAltText | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/board/posts/:id/comments` — The replies on a post, oldest first

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_comments`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| comments[] | true | object[] |  |
| comments[] | true | object |  |
| comments[].commentId | true | string |  |
| comments[].body | true | string |  |
| comments[].authorName | true | string |  |
| comments[].createdAt | true | string |  |
| comments[].mine | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/board/posts/:id/comments` — Reply to a post

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_reply`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `CreateCommentDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| body | true | string | maxLength=1000 |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| comment | true | object |  |
| comment.commentId | true | string |  |
| comment.body | true | string |  |
| comment.authorName | true | string |  |
| comment.createdAt | true | string |  |
| comment.mine | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `DELETE` `/app-api/v1/board/posts/:id/comments/:commentId` — Delete your own reply

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 204
- Response mode: none
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_removeComment`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |
| commentId | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `DeleteCommentDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/board/public/images/:key` — Public image attached to a visible board post

- Authorization: 공개: 로그인 불필요
- Success status: 200
- Response mode: binary
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `PublicBoardImageController_image`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| key | path | true | string |  |

### Request body

_No request body._

### Success response fields

_Binary body. Do not JSON-decode._

## `GET` `/app-api/v1/board/public/posts` — Public recent board posts

- Authorization: 공개: 로그인 불필요
- Success status: 200
- Response mode: json
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `PublicBoardController_list`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| posts[] | true | object[] |  |
| posts[] | true | object |  |
| posts[].postId | true | string |  |
| posts[].title | true | string |  |
| posts[].authorName | true | string |  |
| posts[].createdAt | true | string |  |
| posts[].updatedAt | true | null \| string |  |
| posts[].commentCount | true | number |  |
| posts[].mine | true | boolean=false | const=false |
| posts[].hasImage | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/board/public/posts/:id` — Public board post

- Authorization: 공개: 로그인 불필요
- Success status: 200
- Response mode: json
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `PublicBoardController_read`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| post | true | object |  |
| post.postId | true | string |  |
| post.title | true | string |  |
| post.body | true | string |  |
| post.authorName | true | string |  |
| post.createdAt | true | string |  |
| post.updatedAt | true | null \| string |  |
| post.mine | true | boolean=false | const=false |
| post.imageUrl | true | null \| string |  |
| post.imageAltText | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/board/public/posts/:id/comments` — Public replies on a board post

- Authorization: 공개: 로그인 불필요
- Success status: 200
- Response mode: json
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `PublicBoardController_comments`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| comments[] | true | object[] |  |
| comments[] | true | object |  |
| comments[].commentId | true | string |  |
| comments[].body | true | string |  |
| comments[].authorName | true | string |  |
| comments[].createdAt | true | string |  |
| comments[].mine | true | boolean=false | const=false |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/board/public/stock-posts` — 로그인 없이 공개 주식 게시글 조회

- Authorization: 공개: 로그인 불필요
- Success status: 200
- Response mode: json
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `PublicStockCommunityController_list`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| stock | query | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| posts[] | true | object[] |  |
| posts[] | true | object |  |
| posts[].authorName | true | string |  |
| posts[].createdAt | true | string |  |
| posts[].updatedAt | true | null \| string |  |
| posts[].commentCount | true | number |  |
| posts[].mine | true | boolean |  |
| posts[].hasImage | true | boolean |  |
| posts[].stock | true | null \| object |  |
| posts[].body | false | string |  |
| posts[].postId | true | string |  |
| posts[].title | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/board/stock-posts` — 주식 관련 게시글 작성

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `StockCommunityController_create`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `CreateStockPostDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| title | true | string | maxLength=120 |
| body | true | string | maxLength=5000 |
| idempotencyKey | true | string (uuid) |  |
| imageStorageKey | false | string |  |
| imageAltText | false | string | maxLength=300 |
| stockSymbol | true | string | example="WDX" |
| category | true | string | enum="analysis","question","journal","business","system" |
| stance | true | string | enum="bullish","neutral","bearish","none" |
| positionDisclosure | true | string | enum="holder","no_position","operator_related","undisclosed" |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| post | true | object |  |
| post.authorName | true | string |  |
| post.createdAt | true | string |  |
| post.updatedAt | true | null \| string |  |
| post.commentCount | true | number |  |
| post.mine | true | boolean |  |
| post.hasImage | true | boolean |  |
| post.stock | true | null \| object |  |
| post.body | false | string |  |
| post.postId | true | string |  |
| post.title | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/businesses` — Businesses the caller owns

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_mine`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| businesses[] | true | object[] |  |
| businesses[] | true | object |  |
| businesses[].ownershipId | true | string |  |
| businesses[].businessTypeId | true | string |  |
| businesses[].symbol | true | string |  |
| businesses[].name | true | string |  |
| businesses[].description | true | string |  |
| businesses[].purchaseCost | true | string & object |  |
| businesses[].dailyRevenue | true | string & object |  |
| businesses[].dailyOperatingCost | true | string & object |  |
| businesses[].purchasedAt | true | string |  |
| businesses[].lastSettlementDate | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/businesses/:id/boost` — Equip a boost item from inventory to business

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_applyBoost`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `ApplyBoostDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| boostCode | true | string | example="biz_cvs_boost_7d" |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/businesses/:id/settle-v2` — Settle a day of revenue with active boosts and double-entry ledger sink

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_settleV2`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `IdempotentDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| ownershipId | true | string |  |
| settlementDate | true | string |  |
| grossRevenue | true | string & object |  |
| operatingCost | true | string & object |  |
| netAmount | true | string & object |  |
| transactionId | true | string |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/businesses/:id/settlements` — Settle a day of revenue

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_settle`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `IdempotentDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| ownershipId | true | string |  |
| settlementDate | true | string |  |
| grossRevenue | true | string & object |  |
| operatingCost | true | string & object |  |
| netAmount | true | string & object |  |
| transactionId | true | string |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/businesses/activate-license` — Activate a business using a purchased license item from inventory

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_activateLicense`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `ActivateLicenseDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| catalogCode | true | string | example="biz_cvs_license" |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| ownershipId | true | string |  |
| businessSymbol | true | string |  |
| businessName | true | string |  |
| dailyRevenue | true | string & object |  |
| dailyOperatingCost | true | string & object |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/businesses/catalog` — App API alias: business types available to buy

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_catalogForApp`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| businessTypes[] | true | object[] |  |
| businessTypes[] | true | object |  |
| businessTypes[].id | true | string |  |
| businessTypes[].symbol | true | string |  |
| businessTypes[].name | true | string |  |
| businessTypes[].description | true | string |  |
| businessTypes[].purchaseCost | true | string & object |  |
| businessTypes[].dailyRevenue | true | string & object |  |
| businessTypes[].dailyOperatingCost | true | string & object |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/businesses/catalog/:id/purchases` — App API alias: buy a business from the catalogue

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_purchaseForApp`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `IdempotentDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| ownershipId | true | string |  |
| businessTypeId | true | string |  |
| purchaseCost | true | string & object |  |
| transactionId | true | string |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/businesses/equity` — App API alias: own capital available for a business purchase

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_equityForApp`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| equity | true | object |  |
| equity.holdingsAmount | true | string & object |  |
| equity.debtAmount | true | string & object |  |
| equity.equityAmount | true | string & object |  |
| equity.minimumRatioBps | true | number |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/businesses/my-v2` — Enhanced businesses the caller owns with boosts and settlement status

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_mineV2`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| businesses[] | true | object[] |  |
| businesses[] | true | object |  |
| businesses[].isSettledToday | true | boolean |  |
| businesses[].boostActive | true | null \| object |  |
| businesses[].status | true | string |  |
| businesses[].ownershipId | true | string |  |
| businesses[].businessTypeId | true | string |  |
| businesses[].symbol | true | string |  |
| businesses[].name | true | string |  |
| businesses[].description | true | string |  |
| businesses[].purchaseCost | true | string & object |  |
| businesses[].dailyRevenue | true | string & object |  |
| businesses[].dailyOperatingCost | true | string & object |  |
| businesses[].purchasedAt | true | string |  |
| businesses[].lastSettlementDate | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/casino/coin/fairness` — The disclosed win probability and the trial that evidences it

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_fairness`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| win_probability_ppm | true | number |  |
| trial_id | true | null \| string |  |
| trials | true | null \| string |  |
| heads | true | null \| string |  |
| expected_win_probability_ppm | true | null \| number |  |
| observed_win_probability_ppm | true | null \| number |  |
| z_score | true | null \| string |  |
| tolerance_sigma | true | null \| string |  |
| created_at | true | null \| string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/casino/coin/plays` — Stake WLD on one toss of the coin

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `CasinoController_play`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `CasinoPlayDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |
| choice | true | string | enum="heads","tails" |
| stake | true | number | minimum=1 |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| play_id | true | string |  |
| outcome | true | string |  |
| net_amount | true | string |  |
| transaction_id | true | string |  |
| replayed | true | boolean |  |
| win_probability_ppm | true | number |  |
| payout_multiplier_ppm | true | number |  |
| worst_case_loss | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/casino/coin/terms` — The odds, the stake limits, and what today has already used

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_terms`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| enabled | true | boolean |  |
| min_stake | true | string |  |
| max_stake | true | string |  |
| daily_stake_limit | true | string |  |
| daily_loss_limit | true | string |  |
| daily_stake_used | true | string |  |
| daily_loss_used | true | string |  |
| remaining_stake | true | string |  |
| remaining_loss | true | string |  |
| win_probability_ppm | true | number |  |
| payout_multiplier_ppm | true | number |  |
| house_edge_ppm | true | number |  |
| worst_case_loss | true | string |  |
| net_win_at_max | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/casino/dice/fairness` — Each dice game’s disclosed odds and the trial evidencing them

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_diceFairness`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/casino/dice/plays` — Stake WLD on one roll of the die

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `CasinoController_playDice`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `CasinoDicePlayDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |
| game | true | string | enum="dice_parity","dice_number" |
| choice | true | string | enum="odd","even","1","2","3","4","5","6" |
| stake | true | number | minimum=1 |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| play_id | true | string |  |
| outcome_face | true | number |  |
| net_amount | true | string |  |
| transaction_id | true | string |  |
| replayed | true | boolean |  |
| win_probability_ppm | true | number |  |
| payout_multiplier_ppm | true | number |  |
| worst_case_loss | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/casino/games/terms` — Every game’s odds, payout and remaining exposure for today

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_gameTerms`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/casino/history` — Read the current member's recent casino plays

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_history`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/casino/self-limit` — Read the daily limits chosen by the current member

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_selfLimit`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| daily_bet_limit | true | string |  |
| daily_loss_limit | true | string |  |
| locked_until | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `PUT` `/app-api/v1/casino/self-limit` — Set the daily caps and the lock the member holds themselves to

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 200
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `CasinoController_setSelfLimit`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `CasinoSelfLimitDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| dailyBetLimit | true | number | minimum=0 |
| dailyLossLimit | true | number | minimum=0 |
| lockedUntil | false | string (date-time) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| daily_bet_limit | true | string |  |
| daily_loss_limit | true | string |  |
| locked_until | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/content/announcements` — App API: published announcements

- Authorization: 공개: 로그인 불필요
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AppContentController_announcements`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| announcements[] | true | object[] |  |
| announcements[] | true | object |  |
| announcements[].announcementId | true | string |  |
| announcements[].title | true | string |  |
| announcements[].body | true | string |  |
| announcements[].imageUrl | true | null \| string |  |
| announcements[].imageAltText | true | null \| string |  |
| announcements[].isPinned | true | boolean |  |
| announcements[].publishedAt | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/content/photos` — App API: published gallery photos

- Authorization: 공개: 로그인 불필요
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AppContentController_photos`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| photos[] | true | object[] |  |
| photos[] | true | object |  |
| photos[].photoId | true | string |  |
| photos[].imageUrl | true | string |  |
| photos[].altText | true | string |  |
| photos[].publishedAt | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/content/status` — Server status board

- Authorization: 공개: 로그인 불필요
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `ContentController_status`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| status[] | true | object[] |  |
| status[] | true | object |  |
| status[].sourceKey | true | string |  |
| status[].displayName | true | string |  |
| status[].state | true | string |  |
| status[].detail | true | null \| string |  |
| status[].observedAt | true | null \| string |  |
| status[].freshnessState | true | string="fresh" \| string="stale" \| string="unknown" |  |
| status[].ageMs | true | null \| number |  |
| status[].policyVersion | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/early-game/claims` — Claim today’s event, once

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `EarlyGameController_claim`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `EarlyEventClaimDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |
| eventDate | true | string | example="2026-08-31"; description="The Asia/Seoul day the screen is showing" |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/early-game/first-day` — The seven steps of 16.1’s first day, counted from what happened

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `EarlyGameController_firstDay`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| steps[] | true | object[] |  |
| steps[] | true | object |  |
| steps[].step_code | true | string |  |
| steps[].step_label | true | string |  |
| steps[].step_detail | true | string |  |
| steps[].step_href | true | string |  |
| steps[].step_metric | true | string |  |
| steps[].step_verified | true | boolean |  |
| steps[].step_target | true | string |  |
| steps[].step_progress | true | string |  |
| steps[].step_unit | true | string |  |
| steps[].step_done | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/early-game/today` — The event this member is dealt today, and whether it is still theirs

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `EarlyGameController_today`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| event | true | null \| object |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/engagement` — Today’s goals, this week’s goals, the next unlock and the preference

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `EngagementController_dashboard`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| today_tasks[] | true | object[] |  |
| today_tasks[] | true | object |  |
| today_tasks[].code | true | string |  |
| today_tasks[].title | true | string |  |
| today_tasks[].progress | true | number |  |
| weekly_goals[] | true | object[] |  |
| weekly_goals[] | true | object |  |
| weekly_goals[].code | true | string |  |
| weekly_goals[].title | true | string |  |
| weekly_goals[].progress | true | number |  |
| next_unlock | true | null \| object |  |
| notifications_enabled | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/engagement/early-game` — The early-game weekly goals and collection books

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `EngagementController_earlyGame`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| goals[] | true | object[] |  |
| goals[] | true | object |  |
| goals[].goal_code | true | string |  |
| goals[].goal_label | true | string |  |
| goals[].goal_detail | true | string |  |
| goals[].goal_metric | true | string |  |
| goals[].goal_window | true | string |  |
| goals[].goal_target | true | string |  |
| goals[].goal_progress | true | string |  |
| goals[].goal_unit | true | string |  |
| goals[].goal_self_reported | true | boolean |  |
| goals[].goal_completed | true | boolean |  |
| goals[].week_start | true | string |  |
| collections[] | true | object[] |  |
| collections[] | true | object |  |
| collections[].book_code | true | string |  |
| collections[].book_label | true | string |  |
| collections[].book_detail | true | string |  |
| collections[].reward_title | true | null \| string |  |
| collections[].reward_note | true | string |  |
| collections[].reward_held | true | boolean |  |
| collections[].entry_total | true | number |  |
| collections[].entry_unlocked | true | number |  |
| collections[].entries[] | true | object[] |  |
| collections[].entries[] | true | object |  |
| collections[].entries[].code | true | string |  |
| collections[].entries[].label | true | string |  |
| collections[].entries[].unlocked | true | boolean |  |
| collections[].entries[].unlocked_at | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/engagement/npcs/:code/orders` — Take an order from an NPC

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `EngagementController_recordNpcOrder`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| code | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `EngagementNpcOrderDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| npc_code | true | string |  |
| affinity | true | null \| number |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `PUT` `/app-api/v1/engagement/preferences` — Set whether the member hears about their goals

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 200
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `EngagementController_setPreferences`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `EngagementPreferencesDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| notificationsEnabled | true | boolean |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| notifications_enabled | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/game-clock` — Read the authoritative accelerated Moneyverse server day/week

- Authorization: 공개 읽기
- Success status: 200
- Response mode: json
- After success: 서버 기준 게임 날짜·주차로 UI를 갱신
- Operation ID: `GameClockController_current`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| policy_version | true | string |  |
| day_index | true | string |  |
| week_index | true | string |  |
| day_of_week | true | number |  |
| real_seconds_per_day | true | number |  |
| game_days_per_week | true | number |  |
| day_started_at | true | string (date-time) |  |
| day_ends_at | true | string (date-time) |  |
| week_started_at | true | string (date-time) |  |
| week_ends_at | true | string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/media/:key` — Bytes of a published gallery photo

- Authorization: 공개: 로그인 불필요
- Success status: 200
- Response mode: binary
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `MediaController_media`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| key | path | true | string |  |

### Request body

_No request body._

### Success response fields

_Binary body. Do not JSON-decode._

## `GET` `/app-api/v1/media/profile/:key` — Bytes of a member’s profile picture, on their terms

- Authorization: 공개: 로그인 불필요
- Success status: 200
- Response mode: binary
- After success: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileImageController_image`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| key | path | true | string |  |

### Request body

_No request body._

### Success response fields

_Binary body. Do not JSON-decode._

## `GET` `/app-api/v1/photos` — Published gallery photos

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `ContentController_photos`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| photos[] | true | object[] |  |
| photos[] | true | object |  |
| photos[].photoId | true | string |  |
| photos[].imageUrl | true | string |  |
| photos[].altText | true | string |  |
| photos[].publishedAt | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/photos` — Send an uploaded photo to the gallery for review

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `MemberPhotoController_submit`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `PhotoSubmissionDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| storageKey | true | string | description="A key this server issued from POST /photos/uploads" |
| altText | true | string | maxLength=300 |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/photos/mine` — The caller’s own submissions and where each one got to

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `MemberPhotoController_mine`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| submissions[] | true | object[] |  |
| submissions[] | true | object |  |
| submissions[].photo_id | true | string |  |
| submissions[].image_url | true | null \| string |  |
| submissions[].alt_text | true | string |  |
| submissions[].published | true | boolean |  |
| submissions[].submitted_at | true | string (date-time) |  |
| submissions[].published_at | true | null \| string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/photos/uploads` — Upload image bytes and receive a storage key

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `MemberPhotoController_upload`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/octet-stream`
- Maximum size: 4194304 bytes
- Accepted images: image/png, image/jpeg, image/webp
- Send decoded image bytes directly. Do not send JSON, base64, or multipart.

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| storageKey | true | string |  |
| mimeType | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/privacy/requests` — Data subject requests the caller has made

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 개인정보 요청 목록 재조회
- Operation ID: `PrivacyController_list`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| requests[] | true | object[] |  |
| requests[] | true | object |  |
| requests[].requestId | true | string |  |
| requests[].requestType | true | string |  |
| requests[].detail | true | null \| string |  |
| requests[].status | true | string |  |
| requests[].createdAt | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/privacy/requests` — Raise a data subject request

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 개인정보 요청 목록 재조회
- Operation ID: `PrivacyController_create`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `CreatePrivacyRequestDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| requestType | true | string | enum="access","correction","restriction","withdrawal","deletion" |
| detail | false | string | maxLength=2000 |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| requestId | true | string |  |
| requestType | true | string |  |
| status | true | string |  |
| createdAt | true | string |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/profile` — The caller’s own profile, with every field

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_mine`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| displayName | true | null \| string |  |
| imageUrl | true | null \| string |  |
| joinedAt | true | string |  |
| jobType | true | null \| string |  |
| jobLevel | true | number |  |
| workCompletions | true | string |  |
| visibility | true | string="public" \| string="members" \| string="private" |  |
| featuredTitle | true | null \| string |  |
| email | true | null \| string |  |
| profile | true | object |  |
| profile.displayName | true | null \| string |  |
| profile.imageUrl | true | null \| string |  |
| profile.joinedAt | true | string |  |
| profile.jobType | true | null \| string |  |
| profile.jobLevel | true | number |  |
| profile.workCompletions | true | string |  |
| profile.visibility | true | string="public" \| string="members" \| string="private" |  |
| profile.featuredTitle | true | null \| string |  |
| profile.email | true | null \| string |  |
| profile.display_name | true | null \| string |  |
| profile.image_url | true | null \| string |  |
| profile.joined_at | true | string (date-time) |  |
| profile.job_type | true | null \| string |  |
| profile.job_level | true | null \| number |  |
| profile.work_completions | true | null \| string |  |
| profile.featured_title | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `PUT` `/app-api/v1/profile` — Replace the caller’s profile and its per-field visibility

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 200
- Response mode: json
- After success: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_replace`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `ProfileUpdateDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| visibility | true | string | enum="public","members","private" |
| displayName | false | string | maxLength=80 |
| imageUrl | false | string | maxLength=2048 |
| fieldVisibility | false | object | example={"imageUrl":"private","workCompletions":"members"} |
| featuredTitle | false | string | maxLength=64 |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| settings | true | object |  |
| settings.visibility | true | string="public" \| string="members" \| string="private" |  |
| settings.display_name | true | null \| string |  |
| settings.image_url | true | null \| string |  |
| settings.field_visibility | true | object |  |
| settings.featured_title | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/profile/:userId` — Another member’s profile, as they have chosen to show it

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_member`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| userId | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| profile | true | object |  |
| profile.display_name | true | null \| string |  |
| profile.image_url | true | null \| string |  |
| profile.joined_at | true | string (date-time) |  |
| profile.job_type | true | null \| string |  |
| profile.job_level | true | null \| number |  |
| profile.work_completions | true | null \| string |  |
| profile.visibility | true | string="public" \| string="members" \| string="private" |  |
| profile.featured_title | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `DELETE` `/app-api/v1/profile/image` — Remove the profile picture

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 204
- Response mode: none
- After success: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_removeImage`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/profile/image` — Upload a profile picture, replacing the current one

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_uploadImage`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/octet-stream`
- Maximum size: 4194304 bytes
- Accepted images: image/png, image/jpeg, image/webp
- Send decoded image bytes directly. Do not send JSON, base64, or multipart.

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| imagePath | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/profile/settings` — The caller’s own profile settings, as stored

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_settings`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| settings | true | object |  |
| settings.visibility | true | string="public" \| string="members" \| string="private" |  |
| settings.display_name | true | null \| string |  |
| settings.image_url | true | null \| string |  |
| settings.field_visibility | true | object |  |
| settings.featured_title | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/profile/titles` — Profile titles actually awarded to the caller

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 프로필 화면의 대표 칭호 선택 목록 갱신
- Operation ID: `ProfileController_titles`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| titles[] | true | object[] |  |
| titles[] | true | object |  |
| titles[].code | true | string |  |
| titles[].name | true | string |  |
| titles[].awardedAt | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/progression` — The caller’s growth stage and what unlocks the next one

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `ProgressionController_status`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| progression | true | null \| object |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/progression/credit` — The caller’s credit grade, what each grade buys, and their loans

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `ProgressionController_credit`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| grade | true | null \| string |  |
| loans[] | true | object[] |  |
| loans[] | true | object |  |
| loans[].loan_id | true | string |  |
| loans[].principal_amount | true | string |  |
| loans[].interest_amount | true | string |  |
| loans[].outstanding_amount | true | string |  |
| loans[].status | true | string |  |
| loans[].issued_at | true | string (date-time) |  |
| loans[].repaid_at | true | null \| string (date-time) |  |
| ladder[] | true | object[] |  |
| ladder[] | true | object |  |
| ladder[].grade | true | string |  |
| ladder[].minimum_account_days | true | number |  |
| ladder[].minimum_work_completions | true | number |  |
| ladder[].credit_limit | true | string |  |
| ladder[].interest_bps | true | number |  |
| ladder[].term_days | true | number |  |
| ladder[].minimum_repayment | true | string |  |
| ladder[].held | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/progression/early-game` — The early-game unlock ladder and what the caller has reached

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `ProgressionController_earlyGameUnlocks`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| unlocks[] | true | object[] |  |
| unlocks[] | true | object |  |
| unlocks[].unlock_code | true | string |  |
| unlocks[].unlock_label | true | string |  |
| unlocks[].unlock_detail | true | string |  |
| unlocks[].unlock_business_symbol | true | null \| string |  |
| unlocks[].needs_job_level | true | number |  |
| unlocks[].needs_account_days | true | number |  |
| unlocks[].needs_work_completions | true | number |  |
| unlocks[].is_enforced | true | boolean |  |
| unlocks[].unlocked | true | boolean |  |
| unlocks[].next_up | true | boolean |  |
| unlocks[].member_job_level | true | number |  |
| unlocks[].member_account_days | true | number |  |
| unlocks[].member_work_completions | true | number |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/progression/refreshes` — Recompute the caller’s growth stage from their progress

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `ProgressionController_refresh`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| progression | true | null \| object |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/rewards/availability` — Next eligible times for the caller reward controls

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `WalletController_rewardAvailability`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| dailyAvailable | true | boolean |  |
| dailyNextEligibleAt | true | null \| string |  |
| workAvailable | true | boolean |  |
| workNextEligibleAt | true | null \| string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/rewards/daily/claims` — Claim the daily reward

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `WalletController_claimDaily`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `ClaimDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| transactionId | true | string |  |
| amount | true | string & object |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/rewards/work/claims` — Retired legacy work faucet; use professional work tasks

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WalletController_claimWork`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/seasons/events` — Active season events

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `SeasonController_events`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| events[] | true | object[] |  |
| events[] | true | object |  |
| events[].event_id | true | string |  |
| events[].season_id | true | string |  |
| events[].season_name | true | string |  |
| events[].title | true | string |  |
| events[].description | true | string |  |
| events[].cost_wld | true | string & object |  |
| events[].points_per_entry | true | number |  |
| events[].ends_at | true | unknown |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/seasons/events/:id/consumptions` — Spend on a season event

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `SeasonController_consume`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `ConsumeDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| quantity | true | number | minimum=1 |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| eventId | true | string |  |
| pointsEarned | true | string |  |
| transactionId | true | string |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/seasons/events/:id/leaderboard` — Leaderboard for one event

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `SeasonController_leaderboard`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| entries[] | true | object[] |  |
| entries[] | true | object |  |
| entries[].rank | true | number |  |
| entries[].points | true | string |  |
| entries[].entries | true | string |  |
| entries[].display_name | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/shop/catalog` — The catalogue with prices, stock, purchase limits and cosmetics

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_catalog`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| catalogItems[] | true | object[] |  |
| catalogItems[] | true | object |  |
| catalogItems[].catalog_id | true | string |  |
| catalogItems[].code | true | string |  |
| catalogItems[].name | true | string |  |
| catalogItems[].description | true | string |  |
| catalogItems[].category | true | string |  |
| catalogItems[].price | true | string |  |
| catalogItems[].quantity | true | null \| number |  |
| catalogItems[].purchase_limit | true | string |  |
| catalogItems[].effect_kind | true | string |  |
| catalogItems[].maintenance_cost | true | string |  |
| catalogItems[].sale_ends_at | true | null \| string (date-time) |  |
| catalogItems[].rarity | true | string |  |
| catalogItems[].animation_css | true | null \| string |  |
| catalogItems[].preview_data | true | object |  |
| catalogItems[].max_stock | true | null \| number |  |
| catalogItems[].is_limited | true | boolean |  |
| catalogItems[].user_owned_quantity | true | number |  |
| catalogItems[].user_is_equipped | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/shop/catalog/:id/purchases` — Buy a catalogue item

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_purchaseCatalogItem`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `CatalogPurchaseDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) | description="Client-generated idempotency key" |
| quantity | false | number | minimum=1; maximum=100; description="How many to buy; one when omitted" |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| purchase_id | true | string |  |
| amount | true | string |  |
| transaction_id | true | string |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/shop/cosmetics/:userId` — Get active cosmetics equipped by a user

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_getCosmetics`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| userId | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| cosmetics | true | object |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/shop/holdings` — Catalogue items the caller holds

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_holdings`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| holdings[] | true | object[] |  |
| holdings[] | true | object |  |
| holdings[].catalog_id | true | string |  |
| holdings[].code | true | string |  |
| holdings[].name | true | string |  |
| holdings[].description | true | string |  |
| holdings[].category | true | string |  |
| holdings[].quantity | true | number |  |
| holdings[].acquired_at | true | string (date-time) |  |
| holdings[].expires_at | true | null \| string (date-time) |  |
| holdings[].effect_kind | true | string |  |
| holdings[].rarity | true | string |  |
| holdings[].animation_css | true | null \| string |  |
| holdings[].preview_data | true | object |  |
| holdings[].is_equipped | true | boolean |  |
| holdings[].equipped_slot | true | null \| string |  |
| holdings[].serial_number | true | null \| number |  |
| holdings[].durable | false | boolean |  |
| holdings[].weekly_cost | false | string |  |
| holdings[].effect_expires_at | false | null \| string (date-time) |  |
| holdings[].unpaid_weeks | false | number |  |
| holdings[].arrears_due | false | string |  |
| holdings[].arrears_cap | false | string |  |
| holdings[].suspended | false | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/shop/holdings/:id/consumptions` — Consume one held item

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_consumeItem`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `ItemConsumptionDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) | description="Client-generated idempotency key" |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| catalog_id | true | string |  |
| remaining_quantity | true | null \| number |  |
| expires_at | true | null \| string (date-time) |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/shop/holdings/:id/equip` — Equip or unequip a held cosmetic item

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_equipItem`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| success | true | boolean |  |
| catalog_id | true | string |  |
| slot | true | string |  |
| is_equipped | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/shop/holdings/:id/upkeep-settlements` — Pay the outstanding weekly upkeep on one held item

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_settleUpkeep`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `UpkeepSettlementDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) | description="Client-generated idempotency key" |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| paid_amount | true | string |  |
| ledger_transaction_id | true | string |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/shop/items` — Items currently on sale

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_items`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| items[] | true | object[] |  |
| items[] | true | object |  |
| items[].itemId | true | string |  |
| items[].name | true | string |  |
| items[].description | true | string |  |
| items[].price | true | string & object |  |
| items[].createdAt | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/shop/items/:id/purchases` — Buy an item

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_purchase`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `PurchaseDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) | description="Client-generated idempotency key" |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| purchaseId | true | string |  |
| transactionId | true | string |  |
| amount | true | string & object |  |
| replayed | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/shop/public-catalog` — The catalogue with prices, stock and cosmetics for public browsing

- Authorization: 공개: 로그인 불필요
- Success status: 200
- Response mode: json
- After success: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_publicCatalog`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| catalogItems[] | true | object[] |  |
| catalogItems[] | true | object |  |
| catalogItems[].catalog_id | true | string |  |
| catalogItems[].code | true | string |  |
| catalogItems[].name | true | string |  |
| catalogItems[].description | true | string |  |
| catalogItems[].category | true | string |  |
| catalogItems[].price | true | string |  |
| catalogItems[].quantity | true | null \| number |  |
| catalogItems[].purchase_limit | true | string |  |
| catalogItems[].effect_kind | true | string |  |
| catalogItems[].maintenance_cost | true | string |  |
| catalogItems[].sale_ends_at | true | null \| string (date-time) |  |
| catalogItems[].rarity | true | string |  |
| catalogItems[].animation_css | true | null \| string |  |
| catalogItems[].preview_data | true | object |  |
| catalogItems[].max_stock | true | null \| number |  |
| catalogItems[].is_limited | true | boolean |  |
| catalogItems[].user_owned_quantity | true | number |  |
| catalogItems[].user_is_equipped | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/shop/purchases` — Purchases made by the caller

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_purchases`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| purchases[] | true | object[] |  |
| purchases[] | true | object |  |
| purchases[].purchaseId | true | string |  |
| purchases[].itemId | true | string |  |
| purchases[].itemName | true | string |  |
| purchases[].transactionId | true | string |  |
| purchases[].amount | true | string & object |  |
| purchases[].purchasedAt | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/stocks` — Listed stocks and their current prices

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_list`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| stocks[] | true | object[] |  |
| stocks[] | true | object |  |
| stocks[].day_high_price | true | string & object |  |
| stocks[].day_low_price | true | string & object |  |
| stocks[].symbol | true | string |  |
| stocks[].id | true | string |  |
| stocks[].name | true | string |  |
| stocks[].description | true | string |  |
| stocks[].current_price | true | string & object |  |
| stocks[].day_open_price | true | string & object |  |
| stocks[].halt_status | false | string |  |
| stocks[].halted_at | false | null \| string (date-time) |  |
| stocks[].updated_at | true | string (date-time) |  |
| stocks[].shares_outstanding | true | string |  |
| stocks[].shares_available | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/stocks/:id/candles` — Open/high/low/close for one stock at a given interval

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_candles`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |
| interval | query | true | string |  |
| limit | query | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| interval | true | number=86400 \| number=60 \| number=300 \| number=1800 \| number=3600 \| number=7200 \| number=14400 \| number=604800 |  |
| candles[] | true | object[] |  |
| candles[] | true | object |  |
| candles[].bucket_at | true | string (date-time) |  |
| candles[].open_price | true | string & object |  |
| candles[].high_price | true | string & object |  |
| candles[].low_price | true | string & object |  |
| candles[].close_price | true | string & object |  |
| range | true | null \| object |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/stocks/:id/orders` — Buy or sell a stock

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_order`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `OrderDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| side | true | string | enum="buy","sell" |
| quantity | true | number | minimum=1 |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| trade_id | true | string |  |
| unit_price | true | string & object |  |
| gross_amount | true | string & object |  |
| tax_amount | true | string & object |  |
| current_price | true | string & object |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/stocks/:id/prices` — Recorded price history for one stock

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_prices`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |
| limit | query | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| prices[] | true | object[] |  |
| prices[] | true | object |  |
| prices[].recorded_at | true | string (date-time) |  |
| prices[].price | true | string & object |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/stocks/:id/watchlist` — Add or remove a stock from the caller watchlist

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_setWatchlist`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `WatchlistDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| watching | true | boolean |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| watching | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/stocks/alerts` — Conditional virtual-stock alerts belonging to the caller

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockAlertController_list`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| alerts[] | true | object[] |  |
| alerts[] | true | object |  |
| alerts[].alert_id | true | string |  |
| alerts[].stock_id | true | string |  |
| alerts[].symbol | true | string |  |
| alerts[].name | true | string |  |
| alerts[].condition_kind | true | string |  |
| alerts[].threshold_amount | true | null \| string |  |
| alerts[].threshold_bps | true | null \| number |  |
| alerts[].cooldown_seconds | true | number |  |
| alerts[].current_price | true | string |  |
| alerts[].day_open_price | true | string |  |
| alerts[].current_day_change_bps | true | number |  |
| alerts[].condition_met | true | boolean |  |
| alerts[].last_evaluated_at | true | null \| string (date-time) |  |
| alerts[].last_triggered_at | true | null \| string (date-time) |  |
| alerts[].created_at | true | string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/stocks/alerts` — Create a server-evaluated virtual-stock alert

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockAlertController_create`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `CreateStockAlertDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| stockId | true | string (uuid) |  |
| conditionKind | true | string | enum="price_at_or_above","price_at_or_below","day_change_at_or_above","day_change_at_or_below" |
| thresholdAmount | false | string | description="Integer WLD threshold for price conditions" |
| thresholdBps | false | number | minimum=-100000; maximum=100000 |
| cooldownSeconds | false | number | minimum=300; maximum=604800 |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| alertId | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `DELETE` `/app-api/v1/stocks/alerts/:id` — Delete one virtual-stock alert belonging to the caller

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 200
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockAlertController_remove`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| deleted | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/stocks/alerts/events` — Recent virtual-stock alert events belonging to the caller

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockAlertController_events`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| limit | query | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| events[] | true | object[] |  |
| events[] | true | object |  |
| events[].event_id | true | string |  |
| events[].alert_id | true | string |  |
| events[].stock_id | true | string |  |
| events[].symbol | true | string |  |
| events[].name | true | string |  |
| events[].condition_kind | true | string |  |
| events[].threshold_amount | true | null \| string |  |
| events[].threshold_bps | true | null \| number |  |
| events[].trigger_price | true | string |  |
| events[].trigger_day_change_bps | true | number |  |
| events[].triggered_at | true | string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/stocks/history` — Trades made by the caller

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_history`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| trades[] | true | object[] |  |
| trades[] | true | object |  |
| trades[].trade_id | true | string |  |
| trades[].symbol | true | string |  |
| trades[].side | true | string |  |
| trades[].quantity | true | string |  |
| trades[].unit_price | true | string & object |  |
| trades[].gross_amount | true | string & object |  |
| trades[].tax_amount | true | string & object |  |
| trades[].created_at | true | string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/stocks/market-events` — Market events currently in effect

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_marketEvents`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| events[] | true | object[] |  |
| events[] | true | object |  |
| events[].id | true | string |  |
| events[].stock_id | true | null \| string |  |
| events[].symbol | true | null \| string |  |
| events[].name | true | null \| string |  |
| events[].direction | true | string="up" \| string="down" |  |
| events[].strength | true | number |  |
| events[].headline | true | string |  |
| events[].body | true | string |  |
| events[].source | true | string |  |
| events[].starts_at | true | string (date-time) |  |
| events[].ends_at | true | string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/stocks/portfolio` — Holdings of the caller

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_portfolio`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| holdings[] | true | object[] |  |
| holdings[] | true | object |  |
| holdings[].stock_id | true | string |  |
| holdings[].symbol | true | string |  |
| holdings[].name | true | string |  |
| holdings[].quantity | true | string |  |
| holdings[].average_cost | true | string & object |  |
| holdings[].market_value | true | string & object |  |
| holdings[].current_price | true | string & object |  |
| holdings[].halt_status | false | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/stocks/sparklines` — Recent prices for every listed stock

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_sparklines`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| limit | query | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| series[] | true | object[] |  |
| series[] | true | object |  |
| series[].stock_id | true | string |  |
| series[].prices[] | true | string & object[] |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/stocks/watchlist` — Stocks watched by the caller

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_watchlist`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| stocks[] | true | object[] |  |
| stocks[] | true | object |  |
| stocks[].stock_id | true | string |  |
| stocks[].symbol | true | string |  |
| stocks[].name | true | string |  |
| stocks[].current_price | true | string & object |  |
| stocks[].day_open_price | true | string & object |  |
| stocks[].created_at | true | string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/support/threads` — My administrator support conversations

- Authorization: 로그인 + 최신 동의
- Success status: 200
- Response mode: json
- After success: 응답을 현재 화면 상태에 반영
- Operation ID: `SupportController_threads`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| threads[] | true | object[] |  |
| threads[] | true | object |  |
| threads[].thread_id | true | string |  |
| threads[].subject | true | string |  |
| threads[].status | true | string |  |
| threads[].created_at | true | string (date-time) |  |
| threads[].updated_at | false | string (date-time) |  |
| threads[].last_message_at | false | string (date-time) |  |
| threads[].user_id | false | string |  |
| threads[].display_name | false | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/support/threads` — Open an administrator support conversation

- Authorization: 로그인 + 최신 동의 + CSRF
- Success status: 201
- Response mode: json
- After success: 문의 목록/대화를 서버에서 다시 조회
- Operation ID: `SupportController_create`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `NewThreadDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| subject | true | string | minLength=1; maxLength=120 |
| body | true | string | minLength=1; maxLength=2000 |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| thread | true | object |  |
| thread.thread_id | true | string |  |
| thread.subject | true | string |  |
| thread.status | true | string |  |
| thread.created_at | true | string (date-time) |  |
| thread.updated_at | false | string (date-time) |  |
| thread.last_message_at | false | string (date-time) |  |
| thread.user_id | false | string |  |
| thread.display_name | false | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/support/threads/:id/messages` — Messages in my support conversation

- Authorization: 로그인 + 최신 동의
- Success status: 200
- Response mode: json
- After success: 응답을 현재 화면 상태에 반영
- Operation ID: `SupportController_messages`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string (uuid) |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| messages[] | true | object[] |  |
| messages[] | true | object |  |
| messages[].message_id | true | string |  |
| messages[].sender_kind | true | string="user" \| string="admin" |  |
| messages[].sender_user_id | false | string |  |
| messages[].body | true | string |  |
| messages[].created_at | true | string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/support/threads/:id/messages` — Reply to my support conversation

- Authorization: 로그인 + 최신 동의 + CSRF
- Success status: 201
- Response mode: json
- After success: 문의 목록/대화를 서버에서 다시 조회
- Operation ID: `SupportController_reply`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string (uuid) |  |

### Request body

- Content-Type: `application/json`
- DTO: `NewMessageDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| body | true | string | minLength=1; maxLength=2000 |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| message | true | object |  |
| message.message_id | true | string |  |
| message.sender_kind | true | string="user" \| string="admin" |  |
| message.sender_user_id | false | string |  |
| message.body | true | string |  |
| message.created_at | true | string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/wallet` — Balances and recent ledger entries for the caller

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_overview`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| recent | query | true | string |  |

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| userId | true | string |  |
| balances | true | object |  |
| balances.currency | true | string="WLD" | const="WLD" |
| balances.cash | true | object |  |
| balances.cash.availableAmount | true | string & object |  |
| balances.cash.updatedAt | true | string |  |
| balances.bank | true | object |  |
| balances.bank.availableAmount | true | string & object |  |
| balances.bank.updatedAt | true | string |  |
| balances.totalAvailableAmount | true | string & object |  |
| recentTransactions[] | true | object[] |  |
| recentTransactions[] | true | object |  |
| recentTransactions[].transactionId | true | string |  |
| recentTransactions[].type | true | string |  |
| recentTransactions[].label | true | string |  |
| recentTransactions[].netAmount | true | string & object |  |
| recentTransactions[].direction | true | string="neutral" \| string="in" \| string="out" |  |
| recentTransactions[].occurredAt | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/wallet/transfers` — Send WLD to another member

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_transfer`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `TransferDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| recipientUserId | true | string (uuid) | description="Recipient user id" |
| amount | true | number | minimum=1; description="Amount in WLD" |
| idempotencyKey | true | string (uuid) | description="Client-generated idempotency key" |


### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| transactionId | true | string |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/work` — Caps, what has been paid against them, and open assignments

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_dashboard`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/work/active-job` — Switch active job among 8 specialization careers

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_switchJob`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `JobSwitchDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| jobType | true | string | enum="developer","trader","entertainer","detective","miner","farmer","artisan","civil_servant" |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/work/assignments` — The caller’s recent assignments

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_assignments`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| assignments[] | true | unknown[] |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/work/assignments` — Take a task

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_assign`

### Path/query parameters

_None._

### Request body

- Content-Type: `application/json`
- DTO: `WorkAssignmentDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| taskId | true | string (uuid) |  |
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/work/assignments/:id/completions` — Submit a taken task as done

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_submit`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `WorkCompletionDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |
| evidence | false | string | maxLength=1000 |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/work/assignments/:id/verify` — Verify a submitted task and pay it, within the caps

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_verify`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `WorkCompletionDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |
| evidence | false | string | maxLength=1000 |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/work/profile` — Current active job and all job masteries

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_profile`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/work/receipts` — What the work paid, and the ledger transaction it paid through

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_receipts`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| receipts[] | true | object[] |  |
| receipts[] | true | object |  |
| receipts[].receipt_id | true | string |  |
| receipts[].assignment_id | true | string |  |
| receipts[].code | true | string |  |
| receipts[].name | true | string |  |
| receipts[].reward_amount | true | string |  |
| receipts[].experience_amount | true | string |  |
| receipts[].transaction_id | true | null \| string |  |
| receipts[].created_at | true | string (date-time) |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `GET` `/app-api/v1/work/tasks` — Every task on offer, with this member’s standing against each

- Authorization: 로그인 필요(기능에 따라 최신 동의 필요)
- Success status: 200
- Response mode: json
- After success: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_tasks`

### Path/query parameters

_None._

### Request body

_No request body._

### Success response fields

| Field | Required | Type | Constraints/meaning |
|---|---|---|---|
| featureState | true | string="enabled" \| string="paused" \| string="safe_mode" \| string="disabled" |  |
| tasks[] | true | object[] |  |
| tasks[] | true | object |  |
| tasks[].task_id | true | string |  |
| tasks[].code | true | string |  |
| tasks[].name | true | string |  |
| tasks[].description | true | string |  |
| tasks[].job_type | true | string |  |
| tasks[].difficulty | true | number |  |
| tasks[].base_reward | true | string |  |
| tasks[].base_experience | true | string |  |
| tasks[].minimum_duration_seconds | true | number |  |
| tasks[].daily_limit | true | number |  |
| tasks[].taken_today | true | number |  |
| tasks[].reward_preview | true | null \| string |  |
| tasks[].experience_preview | true | null \| string |  |
| tasks[].recommended | true | boolean |  |

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

## `POST` `/app-api/v1/work/tasks/:id/complete` — Directly complete a career task with EXP and instant WLD faucet payout

- Authorization: 로그인 + 최신 동의 + CSRF(변경 요청)
- Success status: 201
- Response mode: json
- After success: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_completeTask`

### Path/query parameters

| Name | In | Required | Type | Constraints |
|---|---|---|---|---|
| id | path | true | string |  |

### Request body

- Content-Type: `application/json`
- DTO: `WorkCompleteTaskDto`

| Field | Required | Type | Constraints |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### Success response fields

_None._

> Prefer camelCase keys in native code. Legacy snake_case keys remain, and the gateway recursively adds non-conflicting camelCase aliases.

