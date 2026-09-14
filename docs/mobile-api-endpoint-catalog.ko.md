# 모바일 앱 API 전체 호출·응답 카탈로그

[English](mobile-api-endpoint-catalog.md) | **한국어** | [기계 판독 계약](mobile-api-contract.json) | [요청·응답 스키마](mobile-api-schema-reference.ko.md) | [런타임 계약](mobile-api-runtime-contract.ko.md)

업데이트 버전: **v2026.09.14.76**

이 문서는 Android/iOS/Flutter/React Native 앱 또는 다른 AI가 Moneyverse 앱을 구현할 때 **추측 없이 호출 코드를 만들 수 있도록** 작성한 실행 계약이다. 전체 앱 API 139개를 포함하며 URL, method, 인증 조건, path/query/body, 성공 상태코드, 응답 방식, write 이후 재동기화 규칙을 기록한다.

## 1. 절대 규칙

- 앱의 base URL은 `https://easy-scraping.com/app-api/v1`이다. private backend `/api/v1/*`를 직접 호출하지 않는다.
- `INTERNAL_API_TOKEN`은 서버 전용 secret이며 앱 APK/IPA, 소스, 로그, remote config에 넣지 않는다.
- 로그인 전부터 로그인 후까지 **하나의 persistent secure CookieJar**를 사용한다. `Set-Cookie`를 받은 모든 응답을 CookieJar에 반영한다.
- 상태 변경 요청 중 문서가 CSRF를 요구하면 가장 최근 `csrfToken`을 `X-CSRF-Token`에 넣는다.
- 로그인 여부는 로컬 쿠키 존재가 아니라 `GET /auth/viewer`의 `signedIn` 값으로 판정한다.
- 성공은 HTTP `2xx`만이다. `4xx/5xx`를 성공 DTO로 디코딩하거나 빈 배열/null로 바꾸지 않는다. 오류는 `application/problem+json`으로 처리한다.
- 앱 신규 모델의 JSON 이름은 **camelCase**를 기준으로 한다. 게이트웨이는 모든 JSON 객체에서 legacy snake_case를 보존하고 충돌하지 않는 camelCase 별칭을 재귀적으로 추가한다. 신규 앱은 camelCase를 읽는다.
- `null`은 의미 있는 값이다. 화면에 문자열 `null`을 표시하지 않고 필드별 placeholder를 사용한다.
- 금액·원장 카운트·bigint 성격 값이 문자열로 오면 `Double`/JS Number로 강제 변환하지 않는다. BigInt/Decimal/string-safe parser를 사용한다.
- write 성공 직후 응답만 믿고 화면을 낙관적으로 고정하지 않는다. 아래 `성공 후` 열의 authoritative GET을 다시 호출한다.

## 2. 호환성 메타 API

앱 시작 또는 진단 시 `GET /app-api/v1/meta/contract`를 호출할 수 있다. 이 요청은 private backend를 거치지 않으며 현재 API/계약 버전, base URL, CookieJar/CSRF 규칙, 오류 형식, 기능 그룹을 반환한다. 모든 앱 API 응답에는 `X-Moneyverse-Api-Version`과 `X-Moneyverse-Contract-Version`이 붙는다.

```http
GET /app-api/v1/meta/contract HTTP/1.1
Host: easy-scraping.com
Accept: application/json
Accept-Language: ko-KR,ko;q=0.9,en;q=0.8
```

계약 버전이 앱이 검증한 버전보다 새롭더라도 additive field는 무시할 수 있어야 한다. 필드 삭제/의미 변경은 새 API major 없이 하지 않는 것이 원칙이다.

## 3. 공통 HTTP 요청 형식

JSON 요청은 `Content-Type: application/json`, `Accept: application/json`을 사용한다. 이미지 업로드는 엔드포인트에 따라 raw bytes를 body로 보내며 JSON base64로 감싸지 않는다. media GET은 `Range`, `If-None-Match`, `If-Modified-Since`, `If-Range`를 사용할 수 있고 BFF가 upstream으로 전달한다. `Accept-Language`도 전달되며 기본 문서 정책은 English 1순위, Korean 2순위다.

상태 변경의 전형적인 요청:

```http
POST /app-api/v1/wallet/transfers HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json
Accept: application/json
Cookie: <CookieJar가 자동 부착>
X-CSRF-Token: <최근 csrfToken>

{"recipientUserId":"<uuid>","amount":"1000","idempotencyKey":"<uuid>"}
```

## 4. 공통 성공·오류 응답

성공 JSON은 엔드포인트별 wrapper를 그대로 유지한다. 예를 들어 게시판은 `{"posts":[]}`, 프로필은 `{"profile":...}` 및 문서화된 camelCase 별칭, 갤러리는 `{"photos":[]}`이다. wrapper를 제거하거나 임의로 `data` 아래로 옮기지 않는다.

