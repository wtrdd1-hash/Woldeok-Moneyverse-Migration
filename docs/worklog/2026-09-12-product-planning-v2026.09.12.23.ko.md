# 제품 기획 작업기록 — v2026.09.12.23

기준일: 2026-09-12
범위: 기본 무제한 정책 정합성 / 경제 제어

## 검토 자료

- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PRODUCT_GROWTH_PLAN.md`
- `docs/planning/PRODUCT_DESIGN_SPEC.md`
- `docs/planning/SEASON_SYSTEM_SPEC.md`
- `docs/planning/DEFAULT_LIMIT_POLICY.md`
- `docs/planning/ECONOMY_SINKS_SPEC.md`
- 현재 main에 통합된 거래소, 은행, 클럽, 커뮤니티/시장무결성 기획
- 최신 열린 기획/런타임 PR 상태

## 확인사항

1. `DEFAULT_LIMIT_POLICY.md`는 정상 플레이에서 `null/unlimited`를 기본으로 명확히 정의하고 있다.
2. 과거 `PRODUCT_DESIGN_SPEC.md`에는 아직 `계정당 미체결 주문 최대 20개`, 유동 WLD 20% 단일 주문 규칙, 튜토리얼 수량 제한이 남아 있다.
3. `SEASON_SYSTEM_SPEC.md`에는 XP 소스 최대치, ST 발행 목표, Legacy 전환 100 ST 고정 상한, 시즌 랭크 WLD 보상 최대치가 존재한다.
4. 이 값들은 의미가 서로 달라 기계적으로 전부 삭제하면 안 된다. 일반 하드캡, 튜토리얼 규칙, 콘텐츠 예산, 보상예산, 실제 무결성 보호를 구분해야 한다.
5. 이를 반복적으로 판단할 공통 구현 분류층이 부족했다.

## 변경

- `LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.md`와 한국어 대응본 추가.
- 8개 제한 분류와 공통 config 의미 정의.
- 임의 제품 하드캡은 폐기하되 안전/무결성 보호는 유지.
- WDX와 시즌의 기존 숫자에 대한 구체적인 정합성 처리방향 추가.
- DB/API/관리자/분석 계약 추가.
- 하드캡 없는 경제 대응순서와 자산구간별 소비처 기준 추가.

## 동시변경 처리

작업 시작 시 main은 `5908e4bc84bd8c6c0bcfdf7401ccad436f8eacc6`이었다.

작업 중 클럽·협동 경제와 커뮤니티·시장 무결성 문서가 안전 통합되면서 main이 `408e19e695bd190fd6774e6e3aab8ca8e0bfdd38`로 전진했다. 이번 기획 브랜치를 해당 최신 main으로 정확히 이동시킨 뒤 이번 회차 문서를 다시 생성해 신규 통합 문서를 보존하고 오래된 부모이력을 남기지 않았다.

## 조사자료

- EVE Online Monthly Economic Report — August 2026, 2026-09-09 공개: 경제 전체 관측과 원시데이터 제공 방식.
- TradingView 2026년 9월 Paper Trading 대회: 별도 경쟁계정과 동일 고정 preset 조건.
- Microsoft PlayFab Economy V2 Stores: 안정적인 Catalog item과 Store별 가격 override 분리.

## 배포

문서-only 변경이다. 런타임/API/DB migration/원장/배포 동작 변경은 없다. 이번 문서 자체에는 Test 배포가 필요하지 않다. 실제 구현은 별도 개발 브랜치, 필요한 경우 forward-only migration, 정확한 후보 SHA의 Test 배포·검증 후 Production으로 승격해야 한다.

## 다음 우선순위

1. 각 canonical 기능 문서를 다음 수정할 때 이 분류표를 직접 적용한다.
2. Season Token의 고정 이월상한을 시즌 구현기획에서 제거한다.
3. 관리자 경제도구에 read-only Limit & Protection Policy 관측기능을 구현기획한다.
4. 경제 Scenario Lab이 정책을 자동 적용하지 않고 한계보상과 소비처 커버리지를 모델링하도록 확장기획한다.
5. 사용자 하드캡을 고려하기 전에 매력적인 소비처를 계속 추가한다.
