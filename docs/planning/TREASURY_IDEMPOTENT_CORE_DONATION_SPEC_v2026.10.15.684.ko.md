# 국고 기부 복식원장·멱등 정산 — v684

[영문 정본](TREASURY_IDEMPOTENT_CORE_DONATION_SPEC_v2026.10.15.684.md)

상위 PROJECT_PLAN→통합기획→v523/542 통화량 보존. 구 268/269 기부 SQL은 실제 DB에 없는 컬럼을 참조하고 직접 잔액 수정하며 멱등키가 없으므로 v683에서 차단했다. 구 3인자 함수를 다시 열지 않는다.

신규 273 기부 v2: 요청 멱등 UUID, 서버 세션 회원 UUID, 정수 WLD 문자열, 메모. 활성 USER_CASH→TREASURY 계정을 Economy Core `economy_post_transaction`에서 credit/debit 균형 분개. 기존 금고는 국고 보조회계로서 Core 거래 ID를 기록하고 초기 미증빙 시드와 구분한다. treasury_donations에 새 `core_transaction_id UNIQUE`로 영수증 연결, 과거 기록 불변. 같은 UUID 같은 요청은 원본만, 다른 금액은 거부, 잔액부족·수령계정 부재·감사 오류 시 전체 롤백. API는 세션 actor와 클라이언트 멱등키 요구, 서버에서 매번 새 UUID를 만들지 않음.

RED SQL 부재 확인→Test 단독 DB 273 적용→실제 잔액·원장·중복·실패원자성 검사→Nest 계약→동일 SHA Test/권한/세션→안전 운영승격. 국고의 다른 지급 및 보조원장 15M 차액은 여전히 별도 차단.
