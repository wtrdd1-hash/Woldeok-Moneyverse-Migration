# 머니버스 통합 거시경제 조사 검토 — v2026.10.01.496

> 날짜: 2026-10-01
> 상태: RESEARCH / DESIGN INPUT — 런타임 권위 아님
> 기준: `origin/main@2bad12eb290cba6b98d08604cd6b1274243e1a4f`
> 상위 설계: v2026.10.01.495 단일국고/사회 세금 재순환
> 영문 원문: [MONEYVERSE_UNIFIED_MACROECONOMY_RESEARCH_REVIEW_v2026.10.01.496.md](MONEYVERSE_UNIFIED_MACROECONOMY_RESEARCH_REVIEW_v2026.10.01.496.md)

## 1. 조사 목적

이번 검토의 질문은 하나다. **머니버스를 서로 독립된 faucet·sink·세금·은행·시장·보상 기능 모음이 아니라 하나의 일관된 가상경제처럼 작동시키려면 무엇을 바꿔야 하는가?**

목표는 현실 국가경제를 그대로 복제하는 것이 아니다. WLD/WDX는 계속 현금화되지 않는 게임 전용 가상자산이다. 다만 회계 일관성, 감사 가능성, 정책 전달경로, 시장 건전성, 게임성을 개선하는 범위에서 현실의 거시회계·재정·통화·금융·시장 원칙을 가져온다.

이번 검토는 다음을 결합했다.
- 기존 31,289개 후보 머니버스 경제 레퍼런스 코퍼스와 선행 집중 검토;
- 현재 저장소의 권위/런타임 문서 증거;
- UN SNA, IMF, BIS, ECB, Bank of England, Federal Reserve, World Bank, OECD, SEC, EVE Online Economic Council의 공식·1차 자료.

## 2. 근거 계층

**Tier A — 직접 아키텍처 근거:** 국제 거시회계 표준, 중앙은행/공공재정 기술자료, 규제기관 또는 1차 게임경제 보고서.

**Tier B — 게임식 변형 근거:** 메커니즘은 유용하지만 게임경제에 맞게 단순화해야 하는 실증·정책 연구.

**Tier C — 탐색 전용:** 광범위 논문, 2차 요약, 커뮤니티 설명, 유추. 정책 가설을 만들 수는 있지만 권위가 되지 않는다.

외부 근거는 머니버스 원장 진실, 사용자 안전, 비현금화 원칙, 실제 서비스 텔레메트리를 덮어쓰지 않는다.
## 3. 발견 A — 기능별 회계가 아니라 부문별 경제계정이 필요하다

UN 국민계정체계는 비금융기업·금융기관·정부·가계·해외부문을 구분하면서 생산, 소득, 이전, 저축, 투자, 금융흐름을 일관되게 기록한다.

미국 연준 2026 금융계정도 부문별 대차대조표와 자금 원천/사용 매트릭스를 제공하며 부문 간 금융거래가 서로 맞도록 한다.

**머니버스 직접채택:**
- 가계/회원;
- 비금융기업;
- 예금취급 은행;
- 국고/일반정부;
- 머니버스 통화당국;
- 외부/NPC 월드 부문;
- 거래소/시장운영자는 별도 운영주체로 기록하고 알 수 없는 돈 생성원으로 쓰지 않는다.

모든 WLD 흐름은 출발부문, 도착부문, 경제 목적, 금융수단, 총통화량 변동 여부를 가져야 한다. “시스템이 지급”만으로는 자금원천 설명이 아니다.

## 4. 발견 B — 하나의 국고 현금계좌 + 회계 하위원장이 올바른 구조다

IMF Treasury Single Account는 정부 현금을 하나로 통합하면서 지출 목적은 별도 은행계좌가 아니라 회계시스템에서 구분하는 구조를 설명한다.

**머니버스 직접채택:**
- 실제 지출 가능한 WLD 계좌는 `TREASURY_MAIN` 하나;
- 복지·인프라·비상준비금·배당·시장안정은 예산 버킷/약정;
- 독립적으로 지출 가능한 복지/인프라/비상 금고 금지;
- 수입/지출 대사와 현금계획 의무화.

이는 v495 단일국고 결론을 직접 강화한다.

## 5. 발견 C — 세금과 이전지출은 경기를 안정시키고 분배하는 도구이지 몰래 돈을 없애는 도구가 아니다

IMF/OECD는 불황 때 세수는 줄고 이전지출은 늘며, 회복 시 반대로 움직이는 자동안정장치를 설명한다.

