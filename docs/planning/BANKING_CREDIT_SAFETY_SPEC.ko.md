# 월덕 머니버스 — 은행·신용·금융학습 안전 명세

> 버전: v2026.09.13.13
> 상태: 구현 지향 Living Spec
> 날짜: 2026-09-13
> 영어 기준본: [BANKING_CREDIT_SAFETY_SPEC.md](BANKING_CREDIT_SAFETY_SPEC.md)
> 한국어 색인: [../INDEX.ko.md](../INDEX.ko.md)

## 0. 목적과 제품 경계

이 문서는 Moneyverse의 예치, 대출, 상환, 가상 채권을 실제 구현 가능한 제품 계약으로 정의한다. 이 시스템은 게임경제 학습 기능이며 실제 은행, 예금, 대출업, 증권, 투자상품, 신용평가 서비스, 현금 환전 서비스가 아니다.

모든 은행·대출·채권·저축 화면에는 WLD와 관련 잔액이 `virtual / simulated / game-only`라는 점을 표시한다. 예금자보호, 실제 APR 수익, 수익보장, 법적 신용점수, 현금환전, 투자권유로 오해할 문구는 사용하지 않는다.

향후 실제 현금대출, 현금성 예치, 환전 가능한 자산, 실제 신용심사, 외부 금융상품을 도입하려면 이 명세만으로는 부족하며 별도 법률·규제 검토가 선행되어야 한다.

## 1. 설계 원칙

1. 부채 규모보다 예산관리·상환·위험 이해를 보상한다.
2. 일반 성장의 최적 경로가 대출이 되지 않게 한다.
3. 조건은 서버 권위값으로 버전 관리하고 이미 발행된 계약은 발행 당시 조건을 유지한다.
4. 상환·이자계산·정산은 멱등 처리하고 원장에 연결한다.
5. 임의의 일일 대출 횟수 제한은 만들지 않는다. 단, 경제·무결성 보호 목적의 신용노출 한도는 문서화된 보호한도로 허용한다.
6. 회복 불가능한 연체·복리 패널티 루프를 만들지 않는다.
7. 금융학습 행동에는 XP·배지·꾸미기 보상을 사용할 수 있으나 과도한 WLD faucet을 만들지 않는다.
8. 광고·구독 결제로 대출금리, 승인확률, 정산순서, 상환경제를 유리하게 만들지 않는다.

## 2. 정보 구조

기본 `/bank` 탭:

- **개요** — 유동 WLD, 예치잔액, 다음 정산, 활성 신용요약, 안전한 추천행동 1개
- **저축** — 가상 예치상품, 이자계산 설명, 예상 게임 이자, 입출금
- **신용** — 자격 설명, 이용 가능한 제안, 총상환액 미리보기, 활성 대출
- **상환** — 분할상환 일정, 원금/수수료 분리, 조기상환, 연체·회복 경로
- **가상 채권** — 정확한 만기 정산값을 보여주는 게임 전용 계약
- **학습** — 예산, 부채비용, 분산, 상환 학습
- **기록** — 권위 은행 거래내역, 필터/페이지네이션

개인 은행 경로는 로그인 + `noindex`가 기본이다. 공개 교육 페이지는 계정별 정보를 포함하지 않을 때만 색인 후보가 된다.

## 3. 저축/예치 모델

권장 상태:

`EMPTY -> FUNDED -> ACCRUING -> SETTLEMENT_DUE -> SETTLED`

예외 상태: `PAUSED_POLICY`, `LOCKED_SECURITY_REVIEW`, `MIGRATION_HOLD`.

원금이 바뀌는 입출금은 이자계산 기준을 원자적으로 갱신해야 한다. 새로 예치한 WLD에 예치 전 경과시간을 소급 적용해서는 안 된다.

