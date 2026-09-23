# 문서 거버넌스 정책

[English canonical](DOCUMENTATION_POLICY.md) | **한국어**

> 버전: v2026.09.23.403
> 상태: 현재 문서 운영 권위
> 저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`

## 1. 권위 순서

1. `docs/planning/PROJECT_PLAN.ko.md` — 구현 대면 권위 기획.
2. `docs/planning/INTEGRATED_PLANNING_MASTER.ko.md` — 통합 기획 회차 원장.
3. `docs/planning/`의 현재 상세 명세.
4. 생성 API 계약과 런타임 대면 reference.
5. `updates/`, `changelog/`, `releases/`, `worklog/` — 변경·역사 증거이며 최신 기획보다 높은 권위가 아니다.
6. findings/research는 기획 문서가 명시적으로 채택하기 전까지 근거 입력이다.

문서가 충돌하면 가장 최근의 명시적 superseding 권위가 우선한다. 과거 기록은 현재 사실로 다시 쓰지 않고 보존한다.

## 2. 언어

영어가 기준 문서이고 한국어를 필수 두 번째 언어로 유지한다. 쌍 문서는 `NAME.md` / `NAME.ko.md` 형식을 사용하고 같은 작업 단위에서 동기화한다.

## 3. 변경 절차

의미 있는 문서 변경도 전용 브랜치를 사용한다. 명시적으로 승인된 긴급 저장소 복구가 아닌 한 문서를 `main`에 직접 커밋하지 않는다.

작업 전 최신 `origin/main`, 통합 마스터, PROJECT_PLAN, 관련 상세 명세, 현재 work/update 기록을 확인한다. 통합 전 `origin/main`을 다시 확인하고 동시 작업을 덮어쓰지 않는다.

문서 전용 변경은 런타임 릴리스를 시작하지 않는다. 문서 커밋은 repository history를 바꾸지만 application source identity는 바꾸지 않는다.

## 4. 필수 기록

의미 있는 문서 회차는 다음을 가진다.
- 버전;
- 영/한 권위 변경;
- delta 또는 changelog;
- worklog;
- GitHub용 update;
- 기획 권위 변경 시 시작/중간 `origin/main` SHA;
- 런타임/Test/Production 증거 존재 여부의 명시적 구분.

## 5. 디렉터리 규칙

- `planning/`: 현재 living plan, 상세명세, planning delta/worklog.
- `features/`: 구현·사용자 기능의 간결한 가이드. 기획 최고 권위가 아니다.
- `architecture/`: 안정적 아키텍처 설명.
- `operations/`: 운영 절차와 runtime contract.
- `findings/`: 감사, 근거 corpus, 연구검토.
- `updates/`: 버전별 짧은 업데이트 공지.
- `changelog/`: 변경이력.
- `worklog/`: 작업·증거 이력.
- `releases/`: 실제 release evidence가 있는 릴리스 기록.
- docs 루트: 색인·거버넌스·통합 reference만 둔다.

기존 분류 디렉터리가 있는데 날짜형 일회성 문서를 docs 루트에 새로 만들지 않는다.

## 6. 상태 용어

`DRAFT`, `PLANNING`, `BLOCKED`, `IMPLEMENTED`, `TEST_VERIFIED`, `PRODUCTION_VERIFIED`, `SUPERSEDED`, `HISTORICAL`을 명시적으로 사용한다.

exact candidate/runtime version과 수용 결과 증거 없이 “완료”, “배포”, “Production 완료”라고 쓰지 않는다.

## 7. 링크·보존

폴더를 깔끔하게 보이게 하려고 기존 링크를 깨뜨리지 않는다. 먼저 index/status metadata로 정리한다. 파일 이동이 필요하면 이전 경로에 compatibility stub을 남기거나 모든 inbound link를 같은 변경에서 수정한다.

historical은 삭제가 아니라 “현재 권위 아님”을 의미한다.

## 8. 폐기 정책

`PROJECT-DOCUMENT-POLICY-KO.md` v1.0.0의 문서 main 직접반영 규칙은 현재 브랜치·릴리스 거버넌스와 충돌하므로 이 정책이 supersede한다.
