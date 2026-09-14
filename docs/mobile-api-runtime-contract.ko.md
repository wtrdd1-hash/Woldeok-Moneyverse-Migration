# 모바일 앱 API 런타임 계약

[English](mobile-api-runtime-contract.md) | **한국어** | [모바일 API 전체 명세](mobile-api-complete-spec.ko.md)

업데이트 버전: **v2026.09.14.76**

이 문서는 Android/iOS 앱이 실제 런타임에서 따라야 하는 응답 형태와 상태 처리 규칙을 고정한다. 단순 엔드포인트 목록이 아니라 쿠키, CSRF, null 처리, 프로필, 게시판, 갤러리의 요청/응답 예제를 포함한다.

## 1. 유일한 앱 API 기준점

앱은 `https://easy-scraping.com/app-api/v1/*`만 호출한다. `/api/v1/*`는 앱 계약이 아니며 private backend 주소나 `INTERNAL_API_TOKEN`을 앱에 포함하지 않는다.

모든 로그인 이후 요청은 같은 persistent secure CookieJar를 사용한다. 서버가 `Set-Cookie`를 보내면 CookieJar에 반영해야 하며, 이후 GET/POST에도 같은 세션 쿠키가 자동으로 포함되어야 한다. 상태 변경 요청은 마지막으로 받은 `csrfToken`을 `X-CSRF-Token` 헤더로 전송한다.

## 2. 인증 상태 머신

앱 시작 시 `GET /app-api/v1/auth/viewer`를 호출한다. 성공 응답의 `signedIn === true`만 로그인 완료로 인정한다.

```json
{
  "signedIn": true,
  "consentCurrent": true,
  "adminRoles": []
}
```

네트워크 오류를 로그아웃으로 간주하지 않는다. `signedIn:false`가 서버에서 정상 응답된 경우에만 비로그인 상태로 전환한다.

### 이메일 회원가입

1. `POST /app-api/v1/auth/prelogin-session`
2. `POST /app-api/v1/auth/register`에 이메일, 비밀번호, 표시명을 전송
3. 이메일의 인증 링크/토큰으로 `POST /app-api/v1/auth/verify-email`
4. 반환된 `Set-Cookie`와 `csrfToken` 저장
5. `GET /app-api/v1/auth/viewer`에서 `signedIn:true` 확인

대표 메일 도메인 오타는 400으로 거부된다. 예: `nvaer.com`은 `naver.com` 교정 안내를 받는다. SMTP 전달 실패는 성공으로 위장하지 않는다.

### Google/Discord 네이티브 로그인

1. `GET /app-api/v1/auth/{google|discord}/authorize?client=mobile`
2. JSON의 `authorizationUrl`을 시스템 브라우저/Custom Tab으로 연다.
3. provider 승인 후 서버가 `woldeok-moneyverse://oauth/callback?code=...&provider=...`로 앱을 호출한다.
4. 앱은 opaque `code`를 `POST /app-api/v1/auth/mobile/handoff`에 한 번만 전송한다.
5. 반환된 `Set-Cookie`와 `csrfToken`을 저장한다.
6. `GET /app-api/v1/auth/viewer`에서 `signedIn:true` 확인 후 화면을 연다.

`mobile/handoff` code는 로그, analytics, crash report에 기록하지 않는다.

## 3. 내 프로필 — null 문제 방지 계약

`GET /app-api/v1/profile`은 로그인된 본인의 프로필을 반환한다. v2026.09.14.76부터 앱용 camelCase 필드를 명시적으로 제공하고, 기존 웹 호환을 위한 snake_case 필드도 `profile` 객체 안에 유지한다.

정상 예시:

```json
{
  "displayName": "월덕",
  "imageUrl": null,
  "joinedAt": "2026-09-14T03:00:00.000Z",
  "jobType": null,
  "jobLevel": 0,
  "workCompletions": "0",
  "visibility": "members",
  "featuredTitle": null,
  "email": "member@example.com",
  "profile": {
    "display_name": "월덕",
    "image_url": null,
    "joined_at": "2026-09-14T03:00:00.000Z",
    "job_type": null,
    "job_level": null,
    "work_completions": "0",
    "visibility": "members",
    "featured_title": null,
    "displayName": "월덕",
    "imageUrl": null,
    "joinedAt": "2026-09-14T03:00:00.000Z",
    "jobType": null,
    "jobLevel": 0,
    "workCompletions": "0",
    "featuredTitle": null,
    "email": "member@example.com"
  }
}
```