서버/DB는 상품코드, 정책버전, 표시금리 또는 게임요율 기준, 계산방식, 정산주기, 반올림 규칙, 자금원 분류, 유효기간을 권위값으로 가진다. 1 WLD 미만의 이자는 누적 remainder로 관리하고 반복 청구로 최소 1 WLD가 공짜 발행되지 않게 한다.

예치 원금 이동은 일반적으로 **hold/internal allocation**이지 hard sink가 아니다. 시스템 지급 이자는 **faucet**, 실제 소각되는 서비스 수수료만 **hard sink**다.

## 4. 신용/대출 모델

자격은 Moneyverse 내부 상태만 사용한다. 예: 계정/직업 성장, 검증된 활동, 기존 상환이력, 현재 가상채무, 사업 상태, 보안제한, 정책버전. 게임 신용점수를 위해 실제 소득·은행잔액·신용정보·재직서류·정부 발급 신분증을 수집하지 않는다.

승인 전 화면에는 원금, 총상환액, 게임 이자/수수료, 분할횟수, 만기시각/시간대, 조기상환 규칙, 미납 시 처리, 담보 여부, 향후 게임 내 신용자격 영향, game-only 고지를 함께 표시한다.

백분율 금리는 학습용으로 표시할 수 있으나 실제 금융상품 APR처럼 보이게 해서는 안 된다.

신용한도는 일반 플레이 하드캡이 아니라 무제한 발행·과도채무를 방지하는 보호한도다. 서버 권위값, 정책버전, 내부 상환능력/노출 기준, 설명 가능성을 가져야 하며 결제나 광고시청으로 확대할 수 없다. `하루 N회 대출`보다 동적 노출/상환능력 규칙을 우선한다.

## 5. 상환과 연체

상환 배분 순서는 결정적이고 공개해야 한다. 권장: 기한도래 원금 → 계약상 일반 이자/수수료 → 별도 고지된 제한적 연체 행정비용. 숨은 수수료나 재귀적 복리 패널티를 금지한다.

조기상환은 기본적으로 불이익 없이 허용한다. 연체 시에는 상환기간 연장, 임시 분할액 축소, 예산학습 미션, 사업 구조조정, 제한적 행정비용, 기존 부채 해결 전 신규신용 제한처럼 회복 가능한 경로를 제공한다.

대출 연체만으로 무관한 영구 코스메틱·업적·수집품을 삭제하지 않는다. 담보 시스템은 발행 전 명확히 고지하고 별도 검토가 필요하다.

## 6. 가상 채권

가상 채권은 증권이 아닌 고정기간 게임 계약이다. 상품코드, 원금, 기간, 만기정산식, 발행/만기시각, 정책버전, 자금원 계정, 상태를 기록한다.

권장 상태:

`AVAILABLE -> PURCHASED -> ACTIVE -> MATURED -> SETTLED -> ARCHIVED`

예외: `CANCELLED_BEFORE_PURCHASE`, `SETTLEMENT_RETRY`, `SECURITY_HOLD`.

이미 구매된 계약은 발행 당시 조건을 유지한다.

## 7. DB/원장 계약

후보 테이블/리드모델:

- `bank_products`
- `bank_product_versions`
- `bank_deposit_accounts`
- `bank_accrual_state`
- `credit_offers`
- `loan_contracts`
- `loan_installments`
- `loan_repayments`
- `virtual_bond_contracts`
- `bank_transaction_read_model`
- `bank_policy_audit`

모든 WLD 이동은 PostgreSQL 경제 경계와 double-entry ledger를 통과한다. 애플리케이션이 wallet/deposit/loan/bond 잔액을 직접 덮어쓰지 않는다.

재시도 가능한 변경에는 안정적인 idempotency key와 payload-hash 충돌 검사를 사용한다. 같은 키 재요청은 기존 결과를 반환하고 다른 파라미터로 같은 키를 쓰면 거부한다. 금액은 DB/API/UI 전체에서 정수/string-safe 형식을 유지한다.

