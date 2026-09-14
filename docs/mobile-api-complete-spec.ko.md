# 월덕 머니버스 모바일 앱 전체 API 통합 구현 명세서

> 버전: v2026.09.14.2
> 기준일: 2026-09-14
> 운영 기본 주소: `https://easy-scraping.com`
> 앱 API 기준 prefix: `/app-api/v1`
> 대상: Android/iOS 네이티브 앱, Gemini 등 코드 생성 도구, 앱 심사/QA 담당자
> 영문 기준 문서: [mobile-api-complete-spec.md](mobile-api-complete-spec.md)

## 0. 이 문서만 따라야 하는 이유

이 파일은 모바일 앱이 사용해야 하는 API 계약을 한 곳에 통합한 기준 문서다. 앱은 웹 페이지 URL이나 비공개 NestJS 주소를 추측해서 호출하지 않는다. 일반 사용자 기능은 반드시 `https://easy-scraping.com/app-api/v1/*` BFF를 통해 호출한다.

아래 규칙은 선택사항이 아니다.

1. 앱 번들에 `INTERNAL_API_TOKEN`, DB 비밀번호, OAuth client secret, SMTP secret을 넣지 않는다.
2. 모든 Moneyverse HTTP 요청은 하나의 영속 CookieJar를 공유한다.
3. 로그인 성공 여부는 마지막에 `/auth/viewer`의 `signedIn:true`로 확인한다.
4. POST/PUT/PATCH/DELETE 중 서버가 CSRF를 요구하는 요청은 현재 `x-csrf-token`을 보낸다.
5. Google/Discord 네이티브 로그인에는 반드시 `?client=mobile`을 붙인다.
6. OAuth 외부 브라우저 사용은 정상이다. 인증 완료 후 `woldeok-moneyverse://oauth/callback`으로 앱이 다시 열려야 한다.
7. 관리자·worker·Discord webhook·DB 직접 접근은 일반 앱에서 금지한다.
8. `401/403/409/422/429/5xx`를 모두 같은 오류로 처리하지 않는다.

## 1. 전체 아키텍처와 요청 흐름

정상 경로는 다음 하나다.

`앱 화면 -> HTTPS BFF(/app-api/v1) -> Next.js server -> INTERNAL_API_TOKEN 부착 -> 비공개 NestJS -> PostgreSQL`

앱은 BFF 뒤의 실제 backend origin을 몰라도 된다. BFF가 허용된 일반 사용자 route만 전달한다. 따라서 앱 개발자가 `/api/v1/*` backend 주소를 직접 조합하거나 `x-internal-token`을 만들면 안 된다.

읽기 요청은 서버 상태를 그대로 화면 state로 반영한다. 쓰기 요청은 서버 응답 성공 후에만 로컬 UI state를 확정한다. 경제/재화/정산/주문 같은 기능에서 optimistic balance 계산을 하지 않는다. 서버가 원장과 DB invariant의 최종 권한이다.

## 2. 앱 공통 HTTP 클라이언트 규칙

- Base URL: `https://easy-scraping.com`
- JSON: `Content-Type: application/json`
- Timeout: 연결/응답 실패를 무한 대기하지 말고 앱 레벨 timeout을 둔다.
- Redirect: 일반 API JSON 요청은 임의 redirect를 따라 로그인 성공으로 간주하지 않는다. OAuth에서만 반환된 `authorizationUrl`을 브라우저로 연다.
- CookieJar: `Set-Cookie`를 자동 저장하고 같은 host 요청에 자동 전송한다.
- 인증 쿠키 이름은 구현 세부사항으로 하드코딩하지 않는 것이 좋지만 현재 운영 Secure 쿠키는 `__Host-mv_session`이다. locale/analytics 쿠키를 세션 쿠키로 착각하지 않는다.
- CSRF: 응답 JSON의 `csrfToken`을 메모리/보안 저장소에 보관하고 새 값이 오면 교체한다.
- 로그 금지: password, session cookie, CSRF, email verification token, OAuth handoff code, provider code/state를 로그/Crashlytics/analytics에 넣지 않는다.

### 권장 앱 공통 상태

```text
AuthState = SignedOut | Prelogin | OAuthBrowser | HandoffPending | SignedIn | ConsentRequired
SessionStore = { cookieJar, csrfToken?, viewer?, consentCurrent? }
```

앱 재시작 후에는 쿠키가 남아 있더라도 `/auth/viewer`를 다시 호출해 서버 세션이 살아 있는지 확인한다.

## 3. 자체 이메일 회원가입 상태머신

정확한 순서:

`prelogin -> policy -> consent -> local/register -> 이메일 인증 -> local/verify-email -> viewer`

### 3.1 Prelogin

`POST /app-api/v1/auth/prelogin-session`

목적: 아직 로그인하지 않은 사용자를 위한 서버 세션과 CSRF를 만든다. 앱은 응답 쿠키와 `csrfToken`을 둘 다 저장한다.

### 3.2 현재 약관

`GET /app-api/v1/auth/policy`

서버가 반환한 최신 `termsVersion`, `privacyVersion`을 사용한다. 앱에 버전을 하드코딩하지 않는다.

### 3.3 동의 저장

`PUT /app-api/v1/auth/consent` + prelogin cookie + `x-csrf-token`

```json
{"termsCompleted":true,"privacyCompleted":true,"ageConfirmed":true,"termsVersion":"<server>","privacyVersion":"<server>"}
```

필수 동의가 없으면 회원가입 또는 일부 쓰기 기능은 403이 될 수 있다.

### 3.4 회원가입 시작

`POST /app-api/v1/auth/local/register`

```json
{"email":"member@example.com","password":"user password","displayName":"Member"}
```

현재 비밀번호 계약: 빈 문자열 금지, 최대 128 code point, 명백한 common password 거부 가능. 운영은 verification token을 JSON으로 노출하지 않고 인증메일을 보낸다. 성공은 보통 `202`와 `verificationRequired:true`다.

### 3.5 이메일 인증 완료

`POST /app-api/v1/auth/local/verify-email`에 같은 prelogin cookie/CSRF를 유지하고 `{"token":"..."}` 전송. 성공하면 새 로그인 쿠키와 새 CSRF가 발급된다. 이후 반드시 viewer 확인.

## 4. 자체 이메일 로그인

정확한 순서:

`prelogin -> local/login -> viewer`

1. `POST /auth/prelogin-session`
2. `POST /auth/local/login` + cookie + CSRF + email/password
3. 응답 Set-Cookie와 csrfToken 저장
4. `GET /auth/viewer`
5. `signedIn:true`일 때만 앱 메인 진입

없는 이메일과 틀린 비밀번호는 같은 계열의 401로 취급한다. 앱이 “존재하지 않는 이메일”과 “비밀번호 오류”를 구분해 계정 존재 여부를 누설하지 않는다.

## 5. Google/Discord 네이티브 OAuth — 가장 중요한 구현

### 5.1 절대 사용하면 안 되는 시작점

네이티브 앱에서 다음은 잘못된 방식이다.

- `/app-api/v1/auth/google/authorize` (`client=mobile` 없음)
- `/app-api/v1/auth/discord/authorize` (`client=mobile` 없음)
- `/auth/google/authorize`를 앱이 직접 호출
- `/auth/discord/authorize`를 앱이 직접 호출

`client=mobile`이 없으면 **웹 로그인 흐름**으로 처리되어 마지막에 사이트로 이동하는 것이 정상이다.

### 5.2 올바른 시작점

- `GET /app-api/v1/auth/google/authorize?client=mobile`
- `GET /app-api/v1/auth/discord/authorize?client=mobile`

응답 예:

```json
{"authorizationUrl":"https://easy-scraping.com/auth/google/authorize?client=mobile"}
```

앱은 이 `authorizationUrl`을 시스템 브라우저 또는 Custom Tab으로 연다. Google/Discord 인증 화면을 앱 WebView에 억지로 임베드하거나 provider 비밀번호를 앱에서 직접 받지 않는다.

### 5.3 서버 내부 OAuth 로직

브라우저 시작 URL은 prelogin browser session을 만든 뒤 provider authorize로 307 이동한다. backend는 state, PKCE verifier, nonce/provider 검증을 수행한다. provider callback이 성공하면 사용자 identity를 찾거나 생성하고 로그인 결과를 만든다.

모바일 challenge라면 브라우저 로그인 session token을 앱에 넘기지 않는다. 대신 해당 browser session을 폐기하고 5분 유효·1회용 opaque handoff code를 만든다. DB에는 원문 code가 아니라 SHA-256 hash만 저장한다.

### 5.4 앱 복귀 URI

서버는 성공 후 다음 URI를 연다.

`woldeok-moneyverse://oauth/callback?code=<opaque>&provider=google`

또는 provider=discord.

Android Manifest에는 scheme=`woldeok-moneyverse`, host=`oauth`, path=`/callback`, VIEW/DEFAULT/BROWSABLE intent-filter가 정확히 등록되어야 한다. 이 등록이 없으면 서버가 아무리 정상이어도 브라우저에서 앱으로 복귀할 수 없다.

### 5.5 handoff 교환

앱이 deep link에서 `code`를 받으면 즉시:

`POST /app-api/v1/auth/mobile/handoff`

```json
{"code":"<opaque>"}
```

성공 시 앱 전용 새 Moneyverse session cookie + `csrfToken` + `consentCurrent`가 나온다. 이 쿠키를 CookieJar에 저장한 뒤 `/auth/viewer`를 호출한다. handoff는 재사용 금지이며 두 번째 사용/만료/변조는 401이다.

### 5.6 OAuth 성공 판정

provider 페이지가 성공했다고 앱 로그인 완료로 처리하지 않는다. deep link 수신도 완료가 아니다. handoff POST도 마지막 조건이 아니다. **최종 완료 조건은 `/app-api/v1/auth/viewer`가 `signedIn:true`를 반환하는 것**이다.

## 6. 인증 후 공통 API 패턴

`GET /app-api/v1/auth/session`은 로그인 세션의 최신 CSRF를 회전/발급한다. 쓰기 요청 전에 CSRF가 없거나 오래됐으면 호출한다.

`POST /app-api/v1/auth/logout` 성공 후 앱은 서버 쿠키 무효화를 적용하고 로컬 auth state를 SignedOut으로 바꾼다.

계정 identity 연결/재인증은 현재 로그인 session + current consent + CSRF가 필요할 수 있다. 보안 민감 기능은 일반 로그인만으로 충분하다고 가정하지 않는다.

## 7. HTTP 상태 코드와 앱 처리

