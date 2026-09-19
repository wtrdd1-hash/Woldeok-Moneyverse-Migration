# 월덕 머니버스 앱 인증 API 상세 가이드

> 버전: v2026.09.13.48
> 날짜: 2026-09-13
> 영어 기준 문서: [app-auth-api-guide.md](app-auth-api-guide.md)
> 공개 기본 주소: `https://easy-scraping.com`
> 앱 API prefix: `/app-api/v1`

## 1. 범위

이 문서는 네이티브/모바일 앱에서 자체 이메일 회원가입, 이메일 인증, 자체 로그인, 로그인 상태 확인, 로그아웃, Google/Discord OAuth 시작점을 구현할 때 사용하는 상세 계약이다.

앱은 `https://easy-scraping.com/app-api/v1/*`만 호출한다. APK/AAB/IPA 안에 backend `INTERNAL_API_TOKEN`, DB 계정, OAuth client secret, SMTP 계정, 관리자 계정 또는 서버 전용 secret을 넣지 않는다.

## 2. 인증 상태 흐름

자체 회원가입 기본 흐름:

`prelogin 세션 -> 현재 약관 조회 -> 동의 저장 -> 회원가입 -> 이메일 인증 -> 로그인 세션 -> viewer/session 확인`

prelogin과 로그인 상태 모두 서버 발급 쿠키를 사용한다. 네이티브 앱은 지속 가능한 CookieJar를 사용하고 쿠키 값을 로그/분석 이벤트에 남기지 않는다.

CSRF 보호가 필요한 변경 요청에는 현재 `csrfToken`을 `x-csrf-token` 헤더로 보낸다. 서버가 새 CSRF를 반환하면 기존 값을 교체한다.

## 3. 비밀번호 규칙

회원가입 비밀번호에는 더 이상 숫자로 된 최소 글자 수가 없다.

- 문자열이어야 하며 빈 문자열은 허용하지 않는다.
- NFC 정규화 후 기술적 최대치는 128 code point다.
- 공백과 Unicode를 허용한다.
- 대문자/소문자/숫자/특수문자 조합을 강제하지 않는다.
- 명백한 흔한 비밀번호는 거부할 수 있다.
- 서버는 비밀번호를 NFC 정규화한 뒤 Argon2id verifier로만 저장한다.
- HTTPS 인증 요청 외에는 평문 비밀번호를 저장/로그/전송하지 않는다.

제품 정책은 외부 NIST의 15자 권고와 의도적으로 다르다. 대신 common password 차단, rate limit, 계정 존재 여부를 숨기는 오류, Argon2id 저장은 유지한다.

## 4. Prelogin 세션 만들기

```http
POST /app-api/v1/auth/prelogin-session HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json

{}
```

앱 처리:

1. 응답의 `Set-Cookie`를 CookieJar에 저장한다.
2. JSON의 `csrfToken`을 다음 요청에 사용할 상태로 보관한다.
3. 아래 동의/회원가입/로그인 변경 요청에 쿠키와 CSRF를 함께 보낸다.

예시 응답 형태:

```json
{
  "csrfToken": "<opaque token>"
}
```

## 5. 현재 약관 버전 조회

```http
GET /app-api/v1/auth/policy HTTP/1.1
Host: easy-scraping.com
Cookie: <CookieJar가 prelogin 쿠키 전송>
```

응답의 `termsVersion`, `privacyVersion`을 사용한다. 앱에 버전을 하드코딩하지 않는다.

## 6. 필수 동의 저장

```http
PUT /app-api/v1/auth/consent HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json
Cookie: <prelogin cookie>

{
  "termsCompleted": true,
  "privacyCompleted": true,
  "ageConfirmed": true,
  "termsVersion": "<policy 응답 값>",
  "privacyVersion": "<policy 응답 값>"
}
```

현재 필수 동의가 없으면 회원가입은 `403`이 될 수 있다.

## 7. 이메일/비밀번호 회원가입

```http
POST /app-api/v1/auth/local/register HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json
Cookie: <prelogin cookie>

{
  "email": "member@example.com",
  "password": "내비밀번호",
  "displayName": "회원"
}
```

| 필드 | 형식 | 계약 |
|---|---|---|
| `email` | string | 정상 이메일, 최대 254자 |
| `password` | string | 빈 값 금지, 숫자형 최소 길이 없음, 최대 128 code point, 흔한 비밀번호 거부 가능 |
| `displayName` | string | 2~120자 |

정상 응답:

```json
{
  "accepted": true,
  "verificationRequired": true
}
```

운영에서는 인증 원문 token을 응답으로 내리지 않는다. 사용자는 설정된 인증메일 경로로 token을 받는다. 이메일 가입 여부를 추측하기 쉽게 만드는 응답을 앱에서 추가로 만들지 않는다.

## 8. 이메일 인증 및 가입 완료

```http
POST /app-api/v1/auth/local/verify-email HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json

{
  "token": "<이메일에서 받은 인증 token>"
}
```

