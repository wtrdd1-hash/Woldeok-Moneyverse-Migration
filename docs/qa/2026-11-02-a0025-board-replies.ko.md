# 개발 A QA — 공개 게시판 댓글 있는 글 필터 — 2026-11-02

**판정: P1 기능 구현 / 로컬 전체 테스트 통과 / 실제 개발 PostgreSQL 읽기 검증 / 공식 Test 정확 SHA 검증 미완료 / 운영 배포 보류.**

- 기준 main: `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`; 분리 브랜치 `auto/hourly-a-20261102-0025-board-replies`, Draft PR #2399. 기존 공유 체크아웃의 미커밋 변경은 건드리지 않음.
- 기능: 최근 공개 게시글 **최대 50건** 중 댓글이 1개 이상인 글만 보기. 종목·제목 검색과 조합 가능. 전체 과거 글 검색이 아님.
- Backend: `replied=1`만 허용, 중복·잘못된 파라미터 HTTP 400. 기존 `SECURITY DEFINER` 함수의 50건 결과에 매개변수화된 `comment_count > 0` 조건 적용.
- Frontend: 명시적 체크박스, 검색 범위 안내, 검증된 빈 결과/서비스 불가 구분, 필터 URL noindex.
- Android API: 적용 증거 `appliedFilters`와 양수 정수 댓글 수·고유 UUID를 검증. 기존 서버의 필터 미적용 HTTP 200은 503 처리, 잘못된 요청은 400 처리. no-store/noindex.
- TDD: Backend RED 2건 → 대상 22 PASS, Frontend RED 9건 → 대상 19 PASS.
- 전체 Backend **2,987 PASS / 518 SKIP**, Frontend **2,941 PASS**, Database **62 PASS / 5 SKIP**. Build/Typecheck PASS, Lint 오류 0·경고 1,027, 보안 14 PASS, SEO·게시판 17 PASS. 운영 의존성 알려진 취약점 0건. Android API 계약 184개 PASS.
- 실제 개발 PostgreSQL 17.11에서 `moneyverse_app` 역할로 읽기 전용 트랜잭션 실행: 공개 글 1건, 댓글 있는 글 0건, SQL 실행 PASS, ROLLBACK. **실제 양성 다건 정렬·필터 검증은 데이터 부족으로 미완료**.
- 개발 DB의 `account_balances` 직접 UPDATE, `user_items` 직접 DELETE 권한은 여전히 허용됨(P0 #993). 이전 QA v1448은 별도로 운영 권한·출처·복원 문제를 보고했으나 이번 회차에서 운영 DB를 재검증하지는 않음.
- Test 공개 SHA는 `510dbe6...`, Production Backend 공개 SHA는 `353c6d5...`; 후보 SHA가 아님. 공식 Test 인증 E2E, 독립 백업 복원, 금융·권한·GitOps 게이트 미충족.
- 기존 미병합 변경 보호를 위해 브랜치 삭제·main 병합·서비스 재시작·DB 쓰기·Test/Production 배포·롤백 모두 수행하지 않음.

**결론: Draft/HOLD.** 최종 SHA CI, 공식 Test 정확 SHA 인증 E2E, 백업 복원, 보안 및 GitOps 게이트가 모두 통과하기 전까지 운영 승격 금지. 신규 마이그레이션이 없으므로 필요 시 기능 커밋을 되돌리는 방식으로 필터를 제거할 수 있으며 원장 데이터는 변경하지 않음.

## v4 독립 회귀 보강 — 2026-11-02 00:57 KST
- 변경 없는 최신 main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, 영문 원본·국문 기획서와 QA·PR을 재검토. Android 성공 응답에서 동일 UUID를 대문자·소문자로 표기하면 서로 다른 게시글로 인정하는 중복 판정 결함을 발견함.
- 테스트 우선: RED 1 FAIL/9 PASS, UUID를 소문자로 정규화해 중복 검사 후 GREEN 20/20 PASS. 동일 게시글 중복 응답은 HTTP 503으로 거부. 신규 권한·마이그레이션·금융 변경 없음.
- 최신 원격 감사: 전체 브랜치 160개(main 포함), 비-main 159개 중 미통합 고유 커밋 147개·main 선조 12개, 열린 Draft PR 143개, 충돌 29개. 소유권 미확정 브랜치는 삭제하지 않음.
- 이전 전체 테스트 PASS는 **이전 SHA의 결과**임. v4 커밋 SHA에서 전체 필수 게이트를 다시 실행하고 PR #2399에 최종 증거를 기록. 공식 Test 정확 SHA·복원·보안·GitOps 미충족 시 병합·배포 금지.
