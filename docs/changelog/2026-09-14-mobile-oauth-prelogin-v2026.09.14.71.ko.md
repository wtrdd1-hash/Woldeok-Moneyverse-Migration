# 변경기록 — 모바일 OAuth Prelogin 격리 v2026.09.14.71

외부 브라우저에 기존 웹 로그인 세션이 있어도 Google/Discord 네이티브 OAuth가 실패하지 않도록 모바일 전용 익명 prelogin 세션을 사용한다. callback에서는 1회용 state/provider로 모바일 challenge를 복원하고 handoff를 생성한다. 회귀 테스트와 통합 API 명세를 갱신했다.
