# A1125 — QA 및 운영 배포 보류 (2026-11-01)

## 구현 범위
공개 게시판 최근 공개 글 50건에 한정한 한국시간 작성일 검색. Draft PR #2304. 기존 적용 마이그레이션·권한·원장·운영 환경 변경 없음.

## 검증 증거
- Backend 대상 테스트 25 PASS, Frontend·Android·제목 검색 대상 16 PASS. RED→GREEN 기록 보존.
- 실제 PostgreSQL 17.11 `moneyverse_app` 읽기 전용 조회: 2026-09-18 KST 1건, 인접 날짜 0건, 미래 날짜 0건. ROLLBACK.
- DB 단위테스트 62 PASS/4 SKIP, Backend·Frontend 빌드 PASS, 정적 페이지 603개, Lint 오류 0/경고 1,022, 보안 테스트 11 PASS, 의존성 알려진 취약점 0건.
- Android 계약 184개 엔드포인트 생성 및 문서 동기화 후 계약 검사 PASS.
- 최초 Backend·Frontend 전체 Vitest는 워커 `EPIPE`로 정상 요약 없이 실패하여 PASS 처리하지 않음. 별도 스레드 풀 재시도 진행. main 기준 QA v1435 Frontend 관리자 콘솔 2건 실패, 별도 수리 PR #2303 확인.
- 공식 Test 정확 SHA·인증 E2E·운영 출처·독립 복원·GitOps 게이트는 미충족이므로 병합·운영 승격 금지.

## P0·보존
개발 DB 애플리케이션 계정의 `account_balances UPDATE`, `user_items DELETE`, `users SELECT` 권한이 남아 있음. 운영 DB 동일 여부는 미확인. Test 공개 SHA `bc8cd8a6...`, Production 공개 SHA `353c6d5d...`로 후보와 다름. 미통합 고유 커밋을 가진 브랜치 삭제 없음. 운영 변경이 없으므로 실제 롤백 수행하지 않음.

## 최종 테스트 처리
호스트 `moneyverse-mcp.service` cgroup 작업 수가 1,015/1,027에 도달하여 추가 전체 테스트를 중단했습니다. 이는 테스트 PASS가 아니며, 리소스 격리 후 재검증이 필요합니다. 작업 예약은 변경하지 않았고 서비스는 계속 활성입니다.
