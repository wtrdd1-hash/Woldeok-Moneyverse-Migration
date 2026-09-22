# v2026.09.22.357 — Admin role step-up authentication

## English canonical
- Require recent reauthentication for administrative role grants and revocations.
- Preserve existing session, consent, admin-session, CSRF, idempotency, repository authorization, and audit semantics.
- Add controller metadata regression coverage for both privilege mutations.

## 한국어
- 관리자 역할 부여와 회수에 최근 재인증을 요구합니다.
- 기존 세션, 동의, 관리자 세션, CSRF, 멱등성, repository 권한 검사 및 감사 의미는 유지합니다.
- 두 권한 변경 endpoint의 guard 회귀 테스트를 추가했습니다.
