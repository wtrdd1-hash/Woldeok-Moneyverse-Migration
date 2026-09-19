# 모바일 앱 API 요청·응답 스키마 레퍼런스

[English](mobile-api-schema-reference.md) | **한국어** | [기계 판독 계약](mobile-api-contract.json)

업데이트 버전: **v2026.09.16.159**

이 문서는 157개 앱 API 각각의 실제 요청 파라미터, DTO 필드, 타입/제약, 성공 상태코드, 성공 응답 필드를 기록한다. 다른 AI나 앱 개발자는 이 문서와 `mobile-api-contract.json`을 기준으로 코드를 생성하고 필드명을 추측하지 않는다.

## 공통 호환성 규칙

- Base URL은 `https://easy-scraping.com/app-api/v1`이다.
- JSON 응답은 기존 키를 삭제하지 않고 snake_case 키의 camelCase 별칭을 재귀적으로 추가한다. 기존 camelCase와 충돌하면 기존 camelCase 값이 우선이다.
- 로그인/세션은 persistent secure CookieJar를 사용하고 write는 문서가 요구하는 경우 최신 `X-CSRF-Token`을 보낸다.
- 2xx만 성공으로 처리하고 4xx/5xx는 성공 DTO로 역직렬화하지 않는다.
- nullable 값은 화면에 문자열 `null`로 표시하지 않는다.
- raw image upload는 JSON/base64/multipart가 아니라 raw bytes를 보낸다.

## `DELETE` `/app-api/v1/account` — 회원 탈퇴 및 계정 삭제

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 202
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AccountController_remove`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| deletedAt | true | string |  |
| revokedSessionCount | true | number |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/account/identities` — 연결된 Google/Discord 등 로그인 수단 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AccountController_identities`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| identities[] | true | object[] |  |
| identities[] | true | object |  |
| identities[].identityId | true | string |  |
| identities[].provider | true | string="discord" \| string="google" |  |
| identities[].displayName | true | string |  |
| identities[].linkedAt | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `DELETE` `/app-api/v1/account/identities/:id` — 특정 로그인 수단 연결 해제

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AccountController_unlink`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| identityId | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/account/identities/:provider/link` — Google/Discord 로그인 수단 추가 연결 시작

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AuthController_startLink`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| provider | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| authorizationUrl | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/account/security/sessions` — 현재 계정의 로그인 기기/세션 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AccountSecurityController_sessions`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| sessions[] | true | object[] |  |
| sessions[] | true | object |  |
| sessions[].sessionId | true | string |  |
| sessions[].createdAt | true | string |  |
| sessions[].expiresAt | true | string |  |
| sessions[].reauthenticatedAt | true | null \| string |  |
| sessions[].current | true | boolean |  |
| sessions[].administratorSession | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `DELETE` `/app-api/v1/account/security/sessions/:id` — 선택한 로그인 세션 강제 종료

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AccountSecurityController_revokeSession`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| revoked | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/account/security/sessions/revoke-others` — 현재 기기 제외 모든 로그인 세션 종료

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AccountSecurityController_revokeOtherSessions`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| revokedSessions | true | number |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/activity/events` — 앱 활동/참여 이벤트 서버 기록

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `ActivityController_ingestEvents`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `IngestActivityEventsDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| events[] | true | object[] |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| recorded | true | number |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/admin/activity/logs` — 관리자 사용자 활동 로그 조회

- 인증/권한: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답 로그를 관리자 활동 화면에 표시
- Operation ID: `ActivityController_listLogs`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| limit | query | false | integer | minimum=1; maximum=200 |
| offset | query | false | integer | minimum=0 |
| eventType | query | false | string |  |
| userId | query | false | string (uuid) |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/admin/activity/traffic` — 관리자 접속량·유입경로·접속경로 집계

- 인증/권한: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 일/월/년 집계와 유입·진입 경로를 표시
- Operation ID: `ActivityController_traffic`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| granularity | query | false | string | enum="day","month","year" |
| periods | query | false | integer | minimum=1; maximum=366 |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/admin/economy/ai-status` — 경제 AI 위원회 상태 조회

- 인증/권한: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 스위치·최근 리뷰·에이전트 상태를 표시
- Operation ID: `AdminEconomyController_aiStatus`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/admin/me` — 관리자 역할 확인

- 인증/권한: 로그인 + 최신 동의 + 관리자 역할
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: roles를 관리자 UI 권한 상태에 반영
- Operation ID: `AdminController_me`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| roles[] | true | string[] |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/admin/security/sessions` — 관리자 콘솔 세션 열기

- 인증/권한: 로그인 + 최신 동의 + 관리자 역할 + CSRF + 관리자 보안 정책
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 회전된 세션/CSRF를 저장한 뒤 관리자 데이터를 다시 조회
- Operation ID: `AdminSecurityController_openConsole`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| state | true | string="open" \| string="idle_locked" \| string="expired" \| string="closed" \| string="none" |  |
| expiresAt | true | null \| string (date-time) |  |
| idleExpiresAt | true | null \| string (date-time) |  |
| csrfToken | true | string |  |
| loginContext | true | object |  |
| loginContext.decision | true | string="allow" \| string="block" |  |
| loginContext.reason | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/admin/support/threads` — 관리자 문의함 조회

- 인증/권한: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 현재 화면 상태에 반영
- Operation ID: `AdminSupportController_threads`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| status | query | false | string | enum="open","waiting_user","resolved" |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/admin/support/threads/:id/messages` — 관리자가 문의 대화 조회

