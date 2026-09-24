# 문서 카탈로그

[English canonical](DOCUMENT_CATALOG.md) | **한국어**

> 스냅샷: v2026.09.23.403
> 용도: 탐색·정리 인벤토리. 제품 권위 문서가 아닙니다.

## 현재 권위

- [프로젝트 기획](planning/PROJECT_PLAN.ko.md)
- [통합 기획 마스터](planning/INTEGRATED_PLANNING_MASTER.ko.md)
- [전면 기획 재검토 v435](planning/INTEGRATED_FULL_REVIEW_V435.ko.md)
- [문서 정책](DOCUMENTATION_POLICY.ko.md)

## 인벤토리 스냅샷

이번 정리 기준 `docs/` 아래에는 **1,497개 파일**이 있습니다.

| 문서군 | 파일 수 |
|---|---:|
| worklog/ | 515 |
| changelog/ | 410 |
| planning/ | 234 |
| updates/ | 130 |
| releases/ | 58 |
| docs root | 59 |
| operations/ | 20 |
| features/ | 20 |
| findings/ | 15 |
| architecture/ | 10 |
## 정리 결과

- docs 루트 날짜형 Markdown은 **18개**입니다. legacy 배치로 분류하며 새 날짜형 문서는 적합한 하위 디렉터리에 둡니다.
- 내용이 완전히 같은 그룹은 **31개**입니다. 주로 과거 changelog/worklog/release 중복입니다.
- 이번 회차에서는 Git 이력과 inbound link 보호를 위해 기존 중복 경로를 삭제하지 않습니다.
- 향후 dedup은 canonical 경로 선정 → 이전 경로 compatibility stub → inbound reference 동시수정 순서로 수행합니다.
- 역사 파일 수는 품질지표가 아닙니다. 현재 권위, 명시적 status, evidence 품질을 우선합니다.

## 디렉터리 규칙

docs 루트는 index, governance, cross-cutting integration reference만 둡니다. planning/evidence/update/worklog/changelog/release 기록은 각 전용 디렉터리에 둡니다.

각 디렉터리 README의 문서군별 규칙을 따릅니다.
