# 시간별 통합·개발 감사 — v2026.09.12.35

## 현재 기준
- 감사 시작 시 애플리케이션 main: `a89e97b818fe4e12060aef9855b8a6df52721756`.
- 인프라 main: `fcfc899ffe7edc6397ed3f52b33f07499f802e4c`.
- Living Project Plan을 작업 전과 중간에 다시 읽었고 P1 Economy/event calendar 항목이 계속 명시돼 있음을 확인했습니다.

## 이번 회차 개발
- 최신 main에서 `integrate/event-calendar-v2026.09.12.35` 생성.
- 기존 시즌·일일 사건·주간 목표 조회 API를 이용하는 인증 사용자용 `/calendar` 복원.
- 회원 전체 내비게이션과 활동 그룹 내비게이션에 `/calendar` 진입 경로 추가.
- 대체 PR #195 생성. DB나 경제 상태를 변경하는 쓰기 경로는 추가하지 않음.

## 런타임 브랜치 분류
- 활성/대체 검증: #189 Economy Scenario Lab, #195 Event Calendar, #164 Business Settlement Boost, #165 Trusted Client IP, #160 Admin edit-state refresh.
- 활성 문서/기획: #190 인증 보안 우선순위, #192 카지노 시스템 명세. 중복 여부가 입증되지 않아 보존.
- 대체 완료: 기존 #169 Economy Scenario Lab은 #189로, 기존 #162 Event Calendar는 #195로 대체되어 PR을 닫음.
- 삭제 가능하다고 확인한 ref: `feat/economy-scenario-lab-v2026.09.12.14`, `test-candidate/economy-scenario-lab-v2026.09.12.14`, `integrate/economy-scenario-lab-sync-v2026.09.12.30`, `integrate/economy-scenario-lab-v2026.09.12.28`, `feat/event-calendar-v2026.09.12.8`, 그리고 현재 main의 조상임을 확인한 `10d8782f4bfd21bfcbd70c447cbcf28342487f74`의 중복 `docs/integrate-auth-*` ref.
- 기타 오래된 문서 브랜치는 고유 내용이나 squash-merge 동등성이 입증될 때까지 보존함.

## 인프라
- `kuber-infrastructure`에는 `main`과 활성 Draft `feat/v2026.09.12.1-auto-db-backup`(#22)만 존재.
- #22는 유효 작업이지만 비운영 환경에서 dump+checksum 생성, 저장 백업 restore, backend health 증거가 없어 병합 차단 상태 유지.

## 브랜치 삭제 차단
현재 GitHub 연결은 remote ref 삭제 기능을 제공하지 않고, 연결된 Remote Desktop 장비 `debian13`, `minipc`, `weoldog`가 모두 오프라인이었습니다. 따라서 위 삭제 대상 ref는 실제 삭제하지 않았으며 삭제 성공으로 보고하지 않습니다.

## 검증·배포 증거
- #189 head `06fa168597f45833b7a966a9bd6014418b669cb2`: CI #576 성공.
- #195는 감사 문서 추가 전 head `37ac9f873a073c775b81e37ac561f99d12dc8fb4`의 CI #606이 마지막 확인 시 queued였으므로 PASS로 보지 않음.
- `a89e97b8...`의 최신 Production release workflow는 skipped였고 Production 배포 성공을 주장하지 않음.
- 승인된 원격 장비가 오프라인이라 exact-SHA isolated Test 런타임 검증은 불가. 런타임 PR은 병합·운영 승격하지 않음.

## 다음 우선순위
1. #195 CI 및 exact-SHA Test 완료.
2. 확인된 PostgreSQL 런타임 결함 수정인 #164 Business Settlement Boost를 최신 main으로 재통합.
3. #165 Trusted Client IP 재통합.
4. #160 Admin edit-state refresh 재통합.
5. 이후 Stock-tagged Community, Stock Comparison, Conditional Alerts, Account Security Center, Personal Dashboard, Portfolio Analysis 개발.