| 코드 | 의미/처리 |
|---|---|
| 200/201/202 | 정상. JSON/Set-Cookie/CSRF 반영 |
| 204 | 성공, body 없음. 로컬 state 갱신 |
| 400 | 잘못된 요청/상태. 입력 또는 흐름 재검토 |
| 401 | 미로그인/credential 실패/만료/handoff 실패. 필요 시 로그인 재시작 |
| 403 | CSRF, 동의, 권한, 현재 상태 부족 |
| 404 | 앱 route 오타 또는 미구현. 출시 앱에서 조용히 무시하지 말 것 |
| 409 | 동시성/상태/버전 충돌. 서버 상태 재조회 후 판단 |
| 422 | DTO validation 오류. 필드 입력 수정 |
| 429 | rate limit. 즉시 반복 호출 금지 |
| 5xx | 서버 장애. 내부 메시지 노출 금지, 재시도 UI 제공 |

## 8. 화면별 데이터 로딩 원칙

각 화면 진입 시 필요한 GET을 호출하고 skeleton/loading/error/empty/success 상태를 분리한다. 서버 응답이 성공하기 전에 잔액, 주식 보유량, 사업 정산액, 아이템 보유량 등을 임의로 증가시키지 않는다. 쓰기 후에는 성공 응답 또는 관련 GET 재조회로 서버 상태를 다시 동기화한다.

## 9. 지갑/송금

- `GET /wallet`: 현재 지갑/원장 기반 상태 조회
- `POST /wallet/transfers`: 사용자 간 송금

송금은 recipient/amount를 서버에 보내고 성공 후 wallet을 재조회한다. 앱이 잔액을 직접 차감해 확정하지 않는다. 409/422/403을 구분한다.

## 10. 은행/대출/채권

은행은 `/bank/*`와 `/banking/*` 두 계열이 존재한다. movement, loan, deposit/withdraw, borrow/repay, interest claim, bond purchase/redeem, standing 조회를 서버 계약대로 사용한다. 동일 버튼 연타로 중복 요청하지 않도록 UI pending lock을 둔다.

## 11. 주식

조회: stocks, prices, candles, sparklines, portfolio, history, watchlist, market-events, alerts.

쓰기: `{stockId}/orders`, watchlist, alerts 생성/삭제. 주문 완료 후 portfolio/history/stock 상태를 서버에서 재조회한다. 앱은 체결 가격을 클라이언트에서 결정하지 않는다.

## 12. 사업

사업 catalog/equity를 조회한 뒤 purchase를 호출한다. 보유 사업은 `/businesses`, `/businesses/my-v2`로 확인한다. settlement/settle-v2/boost/license activation은 서버 DB 함수가 소유권·날짜·중복/멱등 규칙을 최종 판단한다. 앱은 하루 정산 가능 여부를 임의 계산하지 않는다.

## 13. 근무/직업/성장/보상

`/work`, `/work/profile`, assignments/tasks/receipts, active-job, completion/verify를 사용한다. 보상은 availability 조회 후 daily/work claim을 호출한다. progression/credit/early-game은 읽기 모델이고 refreshes는 서버 기준 갱신 명령이다. claim 버튼은 요청 중 비활성화해 중복 제출을 막는다.

## 14. 상점/아이템

public-catalog는 로그인 전에도 앱 연결 확인에 유용하다. 로그인 후 catalog/items/holdings/purchases/cosmetics를 사용한다. 구매/consume/equip/upkeep는 쓰기 API 성공 후 holdings/purchases를 재조회한다.

## 15. 시즌/이벤트

이벤트 목록 -> 상세 UI -> consumption -> leaderboard 순으로 구성할 수 있다. leaderboard는 서버 정렬 결과를 사용한다. 이벤트 종료/조건 미충족은 409/403 계열로 처리할 수 있으므로 클라이언트 시간을 권한으로 사용하지 않는다.

## 16. 카지노/미니게임

coin/dice terms와 fairness를 먼저 조회할 수 있다. play는 서버 권한형 결과를 사용한다. self-limit GET/PUT과 history를 제공한다. 앱에서 결과 RNG나 payout을 계산해 확정하지 않는다.

## 17. 게시판

public posts/comments/stock-posts는 공개 읽기. 로그인 게시글은 create/update/delete/comment create/delete를 사용한다. 이미지 업로드는 먼저 `/board/images/uploads`에 실제 이미지 bytes를 보내고 서버가 준 key/metadata를 게시물 payload에 연결한다.

## 18. 프로필/이미지

`GET/PUT /profile`, public `/profile/:userId`, settings를 사용한다. 프로필 이미지는 POST/DELETE `/profile/image`. 이미지 bytes/content-type 제한은 서버 검증을 따른다. base64 JSON으로 임의 변환하지 않는다.

## 19. 갤러리/사진/미디어

사진 등록은 upload -> storage key -> metadata create의 2단계다. `/photos/uploads` 후 `/photos`. `/photos/mine`은 내 사진. 실제 미디어 읽기는 `/media/*` BFF를 사용하며 private backend `/media/*`를 직접 호출하지 않는다.

## 20. 개인정보/계정 lifecycle

`GET/POST /privacy/requests`로 개인정보 요청 상태/신청을 처리한다. `DELETE /account`는 계정 lifecycle의 고위험 작업이므로 현재 session/CSRF/필요한 재인증 조건을 서버 응답대로 따른다. 앱 심사에서 개인정보처리방침과 계정 삭제 진입점을 숨기지 않는다.

## 21. 공지/상태/공개 콘텐츠

`/content/announcements`, `/content/photos`, `/content/status`, `/shop/public-catalog`은 로그인 전 상태 점검/공개 화면에 사용할 수 있다. 앱 시작 시 모든 기능을 한꺼번에 호출하지 말고 화면별로 필요한 것만 요청한다.

## 22. 이미지 업로드 공통 구현

1. 사용자가 파일 선택
2. MIME/크기 사전 검사
3. bytes 그대로 upload endpoint로 POST
4. 서버 응답 storage key 보관
5. 해당 resource create/update API에 key 전달
6. 실패 시 orphan cleanup 정책은 서버 계약을 따름

서버가 허용하지 않은 파일 확장자/MIME을 우회하지 않는다.

## 23. 재시도/중복 제출/동시성

GET은 네트워크 오류에서 제한적으로 재시도할 수 있다. 경제 write/구매/주문/정산/claim/play는 무조건 자동 재시도하지 않는다. 응답 유실 가능성이 있으면 먼저 관련 상태/receipt/history를 재조회한다. 서버의 idempotency/ownership invariant를 클라이언트가 대체하지 않는다.

## 24. 앱 시작 권장 순서

```text
App launch
 -> load CookieJar
 -> GET /auth/viewer
 -> signedIn ? authenticated shell : signed-out shell
 -> signedIn이면 필요 시 GET /auth/session for fresh CSRF
 -> 각 탭 진입 시 해당 feature GET
```

viewer가 401이거나 signedIn=false면 쿠키를 로그인 증거로 믿지 않는다.

## 25. Gemini/코드 생성 AI에 반드시 주는 구현 지시

다음 문장을 그대로 지시문에 포함한다.

> Moneyverse 앱은 오직 `https://easy-scraping.com/app-api/v1/*`를 사용한다. 하나의 persistent secure CookieJar와 CSRF store를 사용한다. Google/Discord native OAuth는 `GET /auth/{provider}/authorize?client=mobile`의 BFF 응답 `authorizationUrl`을 외부 브라우저로 열고, `woldeok-moneyverse://oauth/callback?code=...`을 Android deep link로 받은 뒤 `POST /auth/mobile/handoff`, 이후 `/auth/viewer`의 `signedIn:true`까지 확인한다. provider callback을 직접 구현하거나 private backend/internal token을 앱에 넣지 않는다. 모든 경제 write는 서버 성공 후 다시 서버 state를 동기화한다.

## 26. 앱에서 의도적으로 사용하지 않는 API

- `/api/v1/admin/*`
- `/api/v1/integrations/discord/*`
- `/health`
- scheduler/worker/control-plane route
- DB 직접 연결
- private backend origin

이 경로가 앱 API에 없는 것은 누락이 아니라 보안 설계다.

## 27. 출시/Google Play 심사 QA 체크리스트

1. 운영 `/api/version`이 현재 릴리스 SHA인지 확인
2. `/shop/public-catalog` 200 확인
3. local 회원가입: prelogin-policy-consent-register-email verify-viewer 전체 확인
4. 심사용 local 계정 login -> viewer signedIn true 확인
5. Google mobile OAuth가 provider로 이동하고 완료 후 앱 deep link로 돌아오는지 실기기 확인
6. Discord도 동일 확인
7. handoff 재사용이 401인지 확인
8. 로그인 후 wallet/profile 등 최소 핵심 GET 확인
9. 주요 쓰기 기능에서 CSRF/중복 버튼 처리 확인
10. 이미지 업로드/표시 확인
11. 개인정보처리방침/약관/계정삭제 진입점 확인
12. 앱 화면의 모든 버튼에서 404/5xx 없는지 확인
13. planned 기능을 죽은 버튼으로 노출하지 않음
14. 앱 번들에 secret/internal token 없음


## 28. 주요 쓰기 API 요청 body 계약 — 추측 금지

아래는 실제 backend DTO 기준이다. JSON number와 string을 임의로 서로 바꾸지 않는다. 전역 implicit conversion이 꺼져 있어 `"1000"`과 `1000`은 서로 다른 입력이다.

### 28.1 지갑 송금

`POST /wallet/transfers`
```json
{"recipientUserId":"<uuid>","amount":1000,"idempotencyKey":"<uuid>"}
```
`amount`는 positive integer **number**다. `idempotencyKey`는 클라이언트가 요청마다 생성하는 UUID다.

### 28.2 기본 bank movement

`POST /bank/movements`
```json
{"direction":"deposit","amount":1000,"idempotencyKey":"<uuid>"}
```
`direction`은 `deposit|withdraw`, amount는 number다.

### 28.3 banking 계열 큰 정수 금액

`/banking/deposit`, `/banking/withdraw`, `/banking/borrow`, `/banking/repay`, bond purchase 등은 DTO에 따라 금액을 **positive integer string**으로 받는다. 예: `{"amount":"1000","idempotencyKey":"<uuid>"}`. repay는 `loanId`도 필요할 수 있다. 앱 공통 serializer가 숫자로 강제 변환하지 않는다.

채권 구매 예:
```json
{"bondCode":"BOND_7D","amount":"10000","idempotencyKey":"<uuid>"}
```
지원 bondCode는 현재 `BOND_7D|BOND_30D`.