- 인증/권한: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 현재 화면 상태에 반영
- Operation ID: `AdminSupportController_messages`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string (uuid) |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| messages[] | true | object[] |  |
| messages[] | true | object |  |
| messages[].message_id | true | string |  |
| messages[].sender_kind | true | string="user" \| string="admin" |  |
| messages[].sender_user_id | false | string |  |
| messages[].body | true | string |  |
| messages[].created_at | true | string (date-time) |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/admin/support/threads/:id/messages` — 관리자가 회원 문의에 답장

- 인증/권한: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션 + CSRF
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 문의 목록/대화를 서버에서 다시 조회
- Operation ID: `AdminSupportController_reply`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string (uuid) |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `NewMessageDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| body | true | string | minLength=1; maxLength=2000 |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| message | true | object |  |
| message.message_id | true | string |  |
| message.sender_kind | true | string="user" \| string="admin" |  |
| message.sender_user_id | false | string |  |
| message.body | true | string |  |
| message.created_at | true | string (date-time) |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `PUT` `/app-api/v1/admin/support/threads/:id/status` — 관리자가 문의 처리 상태 변경

- 인증/권한: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션 + CSRF
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 문의 목록/대화를 서버에서 다시 조회
- Operation ID: `AdminSupportController_status`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string (uuid) |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `StatusDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| status | true | string | enum="open","waiting_user","resolved" |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| status | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/admin/users` — 관리자 회원 목록 조회

- 인증/권한: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 서버 회원 목록으로 관리자 화면을 갱신
- Operation ID: `AdminController_users`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| users[] | true | unknown[] |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/admin/work` — 관리자 직업·보상 정책 현황 조회

- 인증/권한: 로그인 + 최신 동의 + 관리자 역할 + 열린 관리자 콘솔 세션
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 직업 카탈로그·레벨·정책 상태를 갱신
- Operation ID: `AdminWorkOperationsController_overview`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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
| catalogue[].last_assigned_at | true | null \| string (date-time) |  |
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
| policy.effective_at | true | null \| string (date-time) |  |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/auth/:provider/authorize` — Google/Discord OAuth 시작; 모바일은 client=mobile 필수

- 인증/권한: 인증 흐름 전용: 상태머신 준수
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthController_authorize`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| provider | path | true | string |  |
| client | query | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| authorizationUrl | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/auth/:provider/callback` — OAuth provider callback 처리; 앱이 직접 호출하지 않음

- 인증/권한: 인증 흐름 전용: 상태머신 준수
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthController_callback`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| provider | path | true | string |  |
| state | query | true | string |  |
| code | query | true | string |  |
| error | query | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/auth/:provider/reauthentication` — 민감 작업 전 Google/Discord 재인증 시작

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AuthController_startReauthentication`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| provider | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| authorizationUrl | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `PUT` `/app-api/v1/auth/consent` — 현재 약관·개인정보·연령 동의 저장

- 인증/권한: Prelogin 또는 로그인 세션 + CSRF
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `AuthController_consent`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `ConsentDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| termsCompleted | true | boolean |  |
| privacyCompleted | true | boolean |  |
| ageConfirmed | true | boolean |  |
| termsVersion | true | string | maxLength=64 |
| privacyVersion | true | string | maxLength=64 |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| next | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/auth/local/login` — 이메일/비밀번호 로그인

- 인증/권한: 인증 흐름 전용: 상태머신 준수
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 새 쿠키/CSRF 저장 후 /auth/viewer 확인
- Operation ID: `LocalAuthController_login`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `LocalLoginDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| email | true | string | maxLength=254; example="member@example.com" |
| password | true | string | maxLength=128 |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| outcome | true | string="signed-in" | const="signed-in" |
| csrfToken | true | string |  |
| consentCurrent | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/auth/local/password-reset/complete` — 일회용 token으로 로컬 계정 비밀번호 재설정 완료

- 인증/권한: 30분 만료 일회용 reset token
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 기존 세션은 모두 폐기되므로 새 비밀번호로 다시 로그인
- Operation ID: `LocalAuthController_completePasswordReset`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| outcome | true | string="password-reset" | const="password-reset" |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/auth/local/password-reset/request` — 로컬 계정 비밀번호 재설정 링크 요청

