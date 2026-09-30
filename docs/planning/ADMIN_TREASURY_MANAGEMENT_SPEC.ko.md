# 관리자 국고·세금·재정 운영 상세 기획서

> 버전: v2026.10.01.492
> 상태: 구현 지향형 Living 제품 기획서
> 기준일: 2026-09-21
> 갱신일: 2026-10-01
> 영어 원문: [ADMIN_TREASURY_MANAGEMENT_SPEC.md](ADMIN_TREASURY_MANAGEMENT_SPEC.md)
> 선행 버전: v2026.09.21.323
> 적용 성격: 기획/문서 전용. 본 개정은 런타임·DB·API·Test·Production 변경을 주장하지 않는다.

## 1. 목적

국고를 **세금·수수료 수입 -> 국고 유입 -> 보호준비금 -> 자동 재순환 예산 -> 눈에 보이는 유저/공공 프로그램 -> 대사·감사 -> 경제·참여도 피드백**까지 연결되는 서버 권위 재정 시스템으로 정의한다.

국고는 일반 회원 지갑도 아니고 hard sink도 아니다. 로그인할 수 없는 시스템 계정을 사용하며 모든 WLD 이동은 Economy Core/append-only 원장 계약을 통과한다. 국고로 걷은 세금은 별도 소각 정책으로 실제 통화를 제거하기 전까지 WLD 공급량에 포함한다.

v488은 빠져 있던 핵심 불변조건을 추가한다. **건전한 잉여 국고를 목적 없이 계속 쌓아두지 않는다.** 준비금·대사·데이터 신선도·무결성 게이트가 정상일 때 유휴 잉여금 일부를 자동으로 제한된 예산에 편성하고, 임의 현금성 뿌리기가 아니라 유저가 할 일을 늘리는 활동으로 순환한다.

## 2. 재정·재미 설계 원칙

1. 국고와 소각을 구분한다. 세금의 국고 귀속과 hard sink 회계는 별도다.
2. 세금은 조절수단이지 목표나 일반 플레이 벌칙이 아니다.
3. 기본세율은 낮고 변경은 느리다. 런칭 수치는 replay/Test 증거 전까지 가설이다.
4. 온보딩, 기본 작업/퀘스트/출석 보상, 환불·복구 원금은 과세하지 않는다.
5. 예산 편성은 WLD를 새로 만들지 않고 기존 국고 WLD를 예약·재분배한다.
6. 건전한 잉여금은 **할 거리**를 만든다: 공공 프로젝트, 검증 계약, 시즌 활동, 신규·복귀 활성화, 제한형 안정화.
7. 많이 세금을 냈다는 이유로 경쟁력·순위·운영우선권·시장정보 우위를 주지 않는다.
8. 세금재원 참여 보상은 납세액 비례가 아니라 검증된 활동과 폭넓은 참여를 기준으로 한다.
9. 대사·준비금·무결성 실패 시 자동 세율 변경과 재량 자동지출을 fail-closed 한다.
10. 모든 유저 대상 세금은 결제/정산 전후에 예측 가능하고 영수증과 정책버전이 보인다.
11. 휴면잔액세, 징벌적 부유세, 임의 보유상한은 금지한다.
12. 세금재원 복권·잭팟·베팅은 금지하고 국고 엔터테인먼트 보상은 결정론적 과제/숙련 기반으로 한다.

## 3. 세금·수수료 포트폴리오

아래 값은 모두 **초기 기획 기본값**이며 런타임 사실이 아니다. 별도 권위가 변경하지 않는 한 절대 정책범위는 0~10%다.