오류 예시:

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "invalid request",
  "code": "optional_stable_code",
  "errors": ["optional field error"]
}
```

BFF 자체에서 private API 연결이 실패하면 `502 app_gateway_unavailable`, 15초 timeout이면 `504 app_gateway_timeout` problem JSON을 반환한다. `Retry-After`, `ETag`, `Content-Range`, rate-limit 헤더 등 앱 동작에 필요한 upstream 헤더도 전달한다.

## 5. 구현용 상태 머신

```text
APP START
  -> GET /auth/viewer
     -> signedIn=false: Login UI
     -> signedIn=true + consentCurrent=false: Consent UI
     -> signedIn=true + consentCurrent=true: Main UI

WRITE
  -> local validation
  -> request with CookieJar + X-CSRF-Token + idempotencyKey when required
  -> only 2xx = command accepted
  -> authoritative GET re-fetch
  -> replace local screen state

ERROR
  -> 401: viewer 재확인; 세션 만료면 로그인
  -> 403: 권한/CSRF 상태 재확인
  -> 428: 동의 화면
  -> 429: Retry-After를 존중하여 재시도
  -> 5xx/502/504: 기존 성공 데이터 보존 + 오류 상태 표시
```

## 6. 전체 엔드포인트

### account — 계정/연결 로그인
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `DELETE` | `/app-api/v1/account` | 회원 탈퇴 및 계정 삭제 | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `202` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/account/identities` | 연결된 Google/Discord 등 로그인 수단 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: identities | 응답을 화면의 서버 기준 상태로 교체 |
| `DELETE` | `/app-api/v1/account/identities/:id` | 특정 로그인 수단 연결 해제 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string* | `200` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `POST` | `/app-api/v1/account/identities/:provider/link` | Google/Discord 로그인 수단 추가 연결 시작 | 로그인 + 최신 동의 + CSRF(변경 요청) | params provider[path]:string* | `201` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/account/security/sessions` | 현재 계정의 로그인 기기/세션 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: sessions | 응답을 화면의 서버 기준 상태로 교체 |
| `DELETE` | `/app-api/v1/account/security/sessions/:id` | 선택한 로그인 세션 강제 종료 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string* | `200` | JSON 키: revoked | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `POST` | `/app-api/v1/account/security/sessions/revoke-others` | 현재 기기 제외 모든 로그인 세션 종료 | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `201` | JSON 키: revokedSessions | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### activity — 활동 텔레메트리
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `POST` | `/app-api/v1/activity/events` | 앱 활동/참여 이벤트 서버 기록 | 로그인 + 최신 동의 + CSRF(변경 요청) | body IngestActivityEventsDto (application/json) | `200` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### auth — 인증/세션
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `POST` | `/app-api/v1/auth/:provider/reauthentication` | 민감 작업 전 Google/Discord 재인증 시작 | 로그인 + 최신 동의 + CSRF(변경 요청) | params provider[path]:string* | `201` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `PUT` | `/app-api/v1/auth/consent` | 현재 약관·개인정보·연령 동의 저장 | Prelogin 또는 로그인 세션 + CSRF | body ConsentDto (application/json) | `200` | JSON 키: next | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `POST` | `/app-api/v1/auth/local/login` | 이메일/비밀번호 로그인 | 인증 흐름 전용: 상태머신 준수 | body LocalLoginDto (application/json) | `201` | JSON 키: outcome, csrfToken, consentCurrent | 새 쿠키/CSRF 저장 후 /auth/viewer 확인 |
| `POST` | `/app-api/v1/auth/local/register` | 이메일/비밀번호 회원가입 시작 | 인증 흐름 전용: 상태머신 준수 | body LocalRegisterDto (application/json) | `202` | JSON 키: accepted, verificationRequired | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `POST` | `/app-api/v1/auth/local/verify-email` | 이메일 인증 완료, 계정 활성화 및 로그인 세션 발급 | 인증 흐름 전용: 상태머신 준수 | body LocalVerifyDto (application/json) | `201` | JSON 키: outcome, csrfToken, consentCurrent | 새 쿠키/CSRF 저장 후 /auth/viewer 확인 |
| `POST` | `/app-api/v1/auth/logout` | 현재 로그인 세션 로그아웃 | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `204` | 본문 없음 | 쿠키 무효화 반영 후 로컬 사용자 상태 초기화 |
| `POST` | `/app-api/v1/auth/mobile/handoff` | 모바일 Google/Discord OAuth 1회용 code를 앱 로그인 세션으로 교환 | 인증 흐름 전용: 상태머신 준수 | body MobileHandoffDto (application/json) | `201` | JSON 키: outcome, csrfToken, consentCurrent | 새 쿠키/CSRF 저장 후 /auth/viewer 확인 |
| `GET` | `/app-api/v1/auth/policy` | 현재 약관·개인정보처리방침 버전 조회 | 공개/Prelogin에서 호출 가능 | 없음 / none | `200` | JSON 키: termsVersion, privacyVersion | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/auth/prelogin-session` | 로그인 전 임시 세션과 CSRF 토큰 생성 | 인증 흐름 전용: 상태머신 준수 | 없음 / none | `201` | JSON 키: signedIn, csrfToken | CookieJar와 csrfToken 저장 |
| `GET` | `/app-api/v1/auth/providers` | 현재 사용 가능한 로그인 방식(local/Google/Discord) 조회 | 공개/Prelogin에서 호출 가능 | 없음 / none | `200` | JSON 키: providers | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/auth/session` | 현재 로그인 세션과 최신 CSRF 상태 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: csrfToken | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/auth/viewer` | 현재 로그인 사용자 및 signedIn 상태 확인 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: signedIn, consentCurrent, adminRoles | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/auth/:provider/authorize` | Google/Discord OAuth 시작; 모바일은 client=mobile 필수 | 인증 흐름 전용: 상태머신 준수 | params provider[path]:string*, client[query]:string* | `200` | JSON 키: authorizationUrl | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/auth/:provider/callback` | OAuth provider callback 처리; 앱이 직접 호출하지 않음 | 인증 흐름 전용: 상태머신 준수 | params provider[path]:string*, state[query]:string*, code[query]:string*, error[query]:string* | `200` | JSON 키: outcome, provider, mobileHandoff, consentCurrent, csrfToken | 응답을 화면의 서버 기준 상태로 교체 |

