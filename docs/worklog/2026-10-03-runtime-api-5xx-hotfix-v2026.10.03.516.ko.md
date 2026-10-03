# 런타임 API 5xx 핫픽스 작업 기록 — v2026.10.03.516

- 상태: 시작
- 날짜: 2026-10-03 KST
- 브랜치: `fix/runtime-api-5xx-v2026.10.03.516`
- 시작 `origin/main`: `6fc3adc20bf21c7a447c4693fa07625da014f336`
- 범위: `/app-api/v1/chat/conversations`의 반복 HTTP 500과 `/api/activity/events`의 HTTP 503 원인을 진단·수정하고, 운영 승격 전에 정확한 후보를 Test에서 검증한다.
- 시작 런타임 증거: Production 백엔드/프론트엔드/Nginx 활성, 공개 `/` 및 `/health` HTTP 200, 최근 5xx가 위 두 경로에 집중됨.
- 안전 조건: Test 검증 전 Production 변경 금지, 로그인 세션 연속성 보존, 동시 작업 충돌 방지를 위해 격리 worktree 사용.
- 보안 후속: access log에서 관찰된 URL 쿼리스트링 API 키 노출을 조사하고 비밀값이 URL 로그에 남지 않도록 조치한다.
