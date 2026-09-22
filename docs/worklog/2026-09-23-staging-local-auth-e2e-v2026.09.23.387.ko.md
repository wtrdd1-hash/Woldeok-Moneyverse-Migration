# v2026.09.23.387 — 격리 테스트 로컬 인증 E2E 차단 해소

## 범위
- Android 실제 E2E QA를 막던 `wdmv-test` 로컬 이메일 회원가입 경로를 수정합니다.
- 운영에서는 인증 이메일 전송 실패 시 기존처럼 fail-closed를 유지합니다.
- 명시적 테스트 플래그가 켜지고 `APP_BASE_URL` 호스트가 정확히 `test.easy-scraping.com`인 경우에만 검증 토큰을 응답합니다.

## 결함
- 격리 테스트 백엔드는 운영 유사성을 위해 `NODE_ENV=production`으로 실행됩니다.
- 테스트 스택에는 SMTP가 설정되어 있지 않습니다.
- 따라서 로컬 회원가입이 이메일 전송 실패를 HTTP 503으로 반환해 Android 가입/검증 E2E가 차단됐습니다.

## 구현
- `AppConfig`에 `localAuthTestVerificationTokenEnabled`를 추가했습니다.
- `LOCAL_AUTH_TEST_VERIFICATION_TOKEN_ENABLED=true`는 `test.easy-scraping.com`에서만 유효합니다.
- 안전한 테스트 플래그가 활성일 때만 메일 실패를 허용하고 1회용 검증 토큰을 반환합니다.
- `easy-scraping.com`에서는 플래그를 설정해도 강제로 비활성화되어 운영 동작은 변하지 않습니다.

## 검증
- 인증/설정 집중 테스트 37/37 통과.
- 백엔드 타입체크 통과.
- 로컬 DB fixture 없는 전체 테스트: 943 통과, DB 의존 361개는 기존 정책대로 skip.
- 백엔드 빌드 통과.

## 배포 게이트
- 브랜치: `fix/staging-local-auth-token-v2026.09.23.387`.
- exact-SHA 테스트 후보 배포 후 Android 에뮬레이터 회원가입/검증/로그인 실증 전에는 운영 승격하지 않습니다.