### bank — 기본 은행/대출
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/bank/loans` | 내 대출 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: loans | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/bank/loans` | 신규 대출 실행 | 로그인 + 최신 동의 + CSRF(변경 요청) | body BorrowDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/bank/loans/:id/repayments` | 선택한 대출 상환 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body RepayDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/bank/movements` | 현금 계정과 은행 계정 사이 입금/출금 이동 | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankMovementDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |

### banking — 확장 은행/예금/채권
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `POST` | `/app-api/v1/banking/bonds/:id/redeem` | 보유 채권 상환/환매 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body IdempotentDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/bonds/purchase` | 채권 상품 구매 | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankBondPurchaseDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/borrow` | 은행 대출 실행 | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankBorrowSmartDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/claim-interest` | 예금 이자 수령 | 로그인 + 최신 동의 + CSRF(변경 요청) | body IdempotentDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/deposit` | 은행 예금 입금 | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankTransferDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/repay` | 은행 대출 상환 | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankRepayDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |
| `GET` | `/app-api/v1/banking/standing` | 은행 잔액·대출·신용 상태 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/banking/withdraw` | 은행 예금 출금 | 로그인 + 최신 동의 + CSRF(변경 요청) | body BankTransferDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |

### board — 게시판/커뮤니티
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/board/images/:key` | 게시판 이미지 파일 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | params key[path]:string* | `200` | 바이너리 응답 | 게시글/댓글 목록 또는 상세 재조회 |
| `POST` | `/app-api/v1/board/images/uploads` | 게시글 첨부 이미지 업로드 | 로그인 + 최신 동의 + CSRF(변경 요청) | body Buffer (application/json) | `201` | 바이너리 응답 | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/posts` | 게시글 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: posts | 게시글/댓글 목록 또는 상세 재조회 |
| `POST` | `/app-api/v1/board/posts` | 새 게시글 작성 | 로그인 + 최신 동의 + CSRF(변경 요청) | body CreatePostDto (application/json) | `201` | JSON 키: post | 게시글/댓글 목록 또는 상세 재조회 |
| `DELETE` | `/app-api/v1/board/posts/:id` | 게시글 삭제 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body DeletePostDto (application/json) | `204` | 본문 없음 | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/posts/:id` | 게시글 상세 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | params id[path]:string* | `200` | JSON 키: post | 게시글/댓글 목록 또는 상세 재조회 |
| `PUT` | `/app-api/v1/board/posts/:id` | 게시글 수정 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body UpdatePostDto (application/json) | `200` | JSON 키: post | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/posts/:id/comments` | 게시글 댓글 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | params id[path]:string* | `200` | JSON 키: comments | 게시글/댓글 목록 또는 상세 재조회 |
| `POST` | `/app-api/v1/board/posts/:id/comments` | 게시글 댓글 작성 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body CreateCommentDto (application/json) | `201` | JSON 키: comment | 게시글/댓글 목록 또는 상세 재조회 |
| `DELETE` | `/app-api/v1/board/posts/:id/comments/:commentId` | 게시글 댓글 삭제 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*, commentId[path]:string*; body DeleteCommentDto (application/json) | `204` | 본문 없음 | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/public/images/:key` | 로그인 없이 공개 게시판 이미지 조회 | 공개: 로그인 불필요 | params key[path]:string* | `200` | 바이너리 응답 | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/public/posts` | 로그인 없이 공개 게시글 목록 조회 | 공개: 로그인 불필요 | 없음 / none | `200` | JSON 키: posts | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/public/posts/:id` | 로그인 없이 공개 게시글 상세 조회 | 공개: 로그인 불필요 | params id[path]:string* | `200` | JSON 키: post | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/public/posts/:id/comments` | 로그인 없이 공개 게시글 댓글 조회 | 공개: 로그인 불필요 | params id[path]:string* | `200` | JSON 키: comments | 게시글/댓글 목록 또는 상세 재조회 |
| `GET` | `/app-api/v1/board/public/stock-posts` | 로그인 없이 공개 주식 게시글 조회 | 공개: 로그인 불필요 | params stock[query]:string* | `200` | JSON 키: posts | 게시글/댓글 목록 또는 상세 재조회 |
| `POST` | `/app-api/v1/board/stock-posts` | 주식 관련 게시글 작성 | 로그인 + 최신 동의 + CSRF(변경 요청) | body CreateStockPostDto (application/json) | `201` | JSON 키: post | 게시글/댓글 목록 또는 상세 재조회 |