- 인증/권한: 인증 전 공개 흐름; 계정 존재 여부를 노출하지 않음
- 성공 상태: 202
- 응답 모드: json
- 성공 후 동기화: 항상 동일한 접수 안내를 표시하고 이메일 링크를 기다림
- Operation ID: `LocalAuthController_requestPasswordReset`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| accepted | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/auth/local/register` — 이메일/비밀번호 회원가입 시작

- 인증/권한: 인증 흐름 전용: 상태머신 준수
- 성공 상태: 202
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `LocalAuthController_register`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `LocalRegisterDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| email | true | string | maxLength=254; example="member@example.com" |
| password | true | string | maxLength=128; description="Non-empty password. No numeric minimum length is enforced." |
| displayName | true | string | minLength=2; maxLength=120 |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| verificationToken | false | string |  |
| accepted | true | boolean |  |
| verificationRequired | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/auth/local/verify-email` — 이메일 인증 완료, 계정 활성화 및 로그인 세션 발급

- 인증/권한: 인증 흐름 전용: 상태머신 준수
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 새 쿠키/CSRF 저장 후 /auth/viewer 확인
- Operation ID: `LocalAuthController_verifyEmail`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `LocalVerifyDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| token | true | string | minLength=32; maxLength=512 |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| outcome | true | string="signed-in" | const="signed-in" |
| csrfToken | true | string |  |
| consentCurrent | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/auth/logout` — 현재 로그인 세션 로그아웃

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 204
- 응답 모드: none
- 성공 후 동기화: 쿠키 무효화 반영 후 로컬 사용자 상태 초기화
- Operation ID: `AuthController_logout`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/auth/mobile/handoff` — 모바일 Google/Discord OAuth 1회용 code를 앱 로그인 세션으로 교환

- 인증/권한: 인증 흐름 전용: 상태머신 준수
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 새 쿠키/CSRF 저장 후 /auth/viewer 확인
- Operation ID: `AuthController_mobileHandoff`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `MobileHandoffDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| code | true | string | minLength=32; maxLength=512 |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| outcome | true | string="signed-in" | const="signed-in" |
| csrfToken | true | string |  |
| consentCurrent | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/auth/policy` — 현재 약관·개인정보처리방침 버전 조회

- 인증/권한: 공개/Prelogin에서 호출 가능
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthBootstrapController_policy`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| termsVersion | true | string |  |
| privacyVersion | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/auth/prelogin-session` — 로그인 전 임시 세션과 CSRF 토큰 생성

- 인증/권한: 인증 흐름 전용: 상태머신 준수
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: CookieJar와 csrfToken 저장
- Operation ID: `AuthBootstrapController_preloginSession`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/auth/providers` — 현재 사용 가능한 로그인 방식(local/Google/Discord) 조회

- 인증/권한: 공개/Prelogin에서 호출 가능
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthBootstrapController_providers`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| providers[] | true | object[] |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/auth/session` — 현재 로그인 세션과 최신 CSRF 상태 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthController_session`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| csrfToken | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/auth/viewer` — 현재 로그인 사용자 및 signedIn 상태 확인

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AuthBootstrapController_viewer`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| signedIn | true | boolean |  |
| consentCurrent | true | boolean |  |
| adminRoles[] | true | string[] |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/bank/loans` — 내 대출 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_loans`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/bank/loans` — 신규 대출 실행

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_borrow`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `BorrowDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| principalAmount | true | number | minimum=1 |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| loanId | true | string |  |
| principalAmount | true | string & object |  |
| interestAmount | true | string & object |  |
| outstandingAmount | true | string & object |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/bank/loans/:id/repayments` — 선택한 대출 상환

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_repay`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `RepayDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| amount | true | number | minimum=1 |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| loanId | true | string |  |
| paidAmount | true | string & object |  |
| outstandingAmount | true | string & object |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/bank/movements` — 현금 계정과 은행 계정 사이 입금/출금 이동

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_bankMovement`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `BankMovementDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| direction | true | string | enum="deposit","withdraw" |
| amount | true | number | minimum=1 |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| transactionId | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/banking/bonds/:id/redeem` — 보유 채권 상환/환매

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_redeemBond`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `IdempotentDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/banking/bonds/purchase` — 채권 상품 구매

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_purchaseBond`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `BankBondPurchaseDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| bondCode | true | string | example="BOND_7D"; enum="BOND_7D","BOND_30D" |
| amount | true | string | example="10000" |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/banking/borrow` — 은행 대출 실행

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_borrow`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `BankBorrowSmartDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| amount | true | string | example="5000" |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/banking/claim-interest` — 예금 이자 수령

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_claimInterest`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `IdempotentDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/banking/deposit` — 은행 예금 입금

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_deposit`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `BankTransferDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| amount | true | string | example="1000" |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/banking/repay` — 은행 대출 상환

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_repay`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `BankRepayDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| loanId | true | string (uuid) |  |
| amount | true | string | example="1000" |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/banking/standing` — 은행 잔액·대출·신용 상태 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_standing`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/banking/withdraw` — 은행 예금 출금

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `BankController_withdraw`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `BankTransferDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| amount | true | string | example="1000" |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/board/images/:key` — 게시판 이미지 파일 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: binary
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardImageController_image`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| key | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_바이너리 본문. JSON 디코딩 금지._

## `POST` `/app-api/v1/board/images/uploads` — 게시글 첨부 이미지 업로드

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: binary
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardImageController_upload`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/octet-stream`
- 최대 크기: 4194304 bytes
- 허용 이미지: image/png, image/jpeg, image/webp
- Send decoded image bytes directly. Do not send JSON, base64, or multipart.

### 성공 응답 필드

_바이너리 본문. JSON 디코딩 금지._

## `GET` `/app-api/v1/board/posts` — 게시글 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_list`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/board/posts` — 새 게시글 작성

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_create`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `CreatePostDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| title | true | string | maxLength=120 |
| body | true | string | maxLength=5000 |
| idempotencyKey | true | string (uuid) |  |
| imageStorageKey | false | string | pattern="^[0-9a-f-]{36}\\.(png\|jpg\|webp)$" |
| imageAltText | false | string | maxLength=300 |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `DELETE` `/app-api/v1/board/posts/:id` — 게시글 삭제

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 204
- 응답 모드: none
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_remove`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `DeletePostDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/board/posts/:id` — 게시글 상세 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_read`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `PUT` `/app-api/v1/board/posts/:id` — 게시글 수정

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_update`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `UpdatePostDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| title | true | string | maxLength=120 |
| body | true | string | maxLength=5000 |
| idempotencyKey | true | string (uuid) |  |
| imageStorageKey | false | string | pattern="^[0-9a-f-]{36}\\.(png\|jpg\|webp)$" |
| imageAltText | false | string | maxLength=300 |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/board/posts/:id/comments` — 게시글 댓글 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_comments`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| comments[] | true | object[] |  |
| comments[] | true | object |  |
| comments[].commentId | true | string |  |
| comments[].body | true | string |  |
| comments[].authorName | true | string |  |
| comments[].createdAt | true | string |  |
| comments[].mine | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/board/posts/:id/comments` — 게시글 댓글 작성

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_reply`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `CreateCommentDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| body | true | string | maxLength=1000 |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| comment | true | object |  |
| comment.commentId | true | string |  |
| comment.body | true | string |  |
| comment.authorName | true | string |  |
| comment.createdAt | true | string |  |
| comment.mine | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `DELETE` `/app-api/v1/board/posts/:id/comments/:commentId` — 게시글 댓글 삭제

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 204
- 응답 모드: none
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `BoardController_removeComment`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |
| commentId | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `DeleteCommentDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/board/public/images/:key` — 로그인 없이 공개 게시판 이미지 조회