## 8. API 후보

조회: `/api/bank/overview`, `/products`, `/loans`, `/loans/:id`, `/bonds`, `/history?cursor=...`.

변경: 예치, 출금, 이자정산, 신용제안 수락, 대출상환/구조조정, 채권가입/정산.

모든 객체 ID는 actor ownership을 다시 검증한다. 클라이언트가 보내는 `user_id`, 가격, 금리, 원금, 수수료, 만기, 정산액은 권위값이 아니다.

## 9. UI 상태와 반응형

모든 주요 화면은 default, loading/skeleton, empty, 부적격+다음단계, validation error, 잔액부족, stale offer, idempotent replay, permission denied, offline, maintenance, security review hold, success receipt 상태를 정의한다.

폼은 비파괴 새로고침에서 입력값을 보존한다. 관리자 은행 폼은 입력 중 자동 새로고침으로 값을 날리지 않는다.

데스크톱은 요약카드+일정/내역 테이블+보조패널, 태블릿은 2열/접힘 구조, 모바일은 접근 가능한 카드 전환을 기본으로 한다. 모바일 고정 CTA는 고지문이나 키보드 focus를 가리면 안 된다.

## 10. 접근성

폼 label/error 연결, 절제된 `aria-live`, 색상 외 텍스트/기호 상태표시, 차트의 표/텍스트 대체, dialog 종료 후 focus 복귀, 키보드 조작, 확대 대응을 요구한다.

## 11. 학습 중심 성장

대출 횟수/대출액이 아니라 상환일정 검토, 원금·비용 구분, 예산 시나리오, 정시 상환, 조기상환 시뮬레이터, 저축 vs 차입 비교, 비싼 대출 원인 복기, 연체 회복계획 등을 성장 행동으로 사용한다.

## 12. 악용·보안

우선 위협은 다계정 대출 farming, borrow-transfer-abandon 루프, 정산 재시도 악용, 출금/상환 race condition, BOLA, 보호필드 mass assignment, 탈취계정 출금, 관리자 정책 무감사 변경이다.

actor-scoped DB 함수, row/advisory lock, idempotency, 이상탐지, policy snapshot, 민감변경 재인증, append-only audit를 사용한다.

## 13. 경제 분류

- wallet → deposit: hold/internal allocation
- deposit → wallet: hold release
- 시스템 이자: faucet
- 대출원금 발행: faucet 또는 treasury-funded transfer
- 원금상환: transfer/treasury return, 자동 burn 아님
- 실제 소각되는 대출 서비스비: hard sink
- 재순환 가능한 treasury 수수료: transfer
- 채권원금: 계약에 따라 hold/transfer
- 채권 수익: faucet 또는 treasury-funded transfer

총 상환거래량을 소각량으로 계산하지 않는다.

## 14. KPI

예치 채택률/중앙예치액, 이자 faucet, 활성 대출원금, 신규발행, 상환 원금/비용 분리, 정시상환, 조기상환, 구조조정/회복, 연체발생/치유, 중앙/P95 debt-to-liquid-WLD, 완납 후 재차입, 은행 hard sink 기여, 재시도율, 의심 대출 farming/오탐률, 학습완료율, 조건 관련 지원문의율을 추적한다.

대출발행량, 부채잔액, 이자지급액 자체를 1차 성공 KPI로 삼지 않는다.

## 15. 관리자/운영

관리자는 상품버전, 활성계약, 총노출, 정산실패, 의심클러스터, reconciliation 상태를 본다. 정책변경은 이유 → 영향 preview → 경제 시뮬레이션 → 버전형 config → 런타임 변경 시 Test exact-SHA → 제한적 rollout → 관찰/rollback 순서다.

발행된 계약의 원금/금리/만기를 직접 수정하지 않는다. 보정은 compensating transaction 또는 감사 가능한 별도 보정흐름을 사용한다.