### businesses — 사업
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/businesses` | 내 보유 사업 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: businesses | 내 사업/equity/catalog 관련 상태 재조회 |
| `POST` | `/app-api/v1/businesses/:id/boost` | 보유 사업 부스트/강화 실행 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body ApplyBoostDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 내 사업/equity/catalog 관련 상태 재조회 |
| `POST` | `/app-api/v1/businesses/:id/settle-v2` | 보유 사업 V2 정산 실행 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body IdempotentDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 내 사업/equity/catalog 관련 상태 재조회 |
| `POST` | `/app-api/v1/businesses/:id/settlements` | 보유 사업 정산 실행 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body IdempotentDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 내 사업/equity/catalog 관련 상태 재조회 |
| `POST` | `/app-api/v1/businesses/activate-license` | 사업 라이선스 활성화 | 로그인 + 최신 동의 + CSRF(변경 요청) | body ActivateLicenseDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 내 사업/equity/catalog 관련 상태 재조회 |
| `GET` | `/app-api/v1/businesses/catalog` | 사업 종류·가격·조건 카탈로그 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | 내 사업/equity/catalog 관련 상태 재조회 |
| `POST` | `/app-api/v1/businesses/catalog/:id/purchases` | 선택한 사업 종류 구매 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body IdempotentDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 내 사업/equity/catalog 관련 상태 재조회 |
| `GET` | `/app-api/v1/businesses/equity` | 사업 구매에 사용할 수 있는 자기자본 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | 내 사업/equity/catalog 관련 상태 재조회 |
| `GET` | `/app-api/v1/businesses/my-v2` | 내 사업 V2 상세 상태 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: businesses | 내 사업/equity/catalog 관련 상태 재조회 |

### casino — 카지노
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/casino/coin/fairness` | 동전게임 공정성 검증 정보 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/casino/coin/plays` | 동전 앞/뒤 게임 실행 | 로그인 + 최신 동의 + CSRF(변경 요청) | body CasinoPlayDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/casino/coin/terms` | 동전게임 배당·한도 규칙 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/casino/dice/fairness` | 주사위게임 공정성 검증 정보 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/casino/dice/plays` | 주사위 홀짝/숫자 게임 실행 | 로그인 + 최신 동의 + CSRF(변경 요청) | body CasinoDicePlayDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/casino/games/terms` | 카지노 공통 게임 규칙 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/casino/history` | 내 카지노 플레이 기록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/casino/self-limit` | 내 카지노 자기제한 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | 응답을 화면의 서버 기준 상태로 교체 |
| `PUT` | `/app-api/v1/casino/self-limit` | 일일 베팅/손실 자기제한 설정 | 로그인 + 최신 동의 + CSRF(변경 요청) | body CasinoSelfLimitDto (application/json) | `200` | JSON 키: daily_bet_limit, daily_loss_limit, locked_until | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### content — 공개 콘텐츠
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/content/announcements` | 공지사항 목록 조회 | 공개: 로그인 불필요 | 없음 / none | `200` | JSON 키: announcements | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/content/photos` | 공개 갤러리 사진 조회 | 공개: 로그인 불필요 | 없음 / none | `200` | JSON 키: photos | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/content/status` | 서비스 상태 정보 조회 | 공개: 로그인 불필요 | 없음 / none | `200` | JSON 키: status | 응답을 화면의 서버 기준 상태로 교체 |

### early-game — 초반 진행
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `POST` | `/app-api/v1/early-game/claims` | 오늘 초반 이벤트 보상 수령 | 로그인 + 최신 동의 + CSRF(변경 요청) | body EarlyEventClaimDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/early-game/first-day` | 첫날 온보딩 진행 상태 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: steps | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/early-game/today` | 오늘의 초반 진행 이벤트 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: event | 응답을 화면의 서버 기준 상태로 교체 |

### engagement — 참여/리텐션
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/engagement` | 참여/활동 진행 상태 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/engagement/early-game` | 초반 참여 목표 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: goals, collections | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/engagement/npcs/:code/orders` | NPC 주문/상호작용 실행 | 로그인 + 최신 동의 + CSRF(변경 요청) | params code[path]:string*; body EngagementNpcOrderDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `PUT` | `/app-api/v1/engagement/preferences` | 참여·알림 선호 설정 변경 | 로그인 + 최신 동의 + CSRF(변경 요청) | body EngagementPreferencesDto (application/json) | `200` | JSON 키: notifications_enabled | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### photos — 회원 갤러리 업로드
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/photos` | 갤러리 사진 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: photos | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/photos` | 업로드된 사진을 갤러리에 등록 | 로그인 + 최신 동의 + CSRF(변경 요청) | body PhotoSubmissionDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/photos/mine` | 내가 등록한 갤러리 사진 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: submissions | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/photos/uploads` | 갤러리 이미지 업로드 | 로그인 + 최신 동의 + CSRF(변경 요청) | body Buffer (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### privacy — 개인정보 요청
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/privacy/requests` | 내 개인정보 요청 목록/상태 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: requests | 개인정보 요청 목록 재조회 |
| `POST` | `/app-api/v1/privacy/requests` | 개인정보 열람·삭제 등 요청 생성 | 로그인 + 최신 동의 + CSRF(변경 요청) | body CreatePrivacyRequestDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 개인정보 요청 목록 재조회 |

