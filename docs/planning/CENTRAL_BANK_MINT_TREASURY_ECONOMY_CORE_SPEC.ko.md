# Moneyverse 중앙은행·조폐국·중앙국고·경제코어 통합 상세 기획서

> 버전: v2026.10.04.523
> 상태: 권위 기획 / 구현 계약 (AUTHORITATIVE PLANNING)
> 기준일: 2026-10-04
> 원문: [CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md](CENTRAL_BANK_MINT_TREASURY_ECONOMY_CORE_SPEC.md)
> 상위 권위: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md)
> 런타임 주장: 없음. 본 회차는 기획/문서만 변경한다.

## 1. 확정 결정

기존에 일부 혼재되어 있던 경제 권한을 다음 4개 기관/계층으로 분리한다.

1. **Moneyverse 중앙은행(MCB)** — 통화정책 결정기관.
2. **Moneyverse 조폐국(MMB)** — 승인된 통화 발행·폐기만 실행하는 기관.
3. **중앙국고(CT)** — 세금·수수료·예산·공공지출을 관리하는 재정기관.
4. **Economy Core & Settlement Ledger(ECSL)** — 모든 거래·복식원장·대사·불변식을 집행하는 기술 권위.

사용자 화면에서는 연계된 공공기관처럼 보여도 코드, API, DB 권한, 원장, 감사에서는 반드시 분리한다.

핵심 불변식:

`총 WLD 통화량 변화 = 승인 조폐량 - 승인 폐기/소각량`

세금, 송금, 국고지출, 예산배정, 예금·출금, 장터/주식 거래, 국고 금고 간 이동은 **총통화량을 변경하지 않는다.**

## 2. 레퍼런스에서 가져온 설계 원칙

IMF 국고-중앙은행 현금관리 자료는 재정 현금관리와 통화정책을 서로 다른 책임으로 두고 제도적으로 조정하도록 설명한다. Treasury Single Account(TSA)는 정부 현금을 통합 관리하지만 국고 지출을 화폐발행으로 바꾸지 않는다. ECB와 미국 사례도 발행 권한과 실제 생산·조폐 기능이 분리될 수 있음을 보여준다.

Moneyverse에서는 이를 적용해 세금 재원 지급, 관리자 보정, 대출, 이벤트 보상, 실제 신규 WLD 발행이 모두 단순 `balance += x`로 처리되는 오류를 차단한다.

## 3. 기관별 권한

| 기관 | 소유 권한 | 할 수 있는 것 | 할 수 없는 것 |
|---|---|---|---|
| **중앙은행** | 통화정책 레지스트리, 발행 한도, 통화량 목표, 비상 통화정책 | 발행/폐기 한도 승인, 통화정책 결정, 조폐국 실행명령 | 세금 직접 지출, 유저 잔액 직접수정, raw DB balance update |
| **조폐국** | 발행/폐기 실행 큐, 발행·폐기 인증서 | 유효한 승인명령을 정확히 1회 실행 | 정책 결정, 수혜자 임의선정, 세금징수, 예산지출, 무승인 발행 |
| **중앙국고** | 세금·수수료, 재정 금고, 예산, 보조금·환급·공공지출 | 기존 WLD 징수·보관·예산배정·지출 | WLD 생성, 일반이체를 조폐로 위장, 소각을 단순 국고비용으로 처리 |
| **경제코어/결제원장** | 복식분개, 잔액 projection, idempotency, 대사, 통화량 집계 | 모든 이체 원자적 정산, 불변식 검사, 통화량 read model 생성 | 스스로 통화·재정 정책 결정 |
| **AI 경제 컨트롤러** | 진단, 시뮬레이션, 제한된 정책 제안 | 이상감지, 시나리오 분석, 허용된 저위험 파라미터 조정 | 직접 조폐/폐기, 국고지출, 헌법적 한도 변경, 인간 승인 우회 |

## 4. 중앙은행 계약

중앙은행은 다음을 관리한다.
- 총통화량 성장률, 순발행, 유통 건전성 목표 범위;
- `WORK_REWARD`, `QUEST_REWARD`, `EVENT_REWARD`, `INCIDENT_COMPENSATION`, 승인된 안정화 등 발행원별 발행 엔벨로프;
- 폐기/소각 정책 분류;
- 통화상태 텔레메트리와 통화보고서;
- 신규 발행 비상 동결;
- 정책 버전과 승인 계보.

