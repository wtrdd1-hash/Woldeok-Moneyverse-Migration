# 작업기록 — 모바일 OAuth Prelogin 격리 v2026.09.14.71

운영 증거: 2026-09-14 11:06 KST 실제 Discord 모바일 callback에서 `mobile_client=true` challenge가 소비됐지만 PostgreSQL `active pre-login session required`로 실패했다. 해당 challenge가 이미 `user_id`가 있는 웹 세션에 연결돼 있었다. 모바일 challenge를 새 익명 세션으로 격리하고 일반 웹 OAuth 동작은 유지하도록 수정했다.