### profile — 프로필
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/profile` | 내 프로필 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: displayName, imageUrl, joinedAt, jobType, jobLevel, workCompletions, visibility, featuredTitle, email, profile | 프로필 GET 재조회 후 화면 교체 |
| `PUT` | `/app-api/v1/profile` | 내 프로필 정보/공개범위 수정 | 로그인 + 최신 동의 + CSRF(변경 요청) | body ProfileUpdateDto (application/json) | `200` | JSON 키: settings | 프로필 GET 재조회 후 화면 교체 |
| `GET` | `/app-api/v1/profile/:userId` | 다른 사용자 공개 프로필 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | params userId[path]:string* | `200` | JSON 키: profile | 프로필 GET 재조회 후 화면 교체 |
| `DELETE` | `/app-api/v1/profile/image` | 프로필 이미지 삭제 | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `204` | 본문 없음 | 프로필 GET 재조회 후 화면 교체 |
| `POST` | `/app-api/v1/profile/image` | 프로필 이미지 등록 | 로그인 + 최신 동의 + CSRF(변경 요청) | body Buffer (application/json) | `201` | JSON 키: imagePath | 프로필 GET 재조회 후 화면 교체 |
| `GET` | `/app-api/v1/profile/settings` | 내 프로필 설정 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: settings | 프로필 GET 재조회 후 화면 교체 |

### progression — 성장/신용
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/progression` | 내 전체 성장/레벨 상태 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: progression | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/progression/credit` | 내 신용/성장 점수 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: grade, loans, ladder | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/progression/early-game` | 초반 성장 진행 상태 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: unlocks | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/progression/refreshes` | 성장 상태 재계산/새로고침 | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `201` | JSON 키: progression | 관련 GET을 다시 호출해 서버 상태와 동기화 |

### rewards — 보상
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/rewards/availability` | 현재 수령 가능한 보상 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/rewards/daily/claims` | 일일 보상 수령 | 로그인 + 최신 동의 + CSRF(변경 요청) | body ClaimDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `POST` | `/app-api/v1/rewards/work/claims` | 근무 보상 수령 | 로그인 + 최신 동의 + CSRF(변경 요청) | 없음 / none | `201` | JSON 직접 반환(필드 추가 허용) | work/profile/tasks/receipts 중 관련 상태 재조회 |

### seasons — 시즌
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/seasons/events` | 진행 중 시즌 이벤트 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: events | 응답을 화면의 서버 기준 상태로 교체 |
| `POST` | `/app-api/v1/seasons/events/:id/consumptions` | 시즌 이벤트 자원/아이템 소비 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body ConsumeDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 관련 GET을 다시 호출해 서버 상태와 동기화 |
| `GET` | `/app-api/v1/seasons/events/:id/leaderboard` | 시즌 이벤트 리더보드 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | params id[path]:string* | `200` | JSON 키: entries | 응답을 화면의 서버 기준 상태로 교체 |