### 28.4 상점

일반 purchase/consume/upkeep 명령은 최소 `idempotencyKey` UUID를 받는다. catalog 구매는 선택적 `quantity` number(1~100)를 추가한다. 가격은 절대 앱에서 body로 보내지 않는다. 서버가 transaction 안에서 catalog 가격을 읽는다.

```json
{"idempotencyKey":"<uuid>","quantity":2}
```

### 28.5 근무

assignment 생성:
```json
{"taskId":"<uuid>","idempotencyKey":"<uuid>"}
```
완료:
```json
{"idempotencyKey":"<uuid>","evidence":"optional, max 1000 chars"}
```
직업 변경 jobType은 `developer|trader|entertainer|detective|miner|farmer|artisan|civil_servant`.

### 28.6 카지노

coin play:
```json
{"idempotencyKey":"<uuid>","choice":"heads","stake":100}
```
choice=`heads|tails`, stake=positive integer number.

dice play:
```json
{"idempotencyKey":"<uuid>","game":"dice_parity","choice":"odd","stake":100}
```
`game=dice_parity|dice_number`; choice는 odd/even 또는 1~6 문자열이며 서버가 game-choice 조합을 검증한다.

self limit:
```json
{"dailyBetLimit":0,"dailyLossLimit":0,"lockedUntil":"2026-09-20T00:00:00+09:00"}
```
0은 무제한 sentinel이고 lockedUntil은 선택 ISO8601이다.

### 28.7 프로필 PUT은 PATCH가 아니다

`PUT /profile`은 replacement 성격이다. 생략 필드가 NULL로 저장될 수 있으므로 기존 값을 유지하고 싶다면 화면 state의 현재 값을 포함해 보낸다. 주요 필드: `visibility`, optional `displayName`, `imageUrl`, `fieldVisibility`, `featuredTitle`.

### 28.8 Early-game claim

```json
{"idempotencyKey":"<uuid>","eventDate":"2026-09-13"}
```
`eventDate`는 앱이 오늘 날짜를 임의 계산하는 값이 아니라 **read model에서 받은 Asia/Seoul 날짜**를 그대로 되돌려 보낸다. 자정 넘긴 stale 화면을 서버가 거부할 수 있게 하기 위함이다.

### 28.9 engagement

진행 이벤트는 `idempotencyKey`와 optional `amount` number(1~1000). NPC order는 idempotencyKey. preferences는 `{"notificationsEnabled":true|false}`로 명시적으로 보낸다.

## 29. idempotencyKey 생성/재시도 규칙

UUID v4 등 충돌 가능성이 충분히 낮은 UUID를 **사용자 의도 1회당 하나** 생성한다. 네트워크 timeout 후 같은 의도를 안전하게 재시도해야 하는 endpoint는 동일 key를 유지하고, 사용자가 새 행동을 명시적으로 시작하면 새 key를 만든다. 단, endpoint별 멱등 계약을 모른 채 모든 POST를 자동 재전송하지 않는다. 먼저 history/receipt/current state를 조회할 수 있으면 상태를 확인한다.

## 30. 운영 OpenAPI에 의존하지 말 것

NestJS는 개발 환경에서 DTO 기반 OpenAPI를 만들지만 production에서는 의도적으로 Swagger를 mount하지 않는다. 앱은 production Swagger URL을 발견/추측하려 하지 않는다. 이 통합 문서와 저장소의 DTO/controller가 계약의 근거이며, 앱은 private internal API schema를 런타임 discovery하지 않는다.

## API 경로표를 읽는 방법

아래 표는 이제 단순 경로 목록이 아니라 **앱 기능 사전**이다. `기능` 열을 먼저 보고 해당 API가 어떤 화면/버튼의 동작인지 확인한 다음 호출한다. `인증/CSRF` 열은 호출 전에 갖춰야 하는 상태다.

- `GET`: 화면 진입/새로고침 때 서버의 최신 상태를 읽는다.
- `POST/PUT/DELETE`: 서버 상태를 변경한다. 연속 탭을 막고 CSRF 및 `idempotencyKey` 규칙을 지킨다.
- 잔액·주식·사업·보상·상점·카지노 등 경제 write는 성공 후 관련 GET을 다시 호출해 UI를 서버 상태와 동기화한다.
- `401`은 로그인/세션 문제, `403`은 동의·CSRF·권한 문제, `422`는 요청 body 타입/필드 문제, `404`는 앱 경로 구현 오류로 취급한다.


## 31. 구현자가 그대로 따라야 하는 공통 HTTP 클라이언트 규칙

### 31.1 단 하나의 API origin

앱의 Moneyverse API base URL은 운영에서 반드시 `https://easy-scraping.com` 하나다. 모든 일반 사용자 API는 `/app-api/v1` 아래로 호출한다. 앱에서 `/api/*`, 내부 NestJS 주소, 컨테이너 주소, IP 주소를 조합하지 않는다.

권장 구조:

```text
MoneyverseApiClient
  baseUrl = https://easy-scraping.com
  cookieJar = persistent + secure
  csrfStore = memory + encrypted persistence if needed
  timeout = bounded
  retryPolicy = read-only GET만 제한적 자동 재시도
```

### 31.2 CookieJar는 기능별로 나누지 않는다

회원가입, 로그인, OAuth handoff, 지갑, 주식, 게시판 등 모든 Moneyverse 요청은 **같은 CookieJar**를 사용한다. prelogin에서 받은 쿠키와 로그인 후 교체된 쿠키를 같은 jar가 처리해야 한다. 앱 코드가 `Cookie` 헤더를 문자열로 직접 조립하지 않는다.

서버가 `Set-Cookie`를 반환하면 HTTP 라이브러리의 CookieJar가 즉시 반영해야 한다. `__Host-mv_session` 같은 HttpOnly 쿠키는 앱 비즈니스 로직에서 읽거나 localStorage류에 복사하지 않는다.

### 31.3 CSRF 토큰 생명주기

1. `POST /app-api/v1/auth/prelogin-session`의 JSON 응답에서 `csrfToken` 저장.
2. prelogin 상태의 `PUT /auth/consent`, `POST /auth/local/register`, `POST /auth/local/login`, `POST /auth/local/verify-email` 등에 현재 토큰 사용.
3. 로그인/인증 완료 응답에서 새 `csrfToken`이 오면 즉시 교체.
4. 로그인 후 값이 불확실하면 `GET /app-api/v1/auth/session`으로 최신 상태 확인.
5. 403이 CSRF 문제로 보이면 동일 write를 무한 재시도하지 말고 세션 상태를 다시 조회한 뒤 사용자가 의도한 동작을 다시 수행하도록 한다.

변경 요청 기본 헤더:

```http
Content-Type: application/json
x-csrf-token: <현재 csrfToken>
Cookie: <CookieJar가 자동 전송>
```

### 31.4 idempotencyKey 규칙

경제/보상/구매/게시물 등 idempotencyKey를 받는 API는 **사용자 동작 1회마다 UUID v4 하나**를 생성한다. 네트워크 결과가 불명확한 경우 같은 사용자 동작을 재전송할 때는 같은 키를 사용한다. 사용자가 새로 버튼을 눌러 새로운 거래를 시작한 경우에만 새 UUID를 만든다.

잘못된 구현:

```text
재시도마다 UUID 새 생성 -> 서버에서 중복 결제/중복 작업으로 해석될 수 있음
```

올바른 구현:

```text
사용자 1회 동작 -> UUID A 생성 -> timeout -> 같은 UUID A로 상태 확인/안전 재시도
새 사용자 동작 -> UUID B
```

### 31.5 자동 재시도 정책

- GET: 네트워크 단절/일시적 5xx에 한해 짧은 backoff로 제한적 재시도 가능.
- POST/PUT/PATCH/DELETE: 임의 자동 재시도 금지. idempotencyKey가 있고 결과가 불명확한 경우에만 동일 키로 안전성을 고려해 재시도.
- 401: 로그인 상태 재확인. 무한 재시도 금지.
- 403: CSRF/동의/권한 원인을 해결한 뒤 다시 수행.
- 409: 서버 최신 상태 재조회 후 UI 갱신.
- 422: 앱 payload 버그 또는 사용자 입력 오류. 같은 body 자동 재전송 금지.
- 429: `Retry-After`가 있으면 존중하고 즉시 반복 호출하지 않는다.

## 32. 앱 시작부터 화면 표시까지 정확한 상태머신

앱 프로세스 시작 시 다음 순서를 사용한다.

```text
APP_START
  -> CookieJar 복원
  -> GET /app-api/v1/auth/viewer
      -> signedIn=true  -> SIGNED_IN
      -> signedIn=false -> SIGNED_OUT
      -> 401            -> SIGNED_OUT
      -> 5xx/network    -> UNKNOWN_OFFLINE (로그아웃으로 단정하지 않음)
```

`SIGNED_IN`이면 필요한 화면의 GET만 호출한다. 예를 들어 홈 화면에서 지갑/진행도/공지사항이 필요하다면 각각 서버에서 읽는다. 이전 로컬 캐시는 로딩 placeholder 용도로만 사용할 수 있고 서버 성공을 대신하지 않는다.

앱이 백그라운드에서 오래 있다가 복귀했거나 write 전에 세션 유효성이 중요하면 `/auth/viewer` 또는 `/auth/session`을 다시 확인한다.

## 33. 자체 회원가입 구현 — 실제 요청 순서

### 33.1 prelogin 생성

```http
POST /app-api/v1/auth/prelogin-session
Content-Type: application/json

{}
```

성공 조건: 201 계열 + CookieJar에 세션 쿠키 저장 + JSON `csrfToken` 존재.

### 33.2 약관 버전 조회

```http
GET /app-api/v1/auth/policy
```

앱은 `termsVersion`, `privacyVersion`을 서버 응답에서 읽어야 한다. 앱에 버전 문자열을 하드코딩하지 않는다.

### 33.3 약관 동의 저장

```json
{
  "termsCompleted": true,
  "privacyCompleted": true,
  "ageConfirmed": true,
  "termsVersion": "<policy 응답>",
  "privacyVersion": "<policy 응답>"
}
```

호출: `PUT /app-api/v1/auth/consent`, 같은 prelogin CookieJar + `x-csrf-token`.

### 33.4 가입 시작

```http
POST /app-api/v1/auth/local/register
```

```json
{
  "email": "member@example.com",
  "password": "사용자가 입력한 비밀번호",
  "displayName": "표시 이름"
}
```

