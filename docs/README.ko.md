# 월덕 머니버스 문서

[English canonical](README.md) | **한국어**

여기서 시작한다. 가장 최신처럼 보이는 파일명, 최신 런타임 커밋, 루트 실행 계획만 보고 현재 제품 진실을 추론하지 않는다.

## 현재 권위

- [구현 기준 프로젝트 기획](planning/PROJECT_PLAN.ko.md) / [English](planning/PROJECT_PLAN.md) — **v2026.09.27.468**
- [통합 기획 마스터](planning/INTEGRATED_PLANNING_MASTER.ko.md) / [English](planning/INTEGRATED_PLANNING_MASTER.md)
- [문서 거버넌스](DOCUMENTATION_POLICY.ko.md) / [English](DOCUMENTATION_POLICY.md)
- [문서 카탈로그](DOCUMENT_CATALOG.ko.md) / [English](DOCUMENT_CATALOG.md)
- [현재 런타임/OS 기준](CURRENT_RUNTIME_BASELINE.ko.md) / [English](CURRENT_RUNTIME_BASELINE.md)
- [전체 문서 인덱스](INDEX.ko.md) / [English](INDEX.md)

## 현재 문서 상태

v468 시작 시 저장소 `main`의 런타임/소스 이력은 **v2026.09.27.467**로 관측됐다. API 관측성 지시를 PLANNING 권위로 실제 통합해 구현 기준 기획은 **v2026.09.27.468**이다. 이는 v468 runtime 구현 완료나 중간 runtime 결정 전체의 자동 채택을 뜻하지 않으며 exact-SHA Test/Production 증거가 계속 필요하다.

v402 전체 재검토 문서는 역사 근거로 보존하며 더 이상 현재 전체 검토 권위로 표시하지 않는다.

## 주요 문서군

| 디렉터리 | 목적 |
|---|---|
| `planning/` | 현재 기획, 상세 명세, planning delta |
| `features/` | 간결한 기능 가이드 |
| `architecture/` | 안정적 아키텍처 설명 |
| `operations/` | 운영/런타임 절차 |
| `findings/` | 감사/조사/근거 corpus |
| `updates/` | 버전 업데이트 공지 |
| `changelog/` | 변경 이력 |
| `worklog/` | 실행/증거 이력 |
| `releases/` | 릴리스 증거가 있는 릴리스 기록 |

저장소 루트 `implementation_plan.md`, `PROJECT_MEMORY.md`, `walkthrough.md`는 실행/역사 참조이며 프로젝트 기획이 명시적으로 채택하지 않는 한 현재 제품 권위가 아니다.