### shop — 상점/인벤토리
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/shop/catalog` | 상점 카탈로그 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: catalogItems | holdings/purchases/관련 잔액 재조회 |
| `POST` | `/app-api/v1/shop/catalog/:id/purchases` | 선택한 카탈로그 상품 구매 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body CatalogPurchaseDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | holdings/purchases/관련 잔액 재조회 |
| `GET` | `/app-api/v1/shop/cosmetics/:userId` | 사용자 장착 코스메틱 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | params userId[path]:string* | `200` | JSON 키: cosmetics | holdings/purchases/관련 잔액 재조회 |
| `GET` | `/app-api/v1/shop/holdings` | 내 보유 아이템 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: holdings | holdings/purchases/관련 잔액 재조회 |
| `POST` | `/app-api/v1/shop/holdings/:id/consumptions` | 보유 소모품 사용 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body ItemConsumptionDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | holdings/purchases/관련 잔액 재조회 |
| `POST` | `/app-api/v1/shop/holdings/:id/equip` | 보유 코스메틱 장착 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string* | `201` | JSON 직접 반환(필드 추가 허용) | holdings/purchases/관련 잔액 재조회 |
| `POST` | `/app-api/v1/shop/holdings/:id/upkeep-settlements` | 보유 아이템 유지비 정산 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body UpkeepSettlementDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | holdings/purchases/관련 잔액 재조회 |
| `GET` | `/app-api/v1/shop/items` | 상점 아이템 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: items | holdings/purchases/관련 잔액 재조회 |
| `POST` | `/app-api/v1/shop/items/:id/purchases` | 선택한 상점 아이템 구매 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body PurchaseDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | holdings/purchases/관련 잔액 재조회 |
| `GET` | `/app-api/v1/shop/public-catalog` | 로그인 없이 공개 상점 카탈로그 조회 | 공개: 로그인 불필요 | 없음 / none | `200` | JSON 키: catalogItems | holdings/purchases/관련 잔액 재조회 |
| `GET` | `/app-api/v1/shop/purchases` | 내 상점 구매 기록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: purchases | holdings/purchases/관련 잔액 재조회 |

### stocks — 가상 주식
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/stocks` | 거래 가능한 주식 종목 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: stocks | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/:id/candles` | 선택 종목 OHLC 캔들 차트 데이터 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | params id[path]:string*, interval[query]:string*, limit[query]:string* | `200` | JSON 키: interval, candles, range | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/stocks/:id/orders` | 선택 종목 매수/매도 주문 생성 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body OrderDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/:id/prices` | 선택 종목 가격 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | params id[path]:string*, limit[query]:string* | `200` | JSON 키: prices | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/stocks/:id/watchlist` | 선택 종목 관심목록 추가/변경 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body WatchlistDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/alerts` | 내 주가 알림 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: alerts | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/stocks/alerts` | 새 주가 알림 생성 | 로그인 + 최신 동의 + CSRF(변경 요청) | body CreateStockAlertDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `DELETE` | `/app-api/v1/stocks/alerts/:id` | 선택한 주가 알림 삭제 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string* | `200` | JSON 직접 반환(필드 추가 허용) | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/alerts/events` | 발생한 주가 알림 이벤트 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | params limit[query]:string* | `200` | JSON 키: events | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/history` | 내 주식 거래 기록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: trades | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/market-events` | 주식 시장 이벤트 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: events | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/portfolio` | 내 주식 보유량·평가 포트폴리오 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: holdings | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/sparklines` | 종목별 미니 차트용 시세 데이터 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | params limit[query]:string* | `200` | JSON 키: series | 종목/포트폴리오/기록 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/stocks/watchlist` | 내 관심종목 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: stocks | 종목/포트폴리오/기록 중 관련 상태 재조회 |

### wallet — 지갑/송금
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/wallet` | 내 현금/은행 잔액과 지갑 상태 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | params recent[query]:string* | `200` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |
| `POST` | `/app-api/v1/wallet/transfers` | 다른 사용자에게 WLD 송금 | 로그인 + 최신 동의 + CSRF(변경 요청) | body TransferDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | 지갑/은행 관련 GET 재조회 |

### work — 직업/작업
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/work` | 근무/직업 대시보드 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/work/active-job` | 현재 직업 변경 | 로그인 + 최신 동의 + CSRF(변경 요청) | body JobSwitchDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/work/assignments` | 근무 과제 목록 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: assignments | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/work/assignments` | 새 근무 과제 배정/시작 | 로그인 + 최신 동의 + CSRF(변경 요청) | body WorkAssignmentDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/work/assignments/:id/completions` | 근무 과제 완료 제출 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body WorkCompletionDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/work/assignments/:id/verify` | 근무 과제 완료 검증 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body WorkCompletionDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/work/profile` | 내 근무 프로필/통계 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 직접 반환(필드 추가 허용) | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/work/receipts` | 근무 보상 영수증 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: receipts | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `GET` | `/app-api/v1/work/tasks` | 현재 수행 가능한 근무 작업 조회 | 로그인 필요(기능에 따라 최신 동의 필요) | 없음 / none | `200` | JSON 키: tasks | work/profile/tasks/receipts 중 관련 상태 재조회 |
| `POST` | `/app-api/v1/work/tasks/:id/complete` | 선택한 근무 작업 완료 처리 | 로그인 + 최신 동의 + CSRF(변경 요청) | params id[path]:string*; body WorkCompleteTaskDto (application/json) | `201` | JSON 직접 반환(필드 추가 허용) | work/profile/tasks/receipts 중 관련 상태 재조회 |

### media — 미디어 바이트
| Method | 앱 경로 | 기능 | 인증/CSRF | 요청 | 성공 | 응답 형태 | 성공 후 |
|---|---|---|---|---|---|---|---|
| `GET` | `/app-api/v1/media/:key` | 일반 미디어 파일 조회 | 공개: 로그인 불필요 | params key[path]:string* | `200` | 바이너리 응답 | 응답을 화면의 서버 기준 상태로 교체 |
| `GET` | `/app-api/v1/media/profile/:key` | 프로필 미디어 파일 조회 | 공개: 로그인 불필요 | params key[path]:string* | `200` | 바이너리 응답 | 프로필 GET 재조회 후 화면 교체 |

## 7. Request DTO catalog
아래 DTO는 실제 backend OpenAPI에서 추출한 요청 body 계약이다. `*`는 required다. 문서에 없는 임의 필드를 보내면 validation pipe의 whitelist/forbid 정책으로 400이 될 수 있으므로 보내지 않는다.

### `ActivateLicenseDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `catalogCode` | `string` | yes | example=biz_cvs_license |
| `idempotencyKey` | `string` | yes | format=uuid |