운영 성공 응답은 인증 메일이 필요하다는 상태만 돌려주며 원문 verification token을 앱에 주지 않는다. 앱은 인증메일 확인 화면으로 이동한다.

### 33.5 이메일 인증

인증 링크/화면에서 확보한 token을 **가입을 시작했던 같은 prelogin 세션**과 함께 보낸다.

```http
POST /app-api/v1/auth/local/verify-email
x-csrf-token: <prelogin csrf>
```

```json
{"token":"<verification token>"}
```

성공 시 새 로그인 쿠키와 새 CSRF를 저장하고 즉시 `GET /auth/viewer`를 호출한다. `signedIn:true`가 확인되기 전까지 앱 내부 로그인 완료 화면으로 이동하지 않는다.

## 34. 이메일/비밀번호 로그인 구현

```text
로그인 버튼
 -> POST /auth/prelogin-session
 -> CookieJar + csrf 확보
 -> POST /auth/local/login
 -> 새 Set-Cookie + csrf 저장
 -> GET /auth/viewer
 -> signedIn=true일 때 홈 화면
```

로그인 body:

```json
{
  "email": "member@example.com",
  "password": "사용자가 입력한 비밀번호"
}
```

401에서는 “이메일이 존재하지 않음”과 “비밀번호 틀림”을 앱에서 구분해 표시하지 않는다. 서버의 일반 인증 실패 메시지를 사용한다.

## 35. Google/Discord 네이티브 OAuth — 구현을 틀리면 웹사이트로 가는 부분

### 35.1 앱이 첫 번째로 호출해야 하는 URL

Google:

```http
GET /app-api/v1/auth/google/authorize?client=mobile
```

Discord:

```http
GET /app-api/v1/auth/discord/authorize?client=mobile
```

**`client=mobile`이 없으면 웹 로그인 흐름이다.** 이 경우 인증 뒤 웹사이트로 돌아가는 것이 정상이다. 앱에서 provider의 `/auth/google/authorize` 또는 `/auth/discord/authorize`를 직접 하드코딩해 시작하지 않는다.

BFF 응답 예:

```json
{
  "authorizationUrl": "https://easy-scraping.com/auth/google/authorize?client=mobile"
}
```

앱은 이 `authorizationUrl`을 시스템 브라우저 또는 Custom Tab으로 연다. Google/Discord 로그인 화면이 외부 브라우저에 뜨는 것 자체는 정상이다. **중요한 것은 인증 완료 뒤 앱 deep link로 돌아오는 것**이다.

### 35.2 Android deep link 필수 등록 예

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="woldeok-moneyverse"
        android:host="oauth"
        android:path="/callback" />
</intent-filter>
```

앱이 받아야 하는 URI:

```text
woldeok-moneyverse://oauth/callback?code=<opaque>&provider=google
woldeok-moneyverse://oauth/callback?code=<opaque>&provider=discord
```

scheme/host/path 중 하나라도 다르면 Android가 앱을 열지 못한다. 브라우저가 이 URI를 받았는데 앱이 열리지 않는다면 서버 API보다 먼저 Manifest/intent-filter를 확인한다.

### 35.3 handoff 교환

Deep link에서 `code`만 파싱하고 로그에 남기지 않는다.

```http
POST /app-api/v1/auth/mobile/handoff
Content-Type: application/json
```

```json
{"code":"<deep link에서 받은 code>"}
```

성공하면 `Set-Cookie`를 CookieJar에 저장하고 JSON의 `csrfToken`을 저장한 뒤 `/auth/viewer`를 호출한다. handoff code는 5분짜리 1회용이므로 한 번 성공한 code를 다시 보내면 401이 정상이다.

### 35.4 OAuth 실패 판별표

| 증상 | 우선 확인 |
|---|---|
| 인증 후 웹사이트 홈으로 감 | 앱이 `?client=mobile` 없이 시작했는지 확인 |
| 인증 후 `woldeok-moneyverse://...`가 보이지만 앱이 안 열림 | Android intent-filter scheme/host/path 확인 |
| 앱은 열리지만 로그인 안 됨 | handoff POST 여부, CookieJar 저장 여부 확인 |
| handoff 401 | code 만료/재사용/잘못된 code 여부 확인 |
| handoff 성공인데 앱은 미로그인 | `/auth/viewer`와 CookieJar가 같은 HTTP client인지 확인 |

## 36. 화면별 API 사용 레시피

### 36.1 홈/대시보드

로그인 확인 후 화면에 필요한 데이터만 병렬 조회한다. 예: `/wallet`, `/progression`, `/content/announcements`, `/engagement`. 한 API 실패 때문에 전체 홈을 빈 화면으로 만들지 말고 카드 단위 오류 상태를 보여준다.

### 36.2 지갑/송금

1. `GET /wallet`로 현재 잔액 표시.
2. 송금 대상과 금액 검증.
3. UUID v4 `idempotencyKey` 생성.
4. `POST /wallet/transfers`.
5. 성공 후 `GET /wallet` 다시 호출.

```json
{
  "recipientUserId": "00000000-0000-4000-8000-000000000000",
  "amount": 1000,
  "idempotencyKey": "00000000-0000-4000-8000-000000000001"
}
```

`amount`는 이 API에서는 JSON number 정수다. 잔액은 서버 반환값을 기준으로 렌더링한다.

### 36.3 일반 은행 movement

`POST /bank/movements`:

```json
{
  "direction": "deposit",
  "amount": 1000,
  "idempotencyKey": "<uuid>"
}
```

`direction`은 `deposit|withdraw`. 성공 뒤 지갑/은행 상태를 다시 읽는다.

### 36.4 banking 고정밀 금액 API

`/banking/deposit`, `/banking/withdraw`, `/banking/borrow` 등 일부 DTO는 금액을 **문자열 양의 정수**로 받는다.

```json
{
  "amount": "1000",
  "idempotencyKey": "<uuid>"
}
```

Gemini가 모든 금액을 number로 통일하면 422가 발생할 수 있다. 각 endpoint의 DTO 계약을 그대로 지킨다.

### 36.5 주식

주식 목록: `GET /stocks`, 보유자산: `GET /stocks/portfolio`, 관심종목: `GET /stocks/watchlist`.

주문:

```json
{
  "side": "buy",
  "quantity": 3,
  "idempotencyKey": "<uuid>"
}
```

`POST /stocks/:id/orders` 성공 후 최소 `/stocks/portfolio`, 필요하면 `/stocks/history`와 해당 종목 가격을 재조회한다. 체결 가격이나 잔액을 앱에서 계산해 확정하지 않는다.

관심종목:

```json
{"watching":true}
```

### 36.6 사업

구매 가능 사업은 `/businesses/catalog`, 자금 상태는 `/businesses/equity`, 내 사업은 `/businesses` 또는 최신 화면 계약에 따라 `/businesses/my-v2`를 읽는다.

라이선스 활성화:

```json
{
  "catalogCode":"biz_cvs_license",
  "idempotencyKey":"<uuid>"
}
```

부스트:

```json
{"boostCode":"biz_cvs_boost_7d"}
```

정산/구매/라이선스 변경 성공 후 내 사업 목록과 equity를 다시 읽는다.

### 36.7 상점

카탈로그 조회 후 구매 버튼을 누르면 서버가 제시한 item/catalog id만 사용한다. 가격을 앱 body에 임의로 넣지 않는다.

일반 구매 body:

```json
{"idempotencyKey":"<uuid>"}
```

수량형 catalog 구매:

```json
{
  "idempotencyKey":"<uuid>",
  "quantity":2
}
```

`quantity`는 생략 시 1, 허용 범위는 1~100. 구매 성공 후 holdings/purchases와 관련 잔액을 재조회한다.

### 36.8 근무

과제 시작/완료는 서버가 내려준 task/assignment id를 그대로 사용한다.

```json
{
  "taskId":"<uuid>",
  "idempotencyKey":"<uuid>"
}
```

완료:

```json
{
  "idempotencyKey":"<uuid>",
  "evidence":"선택 입력, 최대 1000자"
}
```

직업 변경 body의 `jobType`은 서버 enum 중 하나만 사용한다: `developer`, `trader`, `entertainer`, `detective`, `miner`, `farmer`, `artisan`, `civil_servant`.

### 36.9 게시판

글 작성:

```json
{
  "title":"제목",
  "body":"본문",
  "idempotencyKey":"<uuid>",
  "imageStorageKey":"<업로드 성공 시 받은 key>",
  "imageAltText":"이미지 설명"
}
```

이미지가 있으면 먼저 `/board/images/uploads`로 실제 이미지 바이트를 업로드하고 성공한 storage key를 글 생성 body에 넣는다. 글 수정은 PATCH가 아니라 **전체 교체형 PUT**이므로 기존 title/body를 빠뜨리지 않는다.

댓글:

```json
{
  "body":"댓글",
  "idempotencyKey":"<uuid>"
}
```

### 36.10 프로필

`PUT /profile`은 partial patch가 아니라 replacement 의미가 있으므로 화면이 가진 현재 값과 사용자가 변경한 값을 합쳐 완전한 의도를 전송한다.

```json
{
  "visibility":"members",
  "displayName":"새 이름",
  "imageUrl":"https://...",
  "fieldVisibility":{"imageUrl":"private"},
  "featuredTitle":"title_code"
}
```

선택 필드를 빼면 DB에서 NULL 의미가 될 수 있으므로 “안 바꿈”과 “지움”을 앱에서 구분해 구현한다.

### 36.11 카지노

코인:

```json
{
  "idempotencyKey":"<uuid>",
  "choice":"heads",
  "stake":100
}
```

주사위:

```json
{
  "idempotencyKey":"<uuid>",
  "game":"dice_parity",
  "choice":"odd",
  "stake":100
}
```

결과/당첨/잔액을 앱 난수나 계산으로 결정하지 않는다. 서버 응답이 유일한 결과다.

### 36.12 초반 진행 이벤트

```json
{
  "idempotencyKey":"<uuid>",
  "eventDate":"2026-09-13"
}
```

`eventDate`는 앱이 임의 계산하기보다 서버 read model이 보여준 Asia/Seoul 날짜를 그대로 보낸다. 자정이 지나 stale 화면이면 서버가 거부할 수 있으므로 최신 상태를 다시 조회한다.

### 36.13 개인정보 요청 및 계정 삭제

개인정보 요청은 `/privacy/requests`, 계정 삭제는 `DELETE /account`를 사용한다. 계정 삭제 버튼은 실수 방지를 위해 확인 UI를 두고, 서버가 재인증을 요구하면 재인증 흐름을 완료한 뒤 다시 실행한다. 삭제 성공 후 CookieJar/CSRF/사용자 캐시를 지우고 signed-out 화면으로 이동한다.

