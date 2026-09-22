# v2026.09.22.347 — 긴급 콘텐츠 조치 step-up

- 관리자 긴급 콘텐츠 삭제 조치에 최근 재인증을 추가했습니다.
- 기존 세션, 동의, 관리자 세션, CSRF, DB operator actor-check 및 API 계약은 유지합니다.
- 민감 작업의 step-up 인증이 다시 빠지지 않도록 controller metadata 회귀 테스트를 추가했습니다.
- focused Vitest 1/1, Backend TypeScript typecheck, `git diff --check` 통과.
