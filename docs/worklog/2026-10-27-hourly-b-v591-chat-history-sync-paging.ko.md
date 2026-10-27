# Backend B v591 — 개인 채팅 이력·동기화 페이지 크기 검증 (DRAFT / HOLD)

- 시작 main: 59cdc2e02f0e83e5401049309c4cb89ff57c2d4c.
- GET /api/v1/chat/conversations/:id/messages: 기본 50, 정상 범위 1~100.
- GET /api/v1/chat/conversations/:id/sync: 기본 100, 정상 범위 1~200.
- 2junk, 1e2, 소수, 음수, 0, 범위 초과, 중복 쿼리 등은 서비스/SQL 호출 전에 HTTP 400. Repository 직접 호출에서도 부정확한 값을 거부한다.
- RED 42건 재현 후 집중 단위·HTTP 테스트 90/90 PASS. 격리 PostgreSQL 17.11 합성 데이터·읽기 전용 계정 검증 4/4 PASS, 컨테이너 제거.
- 기존 280번 마이그레이션 번호 충돌로 전체 필수 테스트 FAIL. 관련 독립 PR #1564.
- bigint 커서를 다루는 미병합 PR #1465와 같은 파일이므로 통합 시 두 변경을 모두 보존해야 한다.
- 기존 인증·인가·동의, 응답 구조, 데이터베이스 마이그레이션, 금융 원장 및 WLD 잔액은 변경하지 않았다.
- 모든 보안·CI·공식 Test exact-SHA·GitOps 검증 통과 전까지 Draft + hold. main 병합 및 Production 배포 금지.