앱은 **camelCase 필드**를 기본으로 사용한다. v2026.09.14.76부터 앱 게이트웨이는 모든 JSON 객체에서 기존 키를 보존하면서 snake_case 키의 camelCase 별칭을 재귀적으로 추가한다. 이미 같은 camelCase 키가 있으면 기존 camelCase 값이 우선하며 덮어쓰지 않는다. `displayName`과 `joinedAt`을 `name`, `username`, `joined_at` 같은 임의 키로 추측하지 않는다.

### null 의미

- `displayName`: 활성 회원이면 DB의 프로필 표시명 또는 최초 연결 identity 표시명으로 보강되므로 정상 계정에서 보통 null이 아니다.
- `joinedAt`: 활성 회원이면 가입 시각이며 정상 계정에서 null이 아니다.
- `jobType`: 아직 직업 진행이 없으면 null이 정상이다.
- `jobLevel`: 앱 계약에서는 직업이 없으면 `0`으로 정규화한다.
- `workCompletions`: 앱 계약에서는 없으면 문자열 `"0"`으로 정규화한다. bigint 정밀도를 위해 문자열이다.
- `featuredTitle`: 대표 칭호를 고르지 않았으면 null이 정상이다. UI에는 `칭호 없음`을 표시한다.
- `imageUrl`: 프로필 이미지를 등록하지 않았으면 null이 정상이다. 기본 아바타를 표시한다.
- `email`: 로컬 이메일 계정이면 본인에게만 검증된 이메일을 반환한다. Google/Discord-only 계정은 현재 이메일을 저장하지 않으므로 null이 정상이다. UI에는 `연결된 이메일 없음`을 표시하고 문자열 `null`을 출력하지 않는다.

**어떤 nullable 필드도 화면에 문자열 `null`로 렌더링하지 않는다.**

권장 Android 매핑:

```kotlin
data class MyProfileResponse(
    val displayName: String?,
    val imageUrl: String?,
    val joinedAt: String,
    val jobType: String?,
    val jobLevel: Int = 0,
    val workCompletions: String = "0",
    val visibility: String,
    val featuredTitle: String?,
    val email: String?
)
```

렌더링 예:

```kotlin
nameText.text = profile.displayName ?: "이름 미설정"
titleText.text = profile.featuredTitle ?: "칭호 없음"
emailText.text = profile.email ?: "연결된 이메일 없음"
levelText.text = "Lv. ${profile.jobLevel}"
```

## 4. 프로필 수정

`PUT /app-api/v1/profile`은 PATCH가 아니라 **전체 replacement**다. 기존 값을 유지하려면 현재 화면 state를 모두 다시 보낸다.

```json
{
  "visibility": "members",
  "displayName": "월덕",
  "imageUrl": null,
  "fieldVisibility": {
    "imageUrl": "public",
    "jobType": "members",
    "workCompletions": "members",
    "featuredTitle": "public"
  },
  "featuredTitle": null
}
```

변경 요청에는 `X-CSRF-Token`이 필요하다. 저장 성공 뒤 반드시 `GET /profile`을 다시 호출해 서버 상태로 UI를 교체한다.

## 5. 다른 사용자 프로필

`GET /app-api/v1/profile/:userId`는 상대방의 공개 설정이 허용한 항목만 반환한다. 이 응답에 이메일을 추가하거나 추론하면 안 된다. 공개 범위 때문에 숨겨진 항목은 null일 수 있으며 이는 데이터 손실이 아니라 개인정보 보호 결과다.

## 6. 게시판

로그인 사용자 목록: `GET /app-api/v1/board/posts`

```json
{
  "posts": [
    {
      "postId": "uuid",
      "title": "제목",
      "authorName": "월덕",
      "createdAt": "2026-09-14T03:00:00.000Z",
      "updatedAt": null,
      "commentCount": 2,
      "mine": true,
      "hasImage": false
    }
  ]
}
```

