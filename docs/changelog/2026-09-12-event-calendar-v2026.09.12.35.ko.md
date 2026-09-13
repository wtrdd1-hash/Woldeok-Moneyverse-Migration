# v2026.09.12.35 — 이벤트 캘린더 재통합

- 오래된 브랜치 이력을 다시 병합하지 않고 기존 인증 사용자용 Event Calendar를 최신 `main` 위에 재통합했습니다.
- `/calendar`를 회원 전용·`noindex` 화면으로 추가하고 시즌 이벤트, 오늘의 사건, 주간 목표 API를 권위 있는 데이터 원천으로 사용합니다.
- 전체 회원 내비게이션과 그룹형 내비게이션에 일정 진입 경로를 추가했습니다.
- DB migration, 보상 변경, 중복 이벤트 상태 저장은 추가하지 않았습니다.
- 재통합 시작 기준 main: `a89e97b818fe4e12060aef9855b8a6df52721756`.
- 후보 브랜치: `integrate/event-calendar-v2026.09.12.35`.
- CI와 isolated Test exact-SHA 검증 전에는 Production으로 승격하지 않습니다.