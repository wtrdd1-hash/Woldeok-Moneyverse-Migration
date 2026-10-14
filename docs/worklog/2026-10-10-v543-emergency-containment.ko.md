# v2026.10.10.543 긴급 경제 격리 및 릴리스 출처 복구 — 작업기록

> 상태: 작업 중
> 브랜치: `fix/v543-emergency-containment-20261010`
> 시작 origin/main: `545e8231f8b90b543ed9de0722adf98d63587820`
> 승인 범위: v542 기획/코드 감사의 P0 긴급 격리.
> 시작 시 런타임 주장: 없음. exact-SHA 증거 전에는 Test/Production 성공을 주장하지 않는다.

## 작업 전 기록

- 편집 전에 현행 문서 거버넌스, PROJECT_PLAN, INTEGRATED_PLANNING_MASTER, 중앙은행·조폐국·중앙국고·Economy Core 권위, 거시경제 마스터, FX/NPS 명세, Production 배포 계약을 다시 읽었다.
- 2026-10-10 GitHub `main`을 재확인했으며 v542 감사 기준보다 106커밋 전진해 있었다.
- 최신 `main`에서도 AutoSovereignWealthFundService가 백엔드 시작 30초 후 및 이후 매시간 자동 실행되도록 예약되는 것을 확인했다.
- 최신 SWF 구현에 원천 없는 국고 증가, 합성 포트폴리오 성장/수익실현, 국채/연금 잔액 직접 증가, DB 오류 삼키기가 남아 있음을 확인했다.
- migration 253의 `moneyverse_app` 대상 `treasury_bond_repo_loans` `ALL PRIVILEGES`가 남아 있음을 확인했다.
- 최신 FX 선물환/환전 경로에 비정규 `accounts.user_id` / `account_balances.available_balance` SQL이 남아 있음을 확인했다.
- Debian 13 Desktop Commander는 연결 상태지만 월 사용량 한도로 명령 실행이 중지돼 있다. 프로젝트 규칙에 따라 재연결을 반복하지 않고 GitHub 작업으로 전환했다.

## v543 변경 경계

1. 명시적으로 활성화하지 않으면 SWF 자동 경제 실행을 fail-closed 한다.
2. 프로세스 재시작 자체가 경제 상태를 변경하지 않도록 부팅 직후 실행을 제거한다.
3. 명시적으로 허용된 SWF 실행에도 transaction advisory lock과 최소 실행간격을 적용한다.
4. fail-closed, 스케줄러, lock/interval 회귀 테스트를 추가한다.
5. 기존 릴리스 디렉터리를 Git working copy로 변형하지 못하도록 exact SHA 기반 immutable host release staging/promotion 계약을 저장소에 추가한다.
6. 영문 canonical + 한국어 2차 언어 문서, 내부 업데이트 로그, GitHub용 업데이트 문서를 동기화한다.
7. 작업 중간 및 통합 직전에 `main`을 재확인한다.
8. GitHub CI와 exact-SHA 격리 Test 증거가 없으면 Production 승격하지 않는다.

## v544로 명시적 이관

v543 이후 위험한 경제 계산과 직접 테이블 정산 경로는 기본적으로 실행 불가 상태가 되지만, SECURITY DEFINER / Economy Core 정산 함수로의 구조 교체, 연금·국채·Repo·FX 자금보존 수정, 권한 회수 forward migration은 v544에서 수행한다.


## 작업 중간 기록

- 중간 `main` 재확인에서 시작 SHA보다 1커밋 전진한 `origin/main=9e17095586c46e43ec1a68214658e512e457148a`를 감지했다.
- 동시 커밋은 SWF·국고·릴리스·배포·권위문서 경로와 겹치지 않았지만, 계속 작업하기 전에 v543 브랜치를 해당 최신 `main` 기준으로 다시 구성했다.
- SWF 런타임 긴급 격리를 구현했다.
  - `MONEYVERSE_SWF_EXECUTION_ENABLED`가 정확히 `true`가 아니면 실행을 fail-closed 한다.
  - `MONEYVERSE_SWF_SCHEDULER_ENABLED`도 별도 fail-closed 한다.
  - 백엔드 시작 30초 후 경제변동 실행을 제거했다.
  - 명시적으로 허용된 스케줄도 한 시간 전체가 지난 뒤 첫 실행이 가능하다.
  - 모든 실행은 PostgreSQL transaction advisory lock을 획득해야 한다.
  - `treasury_swf_configs.last_executed_at`와 `rebalance_interval_hours`로 최소 실행간격을 강제한다.
- 기본 비활성, 재시작 무변동, 중복 사이클 차단, 최소간격 차단 회귀 테스트를 추가했다.
- `ops/release/stage-host-release.sh`를 추가했다. 승인된 40자리 SHA의 clean worktree와 빌드된 backend/frontend 산출물만 허용하고, 기존 경로를 절대 덮어쓰지 않는 새 release directory를 생성하며 Git metadata를 제거하고 `.moneyverse-release.json`을 기록한다.
- exact-SHA staging, 기존 경로 재사용 거부, 잘못된 SHA 거부를 검증하는 릴리스 레이아웃 테스트를 추가했다.
- 아직 Test/Production 배포 완료를 주장하지 않는다. GitHub CI와 exact-SHA 격리 Test가 필수다.
