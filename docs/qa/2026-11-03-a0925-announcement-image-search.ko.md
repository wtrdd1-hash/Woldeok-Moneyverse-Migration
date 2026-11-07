# QA — 개발 A 2026-11-03 09:25 — 공지 이미지 설명 검색

**상태: 분리 브랜치 기능 구현 / 전체 게이트 실패 / 초안 PR #2607 / 운영 배포 보류**

- 기준 main 109c0322699ce4b8588498ad765d56d09c9dce8e, 중간 및 동기화 main e83ad8a6d1b8d477bfbe661ea3cffd46f270509c. 기능 커밋 79143689c450da75593fef5195ffa405e50ab1a9, main 동기화 e013e023b5c9f082ae7a8a78a2f3e68b57a9858a.
- 최근 승인·게시된 공지 최대 20건의 이미지 대체 설명에서만 2~80자 유니코드 검색어를 대소문자 무시, 문자 그대로 검색합니다. Nest 공개/콘텐츠 API, PostgreSQL 기존 SECURITY DEFINER 조회, Next 공지 페이지, Android 앱 API까지 연결했습니다. 전체 공지 검색은 아닙니다.
- 중복·알 수 없는·위험한 검색 조건은 400, 검증되지 않은 Android 성공형 결과는 503으로 차단합니다. 검색 결과의 noindex/no-store 및 접근성 라벨을 확인했습니다. 신규 마이그레이션, 금융 원장 변경, 직접 테이블 권한 확대는 없습니다.
- TDD: Backend 대상 6 PASS(실제 Nest HTTP 2 포함), Frontend 대상 6 PASS(UI/SEO 2, Android 3 포함).
- Backend 전체 2,986 PASS / 2 FAIL / 518 SKIP. 기존 프로필 인증 HTTP 테스트 2건이 200 대신 401을 반환하여 전체 PASS가 아닙니다.
- Frontend 전체 NODE_ENV=test 기준 2,955 PASS. 해당 환경변수 없이 실행한 별도 검증은 React.act 오류 506건으로 실패했으며 PASS로 계산하지 않았습니다.
- DB 단위 72 PASS / 5 SKIP, API 계약 184개 PASS, 타입검사 PASS, Backend 빌드 PASS. Frontend 빌드는 최초 1GB 힙 OOM 후 2GB·1워커 재시도 PASS.
- 전체 Lint는 신규 HTTP 테스트 추가 전 오류 0·경고 1,026건, 이후 변경 파일 Lint 오류 0. 최종 전체 Lint 종료코드 재검증은 미완료. 의존성 보안 감사 9건(보통 8, 낮음 1), 종료코드 1.
- 개발 PostgreSQL에서 moneyverse_app 역할의 읽기 전용 트랜잭션으로 최신 공지 1건, 제주 검색 일치 0건, 특수문자 문자 그대로 비교 성공을 확인하고 ROLLBACK. 실제 일치 결과 및 운영 DB 동일성은 입증하지 않았습니다.
- 운영 /ko·/en HTTP 500, Test /ko·/en HTTP 200. 기존 P0 권한·릴리스 문제와 공식 Test 정확 SHA 인증 E2E, 독립 백업 복원, 브라우저 접근성 검사, GitOps 승인 미완료.
- 감사 시점 원격 참조 351개(그중 main 조상 24개), 열린 PR 311개(초안 297, 충돌 1, 미확정 269)였으며 신규 PR #2607 이전 수치입니다. 시작 수는 독립적으로 기록하지 않아 추정하지 않았습니다. 삭제 브랜치 0.
- main 병합, Test/Production 배포, DB 변경, 서비스 재시작, 롤백 없음. 추후 병합 후 문제 발생 시 읽기 기능 코드를 되돌리며 스키마 롤백은 필요하지 않습니다.

**최종 판정: DRAFT / RELEASE HOLD.**
