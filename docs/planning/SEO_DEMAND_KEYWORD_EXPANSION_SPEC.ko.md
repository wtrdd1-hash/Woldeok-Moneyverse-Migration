# 월덕 머니버스 — SEO 수요·키워드 포트폴리오 확장 명세

> 버전: v2026.10.05.527  
> 상태: 기획 / 조사 / 문서 전용  
> 기준일: 2026-10-05  
> 영문 정본: [SEO_DEMAND_KEYWORD_EXPANSION_SPEC.md](SEO_DEMAND_KEYWORD_EXPANSION_SPEC.md)  
> 상위 권위: [PROJECT_PLAN.ko.md](PROJECT_PLAN.ko.md), [INTEGRATED_PLANNING_MASTER.ko.md](INTEGRATED_PLANNING_MASTER.ko.md)  
> 연계 권위: [GLOBAL_GROWTH_SEO_REVENUE_SPEC.ko.md](GLOBAL_GROWTH_SEO_REVENUE_SPEC.ko.md), [GLOBAL_GROWTH_EXECUTION_SPEC.ko.md](GLOBAL_GROWTH_EXECUTION_SPEC.ko.md), [SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.ko.md](SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.ko.md)

## 1. 목적

Moneyverse는 국내와 해외의 자격 있는 자연검색 수요를 크게 늘리되 programmatic SEO를 단순 페이지 수 공장으로 만들지 않는다.

운영 루프는 다음과 같다.

`실측/출처 있는 수요 -> 즉시 유용한 답/도구 -> 두 번째 유용 행동 -> 필요할 때 가입 -> 첫 제품 활성화 -> 재방문 -> 자격 페이지뷰 -> 실측 광고경제`

이 명세는 **키워드 수요 포트폴리오**를 담당한다. 후보 검색어를 어떻게 발굴·정규화·군집화·검증하고 어떤 페이지 유형에 연결하며, 언제 색인·확장·통합·퇴출할지를 정의한다.

후보 키워드 하나가 URL 하나를 의미하지 않는다. 키워드 후보는 조사 재고이며 색인 페이지 승인이 아니다.

## 2. 현재 exact-main 기준선

이번 기획은 시작 및 작업 중간에 `origin/main=5318213f1eca644c7f36df7d967a53092de0814c`를 다시 확인했다.

현재 저장소에는 이미 상당한 검색면이 있다.

- 연봉, 양도소득세, 연금세금, 은퇴, ISA, 복리, 대출이자, 배당, 부동산, 김치프리미엄, 주식, 세금, 목표자산 등 공개 계산기/도구;
- 금융 용어집 50개 (KO/EN/JA/ZH 4개 국어 및 SearchAutocompletePopover 실시간 검색 연동);
- 2026 증여세 계산기 13개 고수요 롱테일 프리셋 (/tools/gift-tax-calculator/[preset]);
- 글로벌 복리 & FIRE 은퇴 계산기 다국어 18개 허브 (EN/JA/ZH 3개 국어 × 5대 롱테일 프리셋 + 5대 글로벌 통화 세그먼트 스위처);
- 배당 캘린더 인터랙티브 위젯 및 1~12월 세후 배당금 Excel 호환 UTF-8 BOM CSV 내보내기;
- HTML5 Canvas 2D 기반 1초 바이럴 인포그래픽 공유 카드 (ViralShareCardDialog) 및 X(트위터) 공유 인텐트;
- 자동생성 급여 금액구간 50개;
- 명시적 대출 pSEO 프리셋 34개;
- 배당 종목 데이터 44개;
- 양도소득세 11개, 부동산 11개, 김치프리미엄 11개 프리셋;
- IndexNow 프로토콜(Bing/Naver/Yandex/Seznam) 전 지면(증여세, 글로벌 복리, 용어집 포함) 실시간 대량 배치 핑 전송 파이프라인.

따라서 다음 성장 문제는 “pSEO를 새로 만든다”가 아니라 **통제, 수요 검증, 독립 가치, 출처 신선도, 카니벌라이제이션 관리, 전환 품질**이다.

