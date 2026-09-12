# 이벤트 캘린더 재통합 작업기록 — v2026.09.12.35

## 목표
동시에 진행된 인증, 앱 API, 모바일 UI/UX, 기획 작업을 보존하면서 유효한 Event Calendar 런타임 기능을 최신 `main` 위에 재통합합니다.

## 선정 이유
Living Project Plan은 Economy/event calendar를 P1 데이터·커뮤니티 통합 공백으로 분류하고 있습니다. 기존 PR #162는 기능 가치가 남아 있지만 현재 `main`보다 오래되어 전체 브랜치 이력을 다시 병합하지 않았습니다.

## 기준과 브랜치
- 시작 기준 main: `a89e97b818fe4e12060aef9855b8a6df52721756`
- 원본 기능 PR: `#162`
- 통합 브랜치: `integrate/event-calendar-v2026.09.12.35`

## 런타임 변경
- 최신 main에 `frontend/src/app/calendar/page.tsx`를 복원했습니다.
- 기존 `/api/v1/seasons/events`, `/api/v1/early-game/today`, `/api/v1/engagement/early-game` 조회 API만 사용하며 중복 백엔드 상태나 쓰기 경로를 만들지 않았습니다.
- 전체 회원 내비게이션과 그룹형 내비게이션에 `/calendar` 진입 경로를 추가했습니다.
- 화면은 인증 필요, 동적 렌더링, `noindex` 상태를 유지합니다.

## 데이터·안전 경계
- DB migration 없음.
- 보상·원장·잔액·이벤트 상태 쓰기 없음.
- 기존 백엔드 API가 권위 있는 데이터 원천입니다.
- API 실패 시 일정을 추측하지 않고 기존 null-safe UI 상태를 사용합니다.

## 검증 상태
- 정확한 후보 SHA의 GitHub CI 통과가 필요합니다.
- 병합·Production 승격 전 isolated Test에서 동일 SHA가 실제 서비스되고 인증 경로/API smoke 검증을 통과해야 합니다.
- 이 작업으로 Production은 변경하지 않았습니다.

## 브랜치 감사 메모
Economy Scenario Lab 대체 PR #189는 CI 성공을 확인했지만 최신 main 재대조와 exact-SHA Test 검증이 별도로 남아 있습니다. 기존 오래된 런타임 브랜치는 대체 작업이 안전하게 보존된 뒤에만 정리 대상입니다.

## 다음 우선순위
이 작업 이후 Business Settlement Boost 런타임 수정, Trusted Client IP 보안 강화, Admin 입력상태 보존을 재통합하고, 이후 Stock-tagged Community, Stock Comparison, Conditional Alerts, Account Security Center, Personal Dashboard, Portfolio Analysis 등 남은 P1/P2 기능을 진행합니다.