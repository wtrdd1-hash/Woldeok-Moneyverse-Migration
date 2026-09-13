# 작업기록 — 모바일 OAuth 앱 복귀 v2026.09.13.49

날짜: 2026-09-13
영문: [2026-09-13-mobile-oauth-handoff-v2026.09.13.49.md](2026-09-13-mobile-oauth-handoff-v2026.09.13.49.md)

## 기획 재확인
- 작업 시작 기준 `main`: `a57fc851c2800d77c8bb284cb1c168cfb3638bc2`.
- 구현 전 최신 v2026.09.13.47 Weekly World Brief 파일럿 기획을 다시 확인했다.
- 최신 변경은 성장/문서 중심이며 이번 인증/API 수정과 런타임 충돌이 없다.

## 실제 문제
네이티브 앱에서 Google/Discord OAuth를 외부 브라우저로 진행하면 완료 뒤 웹사이트로 돌아왔다. 브라우저 쿠키를 그대로 앱 쿠키로 안전하게 넘길 수 없으므로 URL만 앱으로 리다이렉트하면 앱은 여전히 미로그인 상태가 된다.

## 구현
- 모바일 authorize 요청은 외부 브라우저가 prelogin 쿠키를 가지도록 웹 시작 경로를 사용한다.
- OAuth challenge에 모바일 왕복 여부를 저장한다.
- 모바일 OAuth 성공 시 5분짜리 1회용 handoff를 만들고 임시 브라우저 로그인 세션은 폐기한다.
- 프론트 callback은 고정 앱 URI로 opaque handoff code만 전달한다.
- 앱은 `/app-api/v1/auth/mobile/handoff`에서 code를 자기 세션 쿠키와 CSRF로 교환한다.
