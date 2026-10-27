# 지갑 원장 기간별 조회 — 개발 A / 운영 보류

- 기준: 2026-10-27 11:29 KST, main `5888176454648f51d5f986be60a22847bd234777`에서 독립 `auto/hourly-a-wallet-period-20261027-1125` 브랜치 생성. 작업 중 main이 `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`로 변경되어 최신 기준 재동기화.
- 기능: `/wallet/activity` 최근 50건/7일/30일 필터, `GET /api/v1/wallet?recent=50&period=7d|30d|all`의 본인 원장 조회 SQL에 기간 조건을 LIMIT보다 먼저 적용. WLD는 정수 문자열로 유지, 마이그레이션·원장 쓰기 없음.
- 모바일: 기존 Android app-api 허용 경로의 기간 매개변수 전달을 검증하고, 지갑 응답을 `Cache-Control: private, no-store`로 강제.
- TDD: 신규 Backend 3건·Frontend 미구현 실패(RED) → 수정 후 통과(GREEN). 앱 API 캐시 미설정 실패(RED) → no-store 강제 후 통과.
- 검증: `pnpm test` 전체 PASS(Backend 1330 PASS/398 SKIP, Frontend 1426 PASS, DB 패키지 15 PASS/3 SKIP), Bot 8 PASS. 독립 PostgreSQL 17.11 임시 컨테이너에 순방향 마이그레이션 278개 적용 PASS, 지갑 관련 37 PASS. Typecheck/Lint PASS(기존 경고 1131), Backend 빌드 및 Next Webpack 빌드 PASS, 앱 API 계약 PASS.
- 차단: 기본 Turbopack 빌드는 독립 Worktree의 외부 node_modules 심볼릭 링크로 실패. 전체 보안 감사 Critical 2/High 8, Bot 감사 Critical 1/High 5로 FAIL. 공식 Test·Production SHA 불일치, 인증 E2E/승인 GitOps/복원 훈련 미검증. **병합·운영배포 금지**.
- 충돌 보호: 별도 PR #1160의 지갑 분류 필터와 겹치는 코드 통합 전 검토 필요. 다른 개발자의 브랜치·Worktree·미통합 커밋 보존. 삭제 0건.
- 롤백: 운영 변경 없으므로 불필요. 추후 코드 적용 시 브랜치 변경만 되돌리면 되며 DB 다운 마이그레이션 없음.