아직 병합되지 않은 `origin/plan/search-to-user-growth-v2026.10.04.525`는 동시작업 읽기 전용 입력으로 취급한다. 추후 v525가 병합되면 v527은 키워드/수요획득 taxonomy를, v525는 검색유입 이후 사용자 전환 전체 루프를 담당하도록 합성한다.

## 3. 비타협 원칙

1. 공개/제품 fallback locale은 한국어다.
2. 국내와 해외를 별도 기획한다. locale은 법적 jurisdiction과 동일하지 않다.
3. Search Console/Search Advisor는 Moneyverse의 실제 검색성과를 측정하며 시장 전체 검색량이 아니다.
4. 시장 수요 추정치는 provider, 시장, 언어, 기간, 관측일을 반드시 기록한다.
5. synthetic/fallback 트래픽 숫자는 live 근거로 표시하거나 사용하지 않는다.
6. 고정 URL 수, 키워드 수, 번역 수 목표는 색인을 승인하지 않는다.
7. doorway page, keyword stuffing, 저가치 scaled content, 검색결과 무단 자동 스크래핑을 금지한다.
8. 모든 색인 페이지는 광고나 가입유도 전에 독립적인 사용자 task와 유용한 결과를 제공한다.
9. 금융·세금·대출·연금 계산기는 출처, 시행일, 관할, 가정, stale 동작을 명시한다.
10. private/account/admin/security/transaction/casino/chance 화면은 SEO 재고가 아니다.
11. 게시 locale은 실제 본문 언어 parity가 있어야 하며 template만 번역하면 안 된다.
12. 독립 가치가 없는 새 키워드 변형은 기존 canonical 페이지에 합친다.

## 4. 검색수요 증거 모델

모든 키워드/검색기회는 다음 상태 중 하나를 가진다.

| 상태 | 의미 | 색인결정 근거 가능 여부 |
|---|---|---|
| `LIVE_GSC` | 실제 Google Search Console query/page/country/device 근거 | 콘텐츠 게이트 후 가능 |
| `LIVE_NAVER` | 실제 Naver 검색성과 근거 | 콘텐츠 게이트 후 가능 |
| `NAVER_DATALAB_TREND` | 네이버 상대 추세 근거 | 보조근거 |
| `KEYWORD_PLANNER_ESTIMATE` | Google Ads 시장 수요/비용 추정 | 추정수요로 가능 |
| `OTHER_PROVIDER_ESTIMATE` | 시장/언어/기준일이 있는 명시 공급자 | 보조/추정 |
| `INTERNAL_SEARCH_DEMAND` | Moneyverse 내부검색/no-result 수요 | 외부에도 유용할 때 가능 |
| `COMMUNITY_DEMAND` | 반복되는 공개 지원/커뮤니티 질문 | 보조근거 |
| `NO_DATA` | 공급자는 연결됐지만 유효 데이터 없음 | 불가 |
| `NOT_CONNECTED` | 공급자 미연결 | 불가 |
| `FETCH_ERROR` | 수집 실패 | 불가 |
| `SYNTHETIC_TEST_DATA` | fixture/dev 전용 | 절대 불가 |

Search Console API는 query/page/country/device 등으로 분할할 수 있지만 내부 제한 때문에 모든 행을 반환한다고 보장하지 않는다. 따라서 GSC export에 없다는 사실을 시장 수요 0의 증거로 사용하지 않는다.

Naver DataLab은 상대 검색추세 비교 입력이며 정확한 월검색량 대체값으로 취급하지 않는다.

## 5. 키워드 레지스트리 계약

각 후보는 최소 다음 필드를 가진다.

```text
KeywordOpportunity {
  id
  locale
  market
  cluster
  seed
  modifiers[]
  normalizedQuery
  intentFamily
  landingFamily
  evidenceState
  provider
  demandValue
  demandUnit
  observedAt
  period
  competition
  cpcEstimate
  currentLandingUrl
  currentClicks
  currentImpressions
  currentCtr
  currentPosition
  productRelevance
  independentValue
  localizationReadiness
  freshnessRisk
  complianceRisk
  retentionPotential
  adSuitability
  cannibalizationGroup
  priorityScore
  decision
  reason
}
```

