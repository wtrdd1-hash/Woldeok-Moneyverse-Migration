# v2026.09.12.32 — 앱 API + 자체 인증

## 추가

- 기존 OAuth와 동일한 세션/CSRF 코어를 사용하는 `local_email` 자체 회원가입·로그인 API.
- 해시로 저장하는 1회용 이메일 인증 토큰과 계정 활성화 API.
- Node 기본 Argon2id 비밀번호 해시(19MiB / 2회 / p=1 기준).
- SECURITY DEFINER 함수 뒤에 둔 최소권한 credential/가입대기 DB 테이블.
- 인증 보안 이벤트 저장과 계정 존재 여부를 구분하지 않는 일반 로그인 실패 응답.
- 로그인 provider 조회에 `local_email` 추가.

## 기존 앱 로그인 지원 유지

- Discord OAuth Authorization Code + PKCE.
- Google OAuth/OIDC Authorization Code + PKCE.
- 서버에서만 내부 API 토큰을 붙이고 앱에는 내부 비밀값을 노출하지 않는 `/app-api/v1/*` BFF.

## 배포 상태

아직 Production 배포하지 않았다. GitHub CI와 분리된 Test 서버 검증을 먼저 통과해야 한다. 현재 `@미니pc홍`이 오프라인이라 Test 서버 검증 단계는 대기 상태다.

Production 자체 회원가입은 실제 인증메일 발송 어댑터와 발신 도메인 설정이 추가로 필요하며, Production에서는 원문 인증 토큰을 응답하지 않는다.
