# 변경내역 — 모바일 OAuth 앱 복귀 v2026.09.13.49

날짜: 2026-09-13
영문: [2026-09-13-mobile-oauth-handoff-v2026.09.13.49.md](2026-09-13-mobile-oauth-handoff-v2026.09.13.49.md)

- Google/Discord OAuth 완료 후 웹사이트가 아니라 네이티브 앱으로 복귀하는 고정 deep link 흐름을 추가했다.
- 5분 유효, 1회용 OAuth handoff code를 추가하고 앱이 자기 세션 쿠키/CSRF로 교환하도록 했다.
- `POST /app-api/v1/auth/mobile/handoff`를 추가했다.
- 모바일 authorize는 provider URL 대신 브라우저 시작 URL을 반환하도록 변경했다.
- 웹 OAuth 동작은 유지했다.
- migration 184와 handoff 재사용 방지 DB 회귀 테스트를 추가했다.
- 모바일 API 상세 문서에 앱 등록 URI와 보안 규칙을 기록했다.