이메일 token은 1회용이며 이 인증 요청에는 token만 필요하다. 가입을 시작한 prelogin cookie와 CSRF token은 다른 브라우저에서 완료할 때도 필요하지 않다. 성공하면 계정이 활성화되고 로그인 상태로 전환된다. 응답 `Set-Cookie`를 CookieJar에 반영하고 새 CSRF를 저장한다.

```json
{
  "outcome": "signed-in",
  "csrfToken": "<새 opaque token>",
  "consentCurrent": true
}
```

잘못되었거나 만료되었거나 이미 사용된 token은 모두 내부 상태를 구분해 노출하지 않는 동일한 인증 실패로 처리한다.

## 9. 이메일/비밀번호 로그인

먼저 prelogin 세션을 새로 만들거나 재사용한 뒤 호출한다.

```http
POST /app-api/v1/auth/local/login HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json
Cookie: <prelogin cookie>

{
  "email": "member@example.com",
  "password": "내비밀번호"
}
```

성공 시 새 세션 쿠키와 CSRF를 저장한다.

```json
{
  "outcome": "signed-in",
  "csrfToken": "<새 opaque token>",
  "consentCurrent": true
}
```

없는 이메일, 틀린 비밀번호, 비활성/잘못된 credential은 사용자에게 같은 계열의 `invalid credentials`로 처리한다. 이메일 존재 여부를 알려주는 문구를 만들지 않는다.

## 10. 실제 로그인 상태 확인

```http
GET /app-api/v1/auth/viewer HTTP/1.1
Host: easy-scraping.com
Cookie: <로그인 세션 cookie>
```

앱은 서버가 viewer를 로그인 상태로 확인한 뒤 authenticated shell로 이동한다. 로그인 HTTP 요청이 성공했다는 이유만으로 앱이 임의 로그인 상태를 만들지 않는다.

최신 세션/CSRF가 필요하면:

```http
GET /app-api/v1/auth/session HTTP/1.1
Host: easy-scraping.com
Cookie: <로그인 세션 cookie>
```

## 11. 로그아웃

```http
POST /app-api/v1/auth/logout HTTP/1.1
Host: easy-scraping.com
Content-Type: application/json
Cookie: <로그인 세션 cookie>

{}
```

성공 후 앱의 로그인 UI 상태를 비우고 서버가 내려준 쿠키 무효화를 CookieJar에 반영한다.

## 12. Google / Discord OAuth

시작점:

- `GET /app-api/v1/auth/google/authorize?client=mobile`
- `GET /app-api/v1/auth/discord/authorize?client=mobile`

provider 인증은 시스템 브라우저 또는 안전한 Custom Tab으로 연다. 앱에서 Google/Discord 비밀번호를 직접 받지 않는다. 서버 전용 secret을 넣지 않고, callback 값만 보고 앱이 임의 로그인 처리하지 않는다. 서버의 state/PKCE/OIDC 검증 완료를 기준으로 한다.

## 13. 상태 코드 처리

| 상태 | 앱 처리 |
|---|---|
| `200/201/202` | 응답 파싱, 쿠키/CSRF/세션 상태 갱신 |
| `400/422` | 입력 형식 오류. secret을 노출하지 않는 필드 오류 표시 |
| `401` | 인증 실패/만료. 필요한 경우 로그인 화면으로 이동 |
| `403` | 동의/CSRF/현재 상태/권한 조건 미충족 |
| `409` | 상태 또는 버전 충돌. 서버 상태를 다시 조회 후 재시도 |
| `429` | 인증 rate limit. 즉시 반복 호출 금지 |
| `5xx` | 서버 장애. 재시도 가능한 오류로 표시하되 내부 정보 숨김 |

비밀번호, 세션 쿠키, CSRF token, 이메일 인증 token, OAuth token, 내부 API token을 로그에 남기지 않는다.

## 14. 최소 구현 의사코드

```text
cookieJar = persistentSecureCookieJar()
prelogin = POST /auth/prelogin-session with cookieJar
csrf = prelogin.csrfToken
policy = GET /auth/policy with cookieJar
PUT /auth/consent with cookieJar + csrf + current policy versions
POST /auth/local/register with cookieJar + csrf + email/password/displayName
사용자가 이메일 token 수신
verified = POST /auth/local/verify-email with cookieJar + csrf + token
csrf = verified.csrfToken
viewer = GET /auth/viewer with cookieJar
assert viewer.signedIn == true
```

로그인은 동의/가입/인증 단계 대신 prelogin 이후 `/auth/local/login`을 호출하고 `/auth/viewer`로 최종 확인한다.

## 15. 릴리스 전 실제 확인

정확한 Test 서버 SHA에서 다음을 확인한다.

1. prelogin 세션과 CookieJar 유지
2. 약관 조회/동의
3. 짧은 비어있지 않은 비밀번호 가입 성공, 빈 값/명백한 common password 거부
4. 이메일 인증
5. 같은 계정 로그인
6. `/auth/viewer`의 로그인 확인
7. 로그아웃/재로그인
8. Google/Discord authorize 경로의 BFF 응답
9. 앱 번들에 서버 secret이 없는지 확인