상세: `GET /app-api/v1/board/posts/:id` → `{ "post": {...} }`

댓글: `GET /app-api/v1/board/posts/:id/comments` → `{ "comments": [...] }`

글 작성: `POST /app-api/v1/board/posts`, 댓글 작성: `POST /app-api/v1/board/posts/:id/comments`. 모든 write는 CSRF와 UUID idempotency key가 필요하다. write 성공 후 목록/상세를 다시 읽는다.

비로그인 공개 게시판은 `/app-api/v1/board/public/posts*`를 사용한다.

## 7. 갤러리

공개 갤러리 조회는 `GET /app-api/v1/content/photos`이며 로그인 없이 사용할 수 있다.

```json
{
  "photos": [
    {
      "photoId": "uuid",
      "imageUrl": "/media/...",
      "altText": "설명",
      "publishedAt": "2026-09-14T03:00:00.000Z"
    }
  ]
}
```

회원 업로드는 2단계다.

1. `POST /app-api/v1/photos/uploads`에 이미지 raw bytes 전송 → storage key 수신
2. `POST /app-api/v1/photos`에 `storageKey`, `altText`, `idempotencyKey` 전송 → 검토 대기 등록

내 제출물은 `GET /app-api/v1/photos/mine`에서 확인한다. 공개 갤러리와 내 제출물은 서로 다른 API다.

## 8. HTTP 상태 처리

- `200/201/204`: 성공
- `400`: 요청 필드/형식 오류
- `401`: 세션 없음, 만료, handoff code 무효/재사용
- `403`: 권한 또는 CSRF 거부
- `404`: 리소스 없음 또는 개인정보 보호상 숨김
- `409`: 현재 상태와 충돌
- `428`: 최신 약관/동의가 필요한 상태
- `429`: rate limit
- `503`: DB/SMTP/스토리지 등 필수 의존성 사용 불가

오류 응답을 빈 성공 모델로 역직렬화하지 않는다. HTTP가 2xx가 아니면 화면 model을 `null`로 덮어쓰지 말고 오류 상태를 별도로 표시한다.

## 9. 앱 공통 네트워크 체크리스트

- 한 개의 persistent CookieJar를 로그인부터 모든 API 호출까지 공유한다.
- `Set-Cookie`를 임의로 문자열 파싱하지 않는다.
- CSRF token은 secure storage에 두고 write에만 헤더로 보낸다.
- `auth/viewer.signedIn`을 로그인 진실값으로 사용한다.
- API 응답의 JSON wrapper (`profile`, `posts`, `comments`, `photos`)를 정확히 읽는다.
- 새 앱 코드는 camelCase를 기준으로 한다. legacy snake_case는 호환 목적으로 계속 제공된다.
- 모든 앱 API 응답의 `X-Moneyverse-Api-Version`, `X-Moneyverse-Contract-Version`, `X-Moneyverse-Field-Naming`을 진단에 사용할 수 있다.
- nullable 값은 명시적 placeholder로 렌더링한다.
- write 성공 뒤 authoritative GET으로 재동기화한다.
- 401/428/429/5xx를 빈 데이터로 치환하지 않는다.
- handoff code, 세션 쿠키, CSRF token, 내부 토큰을 로그로 남기지 않는다.

## 10. 운영 검증 기준

배포 전 Test에서 최소 다음을 확인한다.

1. `/api/version`이 배포 대상 exact SHA와 일치한다.
2. `/app-api/v1/shop/public-catalog`이 200이고 DB 기반 catalogItems가 비어 있지 않다.
3. 로그인 계정에서 `/app-api/v1/auth/viewer`가 `signedIn:true`다.
4. `/app-api/v1/profile`의 `displayName`, `joinedAt`이 기대한 값이다.
5. 로컬 이메일 계정은 `email`이 본인 요청에서만 보인다.
6. 공개 프로필에는 이메일이 보이지 않는다.
7. 게시판 목록 wrapper가 `posts`, 공개 갤러리 wrapper가 `photos`다.
8. Test 환경은 `X-Robots-Tag: noindex`를 유지한다.

Production은 동일 exact SHA의 Test 검증이 성공한 뒤 GitOps로만 승격한다.
