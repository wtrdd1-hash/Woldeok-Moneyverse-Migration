# v2026.10.15.684 — 국고 정식 기부 장부 첫 개발 기록

S0 시작 2026-10-15 KST: 사용자 전체 해결 후 운영승격 요청. 기준 main 69bc8c14; 이전 Draft #866 코드만 v684 분리 브랜치로 상속. 운영 prod-v600 SWF OFF 유지 및 암호화 백업 사전 확인, 운영 자금/스키마/서버 변경 금지.
통합문서 v523/v542와 DB 실제 schema 검사: 269 기부 함수는 없는 ledger_transactions.tx_type, ledger_postings.balance_after 및 treasury_donations.message를 참조. treasury_donations는 실제 memo/honor_title. Economy Core economy_post_transaction은 멱등키/균형 분개·정확한 이동을 지원. USER_CASH 양수 계정 18개, TREASURY 결제 계정 1개는 독립 복원 Test에서 확인.
범위: 새 273 전진 migration으로 별도 멱등키 인자를 받는 검증 가능한 `treasury_donate_v2` 구현, 수혜 국고 Core 계정과 보조원장/수령증을 한 트랜잭션에 연결. 기존 3인자 구형 함수는 계속 닫힌 채 유지. 실제 Test 롤백 수용, 동일 키 재시도/타금액 거부, 부족액, 역할 테스트. 다른 국고 지출 기능/운영승격은 별도 차단 게이트.

S1 실증: 새 273 함수 미존재 RED. 복원 Test에만 273 DDL 적용. economy_policies 승인정책 0건으로 외래키 실패 → 정책을 임의 생성하지 않고 NULL 허용, 기능 기본 OFF 유지. 국고 장부 허용 tx_type은 USER_DONATION. 2 WLD 테스트에서 회원 -2, 국고 Core +2, 보조금고 +2, 정식/보조 원장 및 영수증 1건. 동일 멱등키 중복 없음, 키 금액 변조 거부, 잔액부족 전체 롤백. 실 앱 moneyverse_app 역할의 함수호출도 성공, 모든 시험 트랜잭션 ROLLBACK.
S2 신규 POST /api/v1/treasury/donations: 로그인/동의 세션 가드, 필수 UUID 멱등키와 정수 WLD, 최대 500자 메모. 금융 기능 스위치 TREASURY_DONATIONS_V2_ENABLED 기본 OFF → 503. 구형 admin 기부는 계속 차단. 지갑 거래유형 TREASURY_DONATION → 국고 자발적 기부.
S3 소스 검증: 백엔드 1,194 PASS/391 DB SKIP, 프론트 1,211 PASS. 계약/백 빌드·백/프 타입 검사 통과. 운영 SWF 17:17 OFF, 백업 보존, 운영 데이터 무변경. 정책승인 부재·다른 국고 지급/원장·정확 SHA Test/롤백 게이트가 남아 운영 승격 차단. 작업 중 main 69463989 v685 SEO 병합 확인, 충돌 방지.
