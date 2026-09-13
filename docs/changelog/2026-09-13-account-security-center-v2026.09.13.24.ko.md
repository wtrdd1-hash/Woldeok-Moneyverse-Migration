# v2026.09.13.24 — 계정 보안 센터 통합

- 오래된 stacked history를 그대로 합치지 않고 유효했던 계정 보안 센터 런타임을 최신 `main`에 다시 적용했습니다.
- 기존 `auth_sessions`를 사용한 활성 세션 조회, 다른 세션 하나 종료, 다른 세션 전체 종료 API를 추가했습니다.
- 현재 세션 보호를 SQL에서 강제하고 종료 작업에 CSRF와 최근 본인확인을 요구합니다.
- 인증 필수/noindex `/account/security` 화면과 회원 내비게이션을 추가했습니다.
- 최소 세션 정보 노출, 현재 세션 보호, 종료 개수에 대한 회귀 테스트를 추가했습니다.
- 새 DB migration과 경제/원장 변경은 없습니다.
- 기준 main SHA: `22f8b7a18cd778ddf6a754cc6d28dd0206847885`.
- CI와 exact-SHA 격리 Test 검증 전까지 Test/Production은 변경하지 않습니다.