## 37. 앱 화면 상태와 HTTP 상태 코드 매핑

| HTTP | 앱 의미 | 사용자 UI | 개발자 처리 |
|---|---|---|---|
| 200/201/202 | 성공 | 정상 화면/완료 표시 | body + Set-Cookie + csrf 반영 |
| 204 | body 없는 성공 | 완료 표시 | JSON 파싱 시도 금지 |
| 400 | 흐름/입력 오류 | 입력 확인 안내 | request contract 확인 |
| 401 | 인증 실패/만료 | 로그인 필요 또는 인증 실패 | 세션 상태 확인, OAuth code 재사용 금지 |
| 403 | 동의/CSRF/권한 부족 | 필요한 절차 안내 | policy/session/reauth 확인 |
| 404 | 잘못된 앱 route 또는 없는 리소스 | 상황별 처리 | 릴리스에서 API route 404는 결함으로 취급 |
| 409 | 서버 상태 충돌 | 최신 상태 갱신 안내 | GET 재조회 후 UI 재구성 |
| 422 | DTO validation 실패 | 입력 오류 | 타입/필드명/enum 확인 |
| 429 | rate limit | 잠시 후 재시도 | backoff, 반복 호출 중단 |
| 5xx | 서버 장애 | 재시도 UI | 내부 오류 노출 금지, telemetry 기록 |

## 38. Gemini/코드 생성 도구에 그대로 줄 구현 지시문

```text
이 앱은 Woldeok Moneyverse의 공식 네이티브 클라이언트다.
오직 https://easy-scraping.com/app-api/v1/* 만 호출한다.
모든 요청은 하나의 persistent secure CookieJar를 공유한다.
CSRF는 prelogin/session 응답에서 받아 변경 요청의 x-csrf-token으로 보낸다.
로그인 완료는 반드시 GET /auth/viewer 의 signedIn===true로 검증한다.
Google/Discord 로그인은 GET /auth/{provider}/authorize?client=mobile 을 BFF로 호출하고,
응답 authorizationUrl을 외부 브라우저/Custom Tab으로 연다.
Android는 woldeok-moneyverse://oauth/callback 을 deep link로 등록한다.
callback의 code는 POST /auth/mobile/handoff로 단 한 번 교환하고 Set-Cookie를 같은 CookieJar에 저장한다.
/api/* private backend를 직접 호출하지 말고 x-internal-token/DB/OAuth secret을 앱에 넣지 않는다.
경제 write에는 서버 계약의 idempotencyKey를 사용하며, 성공 후 관련 GET으로 서버 상태를 재동기화한다.
응답 필드, enum, number/string 타입을 임의 추측하거나 변환하지 않는다.
404/422를 무시하거나 빈 성공으로 바꾸지 않는다.
이 문서의 endpoint별 기능, 요청 body, 호출 시점, 성공 후 처리 규칙을 그대로 구현한다.
```


## 29. 앱 종료 방지용 응답 타입 계약

### 29.1 지갑 응답은 숫자가 아니라 문자열 금액이다

`GET /app-api/v1/wallet`의 정상 응답은 아래 형태다. WLD 금액은 정밀도 보존을 위해 JSON number가 아니라 decimal string이다. Android/Kotlin 모델에서 `Long`, `Int`, `Double`로 바로 역직렬화하지 말고 `String`으로 받은 뒤 표시/계산 계층에서 안전하게 변환한다.

```json
{
  "userId": "00000000-0000-0000-0000-000000000000",
  "balances": {
    "currency": "WLD",
    "cash": { "availableAmount": "1000", "updatedAt": "2026-09-13T14:00:00.000Z" },
    "bank": { "availableAmount": "0", "updatedAt": "2026-09-13T14:00:00.000Z" },
    "totalAvailableAmount": "1000"
  },
  "recentTransactions": []
}
```

`balances.cash.availableAmount`, `balances.bank.availableAmount`, `balances.totalAvailableAmount`, `recentTransactions[].netAmount`는 모두 문자열이다. 신규 가입 직후 거래내역이 없으면 `recentTransactions`는 `[]`이며 `null`이 아니다. 앱은 빈 배열을 오류로 취급하면 안 된다.

### 29.2 회원가입 완료 후 지갑 생성 계약

이메일 인증 완료(`POST /auth/local/verify-email`)가 성공하면 같은 DB transaction에서 사용자 활성화, `USER_CASH`, `USER_BANK`, 두 account balance row, 로그인 session이 준비되어야 한다. 그 직후 동일 CookieJar로 `GET /auth/viewer`를 호출해 `signedIn:true`를 확인하고 `GET /wallet`을 호출한다. wallet이 200이 아니면 홈 전체를 종료하지 말고 지갑 카드만 오류 상태로 표시한다.

### 29.3 앱 시작 API 병렬 호출 규칙

운영 서버의 read tier는 v2026.09.13.56부터 앱 bootstrap burst를 수용하도록 크게 완화되어 있다. 그래도 앱은 한 API 실패를 process crash로 전파하면 안 된다. 각 요청을 독립적으로 `try/catch`하고 `401/403/404/429/5xx`를 화면 상태로 변환한다. `Promise.all`/coroutine fan-out을 쓸 때 한 요청 실패로 전체 scope가 cancel되지 않도록 supervisor 계층 또는 개별 Result 래핑을 사용한다.

### 29.4 Kotlin/Gson/Moshi/serialization 구현 주의

지갑 모델의 WLD 금액 필드는 반드시 `String`이어야 한다. `recentTransactions` 기본값은 빈 리스트로 두고 nullable 응답을 강제하지 않는다. `viewer.userId`, `wallet.userId`는 UUID string이다. 서버에 없는 임의 필드를 required로 선언하지 않는다. 알 수 없는 추가 필드는 무시하고, 필수 필드 누락은 해당 카드 오류로 처리하되 앱 프로세스를 종료하지 않는다.

## 39. v2026.09.14.2 운영 안정성 계약 — 앱 크래시 방지

이 절은 앱 구현자가 반드시 지켜야 하는 런타임 계약이다. HTTP 실패나 한 화면의 JSON 파싱 실패를 앱 프로세스 종료로 전파하면 안 된다.

### 39.1 병렬 초기 로딩

로그인 완료 뒤 홈에서 여러 API를 읽을 수 있지만, 각 요청은 서로 독립적인 실패 경계를 가져야 한다. Kotlin coroutine에서는 `SupervisorJob`/`supervisorScope` 또는 요청별 `Result`를 사용한다. 지갑 조회 하나가 실패해도 주식·프로필·공지 조회와 앱 프로세스는 계속 살아 있어야 한다.

권장 상태는 `Loading | Content<T> | Empty | RecoverableError`다. `401`, `403`, `404`, `409`, `422`, `429`, `5xx`, timeout, JSON decode 오류를 `throw`한 채 Main/UI scope 밖으로 보내지 않는다.

### 39.2 JSON 타입을 임의 변환하지 않는다

- WLD/경제 금액은 정밀도 보존을 위해 문자열 decimal인 API가 있다. 예: `"availableAmount":"1000"`.
- 빈 컬렉션 `[]`은 정상 상태다. `null`이나 예외로 바꾸지 않는다.
- optional 필드는 서버 계약에 따라 nullable/default를 둔다. 없는 필드를 강제 `!!` 하지 않는다.
- 서버가 문자열 금액을 보내는데 Kotlin `Long`, `Double`, `Int`로 직접 역직렬화하지 않는다. DTO는 `String`으로 받고 도메인 계층에서 `BigDecimal` 등으로 명시 변환한다.

### 39.3 조회 요청과 429

정상 앱 초기 GET burst가 rate limit에 걸리지 않도록 서버의 read budget은 높은 조회 전용 tier로 운영한다. 그래도 429가 오면 앱은 종료하지 않고 `Retry-After`가 있으면 존중하며 지수 backoff한다. 로그인·회원가입·OAuth·송금·주문·구매 같은 민감 write의 abuse 방어는 유지된다.

## 40. 회원가입 이메일 발송 계약

회원가입 순서는 `prelogin -> policy -> consent -> local/register -> 이메일 확인 -> local/verify-email -> viewer`다.

`POST /app-api/v1/auth/local/register`가 Production에서 `503`을 반환하면 입력 형식 문제가 아니라 인증메일 delivery path가 사용할 수 없다는 뜻일 수 있다. 앱은 이를 무한 재시도하거나 크래시하지 말고 "인증메일 발송 서버를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요" 같은 복구 가능한 오류로 표시한다.

Production은 인증메일을 실제 발송하지 못하면서 가입 성공을 가장하지 않는다. 서버는 loopback SMTP relay를 사용할 수 있으며 AUTH 없는 SMTP는 `127.0.0.1`, `::1`, `localhost`에만 허용한다. 원격 SMTP는 username/password가 둘 다 필요하다. SMTP 비밀값은 앱에 절대 넣지 않는다.

성공 기준은 `register=202`만이 아니다. 동일 prelogin CookieJar/CSRF로 이메일 token을 `verify-email`에 제출하고, 발급된 로그인 쿠키를 저장한 뒤 `viewer.signedIn === true`까지 확인해야 한다. 신규 가입 완료 시 서버는 기본 `USER_CASH`와 `USER_BANK` 지갑을 만들며, `/wallet`은 빈 거래내역이더라도 정상적으로 읽혀야 한다.

## 41. Google/Discord OAuth 브라우저 복귀 v2026.09.14.1+

Provider 인증을 외부 브라우저/Custom Tab에서 진행하는 것은 정상이다. 문제는 인증 완료 후 웹사이트에 머무는 경우다.

정상 모바일 흐름:

1. 앱이 `GET /app-api/v1/auth/{google|discord}/authorize?client=mobile` 호출.
2. 응답 `authorizationUrl`만 외부 브라우저로 연다.
3. backend는 OAuth challenge에 `mobile_client=true`를 저장한다.
4. provider callback 성공 시 서버가 5분짜리 1회용 handoff code를 만든다.
5. callback 페이지는 `woldeok-moneyverse://oauth/callback?code=...&provider=...` 이동을 자동 시도한다.
6. 브라우저가 자동 external-app navigation을 막는 경우 완료 페이지의 **월덕 머니버스 앱 열기** 버튼을 사용자가 누를 수 있다.
7. 앱 deep link handler가 code를 받으면 즉시 `POST /app-api/v1/auth/mobile/handoff`로 교환한다.
8. `Set-Cookie`와 `csrfToken`을 공통 SessionStore에 저장한다.
9. `GET /app-api/v1/auth/viewer`에서 `signedIn:true`를 확인한 뒤에만 메인 화면을 연다.