`decision`은 `P0 | P1 | P2 | HOLD | MERGE | NOINDEX | RETIRE` 중 하나다.

v527에서 생성한 레지스트리는 **후보 10,473개**이며 한국어 6,207개, 영어 4,266개, 총 25개 수요클러스터다. 모든 행은 `UNVALIDATED_CANDIDATE / HOLD_UNTIL_EVIDENCE` 상태다. 이 CSV 자체는 페이지 생성을 승인하지 않는다.

레지스트리: `../findings/SEO_DEMAND_KEYWORD_REGISTRY_v2026.10.05.527.csv`  
SHA-256: `4e85672667970b41a33222b7005215ef630900daa935674cb8b7f21fcf901b79`.

## 6. 국내 키워드 포트폴리오

### 6.1 P0 국내 클러스터

| 클러스터 | 핵심 seed | 기본 랜딩유형 | Moneyverse 연결 |
|---|---|---|---|
| 급여·근로 | 연봉, 월급, 실수령액, 시급, 주휴수당, 퇴직금, 통상임금, 실업급여, 4대보험 | 계산기 + 가이드 + 용어 | 직업/소득 시뮬레이션 |
| 예금·저축 | 예금, 적금, 세후이자, 단리, 월복리, 일복리, 저축목표 | 계산기 + 비교 | 가상은행/저축 |
| 대출·주거부채 | 대출이자, 월상환금, 원리금균등, 원금균등, DSR, DTI, LTV, 전세대출, 주담대 | 계산기 + 가이드 + 비교 | 가상은행/부채교육 |
| 투자·복리 | 복리, CAGR, ROI, 미래가치, 현재가치, 평단가, 물타기, 손익분기 | 계산기 + 용어 | 가상주식 시뮬레이터 |
| 배당 | 배당금, 세후배당, 배당수익률, 월배당, 재투자, 목표배당 | 계산기 + entity + 가이드 | 관심종목/가상투자 |
| 연금·FIRE | 국민연금, 연금저축, IRP, 은퇴자금, FIRE, Coast FIRE, 4% 룰, 안전인출률 | 계산기 + 가이드 + 용어 | 장기 경제 시뮬레이터 |
| 부동산 | 취득세, 양도세, 중개수수료, 전월세전환율, 임대수익률, 전세월세비교 | 계산기 + 비교 | 가상 부동산/사업 |
| 생활재무 | 순자산, 예산, 비상금, 저축률, 부채비율, 월생활비 | 계산기 + planner | 개인 경제 대시보드 |

### 6.2 P1 국내 클러스터

- 세금: 소득세, 종합소득세, 금융소득 종합과세, 증여세, 상속세, 재산세;
- 물가·가치: 물가상승률, 구매력, 실질수익률, 실질금리, 화폐가치;
- 사업/창업: 손익분기, 마진율, 원가, 판매가, 현금흐름, CAC, LTV, 번레이트, 런웨이;
- 환율/해외투자: 환율, 환전수수료, 환차손익, 김치프리미엄;
- 실제 계산기·가이드와 연결되는 금융 용어집 확장.

### 6.3 P2 국내 제품발견 클러스터

- 경제 시뮬레이션;
- 가상경제 게임;
- 주식 게임 / 투자 게임;
- 금융 게임;
- 사업 시뮬레이션 / 회사 경영 게임;
- 가상경제 인플레이션 / 통화량 시뮬레이션;
- 가상 직업 수입 비교.

Moneyverse가 가상경제/게임이라는 점을 명확히 표시하며 실제 투자수익, 은행상품, 수익보장을 암시하면 안 된다.

## 7. 해외 키워드 포트폴리오

### 7.1 P0 영어권 클러스터