### `ApplyBoostDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `boostCode` | `string` | yes | example=biz_cvs_boost_7d |

### `BankBondPurchaseDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `bondCode` | `BOND_7D | BOND_30D` | yes | example=BOND_7D; enum=BOND_7D,BOND_30D |
| `amount` | `string` | yes | example=10000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `BankBorrowSmartDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `amount` | `string` | yes | example=5000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `BankMovementDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `direction` | `deposit | withdraw` | yes | enum=deposit,withdraw |
| `amount` | `number` | yes | min=1 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `BankRepayDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `loanId` | `string` | yes | format=uuid |
| `amount` | `string` | yes | example=1000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `BankTransferDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `amount` | `string` | yes | example=1000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `BorrowDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `principalAmount` | `number` | yes | min=1 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `Buffer`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| _(raw body)_ | bytes/object | endpoint-specific | See endpoint media type |

### `CasinoDicePlayDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |
| `game` | `dice_parity | dice_number` | yes | enum=dice_parity,dice_number |
| `choice` | `odd | even | 1 | 2 | 3 | 4 | 5 | 6` | yes | enum=odd,even,1,2,3,4,5,6 |
| `stake` | `number` | yes | min=1 |

### `CasinoPlayDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |
| `choice` | `heads | tails` | yes | enum=heads,tails |
| `stake` | `number` | yes | min=1 |

### `CasinoSelfLimitDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `dailyBetLimit` | `number` | yes | min=0 |
| `dailyLossLimit` | `number` | yes | min=0 |
| `lockedUntil` | `string` | no | format=date-time |

### `CatalogPurchaseDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid; description=Client-generated idempotency key |
| `quantity` | `number` | no | min=1; max=100; description=How many to buy; one when omitted |

### `ClaimDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `ConsentDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `termsCompleted` | `boolean` | yes | - |
| `privacyCompleted` | `boolean` | yes | - |
| `ageConfirmed` | `boolean` | yes | - |
| `termsVersion` | `string` | yes | maxLen=64 |
| `privacyVersion` | `string` | yes | maxLen=64 |

### `ConsumeDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `quantity` | `number` | yes | min=1 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `CreateCommentDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `body` | `string` | yes | maxLen=1000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `CreatePostDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `title` | `string` | yes | maxLen=120 |
| `body` | `string` | yes | maxLen=5000 |
| `idempotencyKey` | `string` | yes | format=uuid |
| `imageStorageKey` | `string` | no | pattern=^[0-9a-f-]{36}\.(png\|jpg\|webp)$ |
| `imageAltText` | `string` | no | maxLen=300 |

### `CreatePrivacyRequestDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `requestType` | `access | correction | restriction | withdrawal | deletion` | yes | enum=access,correction,restriction,withdrawal,deletion |
| `detail` | `string` | no | maxLen=2000 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `CreateStockAlertDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `stockId` | `string` | yes | format=uuid |
| `conditionKind` | `price_at_or_above | price_at_or_below | day_change_at_or_above | day_change_at_or_below` | yes | enum=price_at_or_above,price_at_or_below,day_change_at_or_above,day_change_at_or_below |
| `thresholdAmount` | `string` | no | description=Integer WLD threshold for price conditions |
| `thresholdBps` | `number` | no | min=-100000; max=100000 |
| `cooldownSeconds` | `number` | no | min=300; max=604800 |

### `CreateStockPostDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `title` | `string` | yes | maxLen=120 |
| `body` | `string` | yes | maxLen=5000 |
| `idempotencyKey` | `string` | yes | format=uuid |
| `imageStorageKey` | `string` | no | - |
| `imageAltText` | `string` | no | maxLen=300 |
| `stockSymbol` | `string` | yes | example=WDX |
| `category` | `analysis | question | journal | business | system` | yes | enum=analysis,question,journal,business,system |
| `stance` | `bullish | neutral | bearish | none` | yes | enum=bullish,neutral,bearish,none |
| `positionDisclosure` | `holder | no_position | operator_related | undisclosed` | yes | enum=holder,no_position,operator_related,undisclosed |

### `DeleteCommentDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `DeletePostDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `EarlyEventClaimDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |
| `eventDate` | `string` | yes | description=The Asia/Seoul day the screen is showing; example=2026-08-31 |

### `EngagementNpcOrderDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `EngagementPreferencesDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `notificationsEnabled` | `boolean` | yes | - |

### `IdempotentDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `IngestActivityEventsDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `events` | `array<ActivityEventItemDto>` | yes | - |

### `ItemConsumptionDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid; description=Client-generated idempotency key |

### `JobSwitchDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `jobType` | `developer | trader | entertainer | detective | miner | farmer | artisan | civil_servant` | yes | enum=developer,trader,entertainer,detective,miner,farmer,artisan,civil_servant |

### `LocalLoginDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `email` | `string` | yes | maxLen=254; example=member@example.com |
| `password` | `string` | yes | maxLen=128 |

### `LocalRegisterDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `email` | `string` | yes | maxLen=254; example=member@example.com |
| `password` | `string` | yes | maxLen=128; description=Non-empty password. No numeric minimum length is enforced. |
| `displayName` | `string` | yes | minLen=2; maxLen=120 |

