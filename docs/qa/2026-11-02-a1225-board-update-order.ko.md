# 개발 A QA — 2026-11-02 12:25 KST — 공개 게시판 수정순 정렬

**판정: P1 코드 구현 / 릴리스 실패·보류.** 기준 main `a8541927c3a351d980454c66e95a3356c47e0722`; 분리 브랜치 `auto/hourly-a-20261102-1225-board-update-order`.

최근 공개 글 50건 안에서 수정 또는 작성 시각 기준 정렬을 추가했습니다. 댓글 활동순 또는 전체 과거 글 검색이 아닙니다. 제목·종목 필터를 유지하고 웹·Nest API·PostgreSQL 읽기 함수·Android 게이트웨이까지 연결했습니다. Android는 중복/오류 요청 400, 정렬 증거가 없는 성공 응답 503, 검색 결과 no-store/noindex를 적용합니다. 신규 마이그레이션·DB 권한 확대·금융 원장 변경은 없습니다.

TDD RED 이후 대상 Backend 20건, Frontend 21건, 추가 날짜 검증 12건 PASS. Backend 전체 **2,983 PASS / 2 FAIL / 518 SKIP**(기존 프로필 HTTP 401/200 오류, 복구 PR #2265). Frontend 전체 **2,934 PASS**, DB **62 PASS / 5 SKIP**, 계약 **41 PASS**, 정책 **34 PASS**, 모바일 계약 **184개 PASS**. 빌드·타입검사 PASS, lint 오류 0/기존 경고 1,027. 전체 의존성 감사 **9건 FAIL**, 운영 의존성만 PASS. 전체 라우트 QA 원장 파일 부재로 검증 실패.

개발 PostgreSQL 17.11에서 `moneyverse_app` 읽기 전용 함수/정렬 SQL 실행 PASS, 실제 공개 글 1건, ROLLBACK. 다수 실데이터 양성 검증은 미실시. 개발 DB 최소 권한 P0: `account_balances` UPDATE와 `user_items` DELETE 모두 허용. 운영 DB 권한은 미확인. 공식 Test·Production 공개 버전은 `510dbe6...`로 후보와 불일치. 정확 SHA 인증 E2E·독립 복원·GitOps 게이트 미충족.

시작/중간 열린 PR 202개·충돌 29개, PR #2412와 가상 병합 충돌. 기여자 고유 변경 보존, 브랜치 삭제 0, main 병합·Test/Production 배포·재시작·DB 쓰기·롤백 0. 최종 SHA·CI 및 브랜치 수는 PR에 기록. **Production HOLD.**
