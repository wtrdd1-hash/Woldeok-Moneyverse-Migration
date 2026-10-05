# Moneyverse SEO 수요·키워드 조사 검토 — v2026.10.05.527

상태: RESEARCH / 기획 입력  
기준일: 2026-10-05  
시작·중간 `origin/main`: `5318213f1eca644c7f36df7d967a53092de0814c`  
기획 권위: `docs/planning/SEO_DEMAND_KEYWORD_EXPANSION_SPEC.ko.md`

## 1. 조사 질문

Moneyverse가 저가치 대량콘텐츠, 오래된 금융수치, locale 중복, 사용자로 이어지지 않는 검색트래픽을 피하면서 국내·해외 자연검색 커버리지를 크게 늘리려면 어떻게 해야 하는가?

결론은 “페이지를 더 많이 만든다”가 아니다. 후보 검색공간은 공격적으로 넓히되 실제 게시는 실측수요, 독립 유용성, 콘텐츠/출처 품질, 현지화 준비도, 카니벌라이제이션 통제, downstream 제품가치로 좁혀야 한다.

## 2. 현재 저장소 기준선

exact-main 소스 직접 확인 결과 이미 SEO 구현면이 크다.

관측된 소스 인벤토리:

- 금융 용어집 50개;
- 자동생성 연봉 금액구간 50개;
- 명시적 대출 pSEO 프리셋 34개;
- 배당 ticker 44개;
- 양도세 프리셋 11개;
- 부동산 프리셋 11개;
- 김치프리미엄 프리셋 11개;
- 다수 공개 계산기/도구 family 및 다국어 용어집 route.

최근 main에도 대출/배당 pSEO, 50개 용어집 hub, locale 용어집 경로가 추가됐다.

따라서 다음 SEO 기획층은 프리셋 수 증가보다 **어떤 검색의도가 독립 URL을 가질 자격이 있는가**를 통제해야 한다.

## 3. 신규 독립 10만+ discovery corpus

v527을 위해 기존 v507/v510과 별개의 Crossref REST API 조사 회차를 새로 실행했다.

방법:

- 질의 lane 40개;
- lane당 raw 5,000건;
- 발행기간 2010-01-01~2026-10-05;
- raw 목표/결과 200,000건;
- DOI lowercase 우선 중복제거;
- DOI가 없을 때 normalized-title fallback;
- network/query 오류 0;
- 중복제거 후보 **111,313건**;
- deterministic uncompressed JSONL stream SHA-256: `1629c7b24a688e84249d77eec2cd1ce2f8b906f91187fcbed413739aef54b523`.

이번 버전에 함께 보존한 조사 artifact:

- `docs/research/seo-demand-v2026.10.05.527/crossref-manifest.json`;
- `docs/research/seo-demand-v2026.10.05.527/crossref-sample.csv`;
- `docs/research/seo-demand-v2026.10.05.527/crossref-unique-111313.jsonl.gz`.

40개 lane:

1. search engine optimization;
2. web search information retrieval;
3. search query intent;
4. keyword research/search marketing;
5. programmatic SEO/web content;
6. web crawling/indexing;
7. canonical URL/duplicate content;
8. XML sitemap/search engine;
9. multilingual IR;
10. cross-lingual IR;
11. website localization/search;
12. machine translation quality/web;
13. content quality/ranking;
14. web spam detection/search;
15. search ranking/relevance;
16. search CTR;
17. snippets/metadata;
18. structured data/semantic search;
19. knowledge graph/search;
20. web performance/UX;
21. Core Web Vitals;
22. mobile search/usability;
23. accessibility/content;
24. personal-finance education;
25. financial-literacy digital tools;
26. consumer financial calculators;
27. retirement-planning calculators;
28. compound interest/financial education;
29. mortgage/loan calculators;
30. investment education/simulators;
31. behavioral economics/saving;
32. conversion-rate optimization;
33. digital-product retention;
34. online-ad measurement;
35. invalid traffic/ad fraud;
36. privacy/consent/digital advertising;
37. financial decision-support tools;
38. household budgeting/saving;
39. international digital marketing/localization;
40. search analytics/web measurement.

