# 월덕 머니버스 모바일/앱 API — 전체 상세 사용 가이드

> 버전: v2026.09.13.48
> 날짜: 2026-09-13  
> 변경 전 기준 main: `a57fc851c2800d77c8bb284cb1c168cfb3638bc2`
> 영어 원문: [mobile-api-reference.md](mobile-api-reference.md)

## 1. 목적과 구조

이 문서는 네이티브/모바일 앱이 실제로 사용해야 하는 기준 API 문서다. 일반 회원 기능은 모두 다음 경계를 사용한다.

`모바일 앱 -> HTTPS https://easy-scraping.com/app-api/v1/* -> Next.js BFF -> 비공개 NestJS API -> PostgreSQL`

앱 APK/AAB 안에 `INTERNAL_API_TOKEN`, DB 비밀번호, OAuth client secret, SMTP 비밀값, 관리자 계정을 절대 넣지 않는다. 내부 토큰은 BFF가 서버에서만 붙인다.

## 2. 공통 호출 규칙

- 기본 주소: `https://easy-scraping.com`
- 앱 API prefix: `/app-api/v1`
- JSON 요청: `Content-Type: application/json`
- 이미지 업로드: base64가 아니라 실제 이미지 바이트와 올바른 Content-Type 사용
- 로그인 상태: 서버가 발급하는 Secure/HTTP-only 세션 쿠키를 앱의 CookieJar에 저장하고 계속 전송
- 변경 요청: 최신 CSRF 토큰을 받아 `x-csrf-token` 헤더로 전송
- `401`: 미로그인/인증 실패, `403`: 권한·동의 부족, `409`: 상태/버전 충돌, `400/422`: 입력 오류, `5xx`: 서버 장애로 처리

## 3. 자체 이메일 회원가입 순서

인증 전용 상세 연동 문서: [app-auth-api-guide.ko.md](app-auth-api-guide.ko.md).

1. `POST /app-api/v1/auth/prelogin-session` 호출. 응답 `Set-Cookie`와 `csrfToken` 저장.
2. `GET /app-api/v1/auth/policy`에서 현재 `termsVersion`, `privacyVersion` 조회.
3. `PUT /app-api/v1/auth/consent`에 세션 쿠키 + `x-csrf-token`과 다음 JSON 전송:
   `{"termsCompleted":true,"privacyCompleted":true,"ageConfirmed":true,"termsVersion":"...","privacyVersion":"..."}`
4. `POST /app-api/v1/auth/local/register`에 `{"email":"member@example.com","password":"내비밀번호","displayName":"이름"}` 전송. 숫자형 최소 글자 수 제한은 없다. 빈 비밀번호는 거부하고 기술적 최대치는 128 code point이며, 명백한 흔한 취약 비밀번호는 거부한다.
5. 인증메일의 token을 `POST /app-api/v1/auth/local/verify-email`에 같은 prelogin 쿠키/CSRF와 함께 전송.
6. 성공 시 새 `Set-Cookie`를 저장한다. 응답의 새 `csrfToken`과 `consentCurrent`를 사용한다.

## 4. 자체 이메일 로그인 순서

1. `POST /app-api/v1/auth/prelogin-session`으로 prelogin 세션/CSRF 생성.
2. `POST /app-api/v1/auth/local/login`에 세션 쿠키 + CSRF + `{"email":"...","password":"..."}` 전송.
3. 성공 응답의 새 세션 쿠키와 CSRF 저장.
4. `GET /app-api/v1/auth/viewer`에서 `signedIn:true` 확인.

존재하지 않는 이메일과 틀린 비밀번호는 같은 인증 실패 응답을 사용해 계정 존재 여부를 노출하지 않는다.

## 5. Google/Discord OAuth — 네이티브 앱 복귀

앱은 `GET /app-api/v1/auth/google/authorize?client=mobile` 또는 Discord 동일 경로를 호출한다. BFF는 provider URL을 직접 주지 않고 `https://easy-scraping.com/auth/{provider}/authorize?client=mobile` 브라우저 시작 URL을 `authorizationUrl`로 반환한다. 앱은 이 URL을 시스템 브라우저/Custom Tab으로 연다.

