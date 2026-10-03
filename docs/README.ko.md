# 월덕 머니버스 문서

[English canonical](README.md) | **한국어**

여기서 시작한다. 가장 최신처럼 보이는 파일명, 최신 런타임 커밋, 루트 실행 계획만 보고 현재 제품 진실을 추론하지 않는다.

## 현재 권위

- [구현 기준 프로젝트 기획](planning/PROJECT_PLAN.ko.md) / [English](planning/PROJECT_PLAN.md) — **v2026.10.04.523**
- [중앙은행·조폐국·중앙국고·경제코어 통합 명세](planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.ko.md) / [English](planning/CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md) — **v2026.10.04.523**
- [통합 기획 마스터](planning/INTEGRATED_PLANNING_MASTER.ko.md) / [English](planning/INTEGRATED_PLANNING_MASTER.md)
- [국고 세수 자동 사회 환원 및 재정 선순환 기획](planning/TREASURY_AUTOMATED_SOCIAL_RECIRCULATION_SPEC.ko.md) / [English](planning/TREASURY_AUTOMATED_SOCIAL_RECIRCULATION_SPEC.en.md) — **v2026.10.04.522**
- [광고 전용 수익화 명세](planning/AD_ONLY_ADVERTISING_REVENUE_SPEC.ko.md) / [English](planning/AD_ONLY_ADVERTISING_REVENUE_SPEC.md) — **v2026.09.30.487**
- [문서 거버넌스](DOCUMENTATION_POLICY.ko.md) / [English](DOCUMENTATION_POLICY.md)
- [문서 카탈로그](DOCUMENT_CATALOG.ko.md) / [English](DOCUMENT_CATALOG.md)
- [현재 런타임/OS 기준](CURRENT_RUNTIME_BASELINE.ko.md) / [English](CURRENT_RUNTIME_BASELINE.md)
- [전체 문서 인덱스](INDEX.ko.md) / [English](INDEX.md)

## 현재 문서 상태

본 v523 기획 회차는 중간 국고 문서 변경을 감지한 뒤 `origin/main=065ee42204a4238c5010897212c7fc2a6c848f64`로 재기준화했다. 구현 기준 제품 기획은 중앙은행·조폐국·중앙국고 기관분리 결정에 대해 **v2026.10.04.523**으로 갱신된다. 이는 기획 권위 갱신이며, 명시적으로 정합화·증명되지 않은 런타임/소스 상태는 계속 문서 거버넌스의 authority-drift 규칙을 따른다.

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
