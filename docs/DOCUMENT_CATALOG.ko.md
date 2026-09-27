# 문서 카탈로그

[English canonical](DOCUMENT_CATALOG.md) | **한국어**

> 스냅샷: v2026.09.27.467
> 기준 트리: `main@d64eaedccb7c094063b36fb5f46590ce19f51ab1`
> 용도: 탐색·정리 인벤토리. 제품 권위 문서가 아니다.

## 현재 권위

- [프로젝트 기획](planning/PROJECT_PLAN.ko.md) — 현재 구현 권위, **v2026.09.25.444**.
- [통합 기획 마스터](planning/INTEGRATED_PLANNING_MASTER.ko.md) — 기획/거버넌스 원장, v466 문서 정리 기록 포함.
- [문서 정책](DOCUMENTATION_POLICY.ko.md) — 권위/언어/브랜치/보관/드리프트 규칙.
- [문서 인덱스](INDEX.ko.md) — 선별 탐색 경로.
- [전체 기획 재검토 v402](planning/INTEGRATED_FULL_REVIEW_V402.ko.md) — **역사 검토 스냅샷**이며 현재 권위가 아니다.

## 권위 드리프트 스냅샷

- 저장소 `main` 런타임/소스 이력은 **v2026.09.27.466**.
- `PROJECT_PLAN.md`은 **v2026.09.25.444**.
- v444 이후 런타임 커밋이나 실행 메모가 존재한다는 이유만으로 제품 기획 권위에 통합됐다고 간주하지 않는다.
- 이 카탈로그는 드리프트를 기록하지만 제품 결정을 버전 숫자만 올려 해결하지 않는다.

## 인벤토리

`docs/` 아래 파일은 **1,638개**, 그중 Markdown은 **1,620개**다.

| 문서군 | 파일 수 |
|---|---:|
| worklog/ | 545 |
| changelog/ | 424 |
| planning/ | 279 |
| updates/ | 160 |
| docs 루트 | 63 |
| releases/ | 58 |
| findings/ | 22 |
| operations/ | 22 |
| features/ | 20 |
| superpowers/ | 11 |
| architecture/ | 10 |
| api/ | 9 |
| images/ | 9 |
| design/ | 2 |
| localization/ | 2 |
| research/ | 2 |

루트 README/텍스트 산출물과 `docs/` 밖 문서성 파일까지 포함하면 저장소에서 **1,726개 문서 관련 파일**을 확인했다.

## 정리 결과

- `docs/` 루트 날짜형 Markdown: **18개**. 레거시 배치이며 신규 날짜형 문서는 맞는 하위 디렉터리에 둔다.
- `docs/` exact duplicate-content: **31개 그룹 / 추가 중복 경로 31개**. 이번 회차에서는 Git 이력과 inbound link 보호를 위해 삭제하지 않는다.
- Markdown 언어쌍 인벤토리: **영문 경로 기준 한국어 쌍 없음 85개**, **한국어 정규화 경로 기준 영문 쌍 없음 19개**. 과거/내부/API 레거시/제3언어가 포함되므로 전부 현행 유지 문서 위반은 아니다.
- 루트 `implementation_plan.md`, `PROJECT_MEMORY.md`, `walkthrough.md`는 실행/역사 참조이며 제품 권위가 아니다.
- 기존 v403 카탈로그 스냅샷은 이 인벤토리로 대체한다.

## 정리 규칙

역사 기록을 대량 삭제·이동하지 않는다. 향후 중복제거 시 canonical 경로 선택, inbound reference 갱신, 필요 시 호환 stub 유지, 링크 무결성 검증을 같은 변경에서 수행한다.