| 클러스터 | 핵심 seed | 기본 랜딩유형 | 제품 연결 |
|---|---|---|---|
| Interest & savings | compound interest, simple interest, future value, present value, APY, savings goal | calculator + guide | virtual bank / saved preset |
| Investing | investment growth, DCA, CAGR, ROI, average cost, stock profit, rebalancing | calculator + glossary | stock simulator/watchlist |
| Dividends | dividend income, dividend yield, DRIP, yield on cost, dividend growth | calculator + entity | virtual investing |
| Retirement/FIRE | retirement, FIRE number, Coast FIRE, Lean/Fat/Barista FIRE, SWR, 4 percent rule | calculator + guide | long-term simulator |
| Loan/debt | loan payment, amortization, payoff, debt snowball, debt avalanche, credit-card payoff | calculator + guide | debt/credit education |
| Mortgage | mortgage payment, affordability, refinance, down payment, rent vs buy | calculator + comparison | housing simulation |
| Income | salary, paycheck, take-home pay, hourly-to-salary, overtime, gross-to-net | calculator | career simulation |
| Personal finance | net worth, savings rate, budget, emergency fund, debt-to-income, cash flow | calculator + planner | personal economy dashboard |
| Business/startup | break-even, margin, markup, pricing, burn rate, runway, unit economics, CAC/LTV | calculator + guide | virtual business |

### 7.2 영어 용어·지식그래프

현재 용어집은 알파벳순 수량보다 연결도가 높은 개념부터 확장한다.

`APR, APY, CAGR, ROI, ROE, ROA, EPS, P/E, P/B, EBITDA, free cash flow, market cap, beta, alpha, Sharpe ratio, volatility, drawdown, dividend yield, yield on cost, DCA, compounding, amortization, principal, nominal return, real return, inflation, liquidity, leverage, debt-to-equity, diversification, asset allocation, rebalancing, expense ratio, bond yield, yield curve, duration, present value, future value, NPV, IRR, WACC, break-even, gross margin, operating margin, net margin, cash flow, burn rate, runway`.

실제 의미관계가 있을 때 용어에서 계산기·가이드·entity·시뮬레이터로 연결한다.

### 7.3 해외 제품발견 클러스터

- economy simulator;
- virtual economy game;
- browser economy game;
- multiplayer economy game;
- business simulation game;
- money simulator;
- personal finance simulator;
- financial literacy game;
- investing simulator;
- stock market simulator.

반복적인 “best game” 문구가 아니라 실제 제품 유용성으로 경쟁한다.

## 8. 후보 확장 문법

발굴엔진은 다음 조합으로 후보를 만들 수 있다.

`seed × intent modifier × amount × period × scenario × market × locale`

예:

- `대출 이자 × 3억원 × 30년 × 계산기`;
- `배당금 × 세후 × 월별 × 계산기`;
- `FIRE × 40대 × 목표자산 × 계산기`;
- `compound interest × $100,000 × 10 years × calculator`;
- `mortgage × extra payment × comparison`;
- `Coast FIRE × with inflation × calculator`.

이 곱셈은 **조사용 확장**일 뿐이며 조합 수는 SEO KPI가 아니다.

후보가 별도 URL이 되기 전 결과·데이터·설명·상호작용·의사결정지원이 부모 페이지와 실질적으로 달라야 한다. 그렇지 않으면 새 페이지 대신 preset, anchor section, FAQ, 표 행, 내부검색 synonym으로 처리한다.

## 9. 랜딩 유형

### 계산기
가입 전에 핵심 결과를 제공하고 공식/가정을 설명한다. 외부 규칙을 사용하는 경우 출처와 시행일을 표시하며 접근 가능한 입력/오류상태를 제공한다.

### 가이드
사용자 task 또는 의사결정을 독창적 설명, 예시, 한계, 관련도구, 다음 행동으로 해결한다.

### 용어/entity
개념 하나를 관계·예시·계산기 연결·출처와 함께 정의한다. 용어집은 Schema.org `DefinedTerm` / `DefinedTermSet` 의미표현을 사용할 수 있지만 Schema.org 타입이 있다는 이유만으로 Google rich result를 보장한다고 해석하지 않는다.