OAuth 완료 후 웹 callback은 브라우저 세션을 앱 세션으로 재사용하지 않는다. 대신 5분짜리 1회용 handoff code를 만들고 기본 deep link `woldeok-moneyverse://oauth/callback?code=...&provider=google|discord`로 앱을 연다. 앱은 이 URI scheme/host/path를 등록해야 한다. 운영에서 다른 앱 링크를 사용할 경우 서버 `MOBILE_OAUTH_RETURN_URI`를 그 고정 URI로 설정한다. 사용자 입력 URI는 허용하지 않는다.

앱이 deep link의 `code`를 받으면 즉시 `POST /app-api/v1/auth/mobile/handoff`에 JSON `{"code":"..."}`를 보낸다. 성공 응답의 `Set-Cookie`, `csrfToken`, `consentCurrent`를 앱 CookieJar/세션 저장소에 반영한다. handoff code는 한 번 사용되면 즉시 폐기되며 재사용 시 401이다. code를 로그, analytics, crash report에 기록하지 않는다.

웹 로그인은 기존 `/auth/{provider}/authorize` 흐름을 그대로 사용하며 웹 callback 후 웹사이트로 복귀한다. Google Play 심사에는 개발자 개인 Google/Discord 계정이 아니라 별도의 자체 로그인 심사용 계정을 제공한다.

## 6. 로그인 이후 CSRF 사용법

로그인된 상태에서 `GET /app-api/v1/auth/session`을 호출해 최신 CSRF를 발급/회전한다. 변경이 있는 `POST`, `PUT`, `PATCH`, `DELETE` 호출에는 필요한 경우 `x-csrf-token`을 넣고 세션 쿠키를 함께 보낸다.

## 7. 이미지/미디어

- 갤러리: `POST /app-api/v1/photos/uploads`에 이미지 바이트 업로드 → 받은 storage key로 `POST /app-api/v1/photos` 등록
- 게시판 이미지: `POST /app-api/v1/board/images/uploads`
- 프로필 이미지: `POST /app-api/v1/profile/image`
- 미디어 읽기: `/app-api/v1/media/*`를 backend version-neutral `/media/*`로 정확히 매핑하도록 v45에서 수정
- 각 API의 크기/형식 제한을 지켜야 하며 임의 base64 포장을 하지 않는다.

## 8. 의도적인 보안 제외

`/admin/*`, `/integrations/*`, `/health`, scheduler/worker 내부 경로, DB 직접 접근은 일반 앱에서 차단한다. 이는 누락이 아니라 보안 경계다.

## 9. Google Play 심사 전 필수 확인

운영 build SHA, 공개 카탈로그, 인증 제공자, 심사용 자체 로그인, viewer, 로그인 후 최소 1개 기능 조회, 로그아웃/재로그인, 개인정보처리방침/약관, 계정 삭제·개인정보 요청 진입점, 모든 앱 버튼의 API 404/5xx 여부를 확인한다. 아직 구현되지 않은 기능은 앱 UI에서 숨기거나 비활성화하고 죽은 버튼을 노출하지 않는다.

## 10. 아직 planned/partial인 장기 기능

비밀번호 찾기/변경과 로그인 이메일 변경, 통합 알림/푸시 설정, 전역 사용자 검색, 일반 사용자 MFA/패스키는 현재 기획상 planned/partial이다. 실제 앱 기능으로 광고하거나 활성화하려면 먼저 backend contract와 runtime 검증을 완료해야 한다.

## 11. v2026.09.13.48 인증 변경 사항

- 자체 회원가입 비밀번호의 숫자형 최소 글자 수 제한 제거. 빈 비밀번호 거부와 128 code point 기술적 최대치는 유지.
- 쿠키/CSRF 흐름, 요청/응답 예시, 오류 처리까지 포함한 인증 전용 상세 API 문서 추가.
- common password 차단, Argon2id 저장, 인증 공격 방어는 유지.

## 12. v2026.09.13.48 수정 사항

- `183-local-email-auth-registration-conflict-fix.sql`: 자체 회원가입 완료 시 PostgreSQL SQLSTATE 42702 수정
- 실제 PostgreSQL 기반 자체 회원가입 완료 회귀 테스트 추가
- `/media/*` 및 OAuth version-neutral 경로의 앱 BFF 매핑 수정
- 운영 백엔드 전체 route map을 다시 추출해 앱 경로와 대조

## 전체 감사된 사용자 API 라우트 목록

기준: 2026-09-13 운영 NestJS 재시작 후 실제 route map. 전체 backend route: **239**. 아래 사용자 앱 매핑: **143**. 관리자, Discord webhook, health probe, worker/control-plane 경로는 의도적으로 제외한다.

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
