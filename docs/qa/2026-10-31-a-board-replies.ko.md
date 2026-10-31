# 개발 A 공개 게시판 댓글 유무 필터 — QA (2026-10-31)

- 기준 main: `1a3625f3c5e426c857e2b44a412d7949ac4a6257`. 코드 SHA: `510752cba2e798e08e6df19d93ae144d33ba5fc4`. Draft PR #2170. 문서 커밋 SHA는 PR에 별도 기록.
- 기능: 공개 게시글 최근 50건에 한하여 댓글 있는 글/없는 글/전체 선택. 제목·종목 검색 조합. NestJS·기존 PostgreSQL SECURITY DEFINER 함수·Next.js·Android app-api 연결. 마이그레이션·권한 확대·금융 변경 없음.
- 확인: 백엔드 컴파일 런타임 스모크 PASS, 백엔드 빌드·타입검사 PASS, 프론트 대상 75 PASS, 프론트 타입검사 및 변경 파일 ESLint PASS. 구현 전 스모크는 `replies=with` HTTP 400으로 RED 확인. 실제 개발 PostgreSQL 읽기 전용 SQL 검증 PASS(공개 최근 1건 중 댓글 0건/없는 글 1건); 회원 정보·잔액 조회/변경 없음.
- 코드 SHA `2dcb...` GitHub CI는 lint/typecheck/build/마이그레이션 통과 후 백엔드 테스트 3408 PASS/2 FAIL/107 SKIP. 기존 mock 인자 수와 새 테스트 파라미터 구성 오류를 `510752c...`에서 수정함. 최종 SHA CI 및 후보 이미지 결과 확인 전 PASS 주장 금지.
- 차단: 미니PC moneyverse-mcp cgroup TasksCurrent 1016/TasksMax 1027로 EAGAIN, 로컬 전체 Vitest TIMEOUT·백엔드 SWC 스레드 오류·Next 빌드 실패. P0 이슈 #2171. 격리 클린 PostgreSQL·정확 SHA 공식 Test 로그인 E2E·독립 백업 복원 미완료.
- 운영 검증: Test 공개 SHA `32c737a7...`로 후보와 다름. Production Backend `95485a29...`, Frontend는 SHA가 아닌 `1793422036848` 표시. 두 프로세스 모두 삭제된 v1515 경로에서 실행(P0 #1984). 운영 배포 금지.
- 브랜치/PR: 시작 96/87 → 97/88(자체 신규 포함). 비-main 96개 중 미통합/분기 89, main 선조 6, 객체 확인 불가 1. 열린 PR 충돌 8, 실패/취소 검사 포함 31. 미통합·UNKNOWN 보호. 삭제 0, 병합 0, Test/운영 배포 0, 재시작 0, DB/원장 변경 0, 롤백 0.
- 결론: **P1 코드 구현 / 대상 PASS / 전체 CI 미확정 / Production HOLD**.