**머니버스 직접채택:**
- 모든 `TAX_*`는 취소분을 제외하고 100% `TREASURY_MAIN` 귀속;
- 세금→burn 경로 금지;
- 누진세/표적 이전지출은 경기안정 후보로 시뮬레이션;
- 불황에는 복지/공공일자리 예산 확대, 세부담 완화가 자동으로 작동 가능;
- 임시지원에는 만료/재평가 규칙을 둬 영구 faucet이 되지 않게 한다.

세율 숫자는 머니버스 데이터가 검증하기 전까지 시뮬레이션 가설로 둔다.
## 6. 발견 D — 국고를 빨리 쓰는 것보다 공공지출의 질이 중요하다

IMF 2025 Fiscal Monitor와 World Bank 2026 자료는 지출 구성, 공공투자 효율, 예산집행 예측가능성, 인프라 품질, 제도 통제를 강조한다.

**머니버스 직접채택:**
- 모든 공공지출은 필수복구, 소득안정, 고용, 인프라/생산성, 커뮤니티 서비스, 시장안정, 이벤트/공공재 중 하나로 분류;
- 공공사업은 마일스톤·조달규칙·납품증거·유지비·효과측정 필요;
- 인프라가 물류비 감소나 생산능력 증가를 주더라도 제한된 버전형 효과로만 적용;
- TRR 목표를 맞추기 위해 가치 없는 사업에 돈을 쓰는 행위 금지.

세금 재순환율은 관측/운영 목표이며 무조건 지출해야 하는 강제비율이 아니다.

## 7. 발견 E — 은행신용은 대차대조표식 신용창조로 모델링해야 한다

Bank of England는 은행대출이 기존 예금을 단순 재대출하는 것이 아니라 대출자산과 고객예금을 동시에 만든다고 설명한다. ECB/BIS는 정책금리가 은행 조달비용·대출금리·신용공급·수요를 통해 경제에 전달된다고 설명한다.

**머니버스 직접채택:**
- 은행대출을 불명확한 faucet이나 기본 국고이체로 취급하지 않는다;
- 대출 실행 시 은행 대출자산 + 고객 예금부채를 동시에 생성;
- 원금상환은 해당 신용통화 포지션을 축소;
- 이자는 은행소득으로 이전되며 원금 소각과 구분;
- 부도는 충당금/자본을 감소시키고 정리절차를 탄다;
- 정책금리·조달비용·자본/유동성·차입자 위험이 신규 신용에 반영된다.

이는 게임 회계모형일 뿐 머니버스를 현실 인가은행으로 표현하지 않는다.

## 8. 발견 F — 신용에는 자본·유동성·손실흡수 장치가 필요하다

최근 BIS/BCBS와 IMF 자료는 위험기반 자본, 레버리지, 유동성, 완충자본을 별개의 안정장치로 본다.

**머니버스 직접채택:**
- 은행 자본, 유동성 준비금, 신용익스포저, 기대손실을 별도 지표로 관리;
- 신용성장에 시스템/코호트 위험범위 적용;
- 과도한 신용팽창 때 완충자본을 높이고 불황 때 완화하는 게임식 경기대응 버퍼 허용;
- 금리인상은 연체/부도 영향을 함께 스트레스 테스트;
- 기존 DeFi식 utilization kink를 모든 소매대출의 보편 권위로 쓰지 않는다.

## 9. 발견 G — 분배구조가 정책효과를 바꾼다

Fed HANK 연구와 2025 소비 연구는 자산·부채·소비성향 차이가 정책 전달효과를 크게 바꾼다고 보여준다.

**머니버스 직접채택:**
- 신규, 저유동자산, 중위, 고소득, 고자산 코호트별 거시지표;
- 복지/공공일자리는 게임 내 유동성·소득상태를 기준으로 표적화;
- 자산집중을 현재 소비압력과 동일시하지 않음;
- 휴면 고액자산 계정 복귀를 당일 faucet 증가가 없어도 수요충격으로 모델링.

현실의 민감한 개인정보는 이 분류에 필요하지 않다.
## 10. 발견 H — 복지는 현금만이 아니라 고용·기회와 연결될 때 효과가 높다

World Bank 2025–2026 자료는 현금지원, 공공근로, 고용서비스, 기술훈련, 경제포용을 상호보완적으로 다룬다.

**머니버스 직접채택:**
- 복지는 진행 실패를 막되 선택형 공공일자리·훈련·매칭·사업진입지원과 연결;
- 공공일자리 임금은 국고에서 지급하며 공공서비스 산출을 만든다;
- 민간 일자리는 기업이 임금을 지급;
- 외부/NPC 계약은 일반 “system faucet”이 아니라 외부부문 수요로 분류;
- 복지·공공일자리에는 다중계정/관련계정 악용방지 적용.

## 11. 발견 I — 자산시장은 가격발견과 투명한 유동성이 필요하다