앱이 provider callback URL을 직접 만들거나 provider `code/state`를 `/mobile/handoff`에 넣으면 안 된다. handoff에는 Moneyverse 서버가 생성한 opaque handoff code만 넣는다. 가짜/만료/재사용 code의 401은 정상 보안 동작이다.

## 42. Google Play 계정 삭제 / 데이터 삭제 계약

Google Play Console 공개 URL은 다음과 같다.

- 계정 및 관련 데이터 삭제 안내: `https://easy-scraping.com/account-deletion`
- 계정은 유지하면서 개인정보 삭제 요청: `https://easy-scraping.com/data-deletion`

두 페이지는 로그인 없이 200으로 열려야 하며 앱 이름/운영자, 단계별 요청 방법, 삭제되는 데이터, 제한 보관 데이터와 기간, 로그인 불가 시 요청 수단을 표시한다.

### 42.1 계정 삭제 API

`DELETE /app-api/v1/account`

조건: 로그인 세션 + 현재 동의 + CSRF + 최근 step-up reauthentication. 성공은 `202`다. 계정 삭제는 모든 활성 세션을 무효화하고 계정/식별자 삭제 절차를 시작한다. 앱은 202 뒤 로컬 민감 캐시를 제거하고 삭제 완료 화면을 표시한다. API 실패 시 앱 자체를 종료하지 않는다.

현재 reauthentication은 연결된 Google/Discord identity를 통한 step-up을 지원한다. 이 경로를 사용할 수 없는 사용자는 공개 삭제 안내 페이지의 이메일 대체 요청 경로를 이용할 수 있다. 앱이 임의로 계정 DB row를 삭제하거나 원장을 제거하면 안 된다.

### 42.2 계정 유지형 데이터 삭제 요청 API

`POST /app-api/v1/privacy/requests`

요청 예:

```json
{
  "requestType": "deletion",
  "detail": "삭제를 원하는 개인정보 범위를 필요한 최소한으로 설명",
  "idempotencyKey": "UUID"
}
```

지원 requestType은 `access`, `correction`, `restriction`, `withdrawal`, `deletion`이다. 이 endpoint는 **요청 접수 기록**을 만드는 API이며 즉시 모든 데이터를 동기 삭제했다고 표시하면 안 된다. `GET /app-api/v1/privacy/requests`로 본인의 접수 기록을 다시 읽는다.

### 42.3 공개 안내에 표시하는 보관 기준

현재 개인정보처리방침과 삭제 안내 페이지의 기준은 다음과 같다.

- OAuth 연결 정보/프로필 식별정보: 탈퇴 처리 후 30일 이내 삭제.
- 프로필/갤러리 파일 및 메타데이터: 삭제 요청 후 30일 이내 삭제.
- 가상경제 대사에 필요한 잔여 기록: 식별 연결 제거 후 최대 1년.
- 정책 동의 증명: 탈퇴 후 3년.
- 일반 접속/인증 기록: 90일.
- 관리자/경제 감사 기록: 최대 1년.
- 법령상 보존·분쟁·보안조사 데이터는 필요한 범위에서 분리 보관 후 사유 종료 시 삭제.

## 43. 약관·개인정보처리방침 변경 후 재동의

앱은 약관 버전을 하드코딩하지 않는다. 앱 시작/로그인 복원 시 서버 `auth/policy`와 `viewer/session` 상태를 기준으로 한다. 서버가 새 정책 버전을 발행해 `consentCurrent:false`가 되면 일반 기능을 계속 호출하며 403을 반복하지 말고 동의 화면으로 전환한다.

동의 화면은 서버가 준 `termsVersion`, `privacyVersion`을 그대로 `PUT /auth/consent`에 제출하고 성공 후 `viewer`를 다시 읽는다. 새 정책 버전 반영 때문에 로그아웃할 필요는 없다. 세션을 유지한 채 재동의를 받는다.

## 44. 앱 기능 API QA 최소 매트릭스

릴리스 전 아래 상태를 분리해 테스트한다.

- 완전 로그아웃 상태: 공개 API만 200, 보호 API는 의도된 401/403.
- prelogin 상태: policy/consent/register 흐름, CookieJar 유지.
- 신규 가입 직후: viewer, profile, wallet, USER_CASH/USER_BANK, 빈 배열 응답.
- 기존 로그인: viewer/session/profile/wallet/early-game/engagement/work/shop/stocks/businesses/casino/board/privacy.
- 정책 버전 변경: `consentCurrent:false -> consent UI -> PUT consent -> viewer true`.
- OAuth Google/Discord: browser → completion page/deep link → handoff 1회 교환 → viewer.
- 404 endpoint가 앱에 남아 있지 않은지: `/early-game/tasks`, `/activity/logs`는 호출 금지. 현재 계약은 `/early-game/today`, 필요 시 `POST /activity/events`다.
- 429/5xx/timeout/JSON decode 실패가 앱 종료로 전파되지 않는지.
- Google Play 공개 삭제 URL 2개가 로그인 없이 200인지.

## 전체 감사된 사용자 API 라우트 목록

기준: 2026-09-13 운영 NestJS 재시작 후 실제 route map. 전체 backend route: **239**. 아래 사용자 앱 매핑: **144**. 관리자, Discord webhook, health probe, worker/control-plane 경로는 의도적으로 제외한다.

