# 내부 작업내역 — v2026.09.12.32 앱 API + 자체 인증

기준일: 2026-09-12
브랜치: `feat/app-api-local-auth-v2026.09.12.32`
범위: 회원용 앱 API 인증

## 구현 내용

- 기존 `/app-api/v1/*` BFF 게이트웨이를 유지해 네이티브/모바일 앱에 `INTERNAL_API_TOKEN`이 노출되지 않도록 했다.
- 앱 게이트웨이가 `auth`를 포함한 모든 회원용 API 그룹을 전달하고 관리자/Discord 내부 연동 그룹은 제외하는 구조를 확인했다.
- Discord/Google OAuth는 기존 Authorization Code + PKCE + 서버 세션 흐름을 그대로 사용한다.
- 같은 서버 세션 체계 안에 `local_email` 자체 인증 provider를 추가했다.
- 자체 회원가입, 이메일 인증 완료, 자체 로그인 API를 추가했다.
- Node 기본 crypto Argon2id를 사용하고 메모리 19MiB, 2회 반복, parallelism 1 기준을 적용했다.
- credential/가입대기/security event 테이블을 앱 역할이 직접 읽지 못하게 하고 SECURITY DEFINER 함수로만 접근하게 했다.
- SQL은 bind parameter와 고정 DB 함수만 사용하도록 했다.
- 존재하지 않는 이메일과 틀린 비밀번호 모두 동일한 인증 실패 응답을 사용하고, 미존재 이메일에도 dummy Argon2 연산을 수행한다.
- Test/CI에서만 이메일 인증 토큰을 응답할 수 있게 했으며 Production에서는 원문 인증 토큰을 반환하지 않는다.

## 앱 API 경로

- `POST /app-api/v1/auth/prelogin-session`
- `GET /app-api/v1/auth/policy`
- `PUT /app-api/v1/auth/consent`
- `GET /app-api/v1/auth/providers`
- `GET /app-api/v1/auth/discord/authorize`
- `GET /app-api/v1/auth/google/authorize`
- `GET /app-api/v1/auth/discord/callback`
- `GET /app-api/v1/auth/google/callback`
- `POST /app-api/v1/auth/local/register`
- `POST /app-api/v1/auth/local/verify-email`
- `POST /app-api/v1/auth/local/login`
- `POST /app-api/v1/auth/logout`

## 검증 상태

- 저장소 구현과 Argon2id 단위 테스트를 추가했다.
- 현재 `@미니pc홍` 장치가 오프라인이어서 필수 Test 서버 직접 배포 검증은 아직 수행하지 못했다.
- 다음 검증 단계는 GitHub PR CI이며, CI와 Test 서버가 모두 통과하기 전에는 Production 배포하지 않는다.

## 남은 Production 차단 항목

Production 자체 회원가입에는 SPF/DKIM/DMARC를 적용한 실제 인증메일 발송 어댑터가 추가로 필요하다. API와 인증 토큰 수명주기는 구현했지만 Production에서는 보안상 원문 인증 토큰을 응답하지 않는다.
