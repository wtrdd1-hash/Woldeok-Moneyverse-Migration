# QA — 개발 A 10:25 공개 게시판 글 종류 필터 (2026-11-02)

**상태: DRAFT / RELEASE HOLD.** 실제 코드 후보이나 운영 배포 완료가 아닙니다.

- 기준 main: a8541927c3a351d980454c66e95a3356c47e0722, 코드 SHA: c54c740ee531709e074f8cb883148310b6431460, PR #2457.
- 최근 공개 글 50건에서 종목 연결 글/일반 글을 PostgreSQL SECURITY DEFINER 기존 조회 함수 결과로 구분합니다. Nest API, 웹 접근성 선택 메뉴, Android App API의 빈 결과·중복 UUID·출처 검증을 포함합니다.
- TDD RED: Backend 3건, Frontend 4건 실패 재현. GREEN: Backend 23건, Frontend 17건 통과.
- 모바일 API 계약 184개 엔드포인트 및 영문·국문 스키마 갱신 PASS. 타입검사 PASS. Lint 오류 0, 기존 경고 1,027건.
- 전체 루트 테스트는 **FAIL**: 기존 프로필 HTTP 성공 경로 2건이 200 대신 401을 반환했습니다(Backend 2,986 PASS/518 SKIP). 기존 별도 수리 PR #2265가 있어 이 브랜치에서 중복 수정하지 않았습니다.
- 개발 PostgreSQL 17.11 앱 역할 읽기 전용 검증: 공개 글 1건, 종목 연결 0건, 일반 1건. ROLLBACK. 실제 종목 연결 양성 사례는 부족합니다.
- P0 권한: account_balances UPDATE 및 user_items DELETE 직접 허용 확인(이슈 #993). 전체 의존성 보안 감사 9건 FAIL(낮음 1/보통 8), 운영 의존성 감사 0건.
- Test/Production 버전 모두 510dbe6bf4d5...이며 후보와 다릅니다. Test 정확 SHA 사전검증 6건 불일치, 두 환경 Treasury 공개 응답 HTTP 200으로 릴리스 조건 위반입니다.
- Frontend 전체 테스트 558개 파일/2,931 PASS/0 FAIL. Frontend 첫 빌드는 Node 힙 1GiB 제한으로 OOM 실패했으나 2GiB 재시도 PASS, Backend 빌드 PASS. GitHub CI는 문서 마감 시점에 진행 중입니다. Test 인증 E2E/복원/롤백/운영 승격은 미검증입니다.
- 원격 브랜치 209개(main 포함), 미병합 195개, 열린 PR 191개, 충돌 PR 29개. 관련 PR 가상 병합 충돌: #2453 6개, #2448 9개, #2429 6개, #2440 0개. 삭제 0개(고유 변경 보호).
- **main 병합·Test/Production 배포·DB 변경·서비스 재시작·롤백 없음.**

증거: /srv/moneyverse-data/tasks/mv-a-20261102-1025-board-topic-scope/evidence/

- 실제 PostgreSQL PREPARE/EXECUTE: 종목 0건, 일반 1건, 전체 1건. 합성 SQL의 종목·일반 분류 각각 1건 확인. 최종 원격 브랜치 209개(main 포함), 미병합 195개, 열린 PR 191개(충돌 29개), 삭제 0개. 코드·계약·작업일지 14개 파일, 추가 QA/배포 보류 문서 4개 파일입니다.
