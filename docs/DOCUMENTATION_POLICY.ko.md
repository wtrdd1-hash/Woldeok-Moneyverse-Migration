# 문서 거버넌스 정책

[English canonical](DOCUMENTATION_POLICY.md) | **한국어**

> 버전: v2026.09.28.478
> 상태: 현행 문서 거버넌스
> 저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`

## 1. 권위 순서

1. `docs/planning/PROJECT_PLAN.md` — 구현 기준 제품/엔지니어링 권위 기획서.
2. `docs/planning/INTEGRATED_PLANNING_MASTER.md` — 통합 기획 회차 원장과 권위 드리프트 기록.
3. 위 두 문서에서 명시적으로 채택한 `docs/planning/` 최신 상세 명세.
4. exact source/runtime identity에 연결된 생성 API 계약과 런타임 참조 문서.
5. `docs/updates/`, `docs/changelog/`, `docs/releases/`, `docs/worklog/` — 역사/변경 증거이며 최신 기획 권위를 덮어쓰지 않음.
6. findings/research는 기획 문서가 명시적으로 채택하기 전까지 근거 입력이다.

문서가 충돌하면 가장 최신의 명시적 superseding authority를 따른다. 과거 기록은 현재 진실처럼 다시 쓰지 않고 보존한다.

## 2. 런타임/기획 드리프트 규칙

더 최신 런타임 커밋, 릴리스 노트, 루트 실행 계획, 작업로그가 자동으로 제품 권위가 되지 않는다. 런타임/소스 이력이 구현 권위 기획보다 앞서면 관련 결정이 `PROJECT_PLAN.md`와 필요한 상세 명세에 실제로 통합될 때까지 **AUTHORITY_DRIFT** 상태를 명시한다.

런타임 버전에 숫자를 맞추기 위해 제품 기획 버전만 올리는 행위를 금지한다. 실제 결정 통합 없이 버전만 올리면 안 된다.

## 3. 언어

영문이 canonical이고 한국어가 새로 유지관리하는 제품/기획/운영/거버넌스 문서의 필수 2차 언어다. 유지 문서는 `NAME.md` / `NAME.ko.md` 쌍으로 같은 작업 단위에서 갱신한다.

과거 기록, 내부 전용, 제3언어, 호환성 문서를 단순 쌍 수 맞추기 위해 현행 권위 문서로 승격하지 않는다. 유지 문서의 미쌍 상태는 명시적 정리 gap으로 추적한다.

## 4. 변경 워크플로

의미 있는 문서 변경은 전용 브랜치를 사용한다. 명시적으로 승인된 긴급 저장소 복구 외에는 문서도 `main` 직접 커밋을 금지한다.

저장소에 영향을 주는 예약/자동화 작업도 이 정책의 기여자로 취급한다. 응답이나 저장소 작업 전에 `AGENTS.md`의 Superpowers 작업 진입 규율을 적용해 `skills/using-superpowers`를 먼저 호출하고, 이후 각 단계에 적용 가능한 skill을 해당 행동 전에 호출해야 한다. 저장된 예약 프롬프트에도 이 요구사항을 명시적으로 포함한다. 사용자가 직접 지시하는 모든 Moneyverse 프로젝트 작업에도 동일하게 적용한다.

편집 전 최신 `origin/main`, 이 정책, 문서 카탈로그, 통합 마스터, 프로젝트 기획, 관련 상세 명세, 최신 work/update 기록을 읽는다. 작업 중간과 통합 직전에 `origin/main`을 재확인하며 동시 작업을 덮어쓰지 않는다.

문서 전용 변경은 런타임 릴리스를 유발하지 않는다.

## 5. 필수 기록

중요 문서 회차는 다음을 남긴다.
- 버전
- 적용 가능한 영/한 유지 문서 동기화
- delta/changelog
- worklog
- GitHub 공개용 업데이트 내역
- 프로젝트 운영상 필요한 내부 업데이트 내역
- 권위 변경 시 시작/중간 `origin/main` SHA
- runtime/Test/Production 증거 유무

## 6. 디렉터리 규칙

- `planning/`: 현재 기획, 상세 명세, planning delta/worklog
- `features/`: 간결한 사용자 기능 가이드
- `architecture/`: 안정적 아키텍처 설명
- `operations/`: 운영 절차/런타임 계약
- `findings/`: 감사/조사/근거 corpus
- `updates/`: 버전 업데이트 공지
- `changelog/`: 변경 이력
- `worklog/`: 실행/증거 이력
- `releases/`: 실제 릴리스 증거가 있는 릴리스 기록
- `docs/` 루트: 인덱스, 거버넌스, 범분야 통합 참조

맞는 하위 디렉터리가 있으면 새 날짜형 단발 문서를 docs 루트에 만들지 않는다.

## 7. 비권위 루트/호환 문서

저장소 루트 `implementation_plan.md`, `PROJECT_MEMORY.md`, `walkthrough.md`, 과거 `README/` 번역 산출물 등은 현재 프로젝트 기획이 명시적으로 채택하지 않는 한 제품 권위가 아니다.

`docs/PROJECT-DOCUMENT-POLICY-KO.md`는 호환/역사 문서이며 이 정책이 supersede한다.

## 8. 상태 용어

`DRAFT`, `PLANNING`, `BLOCKED`, `IMPLEMENTED`, `TEST_VERIFIED`, `PRODUCTION_VERIFIED`, `SUPERSEDED`, `HISTORICAL`, `AUTHORITY_DRIFT`를 사용한다.

exact candidate/runtime 버전과 수용 결과 증거 없이 완료/배포/Production이라고 쓰지 않는다.

## 9. 링크/보관 정책

폴더를 깔끔하게 보이게 하려고 기존 링크를 깨지 않는다. 우선 인덱스/상태 메타데이터/호환 stub을 사용한다. 파일 이동이 필요하면 기존 경로 stub을 남기거나 같은 변경에서 모든 inbound reference를 갱신한다.

역사 문서는 검색 가능하게 보존한다. archive는 삭제가 아니라 현재 권위가 아니라는 뜻이다.

## 10. 인벤토리/정리 정책

카탈로그 파일 수는 품질 지표가 아닌 스냅샷이다. exact duplicate, docs 루트 날짜형 기록, 언어쌍 gap, 오래된 권위 참조를 추적하되 삭제보다 정확성과 링크 안정성을 우선한다.

대량 이동/중복제거 전 inbound-link 범위를 증명하고 호환 경로를 보존한다.
