# 국고·사회보험 특별 기획 — 기존 기획 기준선(고정 기록)
> **버전:** vTSI.2026.11.10.001 · **기준일:** 2026-11-10 한국시간 · **main 커밋:** `edd709bcbe96f6f5ceca8372f244b632e8211242`
> **성격:** 과거 기획 증빙용 기준선 / 문서 전용. 실제 구현·운영 QA 통과를 의미하지 않음
> **원본:** [English canonical](TREASURY_SOCIAL_INSURANCE_20261110_BASELINE.md)
> **신규·변경 기록:** [기획 변경대장](TREASURY_SOCIAL_INSURANCE_20261110_CHANGE_REGISTER.ko.md)

## 목적과 우선순위
2026-11-11 오전 6시까지 진행하는 국고·건강보험·국민연금 등 매시간 특별 기획이 시작될 때 **이미 존재했던 기획**을 고정해, 이후에 무엇이 새로 추가·수정됐는지 비교한다. 이 기준선은 최초 시점의 역사적 기록이며 수시로 바뀌는 상위 통합기획서 `PROJECT_PLAN.md`를 대체하지 않는다.

## 기존 문서 원본의 고정 링크
각 링크는 최초 확인한 정확한 main 커밋을 가리킨다. 파일 blob SHA는 기획 문서 버전의 식별자일 뿐 실제 기능 완료 증거가 아니다.

| 번호 | 기존 문서(최초 커밋 고정) | 파일 blob SHA | 기존 담당 기획 |
|---|---|---|---|
| 1 | [`docs/planning/PROJECT_PLAN.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/PROJECT_PLAN.md) | `4082d4a0c3a8395a8f42e4dba3b9771673143b3b` | 최상위 통합기획서 |
| 2 | [`docs/planning/PROJECT_PLAN.ko.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/PROJECT_PLAN.ko.md) | `14b37681245bf24c2551746b231c8309031b0a97` | 통합기획서 한국어 대조 |
| 3 | [`docs/planning/INTEGRATED_PLANNING_MASTER.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/INTEGRATED_PLANNING_MASTER.md) | `761b5f2d3cbbac79fe4df89e4e53203d1cfee04e` | 통합 설계 마스터 |
| 4 | [`docs/planning/INTEGRATED_PLANNING_MASTER.ko.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/INTEGRATED_PLANNING_MASTER.ko.md) | `574b9f0727dd57e636de459610cf59c25c0660cf` | 통합 설계 한국어 대조 |
| 5 | [`docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md) | `885d335322d399ad1dd12fa6245841708ae307f9` | 중앙은행·조폐국·국고·경제 원장 권한 분리 |
| 6 | [`docs/planning/ADMIN_TREASURY_MANAGEMENT_SPEC.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/ADMIN_TREASURY_MANAGEMENT_SPEC.md) | `9139d4fe9520a44190ab706ddc5beec1e773c489` | 국고 재정·세금·예산·준비금 운영 |
| 7 | [`docs/planning/ECONOMY_INTEGRITY_AND_DOCUMENTATION_RECONCILIATION_SPEC.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/ECONOMY_INTEGRITY_AND_DOCUMENTATION_RECONCILIATION_SPEC.md) | `36e90c450d5dfc82dac3481d8d5d0625335a93dd` | 원장 정합성·증빙·대사·출시 기준 |
| 8 | [`docs/planning/TREASURY_AUTOMATED_SOCIAL_RECIRCULATION_SPEC.en.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/planning/TREASURY_AUTOMATED_SOCIAL_RECIRCULATION_SPEC.en.md) | `930937ce098574b08b251884c2a612f310398ae4` | 사회 재순환 기존 기획(구현/운영 주장은 재검증 필요) |
| 9 | [`docs/NATIONAL_PENSION_SERVICE_SPEC.md`](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/blob/edd709bcbe96f6f5ceca8372f244b632e8211242/docs/NATIONAL_PENSION_SERVICE_SPEC.md) | `78eebaf87c032ed42139dac438a9bc7305e23e1d` | 국민연금·사회보장 기획(재원 조달 검증 전 보장 확정 금지) |

## 기존 기획과 확인 한계
- **조폐국과 국고 분리:** v523 기획은 중앙은행의 발행 승인, 조폐국 집행, 국고의 재정 운영, 경제 코어 원장 정산을 별도 권한으로 정의한다. 세금·이체·재정 지출은 기존 가상 WLD 이동이며 무단 발행이 아니다.
- **국고 재정:** 관리자 기획에 세입/지출·예산·준비금·대사·감사 개념이 존재한다. 새로운 기능이라면 기존 문서와 차이부터 증명해야 한다.
- **금융 무결성:** 원장 일치와 PostgreSQL 권한 경계, 증거 출처 검증을 유지한다. 과거 문서에 적힌 운영 확인 주장은 현재 운영 검증의 대체물이 아니다.
- **국민연금:** 기존 연금 문서에는 급여·기금 방안이 있지만 장기 지급·원금 보장 등은 재원 검증이 필요한 조건부 가상 게임 설계이다.
- **건강보험:** 이번 최초 조사에서는 건강보험의 모든 관련 문서·실제 코드를 완전히 조사하지 못했다. 추측한 파일 경로에 문서가 없다는 것만으로 미구현/신규라고 판정하지 않는다. 후속 회차에 전체 출처를 조사한다.

## 기록 규칙
기존 기획 기준선은 새로운 제안을 덮어써서 갱신하지 않는다. 발견되지 않았던 과거 기획을 추후 확인하면 신규 기능으로 취급하지 않고 **기준선 보정**으로 기록한다. 추가/수정/삭제/보류·기능 ID·버전·근거·기획서 반영 상태는 별도 변경대장에서 관리한다. 본 문서 생성 과정에서 운영 사용자 브라우저 QA·실거래·DB 대사·테스트 서버 승격을 실행하지 않았다.