- 인증/권한: 공개: 로그인 불필요
- 성공 상태: 200
- 응답 모드: binary
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `PublicBoardImageController_image`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| key | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_바이너리 본문. JSON 디코딩 금지._

## `GET` `/app-api/v1/board/public/posts` — 로그인 없이 공개 게시글 목록 조회

- 인증/권한: 공개: 로그인 불필요
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `PublicBoardController_list`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/board/public/posts/:id` — 로그인 없이 공개 게시글 상세 조회

- 인증/권한: 공개: 로그인 불필요
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `PublicBoardController_read`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/board/public/posts/:id/comments` — 로그인 없이 공개 게시글 댓글 조회

- 인증/권한: 공개: 로그인 불필요
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `PublicBoardController_comments`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| comments[] | true | object[] |  |
| comments[] | true | object |  |
| comments[].commentId | true | string |  |
| comments[].body | true | string |  |
| comments[].authorName | true | string |  |
| comments[].createdAt | true | string |  |
| comments[].mine | true | boolean=false | const=false |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/board/public/stock-posts` — 로그인 없이 공개 주식 게시글 조회

- 인증/권한: 공개: 로그인 불필요
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `PublicStockCommunityController_list`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| stock | query | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/board/stock-posts` — 주식 관련 게시글 작성

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 게시글/댓글 목록 또는 상세 재조회
- Operation ID: `StockCommunityController_create`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `CreateStockPostDto`