### `LocalVerifyDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `token` | `string` | yes | minLen=32; maxLen=512 |

### `MobileHandoffDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `code` | `string` | yes | minLen=32; maxLen=512 |

### `OrderDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `side` | `buy | sell` | yes | enum=buy,sell |
| `quantity` | `number` | yes | min=1 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `PhotoSubmissionDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `storageKey` | `string` | yes | description=A key this server issued from POST /photos/uploads |
| `altText` | `string` | yes | maxLen=300 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `ProfileUpdateDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `visibility` | `public | members | private` | yes | enum=public,members,private |
| `displayName` | `string` | no | maxLen=80 |
| `imageUrl` | `string` | no | maxLen=2048 |
| `fieldVisibility` | `object` | no | example={'imageUrl': 'private', 'workCompletions': 'members'} |
| `featuredTitle` | `string` | no | maxLen=64 |

### `PurchaseDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid; description=Client-generated idempotency key |

### `RepayDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `amount` | `number` | yes | min=1 |
| `idempotencyKey` | `string` | yes | format=uuid |

### `TransferDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `recipientUserId` | `string` | yes | format=uuid; description=Recipient user id |
| `amount` | `number` | yes | min=1; description=Amount in WLD |
| `idempotencyKey` | `string` | yes | format=uuid; description=Client-generated idempotency key |

### `UpdatePostDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `title` | `string` | yes | maxLen=120 |
| `body` | `string` | yes | maxLen=5000 |
| `idempotencyKey` | `string` | yes | format=uuid |
| `imageStorageKey` | `string` | no | pattern=^[0-9a-f-]{36}\.(png\|jpg\|webp)$ |
| `imageAltText` | `string` | no | maxLen=300 |

### `UpkeepSettlementDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid; description=Client-generated idempotency key |

### `WatchlistDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `watching` | `boolean` | yes | - |

### `WorkAssignmentDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `taskId` | `string` | yes | format=uuid |
| `idempotencyKey` | `string` | yes | format=uuid |

### `WorkCompleteTaskDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |

### `WorkCompletionDto`

| Field | Type | Required | Constraints / notes |
|---|---|---:|---|
| `idempotencyKey` | `string` | yes | format=uuid |
| `evidence` | `string` | no | maxLen=1000 |

## 8. Response decoding rules for AI-generated clients

1. 각 endpoint 표의 `응답 형태`에 wrapper key가 있으면 정확히 그 key에서 읽는다. `posts`를 `items`, `catalogItems`를 `items`처럼 임의 치환하지 않는다.
2. `JSON 직접 반환`은 controller가 service/repository DTO를 그대로 반환하는 경우다. 기계 판독 파일 `mobile-api-contract.json`의 `operationId`와 `responseShape`를 사용하고, 모르는 additive field는 무시한다.
3. raw media는 JSON decoder를 태우지 않는다. `Content-Type`, ETag, Range/Content-Range를 보존한다.
4. 204는 JSON body가 없다. 빈 body 파싱 오류를 서버 오류로 오인하지 않는다.
5. nullable field와 요청 실패를 같은 상태로 두지 않는다. 예: `featuredTitle:null`은 성공 응답이고, 503은 데이터 획득 실패다.
6. 모든 날짜/시간은 문자열 그대로 받은 뒤 ISO-8601 parser를 사용한다. locale 문자열로 직접 파싱하지 않는다.
7. UUID path/body 필드는 opaque ID로 취급한다. ID를 사용자 표시명으로 사용하거나 순서를 추론하지 않는다.

## 9. Android/Kotlin 권장 네트워크 골격

```kotlin
interface MoneyverseApi {
    @GET("auth/viewer") suspend fun viewer(): ViewerResponse
    @GET("profile") suspend fun myProfile(): MyProfileResponse
    @GET("board/posts") suspend fun posts(): PostsResponse
}

// OkHttpClient에는 앱 전체에서 하나의 persistent CookieJar를 연결한다.
// write interceptor는 현재 csrfToken이 있는 경우 X-CSRF-Token을 붙인다.
// HTTP !isSuccessful이면 success DTO를 decode하지 말고 ProblemDocument를 decode한다.
```

## 10. 앱 생성 AI용 체크리스트

- 먼저 `mobile-api-contract.json`을 읽어 endpoint/method/DTO를 생성한다.
- 인증 코드는 `mobile-api-runtime-contract.ko.md`의 상태머신을 구현한다.
- 화면별로 필요한 GET을 명시하고, write마다 authoritative re-fetch를 연결한다.
- nullable UI placeholder를 디자인 단계에서 정의한다.
- idempotencyKey는 command 시점에 새 UUID를 만들고 **동일 logical retry에는 같은 UUID를 재사용**한다. 새 UUID로 자동 재시도하면 중복 실행 보호를 잃는다.
- 429는 `Retry-After`가 있으면 그 시간을 우선한다.
- OAuth handoff code, session cookie, csrfToken, password, internal token은 로그/analytics/crash report에 남기지 않는다.
