# 2026-11-03 개발 A — 다국어 URL P0 복구 작업 기록

- 시작: 00:34 KST, main `9cade11af53db9f27c2b9f0ea9d39005ea8d0387`, 원격 브랜치 295개, 열린 PR 268개, 충돌 PR 29개. 별도 `auto/hourly-a-20261103-0025-localized-tools` worktree 생성.
- 문제: 운영 `/en/tools`, `/ja/tools`, `/zh/tools`, `/en/stocks`, `/en/roadmap` HTTP 500. 루프백 HTTP 포트로 향하는 내부 재작성 주소가 HTTPS로 생성됨.
- 수정: `frontend/src/proxy.ts`의 로컬 HTTPS 재작성만 HTTP로 변환. 회귀테스트 `frontend/src/lib/locale-loopback-rewrite.test.ts` 추가. TDD 5 FAIL → 7 PASS.
- 검증: 격리 Next.js 포트 4325에서 7개 경로 HTTP 200, 다국어 H1·HTML 언어·canonical 정상. 초기 전체 Frontend 2,945 PASS, Backend 2,983 PASS/518 SKIP, DB 62 PASS/5 SKIP, 빌드·타입검사 PASS, App API 184 엔드포인트 PASS.
- 차단: 전체 의존성 보안 감사 9건, 개발 DB P0 권한 문제, 공식 Test SHA 및 인증·복원·운영 릴리스 게이트 미충족. 중간에 main이 `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`로 변경돼 분리 브랜치 리베이스. 최종 SHA 테스트 결과는 PR 기록 참조.
- 운영 DB, 서비스, main, 다른 예약 및 다른 개발자의 브랜치 변경 없음. 삭제 0개. Production HOLD.

- 최신 main 기반 `pnpm test`: 계약 41 PASS, DB 72 PASS/5 SKIP, Backend 2,985 PASS/518 SKIP, Frontend 2,954 PASS. 프록시 회귀테스트 확장 10 PASS. PR #2263과 동일 원인 수정이므로 병합 중복 방지, 기존 고유 커밋 보존.