| 방법 | 앱 API | 기능 | 호출 시점 | 인증/CSRF | 성공 후 앱 처리 | 백엔드 경로 |
|---|---|---|---|---|---|---|
| `DELETE` | `/app-api/v1/account` | 회원 탈퇴 및 계정 삭제 | 사용자가 삭제/해제를 명시적으로 확인했을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/account` |
| `GET` | `/app-api/v1/account/identities` | 연결된 Google/Discord 등 로그인 수단 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/account/identities` |
| `DELETE` | `/app-api/v1/account/identities/:id` | 특정 로그인 수단 연결 해제 | 사용자가 삭제/해제를 명시적으로 확인했을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/account/identities/:id` |
| `POST` | `/app-api/v1/account/identities/:provider/link` | Google/Discord 로그인 수단 추가 연결 시작 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/account/identities/:provider/link` |
| `GET` | `/app-api/v1/account/security/sessions` | 현재 계정의 로그인 기기/세션 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/account/security/sessions` |
| `DELETE` | `/app-api/v1/account/security/sessions/:id` | 선택한 로그인 세션 강제 종료 | 사용자가 삭제/해제를 명시적으로 확인했을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/account/security/sessions/:id` |
| `POST` | `/app-api/v1/account/security/sessions/revoke-others` | 현재 기기 제외 모든 로그인 세션 종료 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/account/security/sessions/revoke-others` |
| `POST` | `/app-api/v1/activity/events` | 앱 활동/참여 이벤트 서버 기록 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/activity/events` |
| `GET` | `/app-api/v1/content/announcements` | 공지사항 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 응답을 화면의 서버 기준 상태로 교체 | `/api/announcements` |
| `POST` | `/app-api/v1/auth/:provider/reauthentication` | 민감 작업 전 Google/Discord 재인증 시작 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/auth/:provider/reauthentication` |
| `PUT` | `/app-api/v1/auth/consent` | 현재 약관·개인정보·연령 동의 저장 | 사용자가 약관 동의를 확정할 때 | Prelogin 또는 로그인 세션 + CSRF | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/auth/consent` |
| `POST` | `/app-api/v1/auth/local/login` | 이메일/비밀번호 로그인 | 이메일 로그인 버튼을 눌렀을 때 | 인증 흐름 전용: 상태머신 준수 | 새 쿠키/CSRF 저장 후 /auth/viewer 확인 | `/api/auth/local/login` |
| `POST` | `/app-api/v1/auth/local/register` | 이메일/비밀번호 회원가입 시작 | 회원가입 정보를 제출할 때 | 인증 흐름 전용: 상태머신 준수 | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/auth/local/register` |
| `POST` | `/app-api/v1/auth/local/verify-email` | 이메일 인증 완료, 계정 활성화 및 로그인 세션 발급 | 이메일 인증 token을 확보한 뒤 | 인증 흐름 전용: 상태머신 준수 | 새 쿠키/CSRF 저장 후 /auth/viewer 확인 | `/api/auth/local/verify-email` |
| `POST` | `/app-api/v1/auth/logout` | 현재 로그인 세션 로그아웃 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 쿠키 무효화 반영 후 로컬 사용자 상태 초기화 | `/api/auth/logout` |
| `POST` | `/app-api/v1/auth/mobile/handoff` | 모바일 Google/Discord OAuth 1회용 code를 앱 로그인 세션으로 교환 | OAuth deep link code 수신 직후 | 인증 흐름 전용: 상태머신 준수 | 새 쿠키/CSRF 저장 후 /auth/viewer 확인 | `/api/auth/mobile/handoff` |
| `GET` | `/app-api/v1/auth/policy` | 현재 약관·개인정보처리방침 버전 조회 | 가입/동의 화면 진입 시 | 공개/Prelogin에서 호출 가능 | 응답을 화면의 서버 기준 상태로 교체 | `/api/auth/policy` |
| `POST` | `/app-api/v1/auth/prelogin-session` | 로그인 전 임시 세션과 CSRF 토큰 생성 | 로그인/가입/OAuth 시작 직전 | 인증 흐름 전용: 상태머신 준수 | CookieJar와 csrfToken 저장 | `/api/auth/prelogin-session` |
| `GET` | `/app-api/v1/auth/providers` | 현재 사용 가능한 로그인 방식(local/Google/Discord) 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개/Prelogin에서 호출 가능 | 응답을 화면의 서버 기준 상태로 교체 | `/api/auth/providers` |
| `GET` | `/app-api/v1/auth/session` | 현재 로그인 세션과 최신 CSRF 상태 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/auth/session` |
| `GET` | `/app-api/v1/auth/viewer` | 현재 로그인 사용자 및 signedIn 상태 확인 | 앱 시작/로그인 완료 후 로그인 확인 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/auth/viewer` |
| `GET` | `/app-api/v1/bank/loans` | 내 대출 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 지갑/은행 관련 GET 재조회 | `/api/bank/loans` |
| `POST` | `/app-api/v1/bank/loans` | 신규 대출 실행 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 지갑/은행 관련 GET 재조회 | `/api/bank/loans` |
| `POST` | `/app-api/v1/bank/loans/:id/repayments` | 선택한 대출 상환 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 지갑/은행 관련 GET 재조회 | `/api/bank/loans/:id/repayments` |
| `POST` | `/app-api/v1/bank/movements` | 현금 계정과 은행 계정 사이 입금/출금 이동 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 지갑/은행 관련 GET 재조회 | `/api/bank/movements` |
| `POST` | `/app-api/v1/banking/bonds/:id/redeem` | 보유 채권 상환/환매 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 지갑/은행 관련 GET 재조회 | `/api/banking/bonds/:id/redeem` |
| `POST` | `/app-api/v1/banking/bonds/purchase` | 채권 상품 구매 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 지갑/은행 관련 GET 재조회 | `/api/banking/bonds/purchase` |
| `POST` | `/app-api/v1/banking/borrow` | 은행 대출 실행 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 지갑/은행 관련 GET 재조회 | `/api/banking/borrow` |
| `POST` | `/app-api/v1/banking/claim-interest` | 예금 이자 수령 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 지갑/은행 관련 GET 재조회 | `/api/banking/claim-interest` |
| `POST` | `/app-api/v1/banking/deposit` | 은행 예금 입금 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 지갑/은행 관련 GET 재조회 | `/api/banking/deposit` |
| `POST` | `/app-api/v1/banking/repay` | 은행 대출 상환 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 지갑/은행 관련 GET 재조회 | `/api/banking/repay` |
| `GET` | `/app-api/v1/banking/standing` | 은행 잔액·대출·신용 상태 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 지갑/은행 관련 GET 재조회 | `/api/banking/standing` |
| `POST` | `/app-api/v1/banking/withdraw` | 은행 예금 출금 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 지갑/은행 관련 GET 재조회 | `/api/banking/withdraw` |
| `GET` | `/app-api/v1/board/images/:key` | 게시판 이미지 파일 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/images/:key` |
| `POST` | `/app-api/v1/board/images/uploads` | 게시글 첨부 이미지 업로드 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/images/uploads` |
| `GET` | `/app-api/v1/board/posts` | 게시글 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/posts` |
| `POST` | `/app-api/v1/board/posts` | 새 게시글 작성 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/posts` |
| `DELETE` | `/app-api/v1/board/posts/:id` | 게시글 삭제 | 사용자가 삭제/해제를 명시적으로 확인했을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/posts/:id` |
| `GET` | `/app-api/v1/board/posts/:id` | 게시글 상세 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/posts/:id` |
| `PUT` | `/app-api/v1/board/posts/:id` | 게시글 수정 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/posts/:id` |
| `GET` | `/app-api/v1/board/posts/:id/comments` | 게시글 댓글 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/posts/:id/comments` |
| `POST` | `/app-api/v1/board/posts/:id/comments` | 게시글 댓글 작성 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/posts/:id/comments` |
| `DELETE` | `/app-api/v1/board/posts/:id/comments/:commentId` | 게시글 댓글 삭제 | 사용자가 삭제/해제를 명시적으로 확인했을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/posts/:id/comments/:commentId` |
| `GET` | `/app-api/v1/board/public/images/:key` | 로그인 없이 공개 게시판 이미지 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/public/images/:key` |
| `GET` | `/app-api/v1/board/public/posts` | 로그인 없이 공개 게시글 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/public/posts` |
| `GET` | `/app-api/v1/board/public/posts/:id` | 로그인 없이 공개 게시글 상세 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/public/posts/:id` |
| `GET` | `/app-api/v1/board/public/posts/:id/comments` | 로그인 없이 공개 게시글 댓글 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/public/posts/:id/comments` |
| `GET` | `/app-api/v1/board/public/stock-posts` | 로그인 없이 공개 주식 게시글 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/public/stock-posts` |
| `POST` | `/app-api/v1/board/stock-posts` | 주식 관련 게시글 작성 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 게시글/댓글 목록 또는 상세 재조회 | `/api/board/stock-posts` |
| `GET` | `/app-api/v1/businesses/equity` | 사업 구매에 사용할 수 있는 자기자본 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/business-equity` |
| `GET` | `/app-api/v1/businesses/catalog` | 사업 종류·가격·조건 카탈로그 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/business-types` |
| `POST` | `/app-api/v1/businesses/catalog/:id/purchases` | 선택한 사업 종류 구매 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/business-types/:id/purchases` |
| `GET` | `/app-api/v1/businesses` | 내 보유 사업 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/businesses` |
| `POST` | `/app-api/v1/businesses/:id/boost` | 보유 사업 부스트/강화 실행 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/businesses/:id/boost` |
| `POST` | `/app-api/v1/businesses/:id/settle-v2` | 보유 사업 V2 정산 실행 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/businesses/:id/settle-v2` |
| `POST` | `/app-api/v1/businesses/:id/settlements` | 보유 사업 정산 실행 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/businesses/:id/settlements` |
| `POST` | `/app-api/v1/businesses/activate-license` | 사업 라이선스 활성화 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/businesses/activate-license` |
| `GET` | `/app-api/v1/businesses/catalog` | 사업 종류·가격·조건 카탈로그 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/businesses/catalog` |
| `POST` | `/app-api/v1/businesses/catalog/:id/purchases` | 선택한 사업 종류 구매 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/businesses/catalog/:id/purchases` |
| `GET` | `/app-api/v1/businesses/equity` | 사업 구매에 사용할 수 있는 자기자본 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/businesses/equity` |
| `GET` | `/app-api/v1/businesses/my-v2` | 내 사업 V2 상세 상태 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 내 사업/equity/catalog 관련 상태 재조회 | `/api/businesses/my-v2` |
| `GET` | `/app-api/v1/casino/coin/fairness` | 동전게임 공정성 검증 정보 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/casino/coin/fairness` |
| `POST` | `/app-api/v1/casino/coin/plays` | 동전 앞/뒤 게임 실행 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/casino/coin/plays` |
| `GET` | `/app-api/v1/casino/coin/terms` | 동전게임 배당·한도 규칙 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/casino/coin/terms` |
| `GET` | `/app-api/v1/casino/dice/fairness` | 주사위게임 공정성 검증 정보 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/casino/dice/fairness` |
| `POST` | `/app-api/v1/casino/dice/plays` | 주사위 홀짝/숫자 게임 실행 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/casino/dice/plays` |
| `GET` | `/app-api/v1/casino/games/terms` | 카지노 공통 게임 규칙 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/casino/games/terms` |
| `GET` | `/app-api/v1/casino/history` | 내 카지노 플레이 기록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/casino/history` |
| `GET` | `/app-api/v1/casino/self-limit` | 내 카지노 자기제한 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/casino/self-limit` |
| `PUT` | `/app-api/v1/casino/self-limit` | 일일 베팅/손실 자기제한 설정 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/casino/self-limit` |
| `GET` | `/app-api/v1/content/announcements` | 공지사항 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 응답을 화면의 서버 기준 상태로 교체 | `/api/content/announcements` |
| `GET` | `/app-api/v1/content/photos` | 공개 갤러리 사진 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 응답을 화면의 서버 기준 상태로 교체 | `/api/content/photos` |
| `GET` | `/app-api/v1/content/status` | 서비스 상태 정보 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 응답을 화면의 서버 기준 상태로 교체 | `/api/content/status` |
| `POST` | `/app-api/v1/early-game/claims` | 오늘 초반 이벤트 보상 수령 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/early-game/claims` |
| `GET` | `/app-api/v1/early-game/first-day` | 첫날 온보딩 진행 상태 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/early-game/first-day` |
| `GET` | `/app-api/v1/early-game/today` | 오늘의 초반 진행 이벤트 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/early-game/today` |
| `GET` | `/app-api/v1/engagement` | 참여/활동 진행 상태 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/engagement` |
| `GET` | `/app-api/v1/engagement/early-game` | 초반 참여 목표 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/engagement/early-game` |
| `POST` | `/app-api/v1/engagement/npcs/:code/orders` | NPC 주문/상호작용 실행 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/engagement/npcs/:code/orders` |
| `PUT` | `/app-api/v1/engagement/preferences` | 참여·알림 선호 설정 변경 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/engagement/preferences` |
| `GET` | `/app-api/v1/photos` | 갤러리 사진 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/photos` |
| `POST` | `/app-api/v1/photos` | 업로드된 사진을 갤러리에 등록 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/photos` |
| `GET` | `/app-api/v1/photos/mine` | 내가 등록한 갤러리 사진 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/photos/mine` |
| `POST` | `/app-api/v1/photos/uploads` | 갤러리 이미지 업로드 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/photos/uploads` |
| `GET` | `/app-api/v1/privacy/requests` | 내 개인정보 요청 목록/상태 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 개인정보 요청 목록 재조회 | `/api/privacy/requests` |
| `POST` | `/app-api/v1/privacy/requests` | 개인정보 열람·삭제 등 요청 생성 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 개인정보 요청 목록 재조회 | `/api/privacy/requests` |
| `GET` | `/app-api/v1/profile` | 내 프로필 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 프로필 GET 재조회 후 화면 교체 | `/api/profile` |
| `PUT` | `/app-api/v1/profile` | 내 프로필 정보/공개범위 수정 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 프로필 GET 재조회 후 화면 교체 | `/api/profile` |
| `GET` | `/app-api/v1/profile/:userId` | 다른 사용자 공개 프로필 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 프로필 GET 재조회 후 화면 교체 | `/api/profile/:userId` |
| `DELETE` | `/app-api/v1/profile/image` | 프로필 이미지 삭제 | 사용자가 삭제/해제를 명시적으로 확인했을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 프로필 GET 재조회 후 화면 교체 | `/api/profile/image` |
| `POST` | `/app-api/v1/profile/image` | 프로필 이미지 등록 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 프로필 GET 재조회 후 화면 교체 | `/api/profile/image` |
| `GET` | `/app-api/v1/profile/settings` | 내 프로필 설정 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 프로필 GET 재조회 후 화면 교체 | `/api/profile/settings` |
| `GET` | `/app-api/v1/progression` | 내 전체 성장/레벨 상태 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/progression` |
| `GET` | `/app-api/v1/progression/credit` | 내 신용/성장 점수 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/progression/credit` |
| `GET` | `/app-api/v1/progression/early-game` | 초반 성장 진행 상태 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/progression/early-game` |
| `POST` | `/app-api/v1/progression/refreshes` | 성장 상태 재계산/새로고침 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/progression/refreshes` |
| `GET` | `/app-api/v1/rewards/availability` | 현재 수령 가능한 보상 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/rewards/availability` |
| `POST` | `/app-api/v1/rewards/daily/claims` | 일일 보상 수령 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/rewards/daily/claims` |
| `POST` | `/app-api/v1/rewards/work/claims` | 근무 보상 수령 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | work/profile/tasks/receipts 중 관련 상태 재조회 | `/api/rewards/work/claims` |
| `GET` | `/app-api/v1/seasons/events` | 진행 중 시즌 이벤트 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/seasons/events` |
| `POST` | `/app-api/v1/seasons/events/:id/consumptions` | 시즌 이벤트 자원/아이템 소비 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 관련 GET을 다시 호출해 서버 상태와 동기화 | `/api/seasons/events/:id/consumptions` |
| `GET` | `/app-api/v1/seasons/events/:id/leaderboard` | 시즌 이벤트 리더보드 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 응답을 화면의 서버 기준 상태로 교체 | `/api/seasons/events/:id/leaderboard` |
| `GET` | `/app-api/v1/shop/catalog` | 상점 카탈로그 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | holdings/purchases/관련 잔액 재조회 | `/api/shop/catalog` |
| `POST` | `/app-api/v1/shop/catalog/:id/purchases` | 선택한 카탈로그 상품 구매 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | holdings/purchases/관련 잔액 재조회 | `/api/shop/catalog/:id/purchases` |
| `GET` | `/app-api/v1/shop/cosmetics/:userId` | 사용자 장착 코스메틱 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | holdings/purchases/관련 잔액 재조회 | `/api/shop/cosmetics/:userId` |
| `GET` | `/app-api/v1/shop/holdings` | 내 보유 아이템 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | holdings/purchases/관련 잔액 재조회 | `/api/shop/holdings` |
| `POST` | `/app-api/v1/shop/holdings/:id/consumptions` | 보유 소모품 사용 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | holdings/purchases/관련 잔액 재조회 | `/api/shop/holdings/:id/consumptions` |
| `POST` | `/app-api/v1/shop/holdings/:id/equip` | 보유 코스메틱 장착 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | holdings/purchases/관련 잔액 재조회 | `/api/shop/holdings/:id/equip` |
| `POST` | `/app-api/v1/shop/holdings/:id/upkeep-settlements` | 보유 아이템 유지비 정산 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | holdings/purchases/관련 잔액 재조회 | `/api/shop/holdings/:id/upkeep-settlements` |
| `GET` | `/app-api/v1/shop/items` | 상점 아이템 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | holdings/purchases/관련 잔액 재조회 | `/api/shop/items` |
| `POST` | `/app-api/v1/shop/items/:id/purchases` | 선택한 상점 아이템 구매 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | holdings/purchases/관련 잔액 재조회 | `/api/shop/items/:id/purchases` |
| `GET` | `/app-api/v1/shop/public-catalog` | 로그인 없이 공개 상점 카탈로그 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | holdings/purchases/관련 잔액 재조회 | `/api/shop/public-catalog` |
| `GET` | `/app-api/v1/shop/purchases` | 내 상점 구매 기록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | holdings/purchases/관련 잔액 재조회 | `/api/shop/purchases` |
| `GET` | `/app-api/v1/content/status` | 서비스 상태 정보 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 응답을 화면의 서버 기준 상태로 교체 | `/api/status` |
| `GET` | `/app-api/v1/stocks` | 거래 가능한 주식 종목 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks` |
| `GET` | `/app-api/v1/stocks/:id/candles` | 선택 종목 OHLC 캔들 차트 데이터 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/:id/candles` |
| `POST` | `/app-api/v1/stocks/:id/orders` | 선택 종목 매수/매도 주문 생성 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/:id/orders` |
| `GET` | `/app-api/v1/stocks/:id/prices` | 선택 종목 가격 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/:id/prices` |
| `POST` | `/app-api/v1/stocks/:id/watchlist` | 선택 종목 관심목록 추가/변경 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/:id/watchlist` |
| `GET` | `/app-api/v1/stocks/alerts` | 내 주가 알림 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/alerts` |
| `POST` | `/app-api/v1/stocks/alerts` | 새 주가 알림 생성 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/alerts` |
| `DELETE` | `/app-api/v1/stocks/alerts/:id` | 선택한 주가 알림 삭제 | 사용자가 삭제/해제를 명시적으로 확인했을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/alerts/:id` |
| `GET` | `/app-api/v1/stocks/alerts/events` | 발생한 주가 알림 이벤트 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/alerts/events` |
| `GET` | `/app-api/v1/stocks/history` | 내 주식 거래 기록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/history` |
| `GET` | `/app-api/v1/stocks/market-events` | 주식 시장 이벤트 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/market-events` |
| `GET` | `/app-api/v1/stocks/portfolio` | 내 주식 보유량·평가 포트폴리오 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/portfolio` |
| `GET` | `/app-api/v1/stocks/sparklines` | 종목별 미니 차트용 시세 데이터 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/sparklines` |
| `GET` | `/app-api/v1/stocks/watchlist` | 내 관심종목 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 종목/포트폴리오/기록 중 관련 상태 재조회 | `/api/stocks/watchlist` |
| `GET` | `/app-api/v1/wallet` | 내 현금/은행 잔액과 지갑 상태 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | 지갑/은행 관련 GET 재조회 | `/api/wallet` |
| `POST` | `/app-api/v1/wallet/transfers` | 다른 사용자에게 WLD 송금 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | 지갑/은행 관련 GET 재조회 | `/api/wallet/transfers` |
| `GET` | `/app-api/v1/work` | 근무/직업 대시보드 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | work/profile/tasks/receipts 중 관련 상태 재조회 | `/api/work` |
| `POST` | `/app-api/v1/work/active-job` | 현재 직업 변경 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | work/profile/tasks/receipts 중 관련 상태 재조회 | `/api/work/active-job` |
| `GET` | `/app-api/v1/work/assignments` | 근무 과제 목록 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | work/profile/tasks/receipts 중 관련 상태 재조회 | `/api/work/assignments` |
| `POST` | `/app-api/v1/work/assignments` | 새 근무 과제 배정/시작 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | work/profile/tasks/receipts 중 관련 상태 재조회 | `/api/work/assignments` |
| `POST` | `/app-api/v1/work/assignments/:id/completions` | 근무 과제 완료 제출 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | work/profile/tasks/receipts 중 관련 상태 재조회 | `/api/work/assignments/:id/completions` |
| `POST` | `/app-api/v1/work/assignments/:id/verify` | 근무 과제 완료 검증 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | work/profile/tasks/receipts 중 관련 상태 재조회 | `/api/work/assignments/:id/verify` |
| `GET` | `/app-api/v1/work/profile` | 내 근무 프로필/통계 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | work/profile/tasks/receipts 중 관련 상태 재조회 | `/api/work/profile` |
| `GET` | `/app-api/v1/work/receipts` | 근무 보상 영수증 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | work/profile/tasks/receipts 중 관련 상태 재조회 | `/api/work/receipts` |
| `GET` | `/app-api/v1/work/tasks` | 현재 수행 가능한 근무 작업 조회 | 해당 화면 진입/새로고침/관련 write 후 | 로그인 필요(기능에 따라 최신 동의 필요) | work/profile/tasks/receipts 중 관련 상태 재조회 | `/api/work/tasks` |
| `POST` | `/app-api/v1/work/tasks/:id/complete` | 선택한 근무 작업 완료 처리 | 해당 기능의 저장/실행 버튼을 눌렀을 때 | 로그인 + 최신 동의 + CSRF(변경 요청) | work/profile/tasks/receipts 중 관련 상태 재조회 | `/api/work/tasks/:id/complete` |
| `GET` | `/app-api/v1/auth/:provider/authorize` | Google/Discord OAuth 시작; 모바일은 client=mobile 필수 | 해당 화면 진입/새로고침/관련 write 후 | 인증 흐름 전용: 상태머신 준수 | 응답을 화면의 서버 기준 상태로 교체 | `/auth/:provider/authorize` |
| `GET` | `/app-api/v1/auth/:provider/callback` | OAuth provider callback 처리; 앱이 직접 호출하지 않음 | 해당 화면 진입/새로고침/관련 write 후 | 인증 흐름 전용: 상태머신 준수 | 응답을 화면의 서버 기준 상태로 교체 | `/auth/:provider/callback` |
| `GET` | `/app-api/v1/media/:key` | 일반 미디어 파일 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 응답을 화면의 서버 기준 상태로 교체 | `/media/:key` |
| `GET` | `/app-api/v1/media/profile/:key` | 프로필 미디어 파일 조회 | 해당 화면 진입/새로고침/관련 write 후 | 공개: 로그인 불필요 | 프로필 GET 재조회 후 화면 교체 | `/media/profile/:key` |



## v2026.09.14.71 — 모바일 OAuth 브라우저 세션 격리 규칙

Google/Discord 네이티브 로그인은 외부 브라우저에 이미 웹사이트 로그인 세션이 있어도 그 세션을 로그인 completion 세션으로 재사용하지 않는다. 서버는 `client=mobile` 요청마다 별도의 익명 prelogin 세션을 생성하고 OAuth challenge를 그 세션에 연결한다. provider callback에서는 일반 웹 challenge는 브라우저 세션과 일치시켜 소비하고, 모바일 challenge는 고엔트로피 single-use `state + provider`로 찾아 전용 prelogin 세션을 복원한다. 이후 provider code 검증 → OAuth 사용자 로그인 → one-time `mobileHandoff` 생성 → `woldeok-moneyverse://oauth/callback?code=...&provider=...` → `POST /app-api/v1/auth/mobile/handoff` 순서로 진행한다.

이 규칙이 필요한 이유는 Android 시스템 브라우저/Custom Tab이 웹사이트의 기존 쿠키를 공유할 수 있기 때문이다. 기존 웹 로그인 세션(`user_id`가 이미 있는 세션)을 `auth_complete_oauth_login`의 prelogin 세션으로 넘기면 서버는 `active pre-login session required`로 거부한다. 앱은 이 오류를 자체 문제로 우회하면 안 되며, 서버가 모바일 challenge를 전용 익명 세션에 격리해야 한다.

운영 점검 시 provider 인증은 성공했는데 앱으로 복귀하지 않으면 다음 순서로 확인한다. (1) authorize URL에 `client=mobile` 포함, (2) DB challenge `mobile_client=true`, (3) challenge 전용 세션 `user_id IS NULL`, (4) callback 뒤 `oauth_mobile_handoffs` row 생성, (5) 브라우저 완료 페이지의 custom URI, (6) 앱 intent-filter의 scheme=`woldeok-moneyverse`, host=`oauth`, path=`/callback`, (7) handoff 교환 후 `/auth/viewer`의 `signedIn:true`.