필수 지표:
- `M_total`: 폐기되지 않은 전체 WLD;
- `M_circulating`: 활동 유저/사업체 사용가능 WLD;
- `M_treasury`: 중앙국고 보유 WLD;
- `M_bank_liquidity`: 은행/대출 풀의 사전재원 WLD;
- `M_locked`: escrow, pending, time-lock;
- `M_dormant`: 휴면계정 잔액;
- 발행원별 총 조폐량;
- 폐기원별 총 폐기량;
- 순발행;
- 통화유통속도 proxy;
- 충분한 시장깊이가 있는 가격지수;
- P50/P90/P95/P99 유동잔액;
- 상위 1%/10% 집중도;
- 국고 흐름은 통화 생성량과 분리 표시.

단일 faucet/sink 비율만으로 통화정책을 자동 승인하지 않는다.

### 4.1 통화정책 명령서

모든 발행/폐기 권한은 버전된 `Monetary Policy Order`로 존재해야 한다.
- `monetary_order_id`;
- policy version/hash;
- `MINT | RETIRE | FREEZE | UNFREEZE`;
- 최대 금액;
- 허용 source/reason;
- 유효기간;
- 승인자/quorum;
- 시뮬레이션·증거 snapshot;
- idempotency 범위;
- rollback/compensation 규칙;
- 권한 증거.

승인 한도는 전액을 반드시 발행하라는 의미가 아니다.

## 5. 조폐국 계약

조폐국은 정책기관이 아니라 **고무결성 실행기관**이다.

### 5.1 신규 발행 조건

1. 유효한 중앙은행 명령 존재;
2. 명령 유효기간·잔여한도 충족;
3. 실제 보상/비즈니스 이벤트가 유효하고 idempotent;
4. Economy Core 대사 정상;
5. 발행 동결 없음;
6. 금액·발행원·수령 대상이 명령과 일치;
7. 원장분개와 발행 인증서가 하나의 원자적 결과로 commit.

완료 시 `mint_certificate_id`를 남기고 누적발행량을 정확히 한 번만 증가시킨다.

### 5.2 영구 폐기/Hard Sink

통화량이 줄어들려면:
- 사용가능 WLD 차감;
- canonical retirement 분개;
- `retirement_certificate_id` 발행;
- `M_total` 동일 금액 감소
가 모두 완료되어야 한다.

WLD를 국고 금고나 `DEAD`라는 이름의 사용가능 계정으로 옮기는 것만으로는 소각으로 인정하지 않는다.

### 5.3 조폐국 금지행위

세율, 복지수혜자, 이벤트 보상액, 대출금리, 긴급 유동성 정책을 결정할 수 없다. public/mobile mint API를 제공하지 않으며 승인명령 없는 관리자 임의금액 발행을 금지한다.

## 6. 중앙국고 계약

### 6.1 TSA형 통합 재정금고

중앙국고는 하나의 통합 재정현금 권위를 갖고 목적별 sub-ledger/envelope를 사용한다. DB 안전을 위해 금고를 나눌 수 있지만 전체 국고 포지션은 통합해서 볼 수 있어야 한다.

논리 뷰:
- `TREASURY_MAIN`
- `TREASURY_WELFARE`
- `TREASURY_INFRA`
- `TREASURY_EMERGENCY`
- `TREASURY_COMMITTED`
- `TREASURY_AVAILABLE`

목적별 원장은 회계·예산 통제이며 별도 통화량을 의미하지 않는다.

### 6.2 세입

장터/주식/사업/소비세, 각종 행정수수료, 공공서비스 수수료, 승인된 국채 관련 수입 등은 **기존 WLD의 이동**이다.

### 6.3 지출

환급·사고복구, 시민배당, 복지·신규지원, 국고재원 시장안정화, 공공사업, 보조금, 시즌/이벤트 예산, 감사된 보정 등이다.

국고지출은 반드시:
- `국고 이전잔액 - 국고 이후잔액 = 실제 정산 지출액`
- `총통화량 변화 = 0`
을 만족한다.

같은 비즈니스 프로세스 안에 별도 중앙은행 승인 조폐/폐기가 있다면 그 leg만 통화량을 바꾼다.

### 6.4 준비금 용어

기존 `VAULT_RESERVE`, 30% 보호준비금 등은 **재정 유동성 준비금**이다. 중앙은행 발행준비금이나 신규 WLD 발행 담보로 해석하지 않는다.

## 7. 국채·은행대출

### 7.1 국채