### 비교
명확한 차원과 가정으로 실제 다른 선택지를 비교한다. “A vs B” 키워드만 노리고 내용 없는 페이지를 만들지 않는다.

### 시뮬레이터
사용자 입력 변화가 결과를 실질적으로 바꾸는 상호작용을 제공한다. Moneyverse 값은 가상/게임 수치임을 명시한다.

### 데이터/entity 페이지
유지관리 가능한 원천데이터, 업데이트시각, stale 동작, entity별 독립내용이 필요하다. 티커/entity 페이지는 template-only면 안 된다.

## 10. pSEO 입장 게이트

pSEO family가 실제 indexable production에 들어가려면 다음을 모두 통과해야 한다.

1. 독립 task/intent;
2. 실측 또는 출처 있는 추정수요;
3. 가입/광고 클릭 전 유용한 핵심결과;
4. 부모/형제와 near-duplicate 아님;
5. 계산/데이터 유지관리와 테스트 가능;
6. 관련 시 출처·관할·시행일 명확;
7. 자연스러운 title/H1/body, keyword stuffing 없음;
8. deterministic canonical;
9. 의도된 sitemap/internal-link 배치;
10. target locale 품질 검토;
11. 필요한 privacy/compliance/financial-safety 검토;
12. 성능 budget 통과;
13. analytics event 모델 존재;
14. merge/noindex/retire 경로 존재.

Google은 doorway, keyword stuffing, 대량 저가치 scaled content를 spam으로 명시한다. 따라서 후보 레지스트리와 실제 게시 URL 레지스트리를 반드시 분리한다.

## 11. 금융·YMYL 유사 정확성 게이트

Moneyverse는 금융자문 서비스가 아니다. 교육용 공개 금융도구도 수치가 오래되거나 과도하게 정확한 척하면 사용자를 해칠 수 있다.

규칙/데이터 기반 계산기는 다음을 보유한다.

`sourceAuthority, sourceUrl, jurisdiction, effectiveFrom, checkedAt, nextReviewAt, calculationVersion, assumptions, disclaimer, staleAction`.

`staleAction`:

- `KEEP_WITH_STATIC_MATH`: 공식은 고정이고 사용자가 입력값 제공;
- `WARN`: 보조 rate/data가 오래됐지만 교육용 계산은 가능;
- `NOINDEX`: 사용자는 볼 수 있으나 검색획득 중단;
- `DISABLE_RESULT`: 공식 권위가 오래됐거나 불확실해 결과계산 중단.

국내는 분야에 맞는 공식기관을 우선한다. 예: 세금은 국세청/재정당국, 국민연금은 국민연금공단, 건강·장기요양은 국민건강보험공단, 대출규정은 금융위원회/금감원, 통화·통계는 한국은행, 주택/금융정책은 적용 법령·정부기관.

해외 계산기는 시장별로 분리한다. 예를 들어 미국은 SEC Investor.gov의 복리 교육/계산기, CFPB의 mortgage/loan 설명, IRS의 withholding 도구 등을 1차자료군으로 삼을 수 있다. 미국 규칙을 generic global 페이지에 몰래 적용하면 안 된다.

## 12. 검색엔진 운영모델

### 국내

Google Search Console + Google Keyword Planner + Naver Search Advisor + Naver DataLab을 보완적으로 사용한다.

- GSC: Moneyverse의 실제 Google impressions/clicks/CTR/position;
- Keyword Planner: Google 시장의 추정 수요/비용;
- Naver Search Advisor: crawl/index/site 품질;
- Naver DataLab: 지원되는 범위에서 주제별·기기·성별·연령별 상대 검색추세.

네이버의 현재 제목/설명/콘텐츠 가이드는 고유하고 주제를 정확히 설명하는 metadata를 권장하며 관련 없는 인기키워드나 반복적인 키워드 나열을 경고한다.

### 해외

국가/언어별 Google Search Console/Keyword Planner와 Bing Webmaster Tools를 사용한다. Bing의 현재 webmaster 가이드는 crawlability, index 정확성, URL consolidation, content clarity, trust가 Bing/Copilot grounding·citation 자격에도 연결된다고 설명한다.