| 필드 | 필수 | 타입 | 제약 |
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


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/businesses` — 내 보유 사업 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_mine`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/businesses/:id/boost` — 보유 사업 부스트/강화 실행

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_applyBoost`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `ApplyBoostDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| boostCode | true | string | example="biz_cvs_boost_7d" |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/businesses/:id/settle-v2` — 보유 사업 V2 정산 실행

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_settleV2`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `IdempotentDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| ownershipId | true | string |  |
| settlementDate | true | string |  |
| grossRevenue | true | string & object |  |
| operatingCost | true | string & object |  |
| netAmount | true | string & object |  |
| transactionId | true | string |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/businesses/:id/settlements` — 보유 사업 정산 실행

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_settle`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `IdempotentDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| ownershipId | true | string |  |
| settlementDate | true | string |  |
| grossRevenue | true | string & object |  |
| operatingCost | true | string & object |  |
| netAmount | true | string & object |  |
| transactionId | true | string |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/businesses/activate-license` — 사업 라이선스 활성화

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_activateLicense`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `ActivateLicenseDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| catalogCode | true | string | example="biz_cvs_license" |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| ownershipId | true | string |  |
| businessSymbol | true | string |  |
| businessName | true | string |  |
| dailyRevenue | true | string & object |  |
| dailyOperatingCost | true | string & object |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/businesses/catalog` — 사업 종류·가격·조건 카탈로그 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_catalogForApp`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/businesses/catalog/:id/purchases` — 선택한 사업 종류 구매

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_purchaseForApp`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `IdempotentDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| ownershipId | true | string |  |
| businessTypeId | true | string |  |
| purchaseCost | true | string & object |  |
| transactionId | true | string |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/businesses/equity` — 사업 구매에 사용할 수 있는 자기자본 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_equityForApp`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| equity | true | object |  |
| equity.holdingsAmount | true | string & object |  |
| equity.debtAmount | true | string & object |  |
| equity.equityAmount | true | string & object |  |
| equity.minimumRatioBps | true | number |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/businesses/my-v2` — 내 사업 V2 상세 상태 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 내 사업/equity/catalog 관련 상태 재조회
- Operation ID: `BusinessController_mineV2`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/casino/coin/fairness` — 동전게임 공정성 검증 정보 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_fairness`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/casino/coin/plays` — 동전 앞/뒤 게임 실행

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `CasinoController_play`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `CasinoPlayDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |
| choice | true | string | enum="heads","tails" |
| stake | true | number | minimum=1 |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| play_id | true | string |  |
| outcome | true | string |  |
| net_amount | true | string |  |
| transaction_id | true | string |  |
| replayed | true | boolean |  |
| win_probability_ppm | true | number |  |
| payout_multiplier_ppm | true | number |  |
| worst_case_loss | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/casino/coin/terms` — 동전게임 배당·한도 규칙 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_terms`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/casino/dice/fairness` — 주사위게임 공정성 검증 정보 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_diceFairness`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/casino/dice/plays` — 주사위 홀짝/숫자 게임 실행

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `CasinoController_playDice`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `CasinoDicePlayDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |
| game | true | string | enum="dice_parity","dice_number" |
| choice | true | string | enum="odd","even","1","2","3","4","5","6" |
| stake | true | number | minimum=1 |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| play_id | true | string |  |
| outcome_face | true | number |  |
| net_amount | true | string |  |
| transaction_id | true | string |  |
| replayed | true | boolean |  |
| win_probability_ppm | true | number |  |
| payout_multiplier_ppm | true | number |  |
| worst_case_loss | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/casino/games/terms` — 카지노 공통 게임 규칙 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_gameTerms`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/casino/history` — 내 카지노 플레이 기록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_history`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/casino/self-limit` — 내 카지노 자기제한 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `CasinoController_selfLimit`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| daily_bet_limit | true | string |  |
| daily_loss_limit | true | string |  |
| locked_until | true | null \| string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `PUT` `/app-api/v1/casino/self-limit` — 일일 베팅/손실 자기제한 설정

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `CasinoController_setSelfLimit`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `CasinoSelfLimitDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| dailyBetLimit | true | number | minimum=0 |
| dailyLossLimit | true | number | minimum=0 |
| lockedUntil | false | string (date-time) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| daily_bet_limit | true | string |  |
| daily_loss_limit | true | string |  |
| locked_until | true | null \| string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/content/announcements` — 공지사항 목록 조회

- 인증/권한: 공개: 로그인 불필요
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AppContentController_announcements`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/content/photos` — 공개 갤러리 사진 조회

- 인증/권한: 공개: 로그인 불필요
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `AppContentController_photos`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| photos[] | true | object[] |  |
| photos[] | true | object |  |
| photos[].photoId | true | string |  |
| photos[].imageUrl | true | string |  |
| photos[].altText | true | string |  |
| photos[].publishedAt | true | null \| string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/content/status` — 서비스 상태 정보 조회

- 인증/권한: 공개: 로그인 불필요
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `ContentController_status`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/early-game/claims` — 오늘 초반 이벤트 보상 수령

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `EarlyGameController_claim`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `EarlyEventClaimDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |
| eventDate | true | string | example="2026-08-31"; description="The Asia/Seoul day the screen is showing" |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/early-game/first-day` — 첫날 온보딩 진행 상태 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `EarlyGameController_firstDay`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/early-game/today` — 오늘의 초반 진행 이벤트 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `EarlyGameController_today`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| event | true | null \| object |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/engagement` — 참여/활동 진행 상태 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `EngagementController_dashboard`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/engagement/early-game` — 초반 참여 목표 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `EngagementController_earlyGame`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/engagement/npcs/:code/orders` — NPC 주문/상호작용 실행

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `EngagementController_recordNpcOrder`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| code | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `EngagementNpcOrderDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| npc_code | true | string |  |
| affinity | true | null \| number |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `PUT` `/app-api/v1/engagement/preferences` — 참여·알림 선호 설정 변경

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `EngagementController_setPreferences`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `EngagementPreferencesDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| notificationsEnabled | true | boolean |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| notifications_enabled | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/game-clock` — 가속 게임 서버 시간 조회

- 인증/권한: 공개 읽기
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 서버 기준 게임 날짜·주차로 UI를 갱신
- Operation ID: `GameClockController_current`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/media/:key` — 일반 미디어 파일 조회

- 인증/권한: 공개: 로그인 불필요
- 성공 상태: 200
- 응답 모드: binary
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `MediaController_media`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| key | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_바이너리 본문. JSON 디코딩 금지._

## `GET` `/app-api/v1/media/profile/:key` — 프로필 미디어 파일 조회

- 인증/권한: 공개: 로그인 불필요
- 성공 상태: 200
- 응답 모드: binary
- 성공 후 동기화: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileImageController_image`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| key | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_바이너리 본문. JSON 디코딩 금지._

