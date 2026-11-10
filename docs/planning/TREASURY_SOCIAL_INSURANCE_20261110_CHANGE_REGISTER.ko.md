# 국고·가상 사회보험 특별 기획 — 전면 철회 기록

> **사용자 철회 지시:** 2026-11-10 (한국시간)
> **철회 버전:** `vTSI.2026.11.10.WD001`
> **상태:** `WITHDRAWN_BY_OWNER` — **유효한 신규·수정 특별 기획 0건**
> **정본:** [English canonical](TREASURY_SOCIAL_INSURANCE_20261110_CHANGE_REGISTER.md)
> **보존된 기존 기준선:** [기존 기획 기록](TREASURY_SOCIAL_INSURANCE_20261110_BASELINE.ko.md)
> **과거 상세 기획(감사 이력용):** [철회 전 Git 버전 `da836124fe4e`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/da836124fe4e40cc41ca6cca3198971c71b8e4ea/docs/planning/TREASURY_SOCIAL_INSURANCE_20261110_CHANGE_REGISTER.md)
> **GitHub:** [Draft PR #3006](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3006) — 병합 없이 종료 대상

## 철회 범위
사용자는 2026-11-10 작성된 국고·건강보험·국민연금 특별 기획의 **신규 기능 및 기존 기능 수정 제안 전체**를 제거하도록 지시했다. 병합되지 않은 11개 제안의 상세 내용은 이 기록대장의 **현재 버전에서 제거**했으며, 감사 필요 시 이전 Git 커밋에서만 확인할 수 있다. 해당 제안을 구현 지시, 승인 완료 기획, QA 통과 근거로 재사용해서는 안 된다. 기존 통합기획서·정상 운영 기능·원장 및 금융 데이터에는 영향을 주지 않는다.

## 현재 유효한 변경 0건

| 분류 | 현재 활성 | 철회된 과거 제안 |
|---|---:|---:|
| 신규 기능 ADD | **0건** | 6건 |
| 기존 기획 수정 MODIFY | **0건** | 5건 |
| 실제 운영 기능 삭제 | **0건** | 대상 아님 |
| 통합기획서 반영 완료 | **0건** | 원래 미반영 |

## 철회된 11개 기능 명세 색인 (복구/개발 대상 아님)

| 기획 ID | 과거 분류 | 우선순위 | 과거 기획 명칭 | 최종 상태 |
|---|---|---|---|---|
| TSI-20261110-001 | MODIFY | P0 | 국고 원장 대사 증빙 게이트 | 철회 / WITHDRAWN_BY_OWNER |
| TSI-20261110-002 | ADD | P1 | 보험 간 자격변경 증빙 접수함 | 철회 / WITHDRAWN_BY_OWNER |
| TSI-20261110-003 | MODIFY | P0 | 국고 배포·원장 출처 증빙 게이트 | 철회 / WITHDRAWN_BY_OWNER |
| TSI-20261110-004 | ADD | P1 | 가상 보험급여 청구 및 독립 심사 | 철회 / WITHDRAWN_BY_OWNER |
| TSI-20261110-005 | MODIFY | P0/P1 | 레거시 백엔드 재시작·금융 거래 경로 증빙 | 철회 / WITHDRAWN_BY_OWNER |
| TSI-20261110-006 | ADD | P1 | 가상 보험료 산정 및 이의신청 징수 잠금 | 철회 / WITHDRAWN_BY_OWNER |
| TSI-20261110-007 | MODIFY | P0 | 국고·보험 실제 QA 증빙 유효성 확인 | 철회 / WITHDRAWN_BY_OWNER |
| TSI-20261110-008 | ADD | P1 | 국고 교부금 예산 예약·독립 지급 승인 | 철회 / WITHDRAWN_BY_OWNER |
| TSI-20261110-009 | MODIFY | P0 | 보험·국고 정산 증빙 격리 게이트 | 철회 / WITHDRAWN_BY_OWNER |
| TSI-20261110-010 | ADD | P1 | 국고 회계기간 마감 및 예산 이월 통제 | 철회 / WITHDRAWN_BY_OWNER |
| TSI-20261110-011 | ADD | P1 | 가상 사회보험 기금 지급여력 스트레스 미리보기 | 철회 / WITHDRAWN_BY_OWNER |

## 기존 문서·예약 보존 원칙
- 11월 11일 오전 6시까지 예정했던 **국고·건강보험 특별 기획은 즉시 중단**하고, 사용자 명시적 재지시 없이 TSI 기능 기획을 새로 생성하지 않는다.
- 기존 `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, 국고/연금 등 종전 기획과 실제 구현된 기능 및 국고 금액·데이터는 **삭제·수정하지 않는다**.
- 매시간 일반 상시 기획 A(QA 기반 기능 개선) / B(새 기능 상세 기획) 및 QA 예약은 계속 유지한다. 철회된 11건은 이름만 바꿔 재등록하지 않는다.
- [철회 작업 로그](../worklog/2026-11-10-owner-withdrawal-tsi-special-planning-vTSI-WD001.md), 과거 Git 이력 및 닫힌 PR은 작업 근거로만 보존한다.
- 철회 작업은 문서/예약 정정이며 실제 운영 데이터 변경, 코드 배포, QA 테스트 실행 또는 사용자 금전 이동을 의미하지 않는다.