지원 검색엔진의 add/update/delete 신선화에는 IndexNow를 사용한다. 제출 성공이 색인/순위를 의미하지 않는다.

순위측정을 위해 Google 검색결과를 무단 자동 스크래핑하지 않는다. Google은 허가 없는 automated search query를 machine-generated traffic spam 정책으로 분류한다.

## 13. 국제화

출시순서는 유지한다.

1. 한국어 기준선;
2. 영어권;
3. 일본어;
4. 독일어;
5. 프랑스어;
6. 스페인어;
7. 브라질 포르투갈어;
8. 추가시장은 별도 수요/컴플라이언스 검토.

각 locale 페이지:

- IP와 상관없이 명시 locale URL 고정;
- 유효 게시 locale은 self-canonical;
- 실제 동등 콘텐츠에만 reciprocal hreflang;
- visible main content가 실제 target language;
- index 전 native/product review;
- 미번역/stale/혼합언어는 noindex 및 sitemap/hreflang 제외.

## 14. 내부링크 지식그래프

기본 그래프:

`topic hub -> calculator -> related guide -> glossary/entity -> Moneyverse simulator/product action`

유용할 때 역방향 contextual link도 둔다.

예:

- `복리 계산기 -> CAGR 뜻 -> 목표자산 계산 -> Moneyverse 가상은행`;
- `대출 계산기 -> DSR 설명 -> 상환방식 비교 -> 가상은행 학습`;
- `FIRE calculator -> safe withdrawal rate -> Coast FIRE -> 장기 가상경제 시뮬레이터`;
- `dividend calculator -> dividend yield -> DRIP -> 가상주식 관심종목`.

orphan indexable 페이지와 footer keyword farm은 금지한다.

## 15. 구조화데이터와 Search appearance

화면에 보이는 내용과 일치하는 schema만 사용한다.

- 실제 계층에 `BreadcrumbList`;
- 해당되는 편집형 가이드에 `Article` / `BlogPosting`;
- 용어 의미에 Schema.org `DefinedTerm` / `DefinedTermSet`;
- 그 외에는 Google이 현재 지원하는 search feature의 요구조건을 실제 충족할 때만 사용.

Google의 일반 “calculator rich result” 계약이 있다고 가정하지 않는다. 지원되지 않는 markup을 만들어내거나 rich result 노출을 약속하지 않는다.

## 16. 검색유입→사용자 전환

자격 있는 landing은 다음 순서를 따른다.

1. 검색질문을 즉시 해결;
2. 관련된 두 번째 유용 행동 제공;
3. 다른 scenario 비교/조정/저장을 제공;
4. persistence/personalization에 실제 가치가 있을 때만 가입 제안;
5. 가입 후 pre-signup context 복구;
6. Moneyverse 핵심 행동 하나에 연결;
7. acquisition family별 D1/D7/D30 측정.

권장 CTA:

- 이 계산 저장;
- 다른 조건과 비교;
- 관심목록 생성;
- Moneyverse 가상경제에서 같은 개념 실험;
- 다음 학습 단계 계속.

SEO utility landing에서 “답 보려면 가입” 방식은 금지한다.

## 17. 기회점수

단순 검색량 대신 정규화 점수를 사용한다.

`Opportunity = DemandEvidence × SERPGap × ProductRelevance × IndependentValue × LocalizationReadiness × RetentionPotential × AdSuitability × TrustConfidence ÷ (FreshnessCost × ComplianceRisk × CannibalizationRisk)`

검색량이 큰 금융키워드라도 출처 권위가 약하면 더 작지만 안전하고 제품 연결이 좋은 키워드보다 낮게 평가할 수 있다.

판정:

- **P0:** 근거 강함 + 제품연결 강함 + 기존/근접 구현으로 높은 가치;
- **P1:** 수요는 있으나 콘텐츠/데이터/현지화 보강 필요;
- **P2:** 전략적 적합 가능성이 있는 탐색군;
- **HOLD:** 후보만 존재, 수요근거 부족;
- **MERGE:** 기존 canonical과 같은 의도;
- **NOINDEX:** 사용자에겐 유용하지만 검색랜딩 부적합;
- **RETIRE:** 오래됐거나 중복·저가치.