SEC 시장구조 자료는 가격발견, 공개유동성, 체결품질, 접근성, 투명성을 핵심으로 본다.

**머니버스 직접채택:**
- WDX 2차시장 가격은 실제 오더북 수급 + 제한된 펀더멘털 기준을 사용하고 임의 랜덤가격 쓰기를 금지;
- spread, depth, turnover, concentration, self-trade, wash/circular volume을 핵심지표로 관리;
- IPO 자금은 투자자→발행기업;
- 2차매매 자금은 매수자→매도자;
- 배당은 세후 실제 분배가능 기업현금/이익에서 지급;
- 시장운영 수수료는 명시적 통화회수 정책이 아니면 운영자/국고 수입으로 처리.

기존 10배 레버리지/공매도 파생상품은 증거금·청산·보험기금·손실분담 계약이 승인되기 전까지 권위 드리프트/재검토 대상으로 유지한다.

## 12. 발견 J — 성숙한 게임경제는 여러 차원을 동시에 본다

EVE Online 2026 월간경제보고서는 생산/채굴/파괴, faucet, 통화량, active ISK delta, velocity, 여러 가격지수를 분리해 공개한다.

**머니버스 직접채택:**
- “faucet = sink” 단일 목표 금지;
- 소비자물가, 생산/input 물가, 자산가격지수를 분리;
- 통화량, active/dormant 잔액, 신용, 생산, 재고, 거래깊이, 아이템파괴, 자산분배를 함께 관측;
- 시즌·신규출시·점검·악용·데이터수정 태그 후 인플레이션/디플레이션 판단.

기존 v400/v401 방향을 하나의 통합 거시모델로 확장한다.
## 13. 발견 K — 아이템 희소성과 통화회수는 서로 다른 정책이다

기존 머니버스 연구는 거래세/아이템싱크가 품목별 가격에 서로 다른 부작용을 낼 수 있음을 이미 확인했고, EVE도 자산파괴와 통화지표를 분리한다.

**머니버스 직접채택:**
- 아이템 과잉공급은 아이템 파괴, 소모, 감가, 국고의 실제 매물 매입으로 해결;
- 세금 WLD 자체는 소각하지 않음;
- 일반 서비스 수수료는 원칙적으로 국고·은행·기업·공기업의 소득으로 귀속;
- 영구 WLD 제거는 세금 안에 숨기지 않고 별도 `MONETARY_RETIREMENT` 정책으로만 허용.

## 14. 발견 L — 국채는 자금원천과 지속가능성 모델이 필요하다

IMF 2025–2026 재정자료는 이자비용, 재정여력, 금리와 부채의 상호작용, 중기 재정프레임을 강조한다.

**머니버스 직접채택:**
- 국채는 국고의 부채이며 공짜 수익 faucet이 아님;
- 국채 매입은 투자자 WLD→국고 이전;
- 이자/원금상환은 국고 예산에서 지급;
- 세수 대비 이자비용, 산출 대비 부채, 만기집중, 차환위험 관측;
- 통화당국 긴급지원이 필요해도 명시적·제한적·감사 가능한 예외로 두고 상시 적자보전 금지.

## 15. 이번 검토에서 확인한 저장소 드리프트

최신 main 문서는 아직 하나의 일관된 경제를 설명하지 못한다.

P0/P1 충돌:
1. `PROJECT_PLAN.md` 과거 마켓세 소각 vs 현행 세금 100% 국고 방향;
2. `APP_SPEC_AND_USER_GUIDE.md` 부동산세를 deflationary sink로 표현;
3. 벤처 기업매출 hard burn;
4. 파생상품 청산금 일부 영구소각;
5. 클럽/영토 “세금”을 중앙국고 밖으로 직접 배분;
6. 은행·사업·직업의 많은 수수료가 수취 경제주체 없이 hard sink 처리;
7. 은행대출 원금이 신용통화모형 없이 generic faucet/국고이체로 혼재;
8. system-funded 직업/사업수입의 거시 자금원천 부재;
9. 가상국채 이자재원이 국고 현금/부채계정과 통합되지 않음;
10. WDX/IPO/배당 구현이 구형 제품설계의 레버리지/마진/공매도 제한보다 앞서 있음;
11. 주식거래정지 100% 취득원가 보호에 단일 사전 적립 보증기금/백스톱 자금계약 부재;
12. 다중국고 런타임/이력 vs 승인된 v495 단일국고.

이는 권위 드리프트이며 과거 마이그레이션 수정이나 런타임 수정 완료를 의미하지 않는다.
## 16. 채택 / 변형 / 거부 요약