## `GET` `/app-api/v1/photos` — 갤러리 사진 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `ContentController_photos`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| photos[] | true | object[] |  |
| photos[] | true | object |  |
| photos[].photoId | true | string |  |
| photos[].imageUrl | true | string |  |
| photos[].altText | true | string |  |
| photos[].publishedAt | true | null \| string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/photos` — 업로드된 사진을 갤러리에 등록

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `MemberPhotoController_submit`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `PhotoSubmissionDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| storageKey | true | string | description="A key this server issued from POST /photos/uploads" |
| altText | true | string | maxLength=300 |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/photos/mine` — 내가 등록한 갤러리 사진 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `MemberPhotoController_mine`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| submissions[] | true | object[] |  |
| submissions[] | true | object |  |
| submissions[].photo_id | true | string |  |
| submissions[].image_url | true | null \| string |  |
| submissions[].alt_text | true | string |  |
| submissions[].published | true | boolean |  |
| submissions[].submitted_at | true | string (date-time) |  |
| submissions[].published_at | true | null \| string (date-time) |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/photos/uploads` — 갤러리 이미지 업로드

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `MemberPhotoController_upload`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/octet-stream`
- 최대 크기: 4194304 bytes
- 허용 이미지: image/png, image/jpeg, image/webp
- Send decoded image bytes directly. Do not send JSON, base64, or multipart.

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| storageKey | true | string |  |
| mimeType | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/privacy/requests` — 내 개인정보 요청 목록/상태 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 개인정보 요청 목록 재조회
- Operation ID: `PrivacyController_list`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| requests[] | true | object[] |  |
| requests[] | true | object |  |
| requests[].requestId | true | string |  |
| requests[].requestType | true | string |  |
| requests[].detail | true | null \| string |  |
| requests[].status | true | string |  |
| requests[].createdAt | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/privacy/requests` — 개인정보 열람·삭제 등 요청 생성

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 개인정보 요청 목록 재조회
- Operation ID: `PrivacyController_create`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `CreatePrivacyRequestDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| requestType | true | string | enum="access","correction","restriction","withdrawal","deletion" |
| detail | false | string | maxLength=2000 |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| requestId | true | string |  |
| requestType | true | string |  |
| status | true | string |  |
| createdAt | true | string |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/profile` — 내 프로필 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_mine`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `PUT` `/app-api/v1/profile` — 내 프로필 정보/공개범위 수정

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_replace`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `ProfileUpdateDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| visibility | true | string | enum="public","members","private" |
| displayName | false | string | maxLength=80 |
| imageUrl | false | string | maxLength=2048 |
| fieldVisibility | false | object | example={"imageUrl":"private","workCompletions":"members"} |
| featuredTitle | false | string | maxLength=64 |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| settings | true | object |  |
| settings.visibility | true | string="public" \| string="members" \| string="private" |  |
| settings.display_name | true | null \| string |  |
| settings.image_url | true | null \| string |  |
| settings.field_visibility | true | object |  |
| settings.featured_title | true | null \| string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/profile/:userId` — 다른 사용자 공개 프로필 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_member`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| userId | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `DELETE` `/app-api/v1/profile/image` — 프로필 이미지 삭제

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 204
- 응답 모드: none
- 성공 후 동기화: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_removeImage`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/profile/image` — 프로필 이미지 등록

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_uploadImage`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/octet-stream`
- 최대 크기: 4194304 bytes
- 허용 이미지: image/png, image/jpeg, image/webp
- Send decoded image bytes directly. Do not send JSON, base64, or multipart.

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| imagePath | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/profile/settings` — 내 프로필 설정 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 프로필 GET 재조회 후 화면 교체
- Operation ID: `ProfileController_settings`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| settings | true | object |  |
| settings.visibility | true | string="public" \| string="members" \| string="private" |  |
| settings.display_name | true | null \| string |  |
| settings.image_url | true | null \| string |  |
| settings.field_visibility | true | object |  |
| settings.featured_title | true | null \| string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/progression` — 내 전체 성장/레벨 상태 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `ProgressionController_status`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| progression | true | null \| object |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/progression/credit` — 내 신용/성장 점수 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `ProgressionController_credit`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/progression/early-game` — 초반 성장 진행 상태 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `ProgressionController_earlyGameUnlocks`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/progression/refreshes` — 성장 상태 재계산/새로고침

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `ProgressionController_refresh`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| progression | true | null \| object |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/rewards/availability` — 현재 수령 가능한 보상 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `WalletController_rewardAvailability`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| dailyAvailable | true | boolean |  |
| dailyNextEligibleAt | true | null \| string |  |
| workAvailable | true | boolean |  |
| workNextEligibleAt | true | null \| string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/rewards/daily/claims` — 일일 보상 수령

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `WalletController_claimDaily`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `ClaimDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| transactionId | true | string |  |
| amount | true | string & object |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/rewards/work/claims` — 근무 보상 수령

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WalletController_claimWork`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/seasons/events` — 진행 중 시즌 이벤트 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `SeasonController_events`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/seasons/events/:id/consumptions` — 시즌 이벤트 자원/아이템 소비

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 관련 GET을 다시 호출해 서버 상태와 동기화
- Operation ID: `SeasonController_consume`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `ConsumeDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| quantity | true | number | minimum=1 |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| eventId | true | string |  |
| pointsEarned | true | string |  |
| transactionId | true | string |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/seasons/events/:id/leaderboard` — 시즌 이벤트 리더보드 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 화면의 서버 기준 상태로 교체
- Operation ID: `SeasonController_leaderboard`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| entries[] | true | object[] |  |
| entries[] | true | object |  |
| entries[].rank | true | number |  |
| entries[].points | true | string |  |
| entries[].entries | true | string |  |
| entries[].display_name | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/shop/catalog` — 상점 카탈로그 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_catalog`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/shop/catalog/:id/purchases` — 선택한 카탈로그 상품 구매

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_purchaseCatalogItem`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `CatalogPurchaseDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) | description="Client-generated idempotency key" |
| quantity | false | number | minimum=1; maximum=100; description="How many to buy; one when omitted" |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| purchase_id | true | string |  |
| amount | true | string |  |
| transaction_id | true | string |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/shop/cosmetics/:userId` — 사용자 장착 코스메틱 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_getCosmetics`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| userId | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| cosmetics | true | object |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/shop/holdings` — 내 보유 아이템 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_holdings`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/shop/holdings/:id/consumptions` — 보유 소모품 사용

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_consumeItem`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `ItemConsumptionDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) | description="Client-generated idempotency key" |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| catalog_id | true | string |  |
| remaining_quantity | true | null \| number |  |
| expires_at | true | null \| string (date-time) |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/shop/holdings/:id/equip` — 보유 코스메틱 장착

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_equipItem`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| success | true | boolean |  |
| catalog_id | true | string |  |
| slot | true | string |  |
| is_equipped | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/shop/holdings/:id/upkeep-settlements` — 보유 아이템 유지비 정산

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_settleUpkeep`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `UpkeepSettlementDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) | description="Client-generated idempotency key" |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| paid_amount | true | string |  |
| ledger_transaction_id | true | string |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/shop/items` — 상점 아이템 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_items`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| items[] | true | object[] |  |
| items[] | true | object |  |
| items[].itemId | true | string |  |
| items[].name | true | string |  |
| items[].description | true | string |  |
| items[].price | true | string & object |  |
| items[].createdAt | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/shop/items/:id/purchases` — 선택한 상점 아이템 구매

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_purchase`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `PurchaseDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) | description="Client-generated idempotency key" |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| purchaseId | true | string |  |
| transactionId | true | string |  |
| amount | true | string & object |  |
| replayed | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/shop/public-catalog` — 로그인 없이 공개 상점 카탈로그 조회

- 인증/권한: 공개: 로그인 불필요
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_publicCatalog`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/shop/purchases` — 내 상점 구매 기록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: holdings/purchases/관련 잔액 재조회
- Operation ID: `ShopController_purchases`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| purchases[] | true | object[] |  |
| purchases[] | true | object |  |
| purchases[].purchaseId | true | string |  |
| purchases[].itemId | true | string |  |
| purchases[].itemName | true | string |  |
| purchases[].transactionId | true | string |  |
| purchases[].amount | true | string & object |  |
| purchases[].purchasedAt | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/stocks` — 거래 가능한 주식 종목 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_list`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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
| stocks[].updated_at | true | string (date-time) |  |
| stocks[].shares_outstanding | true | string |  |
| stocks[].shares_available | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/stocks/:id/candles` — 선택 종목 OHLC 캔들 차트 데이터 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_candles`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |
| interval | query | true | string |  |
| limit | query | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/stocks/:id/orders` — 선택 종목 매수/매도 주문 생성

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_order`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `OrderDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| side | true | string | enum="buy","sell" |
| quantity | true | number | minimum=1 |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| trade_id | true | string |  |
| unit_price | true | string & object |  |
| gross_amount | true | string & object |  |
| tax_amount | true | string & object |  |
| current_price | true | string & object |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/stocks/:id/prices` — 선택 종목 가격 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_prices`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |
| limit | query | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| prices[] | true | object[] |  |
| prices[] | true | object |  |
| prices[].recorded_at | true | string (date-time) |  |
| prices[].price | true | string & object |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/stocks/:id/watchlist` — 선택 종목 관심목록 추가/변경

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_setWatchlist`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `WatchlistDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| watching | true | boolean |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| watching | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/stocks/alerts` — 내 주가 알림 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockAlertController_list`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/stocks/alerts` — 새 주가 알림 생성

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockAlertController_create`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `CreateStockAlertDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| stockId | true | string (uuid) |  |
| conditionKind | true | string | enum="price_at_or_above","price_at_or_below","day_change_at_or_above","day_change_at_or_below" |
| thresholdAmount | false | string | description="Integer WLD threshold for price conditions" |
| thresholdBps | false | number | minimum=-100000; maximum=100000 |
| cooldownSeconds | false | number | minimum=300; maximum=604800 |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| alertId | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `DELETE` `/app-api/v1/stocks/alerts/:id` — 선택한 주가 알림 삭제

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockAlertController_remove`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| deleted | true | boolean |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/stocks/alerts/events` — 발생한 주가 알림 이벤트 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockAlertController_events`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| limit | query | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/stocks/history` — 내 주식 거래 기록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_history`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/stocks/market-events` — 주식 시장 이벤트 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_marketEvents`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/stocks/portfolio` — 내 주식 보유량·평가 포트폴리오 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_portfolio`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/stocks/sparklines` — 종목별 미니 차트용 시세 데이터 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_sparklines`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| limit | query | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| series[] | true | object[] |  |
| series[] | true | object |  |
| series[].stock_id | true | string |  |
| series[].prices[] | true | string & object[] |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/stocks/watchlist` — 내 관심종목 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 종목/포트폴리오/기록 중 관련 상태 재조회
- Operation ID: `StockController_watchlist`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| stocks[] | true | object[] |  |
| stocks[] | true | object |  |
| stocks[].stock_id | true | string |  |
| stocks[].symbol | true | string |  |
| stocks[].name | true | string |  |
| stocks[].current_price | true | string & object |  |
| stocks[].day_open_price | true | string & object |  |
| stocks[].created_at | true | string (date-time) |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/support/threads` — 내 관리자 문의 목록 조회

- 인증/권한: 로그인 + 최신 동의
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 현재 화면 상태에 반영
- Operation ID: `SupportController_threads`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/support/threads` — 새 관리자 문의 생성

