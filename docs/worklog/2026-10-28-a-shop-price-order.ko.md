# A2125 — 회원 상점 가격 정확 정렬: QA 및 운영 보류
- 시작 main `35971c600f25869c96f1c666d4b9f58927202730`; 새 분리 브랜치 `auto/hourly-a-shop-price-order-20261028-2125`. 코드 커밋 `42efdefef0b0ec59ca4638c36f17a7fe35789a8a`, Draft PR #1745.
- 사용자 기능: 회원 상점에서 기본순/낮은 가격순/높은 가격순 선택. 서버가 기존 회원별 `shop_catalog_list_v2` PostgreSQL 조회 결과를 BigInt로 정렬하며 동가 아이템은 코드/ID 기준으로 안정 정렬. 잘못된 sort는 DB 조회 전에 HTTP 400. 검색어와 정렬 선택 유지. Android app-api 동일 sort 전달 및 오류 포함 private/no-store/noindex.
- 코드 TDD RED→GREEN: Backend 집중 11 PASS, Frontend/Android 집중 31 PASS. 전체 Backend 1,950 PASS/441 SKIP, Frontend 1,877 PASS, DB 46 PASS/4 SKIP, Bot 11 PASS. Lint 오류 0건(기존 경고 1,099), Typecheck/Backend·Frontend Webpack Build PASS, 보안 감사 High/Critical 0.
- 격리 PostgreSQL 17.11 실제 함수 146행, app 역할 EXECUTE 허용 및 카탈로그/재고 테이블 직접 SELECT 금지 확인. 읽기 전용 트랜잭션 후 ROLLBACK. 공식 Test 인증 E2E를 대체하지 않음.
- 감사: 원격 브랜치 67개(main 포함), 열린 Draft PR 65개, 충돌 3개, 실패 검사 PR 18개, Head SHA 중복 0개. 사고 복구 참조 352개 전부 유효. 삭제 0건.
- **RELEASE HOLD:** 공식 Test는 후보 SHA가 아닌 `cfb13272...`, Production /api/version `unknown`. QA v1348의 18,000 WLD 원장 차이, DB 과다권한, 마이그레이션 불일치, 독립 백업 복원/정확SHA E2E 미완료, 데이터 디스크 98% 위험. main 병합·운영 배포·금융 원장·DB 변경·브랜치 삭제 모두 0건. 향후 승격 시 롤백은 앱 코드 되돌리기(신규 스키마 없음).
- 영문 원본: [worklog](2026-10-28-a-shop-price-order.md). GitHub: [PR #1745](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1745).