## 18. 카니벌라이제이션·퇴출

문자열이 아니라 검색의도로 query를 묶는다.

같은 task의 URL 둘 이상이 경쟁하면:

- canonical winner 선정;
- 독립적으로 유용한 내용을 winner에 병합;
- 필요시 loser redirect/noindex;
- sitemap/internal link 갱신;
- analytics 이력 보존.

퇴출 검토 trigger:

- 정의된 관찰기간 동안 자격 수요가 거의 없음;
- 반복적인 duplicate title/content 신호;
- 오래된 외부규칙/데이터;
- engagement가 낮고 downstream activation도 없음;
- 품질/수동검토 문제;
- 노출은 되나 검색의도를 오도;
- 유지비용 과다.

## 19. 성능·UX 게이트

색인 landing은 field Core Web Vitals 75th percentile에서 다음을 목표로 한다.

- LCP <= 2.5초;
- INP <= 200ms;
- CLS <= 0.1.

계산기 입력은 모바일·키보드에서 사용 가능해야 하고 빈값/잘못된 값에 복구 가능한 오류를 제공한다. 광고가 핵심결과를 가리거나 유의미한 layout shift를 만들면 안 된다.

## 20. 측정 대시보드

최소 dimension:

`country × locale × query_cluster × landing_family × landing_url × device × source × index_state × content_version`.

검색 KPI:
- submitted/indexed coverage;
- impressions/clicks/CTR/position;
- top3/top10/top20 query 수;
- non-brand 비중;
- 신규 qualified query 수;
- cannibalization 수;
- 해당되는 image/video/Discover;
- 측정 가능한 Bing/AI grounding referral.

제품 KPI:
- landing -> 두 번째 유용 행동;
- 계산완료;
- 관련콘텐츠 클릭;
- save/preset;
- signup;
- 첫 activation;
- D1/D7/D30.

수익 KPI:
- qualified pageviews;
- 실측 Page RPM/ad RPM;
- organic session pages/session;
- qualified organic session당 수익;
- invalid-traffic warning;
- 콘텐츠/현지화/support/infra/compliance 비용 후 incremental contribution.

## 21. 실행 웨이브

### Wave 0 — 진실성·인벤토리
- 실제 GSC/Naver 연결 또는 명시적인 NOT_CONNECTED;
- 현행 pSEO URL 전수 canonical/index 상태 대조;
- 현행 금융계산기 source/freshness risk 분류;
- 혼합언어/canonical/hreflang 오류 탐지;
- v527 키워드 registry를 후보 전용 조사재고로 적재.

### Wave 1 — 국내 P0
실측 수요를 기준으로 급여/근로, 예금/저축, 대출/DSR, 배당, 연금/FIRE, 부동산, 생활재무 hub를 우선한다. 새 sibling을 만들기 전에 기존 페이지 개선을 먼저 검토한다.

### Wave 2 — 영어 P0
compound interest/savings, investment/DCA, FIRE/SWR, dividend/DRIP, loan/debt payoff, mortgage, take-home pay, net worth/budget, business break-even.

### Wave 3 — 지식그래프
현재 50개 용어를 먼저 검토된 고연결 300개 방향으로 확장한다. 1,000+ 확장은 정의 품질·출처관리·내부링크·수요커버리지가 유지될 때만 가능하다. “1,000개”는 capacity 방향이지 발행 quota가 아니다.

### Wave 4 — 일본 및 다음 locale
검증된 page family만 번역하고 native intent research 후 게시한다. 10,473개 후보를 기계번역해 URL로 만들지 않는다.

### Wave 5 — 승자 확장
부모 family의 실제 성과·품질이 입증된 뒤 numeric/entity/preset long-tail을 늘린다. 약한 sibling은 통합/퇴출한다.

## 22. 90일 기획 백로그

