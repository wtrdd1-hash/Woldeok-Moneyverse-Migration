# 주식 알림 딥링크 작업 기록 — v2026.09.14.85

## 기준선 및 중복 검토

- 개발 시작 직전 최신 앱 main: `460efaefa3faa0d5bee18bd3aa73760b409d5797` (PR #289 병합 커밋).
- PR #289가 활성 주식 상세/토론/비교 스택과 인증·모바일 호환 작업을 이미 통합했으므로 오래된 주식 브랜치가 아니라 이 최신 통합 기준선에서 작업했다.
- Economy Scenario Lab, Event Calendar, Trusted Client IP hardening, Business Settlement Boost, Admin edit-state safety, Conditional Alerts, Account Security Center, Personal Dashboard, Portfolio Analysis 구현 커밋은 모두 현재 main의 조상임을 확인해 중복 이식하지 않았다.

## 런타임 변경

- `frontend/src/app/stocks/alerts/page.tsx`: `stock` 검색 파라미터를 읽고 현재 시장 종목과 매칭한다.
- `frontend/src/app/stocks/alerts/alert-manager.tsx`: 알림 생성 폼에서 매칭된 종목을 기본 선택한다.
- `frontend/src/app/stocks/alerts/alert-deeplink.ts`: 안전한 심볼→종목 해석 로직을 분리했다.
- `frontend/src/app/stocks/alerts/alert-deeplink.test.ts`: 대소문자/반복 파라미터/누락/알 수 없는 심볼 회귀 테스트를 추가했다.
- backend/API/DB 계약은 변경하지 않았다.

## 사용자 효과

종목 상세에서 알림 설정으로 이동한 회원이 같은 종목을 다시 선택할 필요가 없어지고, 직전에 선택한 종목 맥락이 알림 생성까지 이어진다.

## 배포 게이트

Secret scan, lint, typecheck, tests, build, CI, 격리 Test exact-SHA, 운영 smoke를 모두 통과하기 전에는 운영 승격하지 않는다.
