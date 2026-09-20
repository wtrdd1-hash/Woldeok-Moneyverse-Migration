# 상점 Envelope QA 수정 — v2026.09.20.301

날짜: 2026-09-20
브랜치: `qa/integrate-shop-v2026.09.20.300`
상태: 구현 / 재검증

## 범위

PR #590의 실제 PostgreSQL QA에서 migration 218의 결함 2건을 확인했습니다. 비활성 또는 존재하지 않는 사용자가 공개 구매 계약의 `22023` 검증 오류 대신 외래키 오류까지 진행될 수 있었고, 재실행 검증이 존재하지 않는 `shop_purchases.amount` 컬럼을 참조했습니다.

v2026.09.20.301은 공통 economic-command claim 전에 권위 있는 사용자/수량 검증을 복구하고, 저장된 영수증의 `unit_price * quantity` 값으로 재실행 금액을 검증하도록 수정합니다. 최소 권한 delegate와 economic-command 권한 경계는 그대로 유지합니다.

## QA 증거

- 로컬 lint: 오류 0건, 기존 Next.js 이미지 최적화 경고 11건.
- 로컬 typecheck: 통과.
- 로컬 API 계약 검사: 통과.
- 로컬 비-DB 백엔드 테스트: 895 통과 / 361 스킵.
- 로컬 프런트엔드 테스트: 683 통과.
- 로컬 운영 빌드: 통과.
- PR #590 PostgreSQL 17 migration gate: 테스트 실패 전에 통과.
- PR #590 최초 실제 DB 실행: 1,470건 통과, 상점 catalogue 2건 실패. 두 실패 모두 이번 수정 대상입니다.
- 신규 shop economic-command 권한 경계 DB 테스트는 실패 실행에서도 통과했습니다.

## 승격 정책

수정된 exact SHA가 실제 PostgreSQL 테스트를 포함한 CI와 격리 Test 후보의 백엔드/API 런타임 검증을 모두 통과하기 전에는 main, Test, Production 승격 대상이 아닙니다. 운영 승격은 기존 GitOps/Flux 경로를 통한 무중단 방식만 사용합니다.
