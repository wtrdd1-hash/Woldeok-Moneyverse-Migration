# 회원 제한 step-up — v2026.09.22.332

상태: 로컬 검증 통과; exact-SHA CI 대기.

## 범위

- abuse-security step-up 병합 이후 최신 main과 열린 통합/의존성 PR을 확인했습니다.
- 계정 접근 상태를 바꾸지만 관리자 세션과 CSRF만 요구하던 회원 제한 mutation을 남은 민감 작업으로 선택했습니다.
- route 계약과 DB mutation 경로를 변경하지 않고 `ReauthGuard`를 추가했습니다.
- focused guard 회귀 테스트를 추가했습니다.

## 게이트

- 로컬 focused test/typecheck/diff check: 통과 (focused test 1/1).
- exact-SHA CI / isolated Test / Production 승격: 대기.