국채는 재정부채이며 새 WLD가 아니다.
- 매입: 투자자 -> 국고;
- 이자/만기: 국고 -> 투자자;
- 총통화량 변화 0.

국고가 만기자금이 부족하면 정의된 재정 스트레스/채무조정 절차 또는 별도 승인 통화개입을 사용한다. 자동 조폐로 숨기지 않는다.

### 7.2 가상은행 대출

초기 Moneyverse는 **기존 WLD로 사전충당된 대출 풀**만 사용한다.
- 대출: 은행 유동성 풀 -> 차주;
- 상환: 차주 -> 은행 풀;
- 이자: 기존 WLD 재분배.

현실 상업은행처럼 대출과 동시에 예금화폐를 만드는 모델은 초기에는 도입하지 않는다. 향후 도입하려면 준비금·자본·부실·광의통화·resolution을 포함한 별도 승인이 필요하다.

## 8. 이벤트별 정식 분류

| 사건 | 출발 | 도착 | 총통화량 | 권위 |
|---|---|---|---:|---|
| 신규발행 재원 직업/퀘스트 보상 | 조폐 발행계정 | 유저 | + | 중앙은행 + 조폐국 |
| 유저 송금 | 유저 A | 유저 B | 0 | Economy Core |
| 시장 세금 | 유저/사업체 | 국고 | 0 | 국고 |
| 세수 시민배당 | 국고 | 유저 | 0 | 국고 |
| 공공사업 | 국고 | 프로젝트/에스크로 | 0 | 국고 |
| Hard sink | 유저/시스템풀 | 폐기 | - | 폐기정책 + 조폐국 |
| 은행대출(초기) | 사전재원 은행풀 | 차주 | 0 | 은행 |
| 대출상환 | 차주 | 은행풀 | 0 | 은행 |
| 국채매입 | 투자자 | 국고 | 0 | 국고/채무정책 |
| 비상 통화주입 | 조폐 발행계정 | 안정화풀 | + | 고위험 중앙은행 명령 |
| 관리자 임의 balance edit | 없음 | 없음 | 금지 | 차단 |

## 9. 통화량·국고 독립 대사식

`M_total = M_players + M_businesses + M_treasury + M_bank_liquidity + M_locked + M_other_valid_system_balances`

`M_total(t) = M_total(t-1) + Minted(t) - Retired(t)`

`TreasuryBalance(t) = TreasuryBalance(t-1) + FiscalInflows(t) - FiscalOutflows(t)`

국고 적자/흑자를 `M_total` 변경으로 자동 보정하지 않는다.

모든 대사에는 ledger high-water mark, 정책 버전, mint/retire certificate 범위, 국고합계, 계정 projection 합계, 오차, repair 상태를 남긴다. 설명되지 않는 통화량 오차는 P0이며 자동발행과 대규모 자동 재정지출을 즉시 중지한다.

## 10. 권한/API 경계

서버 전용 명령 예시:
- `centralBank.previewPolicyOrder`
- `centralBank.proposePolicyOrder`
- `centralBank.approvePolicyOrder`
- `centralBank.freezeIssuance`
- `mint.executeAuthorizedOrder`
- `mint.retireAuthorizedAmount`
- `treasury.previewBudget`
- `treasury.commitBudget`
- `treasury.executeDisbursement`
- `economy.reconcileSupply`
- `economy.reconcileTreasury`

Public/mobile에는 조폐권을 제공하지 않는다. 관리자 UI도 raw balance mutation이 아니라 정책 API만 호출한다. 고위험 작업은 step-up 인증, 설정된 dual/quorum 승인, idempotency, 사유, request hash, 불변 감사를 요구한다.

## 11. AI 경제컨트롤러 경계

AI는 이상감지·시나리오·발행한도 제안·재정정책 제안은 가능하다. 기존 `AI_ECONOMY_CONTROLLER_SPEC`의 저위험 allowlist 안에서만 bounded auto를 사용할 수 있다.

AI는 다음을 할 수 없다.
- 통화정책 명령 생성/최종승인;
- 조폐국 직접 실행;
- 국고잔액을 발행허가로 해석;
- 국고 부족을 자동조폐로 보전;
- 통화량 불변식 변경;
- 감사증거 삭제/수정.

초기 `BOUNDED_AUTO`에서 직접 WLD 발행·폐기와 헌법적 재정준비금 변경은 제외한다.

## 12. 관리자·사용자 투명성

