# 변경내역 — 기본 무제한 정합성 v2026.09.12.23

기준일: 2026-09-12
유형: 제품 기획 / 문서 전용

## 추가

- `LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.md`와 한국어 대응 문서를 추가했다.
- 모든 수치형 제한을 무제한 기본, 유일성, 실제 희소성, 보안 보호, 시스템 안전, 시장 무결성, 법적 요구, 콘텐츠 예산 중 하나로 분류하도록 했다.
- 기존 WDX 미체결 주문수와 단일 주문금액 제한을 일반 진행 하드캡이 아니라 보호 목적 규칙으로 재분류했다.
- 시즌 XP 최대치와 Season Token 발행 목표를 계정 전체 플레이 제한이 아닌 콘텐츠 예산으로 재분류했다.
- Legacy Token 전환의 고정 100 ST 상한을 폐기 대상으로 지정하고 비율 전환 + Legacy 소비처 강화로 대체했다.
- 시즌 랭크 WLD 보상예산과 플레이 하드캡의 의미를 분리했다.
- `null/unlimited` 설정 의미를 위한 config, PostgreSQL, API, 관리자 콘솔, 분석 이벤트, 완료조건을 추가했다.
- 인플레이션 대응 시 하드캡보다 원인진단, 소비처, 한계보상, 경제적으로 타당한 비용조정을 먼저 사용하도록 우선순위를 정의했다.

## 조사 근거

- EVE Online Monthly Economic Report — August 2026, 2026-09-09 공개.
- TradingView 2026년 9월 Paper Trading 대회의 별도 경쟁계정·동일 preset 조건.
- Microsoft PlayFab Economy V2의 Store/Catalog 가격 분리 구조.

## 검증

문서-only 변경이다. 런타임/API/DB/migration/ledger/deployment 동작을 변경하지 않으므로 이번 문서 변경 자체에는 Test 배포가 필요하지 않다. 실제 구현은 별도 개발 브랜치에서 진행하고 정확한 후보 SHA를 Test에서 검증한 뒤 Production으로 승격한다.
