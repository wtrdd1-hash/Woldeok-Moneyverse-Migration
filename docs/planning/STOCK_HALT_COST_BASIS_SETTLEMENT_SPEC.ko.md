# 주식 거래정지 매수원가 자동정산 상세기획

> 버전: v2026.09.21.313
> 상태: 기획 / 구현 계약
> 영문 기준 문서: [STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC.md](STOCK_HALT_COST_BASIS_SETTLEMENT_SPEC.md)

## 1. 제품 규칙
개별 주식이 설정된 판매/거래정지 상태로 전환되면 해당 종목의 모든 남은 사용자 보유분을 서버가 WLD로 자동정산한다. 정산가는 시장가가 아니라 서버 권위 매수원가(cost basis)이며 일반 시장 매도 주문으로 처리하지 않는다.

## 2. 정산가격과 정산금액
- 남아 있는 각 매수 lot의 조정 취득단가를 우선 사용한다.
- legacy 보유분은 서버에 저장된 권위 가중평균 매수가만 사용할 수 있다.
- 분할/병합/이전은 조정 cost basis를 승계한 뒤 정산한다.
- 이번 계약의 거래정지 자동정산에는 매매수수료, 세금, spread, slippage, price impact를 부과하지 않는다.
- 원가가 없거나 오염됐으면 현재가/시가/최근 체결가로 추정하지 않는다. 해당 보유분은 격리하고 최종 정지 완료를 fail-closed 한다.
- WLD 계산은 기존 정수/고정소수점만 사용하고 floating point 정산은 금지한다.

## 3. 상태기계와 원자적 처리
필수 상태는 `ACTIVE -> HALTING -> HALTED_SETTLING -> HALTED_SETTLED`이다.
1. 종목/정지 이벤트를 lock하고 신규 매수·매도를 거절한다.
2. 해당 종목 ticker/가격 변동을 중단한다.
3. 대기 주문은 체결 없이 취소 또는 종결 거절한다.
4. 영향 보유수량과 권위 cost basis를 snapshot한다.
5. account+holding row를 결정론적 순서로 lock한다.
6. `{haltEventId, stockId, accountId}`별 1개 멱등 command를 만든다.
7. 같은 DB transaction에서 환급 WLD를 적립하고 정산 주식수량을 0으로 만든다.
8. receipt, ledger link, 전후 수량, cost-basis method를 저장한다.
9. 모든 보유분이 정산됐거나 명시적으로 오류 격리된 뒤에만 최종 정지 완료로 전환한다.

timeout/crash 후 재시도는 저장된 결과를 반환해야 하며 WLD를 두 번 지급하면 안 된다.

## 4. 원장·감사 증거
각 정산은 최소 `settlementId`, `haltEventId`, `stockId`, `accountId`, `quantity`, `basisMethod`, `basisUnitAmount`, `refundAmount`, `ledgerEntryId`, `commandId`, `createdAt`, `sourceVersion`을 불변 보존한다.
사용자 거래내역은 일반 매도/수익실현이 아니라 거래정지 원가환급 자동정산으로 표시한다.

## 5. 거래정지 기록이 있어도 종목 삭제 가능
- 정산 완료 후 거래정지 이벤트 기록이 있어도 live 종목/catalog row를 archive 또는 tombstone 처리할 수 있다.
- settlement, ledger, audit row는 절대 cascade delete 하지 않는다.
- 역사 데이터는 live 종목 row 없이도 표시되도록 안정적인 stock identity와 ticker/name snapshot 또는 tombstone을 유지한다.
- FK는 tombstone 참조 또는 `ON DELETE SET NULL` + immutable snapshot 컬럼을 사용하며 금융이력으로의 파괴적 cascade를 금지한다.
- `HALTING` 또는 `HALTED_SETTLING`에서 미정산 보유분이 있으면 관리자 종목 삭제를 차단한다.
- `HALTED_SETTLED` 이후에는 거래정지 기록이 있어도 삭제/보관을 허용한다.
- operational halt-history 자체를 일반 관리자 화면에서 숨김/삭제하더라도 그 삭제행위는 감사로그로 남기고 settlement/ledger/audit 증거는 유지한다.

## 6. 계획 API 방향
- `POST /admin/stocks/:stockId/halt`: 정지 이벤트 생성/재사용 후 정산 시작.
- `GET /admin/stocks/:stockId/halt-settlement`: 진행률, 합계, 격리 오류 조회.
- `POST /admin/stocks/:stockId/halt-settlement/retry`: 실패/격리 계정만 멱등 재처리.
- `DELETE /admin/stocks/:stockId`: 정산 게이트 통과 후 archive/tombstone 방식 삭제.
- 사용자 portfolio/transactions API는 정산 receipt를 제공하고 현재 보유수량에서 정산수량을 제거한다.

모든 관리자 mutation은 기존 privileged authorization, 설정된 recent-auth, 브라우저 세션 CSRF 방어, immutable audit, rate/abuse control을 유지한다.

## 7. real-DB 동시성/장애 테스트
동시 halt 요청, `ACTIVE -> HALTING` 순간 매매 경쟁, settlement replay, 2/10/50 계정 동시 정산, 같은 계정 지갑 mutation 경쟁, ledger/holding 사이 failure injection, batch 일부 실패 후 재개, 삭제-vs-정산 race, cost basis 누락, legacy 가중평균 보유, corporate-action 조정원가를 필수 검증한다.

불변식: 각 account/stock/halt event의 WLD 지급합계는 권위 환급원가와 정확히 같고 1회만 지급되며, 정산 주식수량도 정확히 1회만 0이 된다.

## 8. UX와 관측성
- 사용자: 거래정지 배너와 수량/환급 WLD receipt, 일반 시장매도로 오해할 문구 금지.
- 관리자: 확정 전 영향 보유자 수/예상 원금, 진행/실패/재처리, 정산 완료 전 삭제 비활성화.
- metric: 시작/완료/실패, 영향 계정수, 환급총액, replay 차단, 격리 보유분, latency. 잔액/PII/token 원문 로그 금지.

## 9. 구현순서 / 릴리스 게이트
1. `v2026.09.21.313-01` schema/state/cost-basis/tombstone 계약.
2. `-02` transaction 정산 + idempotency + ledger.
3. `-03` 관리자 halt/progress/retry/delete API와 권한.
4. `-04` 사용자/관리자 반응형 UI와 receipt.
5. `-05` real-DB 동시성/장애/security 회귀.
6. `-06` 최신 Living Project Plan 재확인 후 exact candidate SHA를 Test에서 backend/API/DB/UI 검증.
7. `-07` Test 통과 때만 merge하고 병합 exact SHA 재빌드 후 무중단 Production 승격·smoke·rollback 증거 확인.

원가 추정, WLD 중복지급, 주식수량/원장 불일치, 금융이력 cascade 삭제, 미정산 보유분, 권한우회, exact-SHA Test 미검증 중 하나라도 있으면 Production 승격을 차단한다.