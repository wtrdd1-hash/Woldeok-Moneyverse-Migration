# 개발 A 작업 기록 — 2026-10-27 14:25 / 근거 만료

- **시작:** Debian 13.6 미니PC 직접 확인. Backend/Frontend/Bot/MCP/Nginx/Docker ACTIVE, DB 연결 정상. main `584f01a9c8df3f9005a7e5aa6d13e4719914ae0c`. AGENTS, README, 영문·국문 기획서, 통합기획, QA v1316, PR/CI, 최신 기획 Draft #1537(v1360) 확인. 원격 브랜치 349(비-main 348), PR 341(Draft 326), 충돌 PR 26, 실패·취소·시간초과 체크 PR 205, 중복 Head 0. 브랜치 삭제 0.
- **격리:** 최신 origin/main에서 `auto/hourly-a-help-evidence-expiry-20261027-1425` 생성, 기존 A 전용 PR #1533의 커밋 3개만 재적용. 다른 작업공간 변경 없음. 미적용 280 마이그레이션만 수정.
- **RED:** 네트워크 없는 tmpfs 격리 PostgreSQL 17.11에서 근거 만료 후 초안 재시도가 거짓 성공 반환하는 문제 재현(psql rc=3). 관리자 API도 만료 문서 게시 허용 표시 회귀테스트 실패.
- **GREEN:** 초안 멱등 조회 전에 근거 만료 검증, 게시 재시도 시 잠금 후 게시 리비전 만료 확인, 만료 시 SQLSTATE 22023. 관리자 API의 `evidenceExpired`, 만료 게시 버튼 차단, 웹 경고 구현. 실제 PG bootstrap/280/관리자/정상/거부 Fixture PASS, 4초 경과 재시도 거부, app DML/PUBLIC EXECUTE 거부. 전용 컨테이너 제거.
- **검증:** 전체 `pnpm test` PASS(Backend 1339 PASS/398 SKIP, Frontend 1430 PASS, 계약/DB/app-api 포함), 타입 검사 PASS, 린트 PASS(기존 경고 1131/오류 0), Backend 빌드 PASS, Frontend `next build --webpack` PASS, Bot 8 PASS. 기본 Turbopack 빌드는 공유 node_modules 링크가 파일시스템 루트 밖을 가리켜 FAIL. 전체 보안 2 Critical/8 High FAIL, Bot 1 Critical/5 High FAIL. Route ledger는 --inventory/--ledger 실측 증거 미제공으로 FAIL. 공식 Test 정확 SHA 인증 E2E·실브라우저 접근성·SEO·독립 복원·GitOps 미통과.
- **환경:** 루트 100%(여유 약 567MiB), 데이터 99%(자체 빌드 .next 936MiB만 정리 후 여유 약 2.5GiB). 타 Worktree·백업·운영 데이터 변경 없음. 기능 OFF, 운영 RELEASE HOLD. main 병합·Test/운영 배포·운영 DB·금융 변경·롤백 0.
- **보호:** 타 Draft PR의 280번 충돌 지속. 기존 PR #1533과 고유 변경 보존, 후속 PR 중복 병합 금지. 완료 판정은 후보 코드 및 일부 검증에만 한정.
