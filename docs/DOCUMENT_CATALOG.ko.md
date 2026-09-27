# 문서 카탈로그

[English canonical](DOCUMENT_CATALOG.md) | **한국어**

> 스냅샷: v2026.09.27.468
> 소스 기준: main@8493d69e2283bf6526b52752ea2242b707160830 + 이번 v468 기획 delta
> 용도: 탐색·정리 인벤토리. 제품 권위 문서가 아니다.

## 현재 권위

- [프로젝트 기획](planning/PROJECT_PLAN.ko.md) — 현재 구현 권위, **v2026.09.27.468**.
- [통합 기획 마스터](planning/INTEGRATED_PLANNING_MASTER.ko.md) — 기획/거버넌스 원장, **v2026.09.27.468**.
- [API 관측성 관제 타워](planning/API_OBSERVABILITY_CONTROL_TOWER_SPEC.ko.md) — P0 exact-source API 인벤토리, telemetry 진실성, false-green 릴리스 게이트.
- [문서 정책](DOCUMENTATION_POLICY.ko.md) — 권위/언어/브랜치/보관/드리프트 규칙.
- [문서 인덱스](INDEX.ko.md) — 선별 탐색 경로.
- [전체 기획 재검토 v402](planning/INTEGRATED_FULL_REVIEW_V402.ko.md) — 역사 검토 스냅샷이며 현재 권위가 아니다.

## 권위/런타임 상태

- v468 시작 시 저장소 main@8493d69의 소스 이력은 **v2026.09.27.467**이다.
- 이번 회차에서 API 관측성 지시를 실제 통합하여 PROJECT_PLAN 기획 권위는 **v2026.09.27.468**이다.
- 이 숫자는 v468 runtime 구현 완료 주장이 아니다. exact-SHA Test/Production 증거 전까지 API 관측성은 PLANNING이다.
- v444~v468 사이 다른 runtime/제품 결정을 버전 숫자만으로 자동 채택하지 않는다.
- API_CATALOG_MASTER의 runtime 전수 권위 주장은 v468 generated-manifest 대사 구현 전까지 AUTHORITY_DRIFT다.

## 인벤토리

docs/ 아래 파일은 **1,659개**, 그중 Markdown은 **1,641개**다.

| 문서군 | 파일 수 |
|---|---:|
| worklog/ | 549 |
| changelog/ | 428 |
| planning/ | 283 |
| updates/ | 167 |
| docs 루트 | 63 |
| releases/ | 58 |
| findings/ | 24 |
| operations/ | 22 |
| features/ | 20 |
| superpowers/ | 11 |
| architecture/ | 10 |
| api/ | 9 |
| images/ | 9 |
| design/ | 2 |
| localization/ | 2 |
| research/ | 2 |

## 정리 상태

- docs 루트 날짜형 역사 문서와 기존 duplicate group은 별도 link-safe 정리 회차가 supersede하기 전까지 보존한다.
- v468 신규 유지 문서는 상세명세, planning delta, worklog, changelog, GitHub 공개 update, 내부 update 모두 영/한 쌍으로 추가했다.
- 루트 implementation_plan.md, PROJECT_MEMORY.md, walkthrough.md는 실행/역사 참조이며 제품 권위가 아니다.
- 인벤토리 수는 품질 점수가 아니라 스냅샷이다.

## 정리 규칙

역사 기록을 대량 삭제·이동하지 않는다. 향후 중복제거 시 canonical 경로 선택, inbound reference 갱신, 필요 시 호환 stub 유지, 링크 무결성 검증을 같은 변경에서 수행한다.
