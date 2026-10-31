# QA — A0457 시즌 이벤트 참가비 상한 검색 (2026-11-01)

**판정: P1 코드 구현, 로컬 게이트 PASS, 운영 배포 HOLD.**

- 기준 main `f13bbce273ffc65e8576170992d82ea00c27a1c9`, 코드 SHA `b9b066790d1a31c95c31f17a6f19a66282ef6ec0`, Draft PR #2259. 마이그레이션·금융 원장·권한·DB 쓰기 변경 없음.
- RED→GREEN 대상: 공통 계약 3, 백엔드 3, Android 4, 웹 폼 2 PASS. 정확한 BigInt 정수 문자열 비교, 중복·잘못된 쿼리 거부, 인증 회원의 기존 SECURITY DEFINER 함수 사용, 검증되지 않은 HTTP 200 차단, 모바일 개인정보 헤더 강제.
- 전체: 루트 보안·QA 34 PASS, 공통 계약 44 PASS, DB 62 PASS/4 SKIP, 백엔드 2,953 PASS/517 SKIP, 프론트엔드 2,907 PASS. 별도 일시적 systemd scope에서 `pnpm test` PASS. **SKIP 521건은 DB 통합시험 성공이 아님.**
- 타입 검사 PASS(초기 nullable/optional 2건 수정), Lint 오류 0/경고 1,022, 전체 빌드 PASS, 운영 의존성 알려진 취약점 0건. 생성 모바일 API 문서 일치 확인.
- 초기 전체 테스트는 생성 문서가 미커밋 상태라 HEAD drift 실패, 이후 MCP TasksMax=1027 한도에서 자식 프로세스 생성 실패(status=null). 다른 작업을 중단하지 않고 독립 scope(TasksMax=2048)에서 전체 재실행 성공.
- 실제 개발 PostgreSQL 17.11: 함수 SECURITY DEFINER 및 앱 실행 권한 확인, 활성 이벤트 0건. 앱 역할의 이벤트 테이블 직접 SELECT=true(P0 #993). 운영 권한 동일 여부 및 실제 데이터 필터 정확성은 미확인.
- 공식 Test 공개 Backend/Frontend SHA `bc8cd8a6c654af0336f550643f23049a58ee1d16`, Production Backend `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`, Frontend는 SHA가 아닌 빌드 ID `1793450413898`. 후보 SHA 미배포.
- C의 Draft #2234와 시즌 페이지 파일 중복, 병합 전 재검토 필요. 인증 E2E, 실제 비어 있지 않은 DB 필터, 독립 복원, GitOps·운영 실행 출처·CI 전체 완료 미입증. 병합·배포·재시작·롤백·브랜치 삭제 0건. 롤백은 PR 되돌리기이며 데이터 영향 없음.
