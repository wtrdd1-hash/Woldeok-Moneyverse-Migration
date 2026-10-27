# 개발 A — 회원 상점 상품 비용 비교 (2026-10-28 04:25 KST)

- 기준 main `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c`, 독립 브랜치 `auto/hourly-a-shop-verified-compare-20261028-0425`. 다른 A/B/C/QA/Gemini 작업공간과 미통합 PR을 변경하지 않음.
- 범위: 로그인 및 동의를 완료한 회원이 Store 2.0 상품 두 개의 현재 가격·주간 유지비·재고를 비교하는 읽기 전용 기능. 서버는 기존 PostgreSQL `shop_catalog_list_v2`와 회원 식별자를 사용함. 신규 마이그레이션·직접 테이블 권한 부여·WLD 원장 변경·재고 예약·구매 성공 주장 없음.
- 검증: UUID 2개(서로 달라야 함), 품절/미등록 상품 및 부정확한 금액 거부, JavaScript Number를 사용하지 않는 정확한 정수 문자열 차이. 웹 접근성 선택 상태, Android app-api `private, no-store`, 영문/국문 181개 API 계약에 신규 비교 경로 반영. 가격은 조회 시점의 정보이며 실제 결제 시 서버가 다시 판정함.
- 테스트: 구현 전 RED → 구현 후 GREEN, 집중·전체 테스트, 빌드·타입·린트·API 계약·보안 점검. 격리 PostgreSQL 전체 마이그레이션 검증이 완료되지 않으면 미완료로 기록.
- 배포: Draft/HOLD. CI, 실제 격리 PostgreSQL ACL, 공식 Test 정확한 SHA·로그인·DB, 백업 복원, GitOps 게이트 통과 전 main 병합·운영 승격 금지. 고유 미통합 브랜치 보존.