| 코드 | 세금/수수료 | 과세표준·시점 | 초기값 | 허용범위 | 국고귀속 | 유저 경험 규칙 |
|---|---|---|---:|---:|---:|---|
| TAX_TRANSFER | 일반 송금세 | 정산된 P2P 원금 | 0% | 0~2% | 100% | 기본은 사회적 송금 무마찰 |
| TAX_MARKET_SALE | 장터 판매세 | 판매자 총 체결액 | 2% | 0~5% | 100% | 주문·영수증에 사전 표시 |
| FEE_MARKET_LIST | 등록/브로커 수수료 | 비즉시 주문 등록금액 | 0.5% | 0~1.5% | 100% | 초보 등록 일부 면제 가능, 스팸 억제 |
| FEE_MARKET_REPRICE | 상향 재가격 수수료 | 증가한 주문금액 차액 | 0.10% | 0~0.5% | 100% | 정책상 무료 정정창 제공, 하향가격은 원칙적으로 추가부담 없음 |
| TAX_STOCK_SELL | 가상주식 매도세 | 체결 매도금액 | 1% | 0~3% | 100% | watchlist/미체결 주문은 과세 안 함 |
| TAX_BUSINESS_PROFIT | 사업 이익세 | 인정비용 차감 후 양의 이익 | 3% | 0~8% | 100% | 손실에는 과세 안 함 |
| TAX_BUSINESS_SURPLUS | 대형 초과이익 추가세 | 정책 임계치 초과 양의 이익 | 0% | 0~2% | 100% | 기본 OFF, 집중도 근거 있을 때만 후보 |
| TAX_B2B | B2B 정산세 | 실제 정산대금 | 1% | 0~3% | 100% | 한 정산 이벤트에 1회 |
| TAX_SHOP_STANDARD | 일반 상점 소비세 | 지정 과세 SKU | 1% | 0~3% | 100% | 초보/핵심 진행 SKU 면제 가능 |
| TAX_LUXURY | 고급·명예 소비세 | prestige SKU | 3% | 0~8% | 100% | 고자산 주요 과세 lane |
| TAX_PROPERTY_STAMP | 공간/부동산형 업그레이드 인지세 | 고급 방·오피스·랜드마크 업그레이드 | 2% | 0~5% | 100% | starter 공간에는 적용 금지 |
| FEE_BUSINESS_LICENSE | 사업 확장/고급 라이선스 수수료 | 선택형 확장·고급 license | 정책금액 | 0~3% 상당 | 100% | 기본 사업 이용을 반복 수수료로 막지 않음 |
| TAX_CITY_ADMIN | 클럽/도시 행정 부담금 | 지정 비환급 프로젝트/행정금 | 1% | 0~3% | 100% | 사용처·목적을 공개 |
| TAX_SEASON_TEMP | 시즌 한시 luxury levy | 명시적 이벤트/명예 거래 | 0% | 0~1% | 100% | 기본 OFF, 시즌 종료 시 자동 만료 |
| TAX_CASINO | 카지노/확률형 흐름 | 별도 카지노 계약 | 0% | 0% 고정 | 0% | BLOCK된 확률형을 세금으로 정당화 금지 |
| TAX_REWARD | 작업/출석/퀘스트 보상 | 보상액 | 0% | 0% 고정 | 0% | 비과세 유지 |
| TAX_REFUND | 환불/reversal 원금 | 반환 원금 | 0% | 0% 고정 | 0% | 비과세 유지 |

### 3.1 소액·초보 보호

- 매우 작은 거래가 nuisance tax가 되지 않도록 최소 과세표준을 정책값으로 둘 수 있다.
- 신규/저잔액 코호트는 제한된 등록, starter 공간, 사업 온보딩 수수료 면제를 받을 수 있다. 숨은 개인별 세율은 금지한다.
- 숙련/평판 혜택은 지정된 **서비스·등록 수수료**만 공개된 하한까지 낮출 수 있고 일반 핵심세를 없애지 않는다. 현금결제로 구매할 수 없다.
- 자산·가입기간 코호트별 실효부담을 측정하여 낮은 명목세율이 잦은 거래 때문에 역진적으로 작동하지 않는지 본다.

### 3.2 목적배정과 허위 추적 금지

정책은 luxury/prestige 세입 일부를 CITY_COMMUNITY 또는 SEASON_EVENT 같은 프로그램군에 목적배정할 수 있다. 영수증은 다음을 구분한다.
- 실제 거래에서 걷힌 세금;
- 국고 도착 계정;
- 정책상 배분 가중치;
- 이후 실제 프로그램 지출.

