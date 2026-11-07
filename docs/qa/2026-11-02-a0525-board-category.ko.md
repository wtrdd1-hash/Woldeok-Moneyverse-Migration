# QA — 개발 A 2026-11-02 05:25 종목 토론 유형 필터

**상태: 초안 / 운영 배포 보류** — 기능 코드 SHA `5d884a4decd50eeac7ebc38dede588a2a093703f`(최종 문서 SHA 대기).

- Nest `/api/v1/board/public/stock-posts?category=...`, Next `/board` 선택 메뉴, Android `/app-api/v1/board/public/stock-posts`, 기존 PostgreSQL `member_board_public_list_with_stock(50)` 연동. **최근 공개 50건에서만** 유형을 검색하며 전체 게시글 검색 아님.
- TDD RED Backend 7건·Frontend 7건 실패 확인, GREEN Backend 26/26·Frontend 14/14 통과. 중복/잘못된 유형은 400, Android 검증 불가 응답은 503, 필터 결과 no-store/noindex.
- 타입검사·변경 파일 Lint 통과, Android API 계약 184개 생성. 전체 테스트 종료코드 0: Backend 2,991 PASS/518 SKIP, Frontend 2,936 PASS, DB 62 PASS/5 SKIP, 계약 41 PASS. Lint 오류 0/경고 1,027, Build PASS(Next 602개 페이지), 운영 의존성 감사 0건 PASS, 전체 의존성 감사 9건 FAIL(낮음 1/보통 8). 중복 테스트 실행 중 하나를 종료해 공유 로그에 SIGTERM 흔적이 있으나 남은 루트 명령은 정상 종료.
- 실제 개발 PostgreSQL 17.11에서 `moneyverse_app` READ ONLY 조회: 공개 1건, 분석 유형 0건, 함수 EXECUTE 허용, SQL 실행 성공, ROLLBACK. 다수 실제 게시글의 양성 검증은 미완료. DB 마이그레이션·DML·금융 원장·권한 변경 없음.
- **P0 보안 FAIL (#993):** 개발 DB `account_balances` UPDATE 및 `user_items` DELETE 직접 권한 존재. 운영 DB는 미검증. 기존 B 수리 PR #2419 보존.
- 공식 Test/Production 공개 SHA `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`는 후보와 다름. 정확 SHA 인증 E2E, 독립 백업 복원, GitOps 승인 미완료. PR #2425 및 #2417과 각각 6개 파일 충돌 확인, 고유 변경 보존.
- main 병합·Test/Production 배포·서비스 재시작·DB 변경·브랜치 삭제 없음. 실제 롤백 수행 없음.
