# v2026.10.28.1422 — 시민배당 거래명칭 CI 회귀 수정

## 작업 전
사용자 금융 운영승격 지시 유지, 별도 `fix/treasury-dividend-ledger-v20261028-1420` 브랜치. 기존 통합기획·프로젝트계획·v1420/v1421 변경·AGENTS·출시지침 재검증. 원격 main `952e487d0a0eb4d7520fa98a81e413a1b2cb869c` 시작.

## 원인·수정
- GitHub Actions #40643871611 63c68c10 SHA: DB 20 suite/50 test PASS, backend 289 suite PASS/1 FAIL, 2522 PASS / 1 FAIL. 트랜잭션 `TREASURY_CITIZEN_DIVIDEND`가 `wallet.service.ts` 한국어 거래분류에 없어 `경제 활동`이라는 모호한 설명 표시.
- 기존 명칭 계약에 `TREASURY_CITIZEN_DIVIDEND: '국고 시민배당 지급'` 명시. 기존 대분류 fallback 동작과 사용자 계정내역/API 의미 유지.
- 회귀 wallet/ledger-labels.test.ts 29개 GREEN, 신규 배당 SQL 291 및 미니PC 독립 PostgreSQL 실제 트랜잭션 테스트 이전 v1421 증거 유지.

## 승격 차단 정보
- 운영 DB 재실측 readiness exit2 BLOCKED: 18개 USER_CASH +1,000 WLD(18,000) 원장 차이 및 사용자 승인 일반 금융 DML 3곳. 정식 TREASURY 계정 잔고 0.
- 국고 시민배당 기존 3건(9월 30일 두 건 15k·30k, 10월 28일 18k) 누적 63,000 WLD 확인. 9월 누적45k도 수혜자별 출처 대사 필요.
- 운영 `schema_migrations` 269개 기록: 269~287 금융 관련 누락, 288~290 블로그 전용만 적용. 공식 Test 소스 4688e84, 금융 후보와 불일치. 무근거 생산 DB 직접 수정·임의 불일치 메우기·운영 성공 주장 금지.
