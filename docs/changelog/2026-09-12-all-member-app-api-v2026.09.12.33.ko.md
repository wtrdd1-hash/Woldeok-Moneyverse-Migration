# v2026.09.12.33 — 전체 회원 기능 앱 API 보강

## 변경 내용

- 일반 사용자/회원 기능을 `/app-api/v1/*` BFF를 통해 앱에서 사용할 수 있도록 전체 기능 범위를 다시 대조했다.
- 기존 앱 API에서 누락된 공개 콘텐츠/사업 관련 백엔드 루트를 발견하고 앱 전용 정식 별칭 API를 추가했다.
- 공지: `GET /app-api/v1/content/announcements`
- 갤러리: `GET /app-api/v1/content/photos`
- 서비스 상태: `GET /app-api/v1/content/status`
- 사업 카탈로그: `GET /app-api/v1/businesses/catalog`
- 사업 구매: `POST /app-api/v1/businesses/catalog/{id}/purchases`
- 사업 자기자본: `GET /app-api/v1/businesses/equity`
- Discord/Google OAuth 및 자체 `local_email` 회원가입/로그인은 v2026.09.12.32의 동일 세션/CSRF 인증 코어를 계속 사용한다.
- 관리자/Discord webhook/health probe/scheduler 내부면은 일반 사용자 앱 API에서 분리 유지한다.

## 전체 범위 문서

`docs/mobile-api-all-features.ko.md`를 기준 문서로 추가했다.

## 통합 예외

사용자 명시 지시에 따라 이번 버전은 Test 서버 검증을 생략하고 `main`에 통합한다.