풀링 회계인데 “내가 낸 정확한 100 WLD가 특정 사람 보상으로 갔다”처럼 허위 1:1 추적을 표시하지 않는다.

## 4. 면세

기본 면세는 온보딩 보상, 기본 작업·퀘스트·출석 보상, 장애보상, 오류복구·환불, 주식거래정지 원가정산, 본인 계정 내부 하위지갑 이동, reversal/refund 원금, starter 공간 권리, 정책상 필수접근 수수료 면제다.

## 5. 세금 계산·정산

정수/basis-point 연산만 사용한다.

\`tax = floor(taxable_base * rate_bps / 10_000)\`

영수증은 tax code, 과세표준, 세율, 세금액, 세후액, rounding remainder, 면세/면제사유, 정책버전, taxable event ID, 원장 transaction ID를 기록한다.

- stable taxable event ID로 중복징수를 막는다.
- 복수 세금/수수료 중첩 시 순서와 최대 실효부담을 서버정책이 정한다.
- 미체결/취소 주문에는 거래 성립세가 없고, 사전 고지된 비환급 listing fee만 남을 수 있다.
- 활성 정책은 \`effective_at\` 이후 거래에만 적용한다.
- 환불 시 refundable로 정의된 세금/수수료만 정확히 reversal 한다.
- 고마찰 액션 commit 전 gross-to-net preview를 제공한다.

## 6. 국고 잔액 상태

총액, committed, available, protected reserve, stability buffer, pending inflow/outflow, 1d/7d/30d 세입·지출, 순흐름, reserve coverage days, recyclable surplus, 가장 오래된 eligible surplus age, 프로그램 정산 backlog를 표시한다.

\`available = total - committed - protected_reserve - pending_outflow\`

\`recyclable_surplus = max(0, available - stability_buffer)\`

초기 보호준비금 목표는 최근 필수지출 14일치다. stability buffer는 Test replay 전 가설로 추가 7일치 재량지출 baseline을 둔다.

- **EMERGENCY**: 필수커버리지 3일 미만. 필수 환불/복구만 계속.
- **CRITICAL**: 3~7일. 신규 재량 commitment 금지.
- **WARNING**: 7~14일. 기존 commitment만 정산하고 자동 신규 프로그램을 강하게 제한.
- **HEALTHY**: 14일 이상 + 대사 정상 + telemetry 신선. 자동 순환 가능.
- **SURPLUS**: 28일 이상 커버리지 + 7일 연속 정책 임계치 초과 잉여. cap 범위에서 순환목표 상향.

## 7. Treasury Recycling Engine

세금을 걷었는데 국고만 커지는 문제를 방지하고, 세입을 실제 유저 활동으로 보이게 되돌리는 엔진이다.

### 7.1 자동집행 게이트

자동 재량 예산 commitment는 모두 만족해야 한다.
- HEALTHY 또는 SURPLUS;
- 최신 경량대사와 일일 전체대사가 허용오차 이내;
- 경제 무결성 incident 없음;
- telemetry freshness/최소표본 충족;
- payout을 막는 release/maintenance freeze 없음;
- 해당 프로그램 fraud/abuse 제어 정상.

하나라도 실패하면 추천만 생성하고 돈을 commitment 하지 않는다.

### 7.2 초기 자동 commitment 범위

기획 기본값:
- HEALTHY: 주간 자동 commitment는 **recyclable surplus의 최대 25%**, 동시에 최근 28일 세금/수수료 수입의 **20% 이하**.
- SURPLUS: **recyclable surplus 최대 40%**, 최근 28일 세입의 **30% 이하**.
- 각 프로그램 내부에 일/주 cap을 추가한다.
- commitment 후 protected reserve + stability buffer 아래로 내려갈 수 없다.
- 쓰이지 않은 예산은 최대 4주만 rollover하고 이후 uncommitted 국고로 반환하면서 프로그램 품질검토를 발생시킨다.

이 값은 시뮬레이션 목표이며 Production 확정값이 아니다.

### 7.3 초기 자동 배분

| 프로그램 | 비중 | 목적 |
|---|---:|---|
| CITY_COMMUNITY_MATCH | 25% | 유저의 도시/커뮤니티 기여를 국고가 매칭 |
| PUBLIC_CONTRACTS | 20% | 검증된 납품·제작·물류·서비스 미션 |
| SEASON_EVENT_PUBLIC_GOODS | 15% | 결정론적 시즌/커뮤니티 활동 해금 |
| NEW_RETURN_SUPPORT | 15% | 신규·복귀 미션, fee waiver, catch-up |
| BUSINESS_MARKET_STABILIZATION | 10% | 실측 활동·유동성 약화 시 한시 지원 |
| INFRASTRUCTURE_FEE_RELIEF | 10% | 이동·서비스·listing 등 공공수수료 한시 완화 |
| CIVIC_WEEKLY_CHALLENGE | 5% | 여러 시스템을 잇는 협동 주간 도전 |

필수환불·incident·관리자 correction은 이 재량 pool 밖에서 우선 처리한다.

## 8. 세금으로 만드는 재미·참여 시스템

### 8.1 Treasury Today 미터

홈/경제 화면에서 다음을 보여줄 수 있다.
- 오늘/이번주 세금·수수료 수입;
- 보호준비금 상태;
- 공공 프로그램으로 되돌린 금액;
- 현재 도시/커뮤니티 프로젝트;
- 다음 unlock threshold;
- 현재 국고지원 미션.

목적은 높은 세금을 자랑하는 것이 아니라 돈의 흐름을 이해시키는 것이다.

### 8.2 커뮤니티 매칭 프로젝트

유저가 승인된 도시/커뮤니티 프로젝트에 WLD·아이템·행동을 기여하면 국고가 다음 한도 안에서 match한다.
- 유저별 cap;
- 프로젝트 cap;
- 일/주 프로그램 cap;
- alt/연관계정 악용제한.

완료 시 P2W가 아닌 도시 외형 변화, 공공수수료 할인, 커뮤니티 공간 장식, 공개 이벤트, 박물관/아카이브 전시, 프로필 수집품, 협동 미션체인 등을 열 수 있다.

### 8.3 국고 공공계약

국고가 다음과 같은 제한형 계약을 게시할 수 있다.
- 지정 제작품 납품;
- 물류 루트 완료;
- 시설 복구/유지보수;
- 직업군 다양화 작업;
- 비핵심 저재고 자원 공급;
- 승인된 커뮤니티 콘텐츠 제작.

계약마다 수량, 기준가격 범위, 마감, 검증규칙, 참여자 cap, payout cap, 멱등정산을 가진다. 관리자가 임의가격을 입력해 국고가 사들이는 구조는 금지한다.

### 8.4 시즌 공공사업

시즌마다 공개 예산게이지를 보여주고 검증된 기여·참여 milestone 달성 시 콘텐츠 단계가 열린다. 국고는 결정론적 과제 보상이나 단계별 공공서비스 비용 인하를 지원할 수 있다.

세금영수증 복권, 유료 spin, betting, 확률형 국고지급은 금지한다.

### 8.5 신규·복귀 활성화

국고재원으로:
- 첫주 여러 시스템 체험 미션 보너스;
- 제한형 listing/service fee 면제;
- 2개 이상 시스템을 유도하는 catch-up quest;
- 양도불가 starter utility/cosmetic;
- 첫 커뮤니티 프로젝트 기여 matching을 지원한다.

대량 직접 WLD 지급은 발행압력·다계정 악용 때문에 최후수단으로 둔다.

### 8.6 인프라 할인 이벤트

국고가 건강할 때 이동·listing·복구·커뮤니티 서비스 같은 공공수수료를 일시적으로 낮출 수 있다. 감면액도 재정 프로그램 비용으로 기록하여 혜택이 어디서 나왔는지 보여준다.

### 8.7 시장·아이템 안정화 드라이브

아이템 과잉공급이 실측되면 승인된 buyback/salvage를 가동할 수 있다.
- allowlist 아이템만;
- 조작되지 않은 과거가격 기반 bounded reference price;
- 계정별/전체 cap;
- 매입 아이템은 sink 계약에 따라 삭제/변환;
- 지급 WLD는 국고에서 나오므로 **아이템 sink + WLD 재순환**이며 WLD hard sink로 계산하지 않는다.

## 9. P2W 없는 세금 연계 성장

- Accounting/Commerce 숙련은 지정 listing/broker/admin 서비스 fee만 공개된 floor까지 낮출 수 있다.
- 할인은 플레이 숙련/평판으로 얻고 실결제로 살 수 없다.
- TAX_MARKET_SALE, TAX_LUXURY 같은 핵심세가 고레벨이라는 이유로 사라지지 않는다.
- 커뮤니티 참여는 납세액이 아니라 검증된 프로젝트 참여 **폭**에 따라 title, badge, profile frame, civic archive entry 등을 줄 수 있다.
- “최고 납세자 랭킹” 대신 “도운 프로젝트 수”, “참여한 공공 프로그램”을 시즌기록으로 보여준다.

## 10. 참여도 최적화 지표

국고지출은 raw spend/click이 아니라 다음 multi-objective를 본다.

1. 국고프로그램 주간 고유 참여자;
2. 로그인 후 첫 유의미 액션까지 시간;
3. 프로그램 완료율;
4. 대상 신규·복귀 코호트 D1/D7 복귀율;
5. WAU당 참여한 서로 다른 시스템 수;
6. 커뮤니티 프로젝트 기여자 수와 집중도;
7. 다른 프로그램으로 이어지는 반복참여;
8. payout 상위 1%/10% 집중도;
9. alt/wash/악용률;
10. WLD velocity·구매력·인플레이션 guardrail;
11. 문의/불만률;
12. 준비금·대사 건전성.

반복 저품질 클릭, payout 집중, 가격왜곡, 악용은 늘고 폭넓은 검증참여가 늘지 않으면 해당 프로그램을 pause한다.

## 11. 악용 방지

- 자기송금 루프·연관계정 순환거래는 프로그램 점수/보상에서 제외;
- 취소/reversal 거래는 프로그램 credit 제외;
- matching에 actor/account/device/risk 기반 제한;
- 동일 반복행동은 diminishing/cap;
- 공공계약은 독립 deliverable 검증;
- 시장프로그램은 wash-price print와 thin-market outlier 제외;
- claim은 stable program/actor/idempotency identity 사용;
- 의심 claim은 과거원장을 수정하지 않고 review 상태로 처리.

## 12. 지출 우선순위

1. 환불·복구;
2. incident response와 필수 correction;
3. 이미 commitment 된 국고재원 보상;
4. 신규·복귀 보호;
5. 커뮤니티/도시 matching·공공계약;
6. 경제·사업·시장 안정화;
7. 시즌/이벤트 공공재·fee relief;
8. 감사된 관리자 재량 correction.

특정 계정 임의부자 만들기, 투기손실 보전, 카지노 손실보전, 감사없는 대량지급, 과거원장 삭제는 금지한다.

## 13. 예산 envelope

- ESSENTIAL_REFUND
- INCIDENT_RESPONSE
- REWARD_POOL
- NEW_USER_SUPPORT
- RETURNING_USER_SUPPORT
- CITY_COMMUNITY
- PUBLIC_CONTRACTS
- SEASON_EVENT
- INFRASTRUCTURE_FEE_RELIEF
- BUSINESS_STABILIZATION
- MARKET_STABILIZATION
- ITEM_BUYBACK_SALVAGE
- CIVIC_WEEKLY_CHALLENGE
- ADMIN_CORRECTION

각 예산은 stable ID, 기간, allocation, committed, settled, remaining, 우선순위, 자동화 가능여부, policy/config version, actor/source, reason, 필요 시 experiment cohort, 불변 변경이력을 가진다.

## 14. 자동 재정 조절

faucet/sink, 국고흐름, velocity, 장터/주식 turnover, 사업이익률, 자산집중, 코호트 구매력, 준비금, 대사오차, 참여품질을 함께 본다.

세율 자동변경은 지출배분보다 보수적이다.
- 1회 +/-0.5%p 이내;
- 주 1회 이하;
- 최소 7일 유지;
- 절대 0~10% 범위;
- 비활성 tax class를 자동으로 새로 켜지 않음;
- stale data, 표본부족, reserve stress, reconciliation fail이면 자동변경 금지.

자동지출은 승인된 프로그램 template 사이에서만 cap 내 재배분할 수 있다. 새 세금·sink·보상종류·경제권리를 런타임에 발명할 수 없다.

## 15. 관리자 UI

관리자 -> 경제 -> 국고:
1. Overview
2. Revenue
3. Taxes & Fees
4. Recycling Engine
5. Programs & Public Contracts
6. Expenditure
7. Budgets
8. Corrections
9. Reconciliation
10. Policy & Alerts
11. Audit

세금 화면은 현행세율, 허용범위, 다음변경 가능시각, actor/reason, 24h/7d 수입, 코호트별 실효부담, 영향추정, rollback version을 보여준다.

Recycling 화면은 reserve state, recyclable surplus, auto-commit cap, 현행 weight, 프로그램별 고유참여자·완료율·payout 집중도·abuse flag·남은예산·pause/rollback을 보여준다.

## 16. 사용자 UI·영수증

과세거래는 원금, 세금/fee 이름, 세율, 금액, net settlement, 적용 시 면세/면제사유, policy version, transaction ID를 표시한다.

사용자 Treasury 페이지는 민감 운영정보를 제외하고:
- 현재 준비금 상태;
- 세입 대비 프로그램 지출;
- 활성 공공 프로젝트/계약 pool;
- “어디에 쓰이나” 배분비중;
- 과거 프로젝트/프로그램;
- 본인의 검증된 프로젝트 참여를 보여줄 수 있다.

숨은 세금은 금지한다.

## 17. 원장 카테고리

최소:
- TAX_MARKETPLACE
- FEE_MARKET_LIST
- FEE_MARKET_REPRICE
- TAX_STOCK_SELL
- TAX_BUSINESS_PROFIT
- TAX_BUSINESS_SURPLUS
- TAX_B2B
- TAX_CONSUMPTION
- TAX_LUXURY
- TAX_PROPERTY_STAMP
- TAX_CITY_ADMIN
- TREASURY_FEE
- TREASURY_PROGRAM_COMMIT
- TREASURY_REWARD
- TREASURY_MATCH
- TREASURY_CONTRACT
- TREASURY_SUBSIDY
- TREASURY_FEE_RELIEF
- TREASURY_ITEM_BUYBACK
- TREASURY_GRANT
- TREASURY_REFUND
- TREASURY_INCIDENT
- ADMIN_CORRECTION_IN
- ADMIN_CORRECTION_OUT
- REVERSAL

국고와 burn은 서로 다른 double-entry 경로를 사용한다.

## 18. API 방향

유저 read:
- treasury public summary;
- public program/project/contract;
- 본인 program participation/claim;
- tax/fee quote 상세.

관리자 read:
- treasury summary, transaction, revenue, expenditure, tax/fee, recycling state, program, budget, reconciliation, audit.

mutation:
- tax/fee preview·commit;
- recycling policy preview·commit;
- program create/pause/close;
- 안전규칙 내 public contract publish/cancel;
- budget create/update;
- actor-scoped DB function을 통한 claim/fulfillment settlement;
- correction preview/commit;
- reconciliation run.

모든 mutation은 서버인가, 브라우저 적용 시 CSRF, request hash, idempotency key, DB-side actor 검증, 불변 audit를 요구한다.

## 19. 데이터 모델 방향

권장 테이블:
- treasury_accounts
- treasury_transactions
- treasury_tax_policies
- treasury_tax_policy_versions
- treasury_recycling_policies
- treasury_budgets
- treasury_budget_commitments
- treasury_programs
- treasury_program_allocations
- treasury_program_claims
- treasury_public_contracts
- treasury_matching_contributions
- treasury_reconciliations
- treasury_adjustments
- treasury_alerts

핵심제약은 amount > 0, rate_bps 0~1000, unique taxable-event/tax-code, unique program/actor/claim, unique actor/action/idempotency, settled transaction append-only, activated policy version immutable이다.

## 20. 대사

매시간 경량대사와 일 1회 전체대사를 계획한다. treasury balance, ledger aggregate, tax/fee source, budget commitment/settlement, program payout, matching, contract fulfillment, fee relief, buyback, refund/reversal을 교차검증한다.

차이는 파괴적 auto-fix를 하지 않고 증거를 남기며 영향받는 자동지출을 freeze하고 recommendation-only로 내릴 수 있다.

## 21. QA 수용기준

최소 검증:
- 세금 과세표준/시점·면세;
- basis-point rounding·minimum tax;
- 중복징수 방지;
- listing/reprice fee quote·취소의미;
- 동시정산·중복claim 방지;
- effective_at 경계;
- reserve state 전이;
- recyclable surplus/auto-commit 공식;
- commitment 후 reserve/stability buffer 침해 없음;
- program weight/cap;
- project matching 유저/글로벌 cap;
- public contract price band·fulfillment 검증;
- wash/연관계정 제외;
- payout concentration guardrail;
- program pause/rollback;
- reconciliation safe mode;
- 유저영수증/public budget 정확성;
- BOLA/IDOR·reauth·CSRF·idempotency;
- 320/360/390/768/1024/1440 반응형;
- BigInt-safe 표시;
- 런타임 승격 전 exact-SHA Test backend/API/DB 증거.

## 22. v488 채택 레퍼런스 근거

- EVE Online은 주문생성 broker fee와 seller sales tax를 분리하고 숙련/standing으로 일부 fee 부담을 낮춘다. Moneyverse는 구조분리와 학습가능 fee 아이디어만 채택하고 정확 세율은 복제하지 않는다.
- Old School RuneScape의 Grand Exchange tax/item-sink 개입과 관련 실증연구는 transaction tax와 item removal을 결합할 수 있지만 품목군별 가격효과가 다를 수 있음을 보여준다. 따라서 Moneyverse는 “세금 증가=건전”을 가정하지 않고 가격·거래량·대체수요를 함께 측정한다.
- New World는 territory tax를 upkeep·Town Project와 연결하여 걷힌 자원이 settlement 기능과 발전으로 보이는 구조를 사용했다.
- Guild Wars 2는 Trading Post listing/exchange fee를 명확히 표시하고 guild treasury 기여가 눈에 보이는 upgrade/mission 해금으로 이어진다. Moneyverse는 사전고지 fee와 pooled public-project 결과를 채택한다.

근거검토: [TREASURY_TAX_ENGAGEMENT_RESEARCH_REVIEW_v2026.10.01.492.ko.md](../findings/TREASURY_TAX_ENGAGEMENT_RESEARCH_REVIEW_v2026.10.01.492.ko.md).

## 23. 구현 순서

- **v2026.10.01.492-01** — tax/fee event, exemption, quote, receipt 계약.
- **-02** — treasury/recycling/program schema, DB actor boundary, append-only ledger path.
- **-03** — 원자적 tax/fee settlement + duplicate/concurrency test.
- **-04** — reserve state, recyclable surplus 계산, fail-closed Recycling Engine SHADOW.
- **-05** — community matching, public contract, program settlement + anti-abuse.
- **-06** — 유저 Treasury Today/public project UI + 관리자 Recycling/Programs control tower.
- **-07** — 참여도/경제 telemetry, 코호트 부담, payout concentration, experiment guardrail.
- **-08** — real-DB concurrency/reconciliation/security/responsive E2E + 경제 replay.
- **-09** — 최신 Living Project Plan/main 재확인, 동시작업 정합, exact candidate Test.
- **-10** — 증거 확보 후에만 merge -> exact merged SHA rebuild -> 무중단 Production 승격 -> smoke/reconciliation 검증.

## 24. 현재 구현상태

이번 개정은 **PLANNING/문서 전용**이다. 기존 원장·경제정책·관리자·analytics 기반을 재사용할 수 있지만 v488 확장 세금 포트폴리오, Treasury Recycling Engine, 공공 프로젝트, 공공계약, matching, fee relief, 사용자 Treasury 페이지, API, DB schema, Test/Production 동작이 이미 존재한다고 주장하지 않는다.
