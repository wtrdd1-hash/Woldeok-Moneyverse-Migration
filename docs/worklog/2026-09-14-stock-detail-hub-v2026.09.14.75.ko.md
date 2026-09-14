# 2026-09-14 — 종목 상세 허브 v2026.09.14.75

## 기준선·중복 검토

- `origin/main` `2bb84e2b1272ee40c373aa9bd8ee89ab08b286ea`에서 시작했다.
- 원격의 유일한 비-main 앱 브랜치 `feature/app-auth-simplify-v2026.09.13.48`은 인증 영역만 변경하여 주식 허브와 겹치지 않음을 확인했다.
- Economy Scenario Lab, Event Calendar, Business Settlement Boost, Trusted Client IP, Admin edit-state, Stock-tagged Community, Stock Comparison, Conditional Alerts, Account Security Center, Personal Dashboard, Portfolio Analysis의 기존 작업은 현재 main에 이미 반영된 흔적을 확인했다.
- 작업 중 main이 문서 전용 성장 기획 변경 `40e1e504241d5769c9674cd821bda651e5f3ad22`로 전진해 최신 main으로 rebase 후 검증했다.

## 런타임 변경

- `/stocks/[symbol]`에 첫 회원용 canonical 가상 종목 상세 허브를 추가했다.
- 현재가/일중 범위/공급량, 관심종목, 서버 기준 보유 현황, 기존 캔들차트/거래 기능, 종목 비교·조건부 알림, 최근 종목 태그 토론을 한 화면에 연결했다.
- `/stocks` 종목 카드에서 허브로 바로 이동할 수 있게 했다.

## 검증

- `pnpm lint`: PASS. 이번 변경 밖의 기존 `no-img-element` 경고 11개만 남음.
- `pnpm typecheck`: 최신 main rebase 후 PASS.
- `pnpm test`: contract 23, database 7, backend 852 통과/환경 게이트 353 skip, frontend 551 통과. 신규 허브 테스트 3/3 PASS.
- DB 스키마나 쓰기 계약은 변경하지 않았고, 실제 PostgreSQL 통합 테스트 중 저장소 정책상 환경이 없으면 skip되는 항목은 그대로 유지됐다.

## 배포 상태

- 테스트 exact-SHA, main 병합, 운영 배포·smoke는 직접 증거가 확인된 뒤에만 완료로 기록한다.
