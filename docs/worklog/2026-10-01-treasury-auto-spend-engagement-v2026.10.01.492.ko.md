# v2026.10.01.492 — 국고 자동 지출·참여도 강화 기획 작업로그

> 상태: BRANCH_VERIFIED / READY_FOR_PR
> 날짜: 2026-10-01
> 브랜치: `docs/treasury-auto-spend-engagement-v2026.10.01.492`
> 작업 시작 `origin/main`: `9740265592a60ab3811f67af02950f2e84d764d1`
> 범위: 기획/문서 전용. 런타임, DB, API, Test, Production 변경을 주장하지 않는다.

## 작업 시작 기록

- 편집 전 최신 `origin/main`을 fetch하고 해당 정확 SHA에서 격리 worktree를 생성했다.
- `docs/` 아래 Markdown 1,667개 전체를 스캔했고, 국고/세금/재정/sink/참여/retention 관련 용어가 포함된 문서는 580개였다.
- 문서 거버넌스, catalog/index 권위, `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, 국고·통화속도·sink·AI 경제·성장 기획 및 현재 변경기록 형식을 확인했다.
- 권위 버전 차이: `PROJECT_PLAN.md`는 v2026.09.30.487, `INTEGRATED_PLANNING_MASTER.md`는 v2026.09.29.486이다.
- 기존 국고 기획에는 세입, 예산, 준비금, 대사, 지출 우선순위가 있으나 건전한 잉여 국고를 반드시 순환시키는 규칙과 자동 지출을 유저 참여 지표에 연결하는 계약이 부족하다.

## v492 예정 결정

- 유휴 잉여 국고를 WLD 신규 발행 없이 제한적·감사가능 예산으로 자동 전환하는 결정론적 Treasury Recycling Engine을 추가한다.
- 필수 유동성을 침해하기 전에 자동 재량지출을 중단하는 준비금/커버리지 상태를 추가한다.
- 커뮤니티·도시 매칭, 검증된 미션/계약, 시즌·이벤트 공공재, 신규·복귀 활성화, 엄격히 제한된 시장·사업 안정화 지출 경로를 추가한다.
- 원시 클릭/거래량이 아니라 고유 참여자 수, 완료/복귀 행동, 여러 시스템 참여 폭을 최적화하고 wash 거래·다계정 악용은 명시적으로 제외한다.
- EN/KO 권위 문서, v492 delta/changelog, GitHub용 업데이트, 내부용 업데이트와 본 작업로그를 함께 갱신한다.

## 작업 중간 기록

- EVE broker fee/sales tax 분리, OSRS Grand Exchange tax/item-sink 및 causal 연구, New World tax/upkeep/Town Project, Guild Wars 2 listing/exchange fee와 guild treasury upgrade 사례를 재확인했다.
- starter/core 면세와 P2P 기본 0%를 유지하면서 tax/fee 포트폴리오를 확장했다.
- Treasury Recycling Engine reserve state, 적격잉여 공식, 자동 commitment cap, 프로그램 배분, 공공 프로젝트/계약, anti-abuse를 추가했다.
- 동시 자동작업이 v491까지 예약한 것을 확인하여 초기 v488 번호에서 v2026.10.01.492로 변경했고 원격 v488 브랜치는 삭제했다.
- 중간 main이 `9740265592a60ab3811f67af02950f2e84d764d1`에서 `597c6029a8539d501e3c554582552cb761feab6c`로 변경됐다. 새 main 변경은 frontend/root execution-plan 영역으로 v492 기획파일과 직접 겹치지 않았고 최신 main 위로 충돌 없이 rebase 후 force-with-lease 갱신했다.

## 검증 기록

- `git diff --check origin/main...HEAD`: PASS, 공백 오류 없음.
- 변경파일: 기획/findings/changelog/update/worklog 18개이며 모든 신규 유지문서 EN/KO 쌍 존재.
- v492 범위에서 초기 전체 버전/경로 식별자 v2026.10.01.488 잔여: 없음.
- `PROJECT_PLAN`, `INTEGRATED_PLANNING_MASTER`, `ADMIN_TREASURY_MANAGEMENT_SPEC` 영/한 권위 헤더가 모두 v2026.10.01.492를 표시한다.
- rebase 후 검증 head `798b23454c5b676f517e261a461db0fa2794e320`에서 working tree clean 확인.
- 런타임·DB·API·Test 서버·Production 변경은 없으며 기획/문서 전용 작업이다.

## 전체 저장소 검증

- 첫 `pnpm test`는 신규 worktree에 `node_modules`가 없어 `tsc`를 찾지 못하고 `spawn ENOENT`로 중단됐다. 환경/설정 실패이며 통과로 계산하지 않았다.
- `pnpm install --frozen-lockfile`을 성공적으로 실행한 뒤 전체 `pnpm test`를 다시 수행했다.
- 전체 결과: **exit 0**. backup/release 검사 9/9, API contract 179 endpoint 생성·정합, contract 31/31, database package 7/7, backend 1,037 pass + DB 의존 391 skip, frontend 949/949 pass.
- frontend 테스트에서 기존 React `act(...)` 및 jsdom canvas 미구현 stderr 경고가 있었으나 Vitest 최종 결과는 160/160 test files, 949/949 tests pass였다.
- DB 의존 항목은 pass가 아니라 skip으로 기록한다. 이번 문서-only 작업은 Test DB를 만들거나 사용하지 않았으며 DB-backed runtime 검증을 주장하지 않는다.
- 최종 통합 전 main 재확인에서 `17cde78fab01ce4a4ef92376b1168d3ab588e9c9`까지 다시 전진했다. 변경은 direct-chat/floating-support frontend와 루트 `implementation_plan.md`이며 v492 유지 기획문서와 겹치지 않았다. 해당 정확 main SHA 위로 충돌 없이 다시 rebase했다.
