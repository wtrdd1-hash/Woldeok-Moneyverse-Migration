# A2056 — 공개 게시판 제목 완전 일치 검색 QA (초안 / 실패 / 보류)

- 기준 main `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`, 기능 검증 코드 SHA `7ac4998487a2c1b9232acabcea81939b3f657e97`. 문서 커밋 후 최종 SHA를 별도 재확인한다.
- 대상 회귀테스트: Backend 20건 PASS, Frontend 17건 PASS. 잘못된 응답·빈 결과·중복 ID·JSON 오류를 차단하는 테스트 포함.
- Backend 전체: 2,986 PASS / 2 FAIL / 518 SKIP. 기존 프로필 인증 HTTP 401 오류(#2265). 전체 FAIL.
- Frontend 전체: 2,941 PASS, 워커 시작·종료 오류 3건. 전체 PASS 아님. NODE_ENV=production을 상속한 초기 실행 결과는 무효 처리.
- 계약 41 PASS, DB 단위 62 PASS / 5 SKIP. Android 184개 엔드포인트 문서 영문·국문 동기화.
- 타입검사 PASS, 린트 오류 0/경고 1,027. Next 빌드는 SIGSEGV 및 제한 자원 재시도에서 Rayon 스레드 생성 실패. 전체 의존성 감사 취약점 9건(낮음 1, 보통 8).
- 개발 PostgreSQL 읽기 전용 조회 실행, 완전 일치 결과 0건. 앱 역할의 함수 실행 권한과 직접 게시글 테이블 SELECT 권한이 모두 확인되어 최소 권한 재검토 필요. 운영 DB 권한은 미확인.
- 21:16 KST 공식 Test SHA `abfbb8aee63393c9f58e72159bd5bcab06f99412`, Production SHA `6fe94aeeebbd30c996f7a9f8ddeb02f8c538505e`. 후보와 불일치. 인증 E2E·독립 복원 미완료, 운영 승격 금지.
- 원격 브랜치 시작 275→중간 277, 열린 PR 253→254, 충돌 PR 29 유지. 삭제 0건. 기존 작업의 고유 커밋 보호.
- 증거 경로: `/srv/moneyverse-data/tasks/mv-a-20261102-2056-board-exact-title/evidence/`.
