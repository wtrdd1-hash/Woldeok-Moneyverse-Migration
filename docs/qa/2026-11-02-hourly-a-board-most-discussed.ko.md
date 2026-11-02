# 개발 A 2026-11-02 14:25 — 댓글 많은 순 공개 게시판 QA

상태: **P1 격리 브랜치 구현 / 배포 보류**. 기준 main a8541927c3a351d980454c66e95a3356c47e0722, PR #2480. main 병합 및 배포 없음.

- 기능: 최근 공개 게시글 최대 50건 내에서 댓글 수 내림차순, 작성일 내림차순, 게시글 ID 내림차순 정렬. 전체 과거 게시글 순위가 아님. 기존 제목·종목 검색과 기본 최신순 유지.
- Backend: 기존 SECURITY DEFINER 함수만 읽고 SQL 매개변수화. 신규 마이그레이션, 직접 권한 부여, 원장 쓰기 없음.
- Web: 접근 가능한 정렬 선택 메뉴, 검색 범위 고지, 정렬 증명 없는 응답 거부, 검색엔진 색인 방지.
- Android: 잘못되거나 중복된 정렬 400, 증명 없는 200·비정상 데이터·중복 UUID·정렬 오류 503, no-store/noindex.
- TDD: Backend RED 3 FAIL → GREEN 22 PASS; Frontend RED 7 FAIL → GREEN 14 PASS. 추가 회귀테스트 반영.
- 코드 SHA 332ed850be73e06538cc133c1e2aa689e10c86b8 전체 로컬: 빌드 PASS, lint 오류 0/기존 경고 1,027, typecheck PASS. Backend 2,985 PASS/2 FAIL/518 SKIP(기존 프로필 HTTP 401 문제, PR #2265), Frontend 2,936 PASS, DB 62 PASS/5 SKIP, 계약 41 PASS, 보안 정책 34 PASS.
- 최초 Android 계약 문서 드리프트로 CI 후보 검증 FAIL. 컨트롤러 응답 타입 명시 및 184개 엔드포인트 계약 문서 재생성으로 보완했으며 최종 SHA 재검증 필요.
- 전체 의존성 감사 취약점 9건(낮음 1, 보통 8) FAIL. 전체 경로 QA 원본 파일 누락으로 BLOCKED.
- 실제 DEV PostgreSQL 17.11: READ ONLY/ROLLBACK, moneyverse_app 함수 EXECUTE 허용, 정렬 SQL EXPLAIN PASS. 공개 글 1건·댓글 있는 글 0건으로 실데이터 다건 정렬 양성 검증은 미완료.
- DEV 최소권한 P0 #993: account_balances UPDATE 및 user_items DELETE 허용. Production 동일 여부 미검증.
- 공식 Test는 후보가 아닌 510dbe6bf4d5c2a8089fc06b480776053da7a2e3 실행, 정확 SHA 불일치 6건 및 Treasury 공개 HTTP 200. 인증 E2E·독립 복원 BLOCKED.
- 14:33 감사: 원격 브랜치 230(main 포함), 고유 미통합 216, main 포함 13, 열린 PR 212, 충돌 PR 29. #2470/#2464/#2448/#2474 가상 병합 충돌 확인. 삭제 0건, 고유 변경 보호.
- Production 배포·Test 승격·원장/DB 변경·서비스 재시작·롤백 없음. 모든 필수 게이트 통과 전까지 HOLD.
