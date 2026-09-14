# 작업 기록 — v2026.09.14.75

원인: 앱 CookieJar에서 시작한 회원가입과 이메일 링크를 여는 브라우저의 CookieJar가 달라 `verify-email`이 실패했다.

조치: token으로 원래 등록 세션을 서버에서 안전하게 조회하고 기존 완료 함수를 호출하는 SECURITY DEFINER 함수를 추가했다. 공개 verify endpoint는 token만 받으며 세션/CSRF guard를 제거했다.
