# 개발 A 2026-11-02 08:25 KST — 공개 게시판 최소 댓글 수 필터 QA

- 기준 main: `a8541927c3a351d980454c66e95a3356c47e0722`; 독립 작업 브랜치: `auto/hourly-a-20261102-0825-board-reply-threshold`.
- 사용자 기능(P1): 최근 공개 게시글 50건 중 댓글 2/5/10개 이상 필터. 종목·제목 검색과 조합 가능. 기존 PostgreSQL SECURITY DEFINER 함수의 최대 50건 범위를 유지하며, 직접 테이블 권한·마이그레이션·원장·금융 쓰기는 변경하지 않음.
- Backend: 정규형 파라미터만 허용하고 중복·잘못된 조건은 HTTP 400. SQL 바인딩 `$4::integer`로 필터, 응답에 적용 기준을 명시.
- Web: 접근성 선택 메뉴, 검색 범위·오류 안내, 검색엔진 색인 방지. 검증되지 않은 성공 응답은 게시글 없음으로 표시하지 않음.
- Android App API: 필터 미적용·중복 UUID·기준 미달·비정상 응답을 HTTP 503으로 차단. 결과는 no-store/noindex.
- TDD 실패 재현 및 통과 증거는 미니PC `evidence/`에 보존. 전체 로컬 테스트: Backend 2,995 PASS / 518 SKIP, Frontend 2,950 PASS, Database 62 PASS / 5 SKIP, Contract 41 PASS; 타입검사 PASS.
- 실제 개발 PostgreSQL 17.11: `moneyverse_app` 역할의 읽기 전용 트랜잭션, 함수 실행 허용, 공개 1건·댓글 2/5/10개 이상 각 0건, ROLLBACK. 실데이터 다건 양성 검증은 미완료. 합성 PostgreSQL VALUES (0,2,5,10)의 기준별 결과는 3/2/1건.
- 기존 P0: `account_balances` 직접 UPDATE 및 `user_items` 직접 DELETE 권한 허용 확인. 해결되지 않음.
- **릴리스 HOLD:** 정확 SHA CI·이미지·격리 Test 인증 E2E·독립 복원·P0 최소 권한·전체 보안 감사·GitOps 승인 전 main 병합 및 Production 배포 금지.

- 추가 게이트: 정책·보안·백업 34 PASS, 전체 ESLint 오류 0/기존 경고 1,027, Backend·Frontend 빌드 PASS(정적 페이지 602개), 운영 의존성 감사 취약점 0, **전체 의존성 감사 9건(낮음 1/보통 8) FAIL**. Android API 계약 생성물 갱신.
- 공개 Test·Production 백엔드/프론트 버전 `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`으로 후보 SHA 불일치.
