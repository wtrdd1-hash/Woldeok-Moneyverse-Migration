# 개발 A QA — 공개 게시판 제목 문자순 정렬 (2026-11-02)

**판정: P1 코드 구현 / Draft / 배포 보류.** 통합·운영 승인이 아님.

- main `a8541927c3a351d980454c66e95a3356c47e0722` 시작·중간·종료 재확인. 코드 SHA `5615ff68a67858bdc616d73f16e9a94ae44940c9`; 최종 문서 SHA는 PR에 기록.
- 기존 공개 조회 함수가 반환하는 **최근 50건**에서 제목 UTF-8 문자순(`C` 정렬 규칙) 및 UUID 동률 정렬. 종목/제목 검색 유지, 전체 과거 게시글 및 한국어 가나다순 검색 아님. 웹·Android 정렬 증거, 중복·비정상 응답 차단, no-store/noindex 적용.
- 구현 전 Backend 3건·Frontend 8건 실패. 수정 후 대상 Backend 3건·Frontend 10건 통과. Frontend 전체 **2,932 PASS**. Backend 전체 **2,981 PASS / 2 FAIL / 518 SKIP**(기존 프로필 인증 401/200 문제). DB 62 PASS/5 SKIP, 계약 41 PASS, 정책 27 PASS, 타입검사 PASS, lint 오류 0/경고 1,027.
- 최초 1,024 MiB Node heap 빌드 OOM; 2,048 MiB로 Frontend 빌드 재검증 PASS. 전체 의존성 감사 **9건 FAIL**, 운영 의존성 감사 PASS. 전체 경로 QA 증거 파일 부재로 BLOCKED.
- 개발 PostgreSQL 17.11 읽기 전용 검증 PASS, 실제 공개 글 1건이라 다중 데이터 검증 제한. 앱 역할의 `account_balances` UPDATE 및 `user_items` DELETE 권한은 P0 차단. 운영 DB 권한은 미확인.
- 공식 Test는 후보 SHA가 아닌 `510dbe6bf4d5c2a8089fc06b480776053da7a2e3` 실행 중이며 SHA 불일치 6건. Test/Production Treasury HTTP 200(필수 503 아님), 인증 E2E·독립 백업 복원·릴리스 게이트 미충족.
- 시작 원격 브랜치 242개/PR 224개, 종료 브랜치 244개/PR 225개, 충돌 PR 29개. 고유 변경 보존, 삭제 0개. PR #2494 Draft/HOLD, main 병합·운영 배포·DB 변경·서비스 재시작·롤백 없음.
