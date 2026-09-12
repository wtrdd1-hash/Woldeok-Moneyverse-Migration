# 사업체 운영·공급망 — v2026.09.12.25

기준일: 2026-09-12

## 추가

- `BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.md`와 한국어 대응본을 추가했다.
- 사업체를 고정 일일매출/운영비 자산에서 조달·재고·운영·물류·정산·유지보수·지점네트워크 중심의 능동 시스템으로 확장했다.
- 일반 사업체 보유, 지점수, 조달횟수, 운영run, 창고확장에 기본 무제한 정책을 적용했다.
- 사업 흐름을 `HARD_SINK`, `TRANSFER`, `CONVERTER`, `HOLD`, `FAUCET`으로 명시적으로 분류했다.
- 등록, 창고, 지점, 리모델링, 브랜딩, 광고, 유지보수, 물류, 인증, 아카이브, 본사, 사업보호 서비스의 구현형 소비처 카탈로그를 추가했다.
- 임의 성장 하드캡 대신 창고/지점/본사에 점진적 가격곡선을 적용했다.
- 서버 권위 수요모델과 운영run, 원자적·멱등 정산 계약을 추가했다.
- 배송, 계약, 광고, 전문화, 명예, 게임 내부 사업보호 서비스 설계를 추가했다.
- Season 1 사업 온보딩과 Season 2 Industrial Expansion 연동을 추가했다.
- 권장 DB 엔티티, API 계약, 오류코드, 분석이벤트, 관리자 config, 경제대시보드, 완료조건을 정의했다.
- 기존 마이그레이션의 작업 `daily_limit` seed와 고정 일일매출 사업 데이터는 적용된 마이그레이션을 수정하지 않고 향후 forward-only 정책 정합화가 필요하다고 기록했다.

## 검토한 외부 자료

- Microsoft PlayFab Economy V2 Stores: 카탈로그 정체성과 Store별 가격 override 분리.
- Microsoft PlayFab Inventory/idempotent transaction 문서: 재시도 안전한 가치변경 쓰기.
- EVE Online 2026년 8월 Monthly Economic Report(2026-09-09 공개): 가상경제 활동과 가격추세 관측.
- TradingView Demo/Paper Trading 및 과거 리플레이 문서: 실제 자금노출과 분리된 가상 학습.

## 검증

문서-only 변경이다. 런타임/API/DB 마이그레이션/배포 동작은 변경하지 않았으므로 이번 문서 개정 자체에는 테스트서버 배포가 필요하지 않다. 이 명세를 실제 구현할 때는 별도 개발 브랜치에서 exact-SHA 격리 Test 검증을 거친 뒤 Production으로 승격해야 한다.