## 16. 법률/정책 경계

미국 CFPB Regulation Z는 실제 소비자신용을 다룬다. Moneyverse는 명확한 고지 패턴을 참고할 수 있지만 가상 대출이 실제 소비자신용 규정 준수 상품이라고 주장하지 않는다. 실제 신용상품으로 변하면 출시 전 `legal review required`다.

Investor.gov는 투자앱의 gamified nudge가 사용자의 계획보다 과도한 거래를 유도할 수 있다고 경고한다. Moneyverse는 이를 가상금융에도 적용해 부채 축하연출, 손실추격, 반복 대출 압박을 금지한다.

한국에서도 Moneyverse 가상대출을 실제 금융상품/대부관계로 표현하지 않는다. 현금환전, 실제 신용, 외부 금융기관, 실제 신용도, 금융중개가 들어오면 한국 규제검토가 선행되어야 한다.

## 17. 수익화

허용: 경제결과를 바꾸지 않는 코스메틱/일반 구독 혜택.

금지: 결제로 대출승인 개선, 광고시청으로 금리 인하, 구독으로 신용한도 확대, 유료 우선정산, 선택 사용자만 받는 숨은 금융정보, 현금결제 부채탕감/경쟁우위.

## 18. SEO

공개 색인 후보: 가상은행 안내, 원금/이자/상환/가상채권 용어집, 투명한 규칙 페이지.

항상 비공개/noindex: 잔액, 자격, 신용제안, 상환일정, 거래내역, 개인 학습결과, 관리자/reconciliation 도구.

구조화 데이터에서도 Moneyverse를 실제 은행·대부업·투자상품 사업자로 표현하지 않는다.

## 19. 2026-09-13 참고자료

직접 채택:
1. **CFPB Regulation Z / Truth in Lending**, 현재본(2026-04-08 최종 수정). 실제 소비자신용의 명확한 고지 원칙을 참고하되 Moneyverse에 규제상품 지위를 주장하지 않는다.
2. **Investor.gov — Saving and Investing for Military Personnel**. gamified nudge가 과도한 거래를 유도할 수 있다는 투자자 교육 메시지를 가상금융 UX에도 적용한다.

참고:
3. **OWASP API Security Top 10 2023**. BOLA/속성단위 권한검증을 대출 API의 보안 기준으로 사용한다.
4. **Microsoft PlayFab Economy V2 Items and Inventory Overview**, 2026-02-24/25 갱신. 원자적 작업, transaction history, idempotency 패턴을 참고한다. PlayFab 도입 요구사항은 아니다.

## 20. 완료 조건

- game-only 고지가 주요 흐름에 존재
- 실제 금융상품 오인 표현 없음
- 금액 정수안전/서버권위
- 신규예치 이자 소급 불가
- 상환/정산 멱등성
- 기존 계약 조건 불변/버전 관리
- 신용한도 보호목적 문서화
- 회복 불가능한 연체루프 없음
- 원장 reconciliation 통과
- 객체권한 negative test 통과
- 접근성/반응형/오류상태 통과
- faucet/sink/transfer/hold 정확한 분류
- 영문/한국어 동기화
- 런타임은 개발브랜치 → 격리 Test → DB/API/backend/UI 검증 → Production

## 21. 실제 서비스 확인 상태

이번 회차의 외부 확인에서 `https://easy-scraping.com`은 HTTP 530을 반환했다. 따라서 **runtime verification unavailable**로 기록하며 현재 운영이 위 은행 상태/API/UI를 구현했다고 가정하지 않는다.

## 22. 다음 구현 우선순위

1. 자체 인증/Account Security Center P0 유지
2. 은행 authoritative read model + 상품버전 registry
3. 이자/상환 경계시각·중복요청 시뮬레이션 테스트
4. 학습 중심 상환 미리보기와 UI 상태 구현
5. Test 검증 이후 신용상품·가상채권 확장
