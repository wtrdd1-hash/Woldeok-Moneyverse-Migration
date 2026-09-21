# v2026.09.22.329 — 관리자 민감 작업 step-up

## 범위
- 기준: `7cf972f0ed77711ab4d47b8315d6da8e73c26bce`.
- P0 보안 백로그: 관리자 step-up 검증.
- 문서 전용이 아닌 실제 런타임 변경.

## 변경
- 관리자 IP 허용 목록 교체 시 `ReauthGuard`를 필수화.
- 특정 회원의 모든 활성 세션 강제 종료 시 `ReauthGuard`를 필수화.
- 기존 관리자 콘솔, CSRF, 역할, 멱등성, 감사 제어는 유지.
- 두 민감 작업에 컨트롤러 메타데이터 회귀 테스트 추가.

## 검증
- [x] 집중 guard 테스트: 3/3.
- [x] Backend TypeScript typecheck.
- [x] `git diff --check`.
- [ ] exact-SHA GitHub CI.
- [ ] main 통합.
- [ ] Production 승격.

## 차단/후속
고아 DB migration `221-stock-halt-cost-basis-settlement.sql` 문제가 해결되지 않아 이번 변경에는 새 migration을 추가하지 않았다. 저장소 전체 DB actor-check 검증은 별도 P0 항목으로 유지한다.