### 해석 경계

**111,313건은 광역 discovery 후보 수**다. 111,313개 논문을 사람이 모두 정독했다거나 전부 직접 SEO 자료라는 뜻이 아니다. Crossref 검색은 의도적으로 폭넓다.

실제 구현규칙은 아래의 별도 검증된 1차 공식자료와 exact 저장소 증거에서 채택한다.

## 4. 실제 키워드 후보 레지스트리

국내·영어권의 curated seed와 intent modifier로 별도 deterministic 후보 레지스트리를 만들었다.

결과:

- 총 후보 **10,473개**;
- 한국어 **6,207개**;
- 영어 **4,266개**;
- 국내 cluster 13개;
- 영어 cluster 12개;
- registry SHA-256: `4e85672667970b41a33222b7005215ef630900daa935674cb8b7f21fcf901b79`.

artifact:

- `docs/findings/SEO_DEMAND_KEYWORD_REGISTRY_v2026.10.05.527.csv`;
- `docs/findings/SEO_DEMAND_KEYWORD_REGISTRY_v2026.10.05.527.manifest.json`.

모든 행은 의도적으로 `UNVALIDATED_CANDIDATE`, `HOLD_UNTIL_EVIDENCE` 상태다.

이 레지스트리를 검색량 실측자료라고 주장하지 않는다. 이후 GSC, Keyword Planner, Naver, 시장별 native research로 검증할 통제된 discovery universe다.

## 5. 직접 채택 검색 근거

### Google people-first content

Google은 검색순위 조작보다 사람에게 도움되는 신뢰할 수 있는 정보를 우선하도록 ranking system을 설계한다고 설명한다.

채택:
- useful result first;
- 원본 계산·설명·데이터·시뮬레이션;
- page-count KPI 금지;
- family/표본 단위 품질검토.

https://developers.google.com/search/docs/fundamentals/creating-helpful-content

### Google spam policies

현재 정책은 doorway abuse, keyword stuffing, machine-generated traffic, scaled content abuse를 명시한다.

채택:
- 후보 키워드 조합을 자동으로 페이지화하지 않는다;
- 비슷한 금액/지역/locale 페이지는 병합하거나 preset으로 둔다;
- Google SERP 자동 스크래핑/rank query를 사용하지 않는다;
- 검색조작은 release blocker다.

https://developers.google.com/search/docs/essentials/spam-policies

### Google 다국어

Google은 locale별 대체 페이지 관계를 명시할 수 있도록 hreflang 방식을 제공하고, 페이지 언어 자체는 본문을 알고리즘으로 판별한다고 설명한다.

채택:
- explicit locale URL 안정성;
- 실제 동등문서에만 reciprocal hreflang;
- template-only 번역 제외;
- 혼합/stale 번역 noindex 및 sitemap/hreflang 제외.

https://developers.google.com/search/docs/specialty/international/localized-versions

### Google Search Console Search Analytics API

query/page/country/device 등 분할이 가능하지만 내부 제한 때문에 모든 행 반환을 보장하지 않는다.

채택:
- 실제 Moneyverse Google 성과용;
- 없는 행을 시장수요 0으로 해석하지 않음;
- 시장 전체 검색량 대체 금지.

https://developers.google.com/webmaster-tools/v1/searchanalytics/query

### Google Ads Keyword Planner

seed/웹사이트에서 키워드 아이디어를 찾고 예상 월검색량·비용/forecast 정보를 제공한다.

채택:
- 명시 공급자 기반 시장수요 estimate;
- market/language/period/observedAt 저장;
- 추정치가 live site 성과를 덮어쓰지 않음.

https://support.google.com/google-ads/answer/7337243

### Naver Search Advisor