- 인증/권한: 로그인 + 최신 동의 + CSRF
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 문의 목록/대화를 서버에서 다시 조회
- Operation ID: `SupportController_create`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `NewThreadDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| subject | true | string | minLength=1; maxLength=120 |
| body | true | string | minLength=1; maxLength=2000 |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/support/threads/:id/messages` — 내 문의 대화 메시지 조회

- 인증/권한: 로그인 + 최신 동의
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 응답을 현재 화면 상태에 반영
- Operation ID: `SupportController_messages`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string (uuid) |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| messages[] | true | object[] |  |
| messages[] | true | object |  |
| messages[].message_id | true | string |  |
| messages[].sender_kind | true | string="user" \| string="admin" |  |
| messages[].sender_user_id | false | string |  |
| messages[].body | true | string |  |
| messages[].created_at | true | string (date-time) |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/support/threads/:id/messages` — 내 문의에 추가 메시지 전송

- 인증/권한: 로그인 + 최신 동의 + CSRF
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 문의 목록/대화를 서버에서 다시 조회
- Operation ID: `SupportController_reply`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string (uuid) |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `NewMessageDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| body | true | string | minLength=1; maxLength=2000 |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| message | true | object |  |
| message.message_id | true | string |  |
| message.sender_kind | true | string="user" \| string="admin" |  |
| message.sender_user_id | false | string |  |
| message.body | true | string |  |
| message.created_at | true | string (date-time) |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/wallet` — 내 현금/은행 잔액과 지갑 상태 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_overview`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| recent | query | true | string |  |

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/wallet/transfers` — 다른 사용자에게 WLD 송금

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: 지갑/은행 관련 GET 재조회
- Operation ID: `WalletController_transfer`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `TransferDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| recipientUserId | true | string (uuid) | description="Recipient user id" |
| amount | true | number | minimum=1; description="Amount in WLD" |
| idempotencyKey | true | string (uuid) | description="Client-generated idempotency key" |


### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| transactionId | true | string |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/work` — 근무/직업 대시보드 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_dashboard`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/work/active-job` — 현재 직업 변경

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_switchJob`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `JobSwitchDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| jobType | true | string | enum="developer","trader","entertainer","detective","miner","farmer","artisan","civil_servant" |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/work/assignments` — 근무 과제 목록 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_assignments`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
|---|---|---|---|
| assignments[] | true | unknown[] |  |

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/work/assignments` — 새 근무 과제 배정/시작

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_assign`

### 경로/쿼리 파라미터

_None._

### 요청 본문

- Content-Type: `application/json`
- DTO: `WorkAssignmentDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| taskId | true | string (uuid) |  |
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/work/assignments/:id/completions` — 근무 과제 완료 제출

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_submit`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `WorkCompletionDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |
| evidence | false | string | maxLength=1000 |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/work/assignments/:id/verify` — 근무 과제 완료 검증

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_verify`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `WorkCompletionDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |
| evidence | false | string | maxLength=1000 |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/work/profile` — 내 근무 프로필/통계 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_profile`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/work/receipts` — 근무 보상 영수증 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_receipts`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `GET` `/app-api/v1/work/tasks` — 현재 수행 가능한 근무 작업 조회

- 인증/권한: 로그인 필요(기능에 따라 최신 동의 필요)
- 성공 상태: 200
- 응답 모드: json
- 성공 후 동기화: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_tasks`

### 경로/쿼리 파라미터

_None._

### 요청 본문

_요청 본문 없음._

### 성공 응답 필드

| 필드 | 필수 | 타입 | 제약/의미 |
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

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

## `POST` `/app-api/v1/work/tasks/:id/complete` — 선택한 근무 작업 완료 처리

- 인증/권한: 로그인 + 최신 동의 + CSRF(변경 요청)
- 성공 상태: 201
- 응답 모드: json
- 성공 후 동기화: work/profile/tasks/receipts 중 관련 상태 재조회
- Operation ID: `WorkController_completeTask`

### 경로/쿼리 파라미터

| 이름 | 위치 | 필수 | 타입 | 제약 |
|---|---|---|---|---|
| id | path | true | string |  |

### 요청 본문

- Content-Type: `application/json`
- DTO: `WorkCompleteTaskDto`

| 필드 | 필수 | 타입 | 제약 |
|---|---|---|---|
| idempotencyKey | true | string (uuid) |  |


### 성공 응답 필드

_None._

> 앱에서는 camelCase 키를 우선 사용한다. 같은 객체의 legacy snake_case 키는 보존되며, 게이트웨이가 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다.