### `/admin/economy/monetary`
총/유통/휴면/잠금/국고 WLD, 총발행·총폐기·순발행, 활성 정책명령·잔여한도, 발행/폐기 인증서, 인플레이션·velocity·집중도, 대사상태, 발행동결을 표시한다.

### `/admin/treasury`
재정정보만 표시한다: 통합 국고현금, 재정준비금, 세금·수수료, 예산 commitment, 실제지출, 재정 runway, 국고대사.

### 공개 경제 투명성
보안상 안전한 범위에서 총통화량, 30일 발행/폐기, 국고잔액, 30일 세입/공공지출, 정책버전을 공개할 수 있다. 항상 “가상 게임 경제”임을 명시한다.

## 13. 기존 시스템 마이그레이션

1. 기존 국고 거래이력은 수정하지 않는다.
2. 기존 국고 준비금은 재정준비금 의미로 매핑한다.
3. 모든 balance 증가경로를 기존통화 이체 / 국고재원 / 실제발행 / 보정·역분개로 전수분류한다.
4. 모호한 `INJECTION`을 `MONETARY_MINT`, `TREASURY_TRANSFER`, `REVERSAL`, `CORRECTION`으로 분해한다.
5. 모든 “burn” 경로가 spendable system account가 아니라 canonical retirement로 끝나는지 증명한다.
6. 과거 tx type은 감사호환을 위해 읽기 alias로 유지하고 과거 원장을 다시 쓰지 않는다.
7. exact-SHA Test 대사 성공 전까지 호환 view를 유지한다.

## 14. QA·승격 게이트

P0 조건:
- 모든 WLD 증가 경로 분류;
- 실제 발행마다 유효한 통화정책 명령 1개 + mint certificate 1개;
- 모든 영구폐기마다 retirement certificate;
- 세금/국고이체가 총통화량 변화 0 증명;
- replay/concurrency에서 경제결과 exactly-once;
- 국고대사와 통화량대사가 각각 0 오차;
- 무권한 조폐호출 fail-closed;
- AI에서 조폐 실행경로 차단;
- 모호한 legacy injection endpoint 제거 또는 fail-closed;
- 재시작/retry로 중복발행·중복지급 없음;
- exact candidate SHA, DB schema, 정책버전, 증거번들 기록.

Production은 격리 Test에서 backend/API/DB 검증 후 기존 무중단 승격절차를 따른다. 본 v523 회차 자체는 배포하지 않는다.

## 15. 실제 레퍼런스

본 v523에서 검토한 1차·공식 자료:

1. IMF — *Government Cash Management: Relationship between the Treasury and the Central Bank*  
   https://www.imf.org/en/Publications/TNM/Issues/2016/12/31/Government-Cash-Management-Relationship-between-the-Treasury-and-the-Central-Bank-40111
2. IMF — *Treasury Single Account: Concept, Design and Implementation Issues*  
   https://www.imf.org/en/Publications/WP/Issues/2016/12/31/Treasury-Single-Account-Concept-Design-and-Implementation-Issues-23927
3. ECB — *Issuance and circulation*  
   https://www.ecb.europa.eu/euro/cash_strategy/issuance/html/index.en.html
4. ECB — *Banknotes and coins production*  
   https://www.ecb.europa.eu/stats/policy_and_exchange_rates/banknotes+coins/production/html/index.en.html
5. 미국 Federal Reserve — *2026 Federal Reserve Note Print Order*  
   https://www.federalreserve.gov/paymentsystems/2026_currency_print_order.htm
6. 미국 Federal Reserve — *Currency and Coin Services*  
   https://www.federalreserve.gov/paymentsystems/coin_about.htm
7. US Mint — *Coin Production*  
   https://www.usmint.gov/learn/production-process/coin-production
8. 한국은행 — 통화 발행·유통 자료  
   https://www.bok.or.kr/eng/main/contents.do?menuNo=400119
9. Bank of England — *Money creation in the modern economy*  
   https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy
10. EVE Online Economic Council — *Monthly Economic Report, May 2026*  
    https://www.eveonline.com/news/view/monthly-economic-report-may-2026
11. EVE Online Economic Council — *Monthly Economic Report, July 2026*  
    https://www.eveonline.com/news/view/monthly-economic-report-july-2026
12. EVE Online Economic Council — *Monthly Economic Report, August 2026*  
    https://www.eveonline.com/news/view/monthly-economic-report-august-2026

이 자료들은 구조·관측 설계의 근거이며 Moneyverse 자체 replay, 텔레메트리, Test 검증을 대체하지 않는다.
