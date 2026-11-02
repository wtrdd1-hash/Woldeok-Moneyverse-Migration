# 개발 A QA — 2026-11-02 13:25 KST — 보관함 관리 필요 항목 검증

**판정: P1 코드 구현, 릴리스 FAIL/HOLD.** 기준 main `a8541927c3a351d980454c66e95a3356c47e0722`; 독립 브랜치 `auto/hourly-a-20261102-1325-inventory-attention`. 영문 통합기획서가 원본이며 한국어 문서는 두 번째 언어다.

- 로그인·동의한 소유자의 `shop_my_items_v2(actor)` 결과에서 이용 정지, 미납 주차 양수, 정밀 정수 문자열 미납금 양수 항목만 필터링한다. 기본 전체 목록은 유지하며 `filter=attention` 성공 응답은 명시적인 증거를 포함한다. 금융 원장·아이템 쓰기·DB 권한·기존 마이그레이션 변경 없음.
- Android API는 중복·잘못된 쿼리를 400, 증명 불가능한 200 및 HEAD 요청을 503으로 차단하고 보관함 전체에 private/no-store/noindex/no-referrer를 강제한다. 웹은 장착 상태 전체 목록을 보존하고 관리 필요 목록을 별도로 보여 준다. 조회 실패를 빈 보관함으로 오인하지 않는다. UI 플래그 `INVENTORY_ATTENTION_FILTER_ENABLED=1`, 기본 OFF.
- TDD 대상 Backend 9 PASS, Frontend 22 PASS. 전체 Backend **2980 PASS / 3 FAIL / 518 SKIP**(프로필 인증 401 회귀 2건, 병렬 SEO 타임아웃 1건; SEO 단독 9 PASS). 전체 Frontend **2944 PASS**, DB **62 PASS / 5 SKIP**, 계약 **41 PASS**, Typecheck PASS, Lint 오류 0/경고 1026, 빌드 PASS. 전체 의존성 감사 **9건 FAIL**(낮음 1/보통 8), 운영 의존성 감사 0건.
- 개발 PostgreSQL 17.11 읽기 전용 트랜잭션에서 소유자 조회 함수 실행 권한 확인, 존재하지 않는 소유자 0건, ROLLBACK. `moneyverse_app`의 `user_items` 직접 DELETE 권한 TRUE(P0); 운영 DB는 미확인. 공식 Test 정확 SHA 인증 E2E·독립 복원·GitOps·보안 릴리스 게이트 미충족.
- 시작 열린 PR 206건/충돌 29건, 전체 원격 참조 228건/미병합 214건/병합 14건. 기존 PR #2239/#2229/#2386/#2419 가상 병합 파일 충돌 없음; 실제 통합은 수행하지 않음. 브랜치 삭제 0건. main 병합, 배포, 운영 DB 변경, 서비스 재시작, 롤백 없음. 추후 롤백은 플래그 OFF 또는 검증된 코드 되돌리기.

증거: `/srv/moneyverse-data/tasks/mv-a-20261102-1325-inventory-attention/evidence/`.