P0:
- 검색수요 evidence connector 진실성;
- 현행 URL/indexability inventory;
- 국내 급여/대출/배당/FIRE cluster audit;
- 영어 compound/FIRE/debt cluster audit;
- 금융 source/effective-date registry;
- cannibalization detector;
- keyword opportunity queue;
- contextual second-action CTA;
- mixed-locale QA;
- sitemap/canonical/hreflang audit.

P1:
- 용어집 50 -> 1차 검토 300;
- comparison family template;
- saved calculator/preset;
- 검색 landing -> activation analytics;
- Bing Webmaster/IndexNow 운영 dashboard;
- 고가치 guide의 image/search-media 확장;
- 일본어 native keyword discovery;
- stale source noindex/disable workflow.

P2:
- 고급 사업/창업 계산기;
- 더 깊은 가상경제 simulator;
- 집계 임계치/privacy gate를 통과한 country/locale trend;
- DE/FR/ES/pt-BR 확장.

## 23. 조사·레퍼런스 정책

v527은 기존 v507/v510 corpus를 숫자에 단순 합산하지 않고, SEO·IR·query intent·keyword research·crawl/index·다국어 IR·현지화·content quality/spam·ranking/CTR·structured data/knowledge graph·성능/접근성·금융교육/계산기·behavioral saving·conversion/retention·광고측정/fraud/privacy·search analytics를 포함한 40개 lane으로 **신규 독립 Crossref discovery corpus**를 수집했다.

결과는 **raw 200,000건 -> 중복제거 후보 111,313건**, 수집오류 0이다. 중복제거는 lowercase DOI 우선, normalized title fallback을 사용했다. deterministic uncompressed JSONL stream SHA-256은 `1629c7b24a688e84249d77eec2cd1ce2f8b906f91187fcbed413739aef54b523`이며 artifact는 `../research/seo-demand-v2026.10.05.527/`에 버전 보존한다.

대규모 corpus 건수는 후보 레퍼런스 폭이며 모든 항목을 사람이 수동 검토했거나 모두 Moneyverse에 직접 적용된다는 뜻이 아니다. 실제 요구사항은 별도 검증한 1차 공식자료를 우선한다.

이번 회차 직접 확인한 1차자료군:

- Google people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google spam policies: https://developers.google.com/search/docs/essentials/spam-policies
- Google localized versions/hreflang: https://developers.google.com/search/docs/specialty/international/localized-versions
- Google Search Console Search Analytics API: https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- Google Ads Keyword Planner: https://support.google.com/google-ads/answer/7337243
- Naver Search Advisor SEO/content: https://searchadvisor.naver.com/guide/seo-help
- Naver DataLab: https://datalab.naver.com/
- Bing Webmaster Guidelines: https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a
- IndexNow: https://www.indexnow.org/documentation
- Core Web Vitals: https://web.dev/articles/vitals
- Schema.org DefinedTerm/DefinedTermSet: https://schema.org/DefinedTerm / https://schema.org/DefinedTermSet
- SEC Investor.gov 복리 계산기: https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator
- CFPB mortgage/loan estimate: https://www.consumerfinance.gov/owning-a-home/loan-estimate/
- IRS Tax Withholding Estimator: https://www.irs.gov/individuals/tax-withholding-estimator
- 국민연금공단/노후준비: https://www.nps.or.kr/ / https://csa.nps.or.kr/
- 한국은행: https://www.bok.or.kr/

## 24. v527 기획 완료 정의

- 국내/해외 키워드 포트폴리오 분리;
- 후보 생성과 실제 페이지 입장 분리;
- 실제 1만+ 키워드 후보 레지스트리 존재;
- 신규 독립 broad research corpus가 중복제거 10만+ 후보를 달성하거나 미달 시 정확히 기록;
- 광역 조사와 별개로 1차 공식 search/finance 자료 등록;
- 상위 통합기획에 v527 권위 연결;
- EN/KO parity;
- 시작/중간/최종 main SHA 및 docs-only 증거 기록;
- runtime/Test/Production 완료 허위 주장 없음.

구현은 별도 검토된 구현계획과 exact-SHA 릴리스 증거가 필요하다.