네이버는 콘텐츠를 정확히 대표하는 고유 title/description을 권장하며 관련 없는 인기키워드, 반복 키워드, spam성 나열을 경고한다.

채택:
- 국내 metadata/query 검증 별도;
- title/description/footer 키워드 나열 금지;
- 고유 title/H1/body + 실제 유용성 필수.

https://searchadvisor.naver.com/guide/seo-help  
https://searchadvisor.naver.com/guide/content-basic  
https://searchadvisor.naver.com/guide/markup-content

### Naver DataLab

검색어트렌드는 주제어/하위검색어와 기기·성별·연령 등의 필터를 제공한다.

채택:
- 상대 trend evidence;
- 정확한 월검색량이라고 표시하지 않음;
- privacy-safe aggregate 수준에서만 demographic/device 기획.

https://datalab.naver.com/

### Bing Webmaster Guidelines

현재 Bing 가이드는 discovery/crawl/index accuracy/URL consolidation/content clarity/trust 같은 SEO 기본을 Bing Search뿐 아니라 Copilot grounding/citation 자격에도 연결한다.

채택:
- 해외 SEO를 Google만으로 보지 않는다;
- sitemap/internal link/IndexNow 정확성;
- semantic clarity/freshness를 Search+AI discovery 자산으로 관리.

https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a

### Core Web Vitals

75th percentile 권장 기준은 LCP <= 2.5초, INP <= 200ms, CLS <= 0.1이다.

채택:
- pSEO 확장이 모바일 UX/성능을 해치면 안 됨;
- 광고가 계산결과를 밀거나 큰 layout shift를 만들면 안 됨.

https://web.dev/articles/vitals

### Schema.org 용어 의미모델

`DefinedTerm`과 `DefinedTermSet`은 정식 용어와 용어집 집합을 표현한다.

채택:
- glossary 의미관계에는 유용;
- Google rich-result 존재를 의미하지 않음;
- Google 지원 search feature는 별도 확인.

https://schema.org/DefinedTerm  
https://schema.org/DefinedTermSet

## 6. 직접 채택 금융도구 근거

### SEC Investor.gov

Investor.gov 복리계산기는 초기투자금, 정기납입, 기간, 추정이율, 복리주기를 명시적 입력으로 사용한다.

채택:
- 입력값/가정을 명확히 노출;
- “보장수익” 정적 문구보다 user-controlled scenario;
- 설명 + interactive tool 결합.

https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator

### 미국 CFPB

CFPB mortgage 자료는 loan amount, term, interest, principal/interest와 broader affordability를 구분하고 대출가능액과 감당가능액이 다른 질문이라고 설명한다.

채택:
- 수학적 월상환액과 생활재무 affordability를 구분;
- 국가별 대출주장은 해당 국가 공식권위 필요;
- personalized advice처럼 보이지 않도록 가정·비용 명시.

https://www.consumerfinance.gov/owning-a-home/loan-estimate/  
https://www.consumerfinance.gov/ask-cfpb/how-can-i-figure-out-if-i-can-afford-to-buy-a-home-and-take-out-a-mortgage-en-118/

### 미국 IRS

IRS는 Tax Withholding Estimator를 운영하며 법 변경을 반영해 업데이트한다.

채택:
- tax calculator에 jurisdiction/effective-date/version;
- stale rule warning/noindex/disable;
- 국가별 세법을 “global” 계산기에 재사용 금지.

https://www.irs.gov/individuals/tax-withholding-estimator  
https://www.irs.gov/payments/tax-withholding

### 한국 공식기관군

직접 source registry는 최소 다음을 우선한다.

- 국민연금공단: 국민연금 가정/노후준비;
- 한국은행: 통화·통계;
- 국세청/재정당국: 세법·세액계산 근거;
- 국민건강보험공단: 건강·장기요양 보험;
- 금융위원회/금감원: 대출·신용정책.

