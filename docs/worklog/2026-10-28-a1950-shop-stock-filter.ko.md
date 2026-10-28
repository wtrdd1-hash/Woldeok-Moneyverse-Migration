# A1950 — 회원 상점 재고 보유 상품 필터 (코드 후보 / HOLD)

기준 main `35971c600f25869c96f1c666d4b9f58927202730`, 독립 브랜치 `auto/hourly-a-shop-stock-filter-20261028-1950`. Debian 13.6 미니PC 연결 및 주요 서비스 정상 확인. 다른 개발 브랜치·복구 참조·작업공간 모두 보존.

**기능:** `/shop/catalog`에 접근 가능한 '재고 있는 상품만' 체크박스 추가. 회원 인증된 `GET /api/v1/shop/catalog?stock=available`은 기존 회원별 PostgreSQL `shop_catalog_list_v2(actor)`를 재사용하며 재고가 양수이거나 무제한(NULL)인 상품만 표시하고 0개 상품을 제외. 잘못된/중복된 필터는 DB 조회 전 HTTP 400. 실제 구매 가능 여부·구매 한도·가격·할인은 결제 시 DB에서 재검증하며 필터가 구매를 보장하지 않음. Android app-api는 동일한 쿼리를 전달하고 응답 성공/실패 시 공개 캐시와 색인 금지.

**검증:** Backend RED 후 집중 10 PASS, Frontend RED 5건 후 집중 64 PASS. 전체 테스트 Backend 1,949 PASS / 440 SKIP, Frontend 1,876 PASS, Database 46 PASS / 4 SKIP, Bot 11 PASS. Typecheck PASS, Lint 오류 0/경고 1,099, Backend 빌드 PASS, Frontend 첫 빌드 1,024MB 힙 부족 실패 후 2,048MB 재시도 PASS, app-api 180개 PASS. 루트 High/Critical 0(Moderate 1), Bot 취약점 0. 격리 PostgreSQL 17.11 읽기 전용 app 역할 함수 실행 PASS, 직접 테이블 SELECT 거부; 현재 fixture 상품 146건에 품절 데이터가 없어 품절 동작은 단위 테스트로 검증. 신규 마이그레이션/DB 쓰기 없음.

**배포:** QA v1347 FAIL 및 과거 18,000 WLD 원장 불일치, app DML 235개, PUBLIC 은행 함수 3개, 마이그레이션 불일치, 독립 백업 복원 미확인, 공식 Test SHA 불일치, Production 링크 손상, 데이터 디스크 98%로 RELEASE HOLD. 정확 SHA 인증 E2E/GitOps 승인 미충족. PR Draft로 유지, main 병합·Test/Production 배포·원장 변경·롤백·서비스 재시작·브랜치 삭제 없음. 기존 미병합 상점 비교 PR #1684와 controller/gateway 경로가 겹치므로 통합 전 충돌·고유 변경 재검토 필요. 미배포 상태이므로 기존 실행 SHA 유지가 롤백; 향후 통합 시 앱 커밋 되돌리기(스키마 롤백 불필요).

증거: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-28-1950/`.
