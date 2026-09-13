# 월덕 머니버스 모바일 앱 전체 API 통합 구현 명세서

> 버전: v2026.09.13.51
> 기준일: 2026-09-13
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

## 전체 감사된 사용자 API 라우트 목록

기준: 2026-09-13 운영 NestJS 재시작 후 실제 route map. 전체 backend route: **239**. 아래 사용자 앱 매핑: **144**. 관리자, Discord webhook, health probe, worker/control-plane 경로는 의도적으로 제외한다.

| Method | App API | Backend route |
|---|---|---|
| `DELETE` | `/app-api/v1/account` | `/api/account` |
| `GET` | `/app-api/v1/account/identities` | `/api/account/identities` |
| `DELETE` | `/app-api/v1/account/identities/:id` | `/api/account/identities/:id` |
| `POST` | `/app-api/v1/account/identities/:provider/link` | `/api/account/identities/:provider/link` |
| `GET` | `/app-api/v1/account/security/sessions` | `/api/account/security/sessions` |
| `DELETE` | `/app-api/v1/account/security/sessions/:id` | `/api/account/security/sessions/:id` |
| `POST` | `/app-api/v1/account/security/sessions/revoke-others` | `/api/account/security/sessions/revoke-others` |
| `POST` | `/app-api/v1/activity/events` | `/api/activity/events` |
| `GET` | `/app-api/v1/content/announcements` | `/api/announcements` |
| `POST` | `/app-api/v1/auth/:provider/reauthentication` | `/api/auth/:provider/reauthentication` |
| `PUT` | `/app-api/v1/auth/consent` | `/api/auth/consent` |
| `POST` | `/app-api/v1/auth/local/login` | `/api/auth/local/login` |
| `POST` | `/app-api/v1/auth/local/register` | `/api/auth/local/register` |
| `POST` | `/app-api/v1/auth/local/verify-email` | `/api/auth/local/verify-email` |
| `POST` | `/app-api/v1/auth/logout` | `/api/auth/logout` |
| `POST` | `/app-api/v1/auth/mobile/handoff` | `/api/auth/mobile/handoff` |
| `GET` | `/app-api/v1/auth/policy` | `/api/auth/policy` |
| `POST` | `/app-api/v1/auth/prelogin-session` | `/api/auth/prelogin-session` |
| `GET` | `/app-api/v1/auth/providers` | `/api/auth/providers` |
| `GET` | `/app-api/v1/auth/session` | `/api/auth/session` |
| `GET` | `/app-api/v1/auth/viewer` | `/api/auth/viewer` |
| `GET` | `/app-api/v1/bank/loans` | `/api/bank/loans` |
| `POST` | `/app-api/v1/bank/loans` | `/api/bank/loans` |
| `POST` | `/app-api/v1/bank/loans/:id/repayments` | `/api/bank/loans/:id/repayments` |
| `POST` | `/app-api/v1/bank/movements` | `/api/bank/movements` |
| `POST` | `/app-api/v1/banking/bonds/:id/redeem` | `/api/banking/bonds/:id/redeem` |
| `POST` | `/app-api/v1/banking/bonds/purchase` | `/api/banking/bonds/purchase` |
| `POST` | `/app-api/v1/banking/borrow` | `/api/banking/borrow` |
| `POST` | `/app-api/v1/banking/claim-interest` | `/api/banking/claim-interest` |
| `POST` | `/app-api/v1/banking/deposit` | `/api/banking/deposit` |
| `POST` | `/app-api/v1/banking/repay` | `/api/banking/repay` |
| `GET` | `/app-api/v1/banking/standing` | `/api/banking/standing` |
| `POST` | `/app-api/v1/banking/withdraw` | `/api/banking/withdraw` |
| `GET` | `/app-api/v1/board/images/:key` | `/api/board/images/:key` |
| `POST` | `/app-api/v1/board/images/uploads` | `/api/board/images/uploads` |
| `GET` | `/app-api/v1/board/posts` | `/api/board/posts` |
| `POST` | `/app-api/v1/board/posts` | `/api/board/posts` |
| `DELETE` | `/app-api/v1/board/posts/:id` | `/api/board/posts/:id` |
| `GET` | `/app-api/v1/board/posts/:id` | `/api/board/posts/:id` |
| `PUT` | `/app-api/v1/board/posts/:id` | `/api/board/posts/:id` |
| `GET` | `/app-api/v1/board/posts/:id/comments` | `/api/board/posts/:id/comments` |
| `POST` | `/app-api/v1/board/posts/:id/comments` | `/api/board/posts/:id/comments` |
| `DELETE` | `/app-api/v1/board/posts/:id/comments/:commentId` | `/api/board/posts/:id/comments/:commentId` |
| `GET` | `/app-api/v1/board/public/images/:key` | `/api/board/public/images/:key` |
| `GET` | `/app-api/v1/board/public/posts` | `/api/board/public/posts` |
| `GET` | `/app-api/v1/board/public/posts/:id` | `/api/board/public/posts/:id` |
| `GET` | `/app-api/v1/board/public/posts/:id/comments` | `/api/board/public/posts/:id/comments` |
| `GET` | `/app-api/v1/board/public/stock-posts` | `/api/board/public/stock-posts` |
| `POST` | `/app-api/v1/board/stock-posts` | `/api/board/stock-posts` |
| `GET` | `/app-api/v1/businesses/equity` | `/api/business-equity` |
| `GET` | `/app-api/v1/businesses/catalog` | `/api/business-types` |
| `POST` | `/app-api/v1/businesses/catalog/:id/purchases` | `/api/business-types/:id/purchases` |
| `GET` | `/app-api/v1/businesses` | `/api/businesses` |
| `POST` | `/app-api/v1/businesses/:id/boost` | `/api/businesses/:id/boost` |
| `POST` | `/app-api/v1/businesses/:id/settle-v2` | `/api/businesses/:id/settle-v2` |
| `POST` | `/app-api/v1/businesses/:id/settlements` | `/api/businesses/:id/settlements` |
| `POST` | `/app-api/v1/businesses/activate-license` | `/api/businesses/activate-license` |
| `GET` | `/app-api/v1/businesses/catalog` | `/api/businesses/catalog` |
| `POST` | `/app-api/v1/businesses/catalog/:id/purchases` | `/api/businesses/catalog/:id/purchases` |
| `GET` | `/app-api/v1/businesses/equity` | `/api/businesses/equity` |
| `GET` | `/app-api/v1/businesses/my-v2` | `/api/businesses/my-v2` |
| `GET` | `/app-api/v1/casino/coin/fairness` | `/api/casino/coin/fairness` |
| `POST` | `/app-api/v1/casino/coin/plays` | `/api/casino/coin/plays` |
| `GET` | `/app-api/v1/casino/coin/terms` | `/api/casino/coin/terms` |
| `GET` | `/app-api/v1/casino/dice/fairness` | `/api/casino/dice/fairness` |
| `POST` | `/app-api/v1/casino/dice/plays` | `/api/casino/dice/plays` |
| `GET` | `/app-api/v1/casino/games/terms` | `/api/casino/games/terms` |
| `GET` | `/app-api/v1/casino/history` | `/api/casino/history` |
| `GET` | `/app-api/v1/casino/self-limit` | `/api/casino/self-limit` |
| `PUT` | `/app-api/v1/casino/self-limit` | `/api/casino/self-limit` |
| `GET` | `/app-api/v1/content/announcements` | `/api/content/announcements` |
| `GET` | `/app-api/v1/content/photos` | `/api/content/photos` |
| `GET` | `/app-api/v1/content/status` | `/api/content/status` |
| `POST` | `/app-api/v1/early-game/claims` | `/api/early-game/claims` |
| `GET` | `/app-api/v1/early-game/first-day` | `/api/early-game/first-day` |
| `GET` | `/app-api/v1/early-game/today` | `/api/early-game/today` |
| `GET` | `/app-api/v1/engagement` | `/api/engagement` |
| `GET` | `/app-api/v1/engagement/early-game` | `/api/engagement/early-game` |
| `POST` | `/app-api/v1/engagement/npcs/:code/orders` | `/api/engagement/npcs/:code/orders` |
| `PUT` | `/app-api/v1/engagement/preferences` | `/api/engagement/preferences` |
| `GET` | `/app-api/v1/photos` | `/api/photos` |
| `POST` | `/app-api/v1/photos` | `/api/photos` |
| `GET` | `/app-api/v1/photos/mine` | `/api/photos/mine` |
| `POST` | `/app-api/v1/photos/uploads` | `/api/photos/uploads` |
| `GET` | `/app-api/v1/privacy/requests` | `/api/privacy/requests` |
| `POST` | `/app-api/v1/privacy/requests` | `/api/privacy/requests` |
| `GET` | `/app-api/v1/profile` | `/api/profile` |
| `PUT` | `/app-api/v1/profile` | `/api/profile` |
| `GET` | `/app-api/v1/profile/:userId` | `/api/profile/:userId` |
| `DELETE` | `/app-api/v1/profile/image` | `/api/profile/image` |
| `POST` | `/app-api/v1/profile/image` | `/api/profile/image` |
| `GET` | `/app-api/v1/profile/settings` | `/api/profile/settings` |
| `GET` | `/app-api/v1/progression` | `/api/progression` |
| `GET` | `/app-api/v1/progression/credit` | `/api/progression/credit` |
| `GET` | `/app-api/v1/progression/early-game` | `/api/progression/early-game` |
| `POST` | `/app-api/v1/progression/refreshes` | `/api/progression/refreshes` |
| `GET` | `/app-api/v1/rewards/availability` | `/api/rewards/availability` |
| `POST` | `/app-api/v1/rewards/daily/claims` | `/api/rewards/daily/claims` |
| `POST` | `/app-api/v1/rewards/work/claims` | `/api/rewards/work/claims` |
| `GET` | `/app-api/v1/seasons/events` | `/api/seasons/events` |
| `POST` | `/app-api/v1/seasons/events/:id/consumptions` | `/api/seasons/events/:id/consumptions` |
| `GET` | `/app-api/v1/seasons/events/:id/leaderboard` | `/api/seasons/events/:id/leaderboard` |
| `GET` | `/app-api/v1/shop/catalog` | `/api/shop/catalog` |
| `POST` | `/app-api/v1/shop/catalog/:id/purchases` | `/api/shop/catalog/:id/purchases` |
| `GET` | `/app-api/v1/shop/cosmetics/:userId` | `/api/shop/cosmetics/:userId` |
| `GET` | `/app-api/v1/shop/holdings` | `/api/shop/holdings` |
| `POST` | `/app-api/v1/shop/holdings/:id/consumptions` | `/api/shop/holdings/:id/consumptions` |
| `POST` | `/app-api/v1/shop/holdings/:id/equip` | `/api/shop/holdings/:id/equip` |
| `POST` | `/app-api/v1/shop/holdings/:id/upkeep-settlements` | `/api/shop/holdings/:id/upkeep-settlements` |
| `GET` | `/app-api/v1/shop/items` | `/api/shop/items` |
| `POST` | `/app-api/v1/shop/items/:id/purchases` | `/api/shop/items/:id/purchases` |
| `GET` | `/app-api/v1/shop/public-catalog` | `/api/shop/public-catalog` |
| `GET` | `/app-api/v1/shop/purchases` | `/api/shop/purchases` |
| `GET` | `/app-api/v1/content/status` | `/api/status` |
| `GET` | `/app-api/v1/stocks` | `/api/stocks` |
| `GET` | `/app-api/v1/stocks/:id/candles` | `/api/stocks/:id/candles` |
| `POST` | `/app-api/v1/stocks/:id/orders` | `/api/stocks/:id/orders` |
| `GET` | `/app-api/v1/stocks/:id/prices` | `/api/stocks/:id/prices` |
| `POST` | `/app-api/v1/stocks/:id/watchlist` | `/api/stocks/:id/watchlist` |
| `GET` | `/app-api/v1/stocks/alerts` | `/api/stocks/alerts` |
| `POST` | `/app-api/v1/stocks/alerts` | `/api/stocks/alerts` |
| `DELETE` | `/app-api/v1/stocks/alerts/:id` | `/api/stocks/alerts/:id` |
| `GET` | `/app-api/v1/stocks/alerts/events` | `/api/stocks/alerts/events` |
| `GET` | `/app-api/v1/stocks/history` | `/api/stocks/history` |
| `GET` | `/app-api/v1/stocks/market-events` | `/api/stocks/market-events` |
| `GET` | `/app-api/v1/stocks/portfolio` | `/api/stocks/portfolio` |
| `GET` | `/app-api/v1/stocks/sparklines` | `/api/stocks/sparklines` |
| `GET` | `/app-api/v1/stocks/watchlist` | `/api/stocks/watchlist` |
| `GET` | `/app-api/v1/wallet` | `/api/wallet` |
| `POST` | `/app-api/v1/wallet/transfers` | `/api/wallet/transfers` |
| `GET` | `/app-api/v1/work` | `/api/work` |
| `POST` | `/app-api/v1/work/active-job` | `/api/work/active-job` |
| `GET` | `/app-api/v1/work/assignments` | `/api/work/assignments` |
| `POST` | `/app-api/v1/work/assignments` | `/api/work/assignments` |
| `POST` | `/app-api/v1/work/assignments/:id/completions` | `/api/work/assignments/:id/completions` |
| `POST` | `/app-api/v1/work/assignments/:id/verify` | `/api/work/assignments/:id/verify` |
| `GET` | `/app-api/v1/work/profile` | `/api/work/profile` |
| `GET` | `/app-api/v1/work/receipts` | `/api/work/receipts` |
| `GET` | `/app-api/v1/work/tasks` | `/api/work/tasks` |
| `POST` | `/app-api/v1/work/tasks/:id/complete` | `/api/work/tasks/:id/complete` |
| `GET` | `/app-api/v1/auth/:provider/authorize` | `/auth/:provider/authorize` |
| `GET` | `/app-api/v1/auth/:provider/callback` | `/auth/:provider/callback` |
| `GET` | `/app-api/v1/media/:key` | `/media/:key` |
| `GET` | `/app-api/v1/media/profile/:key` | `/media/profile/:key` |