### 직접채택
- 부문별 대차대조표와 from-whom-to-whom 자금흐름;
- 단일국고 현금계좌 + 회계 하위원장;
- 세금/이전지출 자동안정장치;
- 대출/예금 대차대조표식 신용회계;
- 자본/유동성/손실흡수 규칙;
- 코호트별 분배지표;
- 다중지표 거시 관측;
- 공공지출 효율 및 마일스톤 증거.

### 게임에 맞게 변형
- GDP 대신 측정 가능한 최종생산/소비만 집계하는 “World Output”;
- 실업률 대신 labor-slack/적격 구직자 지표;
- 중앙은행 대신 제한된 정책행동을 갖는 가상 통화당국;
- 적은 초기 인구에서도 경제가 돌도록 명시적 NPC/외부부문;
- 국채는 현금화되지 않는 게임 전용 정부부채.

### 기본값으로 거부
- faucet-minus-sink 하나만 맞추는 경제운영;
- 세금의 통화소각 사용;
- 상대 자금원천 없는 기능별 돈 생성;
- 보장수익형 사업/주식/국채;
- 징벌적 부채함정/숨은 금리변경;
- AI의 직접 잔액·가격·세율·금리 쓰기;
- 실제 금융상품/신용평가/현금상환으로 오인시키는 표현.
## 17. 핵심 1차 레퍼런스

1. UN Statistics Division, **System of National Accounts 2025**: https://unstats.un.org/unsd/nationalaccount/sna2025.asp
2. Federal Reserve, **Financial Accounts of the United States (Z.1), 2026:Q2**: https://www.federalreserve.gov/releases/z1/
3. IMF, **Treasury Single Account: Concept, Design and Implementation Issues**: https://www.imf.org/en/publications/wp/issues/2016/12/31/treasury-single-account-concept-design-and-implementation-issues-23927
4. Bank of England, **Money creation in the modern economy**: https://www.bankofengland.co.uk/quarterly-bulletin/2014/q1/money-creation-in-the-modern-economy
5. ECB, **Transmission mechanism of monetary policy**: https://www.ecb.europa.eu/mopo/intro/transmission/html/index.en.html
6. BIS, **New forms of money and the transmission of monetary policy** (2026): https://www.bis.org/speeches/20260622-new-forms-money-and-transmission-monetary-policy
7. BCBS/BIS, **Basel III monitoring report** (2026): https://www.bis.org/publications/202609-qis-basel-iii-monitoring-report
8. IMF, **Fiscal Monitor April 2026 — Fiscal Policy under Pressure**: https://www.imf.org/en/publications/fm/issues/2026/04/15/fiscal-monitor-april-2026
9. IMF, **Fiscal Monitor October 2025 — Spending Smarter**: https://www.imf.org/en/publications/fm/issues/2025/10/07/fiscal-monitor-october-2025
10. OECD, **Automatic fiscal stabilisers**: https://www.oecd.org/en/publications/automatic-fiscal-stabilisers-recent-evolution-and-policy-options-to-boost-their-effectiveness_816b1b06-en.html
11. Federal Reserve, **HANK Comes of Age**: https://www.federalreserve.gov/econres/feds/hank-comes-of-age.htm
12. Federal Reserve, **Wealth Heterogeneity and Consumer Spending**: https://www.federalreserve.gov/econres/notes/feds-notes/wealth-heterogeneity-and-consumer-spending-20250805.html
13. World Bank, **State of Social Protection Report 2025**: https://www.worldbank.org/en/topic/socialprotectionandjobs/publication/state-of-social-protection-2025-2-billion-person-challenge
14. World Bank, **Public Employment Services** (2026): https://www.worldbank.org/en/brief/2026/05/12/public-employment-services
15. World Bank, **The Quality of Budget Institutions and the Efficiency of Public Spending** (2026): https://documents.worldbank.org/en/publication/documents-reports/documentdetail/099060226153024717
16. SEC, **Equity market structure / price discovery principles**: https://www.sec.gov/newsroom/speeches-statements/us-equity-market-structure
17. EVE Online Economic Council, **2026 Monthly Economic Reports**: https://www.eveonline.com/news/category/monthly-economic-report

## 18. 조사 결론

근거는 **부문별·stock-flow-consistent·원장 대사형 가상 거시경제**로 재설계하는 방향을 지지한다.

일반 플레이 무제한 원칙과 게임성은 유지하되, 모든 중요한 WLD 원천·사용·자산·부채·세금·이전·신용사건·통화회수에 경제적 상대방을 부여해야 한다. 그 위에서 재정·통화·신용·노동·기업·자산시장 정책을 하나의 모델로 운영하고, 서로 무관한 feature-local faucet/sink를 따로 조절하는 구조는 단계적으로 폐기해야 한다.
