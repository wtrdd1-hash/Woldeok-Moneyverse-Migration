# v2026.10.05.531 — 긴급 UI 수정 구현

- 좁은 화면 `/admin/seo` 관제바 잘림을 긴 액션 stack/wrap, shrink-safe 텍스트, 최소 44px 액션 높이로 수정.
- 관리자 mobile/coarse-pointer에 44×44 target-size 바닥값 추가.
- 온보딩/고객지원 소비자 overlay를 공용 floating layer로 통합하고 관리자 route에서 제거.
- 전역 헤더/모바일 주요 제어를 44px target 바닥값으로 상향.
- 홈에 실제 보이는 localized `h1` 추가.
- 연결 identity contract가 `local_email` row를 허용하도록 수정해 account identities 서버 오류 원인을 해결. OAuth 연결은 Discord/Google에 계속 한정.
- account provider, 관리자 액션 layout, touch target, 관리자 floating layer 억제 회귀 테스트 추가.
- 소스 상태: **IMPLEMENTED — Test 검증 대기**. 이 기록은 Production 승격을 주장하지 않는다.