기관명만 적는 것이 아니라 실제 구현공식마다 exact URL과 시행일을 저장한다.

예:
- https://www.nps.or.kr/
- https://csa.nps.or.kr/
- https://www.bok.or.kr/

## 7. 국내 기획 결론

기존 고유용성 기능을 중심으로 다음 P0 검색의도를 먼저 깊게 만든다.

1. 연봉/실수령액/근로수당;
2. 예금/적금/세후이자;
3. 대출상환/DSR/상환방식 비교;
4. 배당/세후배당/재투자;
5. 은퇴/FIRE;
6. 부동산 거래/전월세 의사결정;
7. 순자산/예산/저축률.

성장단위는 **문자열 키워드가 아니라 task cluster**다.

예를 들어 “대출”은 상환계산기, DSR 설명, 상환방식 비교, 관련용어를 한 정보구조로 묶고 거의 같은 doorway 페이지 수십 개로 분해하지 않는다.

## 8. 해외 기획 결론

영어 P0:

1. compound interest / savings;
2. investment growth / DCA;
3. FIRE / Coast FIRE / SWR;
4. dividend / DRIP;
5. loan / debt payoff;
6. mortgage / affordability;
7. paycheck / take-home pay;
8. net worth / budget;
9. business break-even / margin / runway.

영어에서 성공한 family가 일본어 native-intent research의 근거가 되며 DE/FR/ES/pt-BR은 locale 하나씩 확장한다.

## 9. Programmatic SEO 결론

올바른 흐름:

`큰 후보 universe -> evidence -> intent clustering -> canonical decision -> value/source gate -> 제한 게시 -> 측정 -> 확장/병합/퇴출`.

잘못된 흐름:

`큰 keyword list -> 행마다 생성페이지 -> sitemap`.

금액 × 금리 × 기간 numeric long-tail은 실제 수요와 실질적 결과/설명 차이가 입증되지 않으면 별도 URL보다 preset으로 처리할 가능성이 높다.

## 10. 검색→사용자 결론

트래픽만 늘어나는 것은 성공이 아니다.

모든 검색 family는 다음을 측정한다.

`impression -> click -> useful result -> second useful action -> signup(optional) -> activation -> D1/D7/D30 -> qualified pageviews/ad economics`.

아직 병합되지 않은 v525 search-to-user growth loop를 수정하지 않으면서도 이후 합성 가능하다.

## 11. 현재 방향에서 확인된 위험

- 금융/pSEO surface 확장이 통합 source/effective-date registry보다 빠르다;
- 숫자형 preset이 config 등록만으로 색인되면 duplicate/cannibalization 가능성이 있다;
- 금융문구가 source freshness보다 더 권위 있게 들릴 수 있다;
- locale route 존재가 target-language 본문 parity를 보장하지 않는다;
- 큰 용어집도 계산기/가이드/entity 연결이 없으면 thin해질 수 있다;
- synthetic/fallback analytics를 live처럼 보면 검색성과를 과장할 수 있다;
- page-count growth가 crawl quality, 유지비용, spam-policy 위험을 높일 수 있다.

v527은 이를 admission/evidence/retirement gate로 전환한다.

## 12. 조사 결론

사용자가 요청한 “10만개 정도 레퍼런스” 목표는 이번 회차의 신규 광역 discovery corpus에서 **raw 200,000건 / 중복제거 후보 111,313건**으로 충족했다. 이 숫자를 확실성으로 오용하지 않는다.

실제 기획자산은 다음의 조합이다.

- 111,313건 broad research corpus;
- 최신 Google/Naver/Bing 1차 검색정책;
- 공식 금융도구 레퍼런스 패턴;
- exact-main Moneyverse 소스 인벤토리;
- 실제 10,473개 keyword candidate registry;
- 엄격한 게시·출처신선도·현지화·카니벌라이제이션·전환 gate.

이 조합을 v527 상세명세와 상위 통합기획 권위에 반영한다.
