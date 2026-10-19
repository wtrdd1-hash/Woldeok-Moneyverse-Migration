# v2026.10.19.922 — 검색수요 기반 내부 AI 금융 계산기 · 블로그 위젯 성장 엔진 상세 기획서

영문 정본: [AI_CALCULATOR_BLOG_WIDGET_GROWTH_ENGINE_SPEC_v2026.10.19.922.md](AI_CALCULATOR_BLOG_WIDGET_GROWTH_ENGINE_SPEC_v2026.10.19.922.md)

> 상태: PLANNING ONLY / 구현·Test·Production 완료를 의미하지 않음  
> 기준 메인: origin/main 01c34e4b08f200066eca2c35d87788e3fdfd1361  
> 기존 권위: v527 SEO 수요기획, v681 계산기→학습 기획, v719/v721/v735 AI 블로그 안전 게이트를 승계한다.  
> 핵심 원칙: 내부 AI는 수요 데이터·세법·공식 수치·검색량을 만들어내지 않는다. 실제 공급자 데이터와 검증된 공식만 사용하고, 금융/YMYL 블로그는 편집 승인 전 자동 공개하지 않는다.

## 1. 기획 목적

월덕 머니버스의 금융 계산기를 단순히 많이 만드는 것이 아니라, 실제 검색 수요가 크고 현재 사이트와 적합한 계산기만 선별해 개발하고, 각 계산기와 연결되는 고품질 블로그 글에 해당 계산기의 인터랙티브 위젯을 자동 삽입하는 성장 시스템을 구축한다.

전체 성장 루프는 다음과 같다.

실제 검색수요 수집  
→ 검색어 클러스터링  
→ 기존 19개 계산기와 중복 여부 판정  
→ 공식 출처·계산식 명세  
→ 계산기 구현  
→ 독립 골든 테스트  
→ 블로그용 위젯 등록  
→ 내부 AI 콘텐츠 브리프 생성  
→ AI 초안 생성  
→ 출처·수치·중복·SEO 자동검사  
→ 편집자 승인  
→ 공개  
→ Search Console 실제 노출/클릭 확인  
→ 개선·통합·보류·폐기

목표는 페이지 수가 아니다. 사용자가 검색해서 들어왔을 때:
1. 로그인 없이 실제 계산 결과를 얻고,
2. 결과의 의미와 가정을 이해하고,
3. 관련 글 또는 비교 시나리오를 통해 두 번째 유용한 행동을 하고,
4. 필요하면 기존 머니버스 서비스로 자연스럽게 이동하게 하는 것이 목표다.

## 2. 최신 메인 기준 현재 상태

### 2.1 기존 문서의 12대 계산기는 현재 최신 상태가 아님

2026-10-19 최신 main 01c34e4b에는 홈 듀얼 서피스와 19개 금융 계산기 카탈로그가 추가되어 있다.

현재 확인된 계산기군:
- 주식 물타기·평단가·수익률
- 배당소득세
- 해외주식 양도소득세
- 퀀트/백테스트
- 김치프리미엄
- 연금저축·IRP
- ISA
- 대출 이자
- 부동산/DSR
- 증여세
- 종합 세금
- FIRE
- 연봉 실수령액
- 청년도약계좌
- 퇴직금
- 목표자산
- 크립토 APY/APR
- 복리
- WLD 직업 파밍

따라서 신규 계산기 생성 전에 반드시 다음 상태 중 하나를 판정한다.

- EXISTING_EXACT: 이미 같은 검색 의도를 정확히 제공
- EXISTING_PARTIAL: 기존 계산기에 기능 추가가 더 적절
- MERGE_INTO_EXISTING: 별도 URL보다 기존 계산기 섹션/프리셋으로 통합
- NEW_TOOL_REQUIRED: 실제 독립 검색의도와 계산가치가 있어 새 도구 필요

검색어가 다르다는 이유만으로 계산기를 복제하지 않는다.

### 2.2 현재 블로그 인라인 위젯은 실제로 복리 계산기 하나에 고정

현재 BlogInlineCalculator는:
- 원금
- 연 수익률
- 기간
을 입력하는 복리 위젯이다.

BlogPost에는 relatedCalculatorHref와 relatedCalculatorName만 존재하고, 글 종류와 상관없이 동일 위젯을 고정 단락 위치에 넣는다.

즉:
- 세금 글인데 복리 위젯
- 대출 글인데 복리 위젯
- DSR 글인데 복리 위젯
이 들어갈 수 있는 구조다.

v922에서는 이를 폐기하지 않고 호환 레이어를 둔 상태에서, 계산기별 타입 안전 위젯 레지스트리로 확장한다.

### 2.3 AI 블로그 자동발행은 현재 의도적으로 중단 상태

현재 POST /api/blog/generate는 EDITORIAL_REVIEW_REQUIRED와 503을 반환한다.

이유:
- 출처 확인 없는 시장 수치
- 오래된 금리/환율을 최신처럼 표시
- 검증되지 않은 백테스트/몬테카를로 수치
- 실제가 아닌 조회수/성과 주장 가능성
- 중복 AI 기사
때문이다.

v922는 이 안전 게이트를 우회하지 않는다.

새 시스템도:
AI 생성 완료 ≠ 공개 완료
이다.

## 3. 검색수요 데이터 수집 설계

### 3.1 Provider A — Google Search Console

Moneyverse 자체 검색 성과를 가장 먼저 사용한다.

수집:
- query
- page
- country
- device
- date
- clicks
- impressions
- CTR
- average position

핵심 사용법:
- 이미 5~20위권에 노출되는 검색어
- 노출은 많은데 CTR이 낮은 검색어
- 특정 계산기 URL로 들어오지만 콘텐츠가 부족한 검색어
- 한국/미국/일본 등 국가별 의도 차이
를 찾는다.

사이트맵 제출·크롤링·URL Inspection은 실제 검색 유입과 별개의 증거다.

### 3.2 Provider B — Google Ads Keyword Planning Historical Metrics

검색시장 자체 수요를 검증한다.

저장할 원본 지표:
- avg_monthly_searches
- monthly_search_volumes
- competition
- competition_index
- low_top_of_page_bid
- high_top_of_page_bid
- geo target
- language
- 관측 시각

주의:
- Google Ads 검색량은 근사치다.
- 광고 경쟁도는 SEO 난이도와 동일하지 않다.
- CPC는 수익 잠재력의 참고값일 뿐 계산기 우선순위의 단독 기준이 아니다.

### 3.3 Provider C — NAVER API HUB Search Keyword Trends

2026년 네이버 검색어 트렌드 API가 NAVER API HUB로 이관된 현재 계약을 기준으로 사용한다.

수집:
- 일/주/월 검색 추이
- 검색어 그룹
- PC/모바일
- 연령
- 성별
- 기간별 상대 변화

네이버 데이터는 한국 사용자 계절성과 모바일 수요를 보는 보조 핵심 신호로 사용한다.

절대 검색량처럼 조작하거나 환산하지 않는다.

### 3.4 Provider D — 내부 사이트 데이터

각 계산기마다 다음 정보를 함께 본다.

- 현재 URL
- index/noindex
- 실제 formulaVersion
- 적용 국가/연도
- 마지막 출처 검토일
- 해당 계산기 관련 블로그 개수
- 내부링크 수
- GSC 성과
- 페이지 성능
- 사용자 계산 완료율
- 중복 URL
- 이미 존재하는 프리셋
- 광고 수익 데이터가 있다면 실제 Page RPM

## 4. 검색어·계산기 기회 점수

100점 기준 초기 설계:

- 25점: Google Ads 검증 검색수요
- 15점: 네이버 검색 트렌드와 최근 상승세
- 20점: Search Console 실제 사이트 기회
- 10점: 광고시장 상단입찰가 등 상업의도 보조지표
- 15점: 월덕 머니버스 서비스 적합도
- 10점: 인터랙티브 계산기가 텍스트보다 실제로 유용한 정도
- 5점: 계절성·정책개정·시기 적합성

감점:
- 기존 URL 카니벌라이제이션 위험 -25
- 공식 출처 유지 불가능 -25
- 금액만 바꾼 얇은 프리셋 -20
- 계산 결과가 텍스트보다 별 가치 없음 -20
- 유지보수 담당자 없음 -15
- 해결 못 하는 법률/정책 위험 -40

기본 상태:
- 75~100: BUILD_CANDIDATE
- 60~74: RESEARCH_AND_EDITORIAL_REVIEW
- 40~59: BACKLOG
- 0~39: DO_NOT_BUILD

이 점수는 순위 보장 수치가 아니라 내부 우선순위 모델이다.

## 5. 우선 신규 계산기 후보군

아래는 검색량이 많다고 단정한 목록이 아니라, 실제 API 수요검증을 먼저 돌릴 Seed Queue다.

### 5.1 한국 근로·소득

1. 실업급여 계산기
2. 주휴수당 계산기
3. 연차수당 계산기
4. 야간·연장·휴일근로수당 계산기
5. 프리랜서 3.3% 원천징수/환급 예상 계산기
6. 국민연금 예상 수령액 계산기
7. 건강보험료 계산기
8. 육아휴직 급여 계산기

이 그룹은 연봉 실수령액/퇴직금 계산기와 연관성이 매우 높으므로 별도 URL이 필요한지 먼저 판정한다.

### 5.2 세금·주거

9. 상속세 계산기
10. 부가가치세 VAT 계산기
11. 취득세 상세 계산기
12. 전세 vs 월세 비용 비교 계산기
13. LTV·DSR 대출한도 계산기
14. 종합부동산세 예상 계산기

단:
- 현재 real-estate-calculator가 해당 의도를 충분히 처리하면 새 URL 금지
- 세법 변경 추적 자동화가 없으면 index 금지 또는 교육용 표시

### 5.3 저축·부채·투자

15. 적금 만기 수령액 계산기
16. 예금 세후이자 계산기
17. 원리금 상환 Snowball vs Avalanche 부채상환 비교기
18. DCA 적립식 투자 계산기
19. 배당 재투자 DRIP 계산기
20. 인플레이션 구매력 계산기
21. 환율·환전수수료 계산기
22. 포트폴리오 리밸런싱 계산기
23. 비상금 목표 계산기
24. 순자산 계산기

기존 compound/loan/dividend/quant 계산기와 중복되면 별도 페이지가 아니라 모드 또는 섹션으로 추가한다.

### 5.4 글로벌 영어권 후보

- mortgage affordability
- debt payoff
- take-home pay
- compound interest
- DCA
- dividend/DRIP
- FIRE/SWR
- net worth
- budget 50/30/20
- business break-even

미국 세법·한국 세법을 번역만 해서 공유하는 방식은 금지한다.

## 6. CalculatorDefinition 단일 등록부

계산기별 메타데이터를 페이지 파일마다 하드코딩하지 않고 중앙 등록부로 이동한다.

필드:
- id
- canonicalPath
- intentClusterId
- displayNameByLocale
- category
- calculatorClass
- jurisdiction
- effectiveFrom
- effectiveTo
- formulaId
- formulaVersion
- inputSchema
- outputSchema
- unitPolicy
- currencyPolicy
- roundingPolicyId
- sourceSetId
- reviewedAt
- reviewDueAt
- owner
- widgetComponentKey
- allowedBlogPresets
- indexability
- sourceState
- lifecycleState

calculatorClass:
- REAL_WORLD_ESTIMATE
- EDUCATIONAL
- FICTIONAL_WLD

sourceState:
- VERIFIED_FOR_PERIOD
- REVIEW_DUE
- STALE
- ILLUSTRATIVE_ONLY
- UNKNOWN

REAL_WORLD_ESTIMATE가 STALE 또는 UNKNOWN이면:
- 법률확정 표현 차단
- 결과에 경고
- 필요 시 계산 기능 제한
- 고위험이면 noindex
로 fail-closed 처리한다.

## 7. 계산식·법령·출처 버전 관리

내부 AI가 절대 결정하면 안 되는 것:
- 세율
- 공제액
- 정부지원액
- 보험료율
- 기준금리
- 공식 환율
- 실시간 시장가격
- 연금 지급 공식
- 법정 근로수당 공식

각 formulaVersion에는 반드시:
- 1차 공식 출처
- 관할국가
- 시행일
- 종료일 또는 다음 검토일
- 계산 상수
- 반올림 정책
- 제외사항
- 독립 검증 예제
- 변경 담당자
를 둔다.

예:
salary-kr-2026-v3
gift-tax-kr-2026-v2
unemployment-benefit-kr-2026-v1

법령이 바뀌면 과거 formulaVersion을 수정하지 않고 새 버전을 만든다.

## 8. 블로그 계산기 위젯 레지스트리

### 8.1 핵심 변경

현재 BlogInlineCalculator 한 개를 CalculatorWidgetRegistry로 확장한다.

예시 widgetKey:
- compound
- salary
- loan
- dsr
- gift_tax
- dividend_tax
- capital_gains_tax
- pension_tax
- fire
- unemployment_benefit
- weekly_holiday_pay
- vat
- dca
- debt_payoff

AI는 React JSX를 직접 만들지 않는다.

AI 출력:
WidgetBinding
- widgetKey
- calculatorId
- presetId
- placement
- heading
- explanation
- sourceVersion
- initialValues
- locale

렌더러가 허용된 레지스트리에서 실제 컴포넌트를 찾는다.

### 8.2 보안

AI가 다음을 출력해도 렌더링 금지:
- script
- iframe
- 임의 HTML 이벤트 핸들러
- 외부 JS URL
- 동적 import 경로
- 사용자 입력값을 포함한 URL
- 등록되지 않은 widgetKey

### 8.3 블로그 프리셋

블로그 위젯 초기값은 공개 예제만 사용한다.

예:
- 연봉 4,000만원
- 대출 3억원, 30년, 예시금리
- 매월 50만원 적립
등.

사용자의 실제 급여/대출/세금 입력은:
- canonical URL
- OpenGraph
- JSON-LD
- analytics
- 서버 로그
에 보내지 않는다.

## 9. 블로그 위젯 배치 방식

현재처럼 두 번째 단락 뒤에 무조건 삽입하지 않는다.

블로그 본문 구조를 의미 블록으로 만든다.

- INTRO
- USER_PROBLEM
- QUICK_ANSWER
- CALCULATOR_DEMO
- HOW_IT_WORKS
- EXAMPLE
- ASSUMPTIONS
- SOURCE_NOTES
- RELATED_ACTION

기본 규칙:
CALCULATOR_DEMO 블록에 주요 위젯 1개.

예:
주휴수당 글
→ WeeklyHolidayPayWidget

증여세 글
→ GiftTaxWidget

대출상환 글
→ LoanRepaymentWidget

복리 글
→ CompoundWidget

글당 기본 1개, 비교 필요 시 보조 1개까지.

## 10. 위젯 UX 명세

모든 인라인 계산기:
- 로그인 없이 결과 제공
- 숫자 직접 입력 지원
- 슬라이더만 강제하지 않음
- 입력 단위 표시
- 예시값 표시
- 결과 aria-live
- 키보드 완전 동작
- 320px 모바일 대응
- 400% 확대 대응
- 색상만으로 의미 전달 금지
- 적용연도 표시
- 공식/가정 보기
- 풀버전 계산기로 이동
- 계산버튼과 광고 혼동 금지

결과 바로 근처에:
“예상값이며 신고/계약 전 공식자료를 확인하세요”
와 같은 위험도에 맞는 안내를 둔다.

## 11. 내부 AI 역할

### 허용

- 키워드 클러스터링
- 검색수요 데이터 요약
- 기존 계산기 중복분석
- 계산기 상세 요구사항 초안
- 테스트 케이스 제안
- 블로그 제목 후보
- 구조화된 콘텐츠 브리프
- 검증된 출처 기반 설명 초안
- 내부링크 후보
- 다국어 초안
- 중복 글 탐지
- unsupported claim 탐지
- 적절한 widgetKey 추천

### 금지

- 검색량 숫자 생성
- 세율·법률 임의 생성
- 최신 금리/환율 추정
- 실시간 시장 데이터 창작
- 가짜 리뷰·평점·별점
- 가짜 전문가 프로필
- 허위 조회수
- 순위 보장
- 대량 자동색인 페이지 생성
- 금융 글 무인 자동발행
- WLD 지급·경제정책 변경
- 실제 주문/거래

## 12. AI ContentBrief

글 생성 전 반드시 ContentBrief를 만든다.

필드:
- clusterId
- userIntent
- primaryKeyword
- secondaryKeywords
- locale
- jurisdiction
- calculatorId
- widgetKey
- formulaVersion
- sourceSetId
- approvedClaims
- forbiddenClaims
- sampleScenario
- relatedInternalLinks
- requiredDisclosure
- freshnessDeadline
- editorialRiskLevel

sourceSetId가 없으면:
SOURCE_BLOCKED
상태이며 공개 가능한 AI 글을 만들지 않는다.

## 13. AI 출력 포맷

현재처럼 긴 임의 Markdown 문자열 하나만 저장하지 않고 구조화한다.

BlogDraft:
- title
- excerpt
- searchIntentAnswer
- blocks[]
- citations[]
- widgetBindings[]
- assumptions[]
- riskFlags[]
- metaTitle
- metaDescription
- tags[]
- relatedLinks[]
- aiDisclosure
- locale

허용 blockType:
- paragraph
- heading
- list
- table
- formula
- quote
- image_reference
- widget_slot
- source_note

임의 HTML/script/style은 거부한다.

## 14. 글 자동생성 상태 머신

DEMAND_DISCOVERED
→ CLUSTERED
→ GAP_ANALYZED
→ SPEC_REQUIRED
→ SOURCE_VERIFIED
→ CALCULATOR_IMPLEMENTED
→ GOLDEN_TEST_PASS
→ WIDGET_REGISTERED
→ CONTENT_BRIEF_READY
→ AI_DRAFTED
→ AUTOMATED_QA_PASS
→ FACT_CHECKED
→ EDITOR_APPROVED
→ PUBLISH_READY
→ PUBLISHED
→ INDEX_OBSERVED
→ PERFORMANCE_REVIEW
→ OPTIMIZE / MERGE / HOLD / RETIRE

중요:
AI_DRAFTED 상태에서는 공개 URL이 생기면 안 된다.

PUBLISHED와 INDEX_OBSERVED도 다르다.

## 15. 기존 /api/blog/generate 개편

현재 503 hold 유지.

향후 구현 시 역할을:
“게시 API”
가 아니라
“초안 생성 API”
로 바꾼다.

POST /admin/blog/drafts/generate

필수:
- 관리자 또는 승인 scheduler
- ContentBrief
- sourceSetId
- calculatorId
- widgetKey
- locale
- idempotency key

응답:
- draftId
- QA 상태
- 출처 상태
- 중복도
- riskFlags

절대 반환하면 안 되는 의미:
“게시 성공”

게시 API는 별도로 둔다.

POST /admin/blog/drafts/:id/publish

## 16. AI 금융 글 품질 기준

계산기 관련 글은 최소 다음을 포함한다.

1. 사용자의 구체적인 질문
2. 3~5문장 이내 빠른 답변
3. 올바른 인라인 계산기
4. 계산식 설명
5. 최소 1개 재현 가능한 예시
6. 결과를 바꾸는 주요 변수
7. 적용연도·관할
8. 공식 출처
9. 한계·주의
10. 풀버전 계산기 링크

단순히 계산기 페이지 설명을 길게 복사하면 실패.

금액만 바꾼 글 100개 생성 금지.

예:
“연봉 3000 실수령액”
“연봉 3100 실수령액”
“연봉 3200 실수령액”
을 각각 얇은 글로 자동 생성하지 않는다.

대신:
연봉 계산기 본체 + 유용한 구간표/프리셋으로 처리한다.

## 17. SEO 구조

### 17.1 Calculator Canonical

하나의 실제 검색의도에 대표 계산기 URL 하나.

프리셋 URL index 조건:
- 검색 의도 독립성
- 실제 수요
- 독자적 설명 가치
- 중복 없음
- 출처/가정 차이
- 편집 승인

조건이 부족하면:
canonical parent 또는 noindex.

### 17.2 계산기 ↔ 블로그

계산기:
- 계산이 주 목적
- 핵심 설명
- 출처
- 관련 글 2~5개

블로그:
- 왜/어떻게/비교 설명
- 인라인 계산
- 공식/출처
- 풀 계산기 CTA

양방향 Topic Cluster를 만든다.

### 17.3 구조화 데이터

반드시 제거/금지할 허위 요소:
- 실제 리뷰가 없는 AggregateRating
- 임의 4.9 별점
- 생성된 reviewCount
- 화면에 없는 후기

Breadcrumb는 실제 구조와 일치할 때 사용.

BlogPosting:
- visible title
- publishedAt
- modifiedAt
- 실제 author 표시
- AI 생성/검수 고지
와 일치해야 한다.

FAQ schema는 검색노출 핵심 전략으로 쓰지 않는다.

### 17.4 Google 색인

Google Indexing API를 일반 계산기/블로그 색인 API로 사용하지 않는다.

계산기·블로그:
- 정상 sitemap
- Search Console
- 내부링크
- crawl/index 검증
을 사용한다.

“전송 성공”
≠
“색인 성공”
≠
“순위 상승”
이다.

## 18. 데이터 모델 제안

### SeoKeywordObservation
- provider
- clusterId
- keyword
- locale
- jurisdiction
- metricsJson
- observedAt
- periodStart
- periodEnd
- status

### SeoKeywordCluster
- id
- canonicalIntent
- locale
- jurisdiction
- lifecycle
- assignedCalculatorId

### CalculatorDefinition
- 6장 정의 필드

### CalculatorFormulaVersion
- calculatorId
- formulaVersion
- constantsJson
- roundingPolicy
- effectiveFrom
- effectiveTo
- sourceSetId
- approval

### SourceEvidence
- sourceSetId
- sourceType
- URL
- title
- effectiveDate
- retrievedAt
- contentHash
- reviewer

### CalculatorWidgetManifest
- widgetKey
- calculatorId
- componentVersion
- allowedPresets
- inputSchemaVersion

### ContentBrief
- clusterId
- calculatorId
- sourceSetId
- approvedClaims
- forbiddenClaims
- locale
- status

### BlogDraftRevision
- draftId
- briefId
- modelVersion
- promptTemplateVersion
- structuredOutput
- QA flags
- createdAt

### BlogWidgetBinding
- post/draft id
- widgetKey
- calculatorId
- presetId
- componentVersion

### PublicationAudit
- postId
- approvedBy
- approvedAt
- sourceSetId
- formulaVersion
- release SHA

### SeoPerformanceSnapshot
- query/page/date/country/device
- clicks
- impressions
- CTR
- position
- fetchedAt

## 19. 관리자 화면

기존 /admin/seo와 /admin/blog를 확장한다.

### /admin/seo — 계산기 기회

테이블:
- 검색어 클러스터
- locale
- Google 검색량
- 네이버 추세
- GSC 현재 노출
- 현재 평균순위
- CPC 보조값
- 기존 계산기
- 중복 위험
- source risk
- opportunity score
- 상태

버튼:
- 증거 보기
- 기존 계산기에 합치기
- 신규 계산기 상세기획 생성
- 보류
- 제외

AI가 자동으로 “개발 시작”하지 않고 관리자 결정 후 다음 상태로 이동한다.

### /admin/calculators

표시:
- formulaVersion
- 적용연도
- 출처 상태
- 다음 검토일
- 위젯 등록상태
- 골든 테스트 상태
- index 상태
- 관련 블로그 수

### /admin/blog

표시:
- Draft
- 대상 검색어
- 대상 계산기
- 위젯 미리보기
- 출처 목록
- AI 생성 모델
- unsupported claims
- 중복율
- 번역 상태
- approve
- reject
- request changes
- publish

생성과 게시를 완전히 분리한다.

## 20. API 상세 후보

조회:
- GET /admin/seo/calculator-opportunities
- GET /admin/seo/calculator-opportunities/:id
- GET /admin/calculators/:id/source-status
- GET /admin/blog/drafts
- GET /admin/blog/drafts/:id

작업:
- POST /admin/seo/calculator-opportunities/refresh
- POST /admin/seo/calculator-opportunities/:id/create-brief
- POST /admin/blog/drafts/generate
- POST /admin/blog/drafts/:id/run-qa
- POST /admin/blog/drafts/:id/approve
- POST /admin/blog/drafts/:id/reject
- POST /admin/blog/drafts/:id/publish

필수 공통:
- 관리자 인증
- 브라우저 요청 CSRF
- rate limit
- idempotency
- audit
- 상태 전이 검증
- 결과불명 처리

## 21. 자동 스케줄

### 매일
- GSC 신규 데이터 수집
- 고노출/저CTR 검색어 발견
- stale source 확인
- 신규 demand candidate 점수 갱신

### 매주
- NAVER 검색트렌드 갱신
- 신규 키워드 클러스터링
- 기존 계산기 중복/카니벌라이제이션 검사

### 매월
- Google Ads historical metrics 갱신
- 계산기 기회 우선순위 전체 재산정
- 검색량 하락/상승 분석

### AI 초안
- 승인된 ContentBrief만
- 일일 생성량 제한
- 동일 검색의도 중복 생성 금지

### 게시
자동 초안 스케줄러와 분리.

금융/YMYL은 편집 승인 없는 자동 게시 금지.

## 22. Search Console 피드백 루프

게시 후:
7일
14일
28일
56일
단위로 성과를 본다.

판단:
- impressions 0: crawl/index/content/intent 확인
- impressions 증가, position 20+: 콘텐츠·내부링크·의도 mismatch
- position 4~15 + CTR 낮음: title/snippet 개선 후보
- article 노출 있지만 calculator 클릭 없음: 위젯/CTA 분석
- calculator 노출 있지만 result completion 낮음: UX/공식/입력 복잡도 분석
- 여러 URL이 같은 query 경쟁: merge/canonical 후보

28일 데이터가 적다고 실패로 즉시 삭제하지 않는다.

## 23. 사용자 분석 이벤트

허용:
- calculator_start
- calculator_valid_result
- assumptions_opened
- comparison_used
- blog_widget_visible
- blog_widget_interaction
- full_calculator_from_article
- second_useful_action

금지:
- 실제 연봉
- 실제 대출금
- 실제 세금
- 실제 잔액
- 사용자 자산 값
- 개인식별정보
를 analytics payload에 저장.

## 24. 테스트

### 계산식
- 독립 골든 케이스
- 0
- 음수
- 최대값
- 소수점
- 반올림
- 날짜경계
- 시행일 변경
- 잘못된 locale
- currency mismatch
- fuzz/property test

### 위젯
- widgetKey 매핑
- 잘못된 preset 차단
- 입력 clamp
- 키보드
- 스크린리더
- 320/360/390/430px
- 200/400% zoom
- aria-live
- 개인정보 URL 미노출

### AI 블로그
- sourceSet 없는 생성 차단
- 허용되지 않은 수치 flag
- stale source flag
- 임의 HTML/JS reject
- duplicate article 차단
- AI disclosure
- 올바른 widgetKey
- generation 성공이 publication이 아님
- editorial hold 보존

### SEO
- canonical
- hreflang
- sitemap
- noindex
- structured data
- 허위 rating 0
- 제출/색인/검색실적 상태 구분

## 25. 성능

인라인 위젯은 블로그마다 전체 19개 계산기 코드를 번들하지 않는다.

방법:
- widget registry code splitting
- 필요한 위젯만 lazy load
- 기본 HTML에는 설명/예시 결과의 서버 렌더링 가능한 핵심 제공
- hydration 후 인터랙션

목표:
- 위젯 하나 추가로 페이지 전체 JS 폭증 금지
- CLS 방지용 최소 높이
- 광고 로딩과 결과 UI 충돌 금지

CWV 목표는 실측:
- LCP p75 ≤ 2.5s
- INP p75 ≤ 200ms
- CLS p75 ≤ 0.1
를 목표로 하되 실제 운영 수치로 검증한다.

## 26. 첫 구현 순서

### Phase A — 진실성 정리
1. 문서 12대 → 실제 19대 불일치 정정
2. 19개 계산기 inventory 확정
3. formula/source 상태 조사
4. 가짜 별점/리뷰 구조화데이터 감사
5. AI 블로그 hold 유지

### Phase B — 수요 엔진
6. GSC adapter
7. Google Ads keyword metrics adapter
8. NAVER API HUB adapter
9. provider observation 저장
10. keyword cluster
11. opportunity score
12. /admin/seo 계산기 기회 UI

### Phase C — 위젯
13. CalculatorWidgetRegistry
14. 기존 복리 위젯을 registry 1번으로 이전
15. SalaryWidget
16. LoanWidget
17. DsrWidget
18. GiftTaxWidget
19. DividendTaxWidget
20. 블로그 semantic renderer

### Phase D — AI
21. ContentBrief
22. source-grounded prompt
23. structured draft
24. unsupported claim scanner
25. duplicate scanner
26. 관리자 preview
27. approve/reject
28. 별도 publish

### Phase E — 1차 SEO 실험
신규 계산기를 바로 20개 만들지 않는다.

기존 계산기 3개를 먼저 선정:
- 연봉
- 대출/DSR
- 증여세 또는 복리

각각:
- 정확성 개선
- 올바른 위젯
- 관련 고품질 글 1편
- 양방향 링크
- 28일 계측

### Phase F — 신규 계산기
그 후 실제 수요점수 1위부터 하나씩.

첫 신규 후보는:
실업급여 / 주휴수당 / 국민연금 / VAT / 상속세 / 전월세비교
중 실제 데이터 점수가 가장 높은 것.

## 27. 블로그 예시 흐름

예시: “2026 실업급여 계산 방법”

1. 검색수요 evidence 확보
2. unemployment-benefit-calculator 신규 gap 승인
3. 고용보험 공식 출처 sourceSet 생성
4. formulaVersion 생성
5. golden tests
6. calculator 공개 준비
7. widgetKey unemployment_benefit 등록
8. AI ContentBrief 생성
9. AI가:
   - 지급기간 의미
   - 입력값
   - 계산 예시
   - 주의
   - 공식출처
   구조로 초안 생성
10. 본문 CALCULATOR_DEMO 위치에 위젯 binding
11. 자동 QA
12. 편집 승인
13. Test exact SHA
14. 운영승격
15. sitemap 포함
16. GSC 실제 노출 관측

## 28. 장애·실패 처리

Google Ads API 실패:
- 기존 값을 current처럼 사용 금지
- STALE 표시
- opportunity score 일부 unavailable

NAVER 실패:
- Google 데이터만으로 임시점수 계산 가능하나 provider coverage 표시

GSC 실패:
- site-specific opportunity 알 수 없음
- 신규 대량 생성 금지

AI 모델 실패:
- draft FAILED
- 기존 승인 콘텐츠 유지
- 사용자 페이지 영향 없음

Source stale:
- 해당 계산기 경고
- 새 AI 글 생성 중지
- 위험도에 따라 noindex/기능 제한 검토

Widget import 실패:
- 설명 콘텐츠와 풀 계산기 링크 fallback
- 빈 화면 금지

게시 결과 불명:
- 중복 POST 금지
- publication audit로 실제 상태 확인 후 재시도

## 29. 보안·권한

내부 AI는:
- DB direct write 권한 최소화
- publish 권한 없음
- Production shell 권한 없음
- WLD 권한 없음
- financial transaction 권한 없음

AI 워커가 필요한 것은:
- 승인된 provider read
- 승인된 source packet
- draft write
정도로 제한한다.

Secret:
- Google Ads
- GSC
- NAVER API HUB
- internal model
은 브라우저로 노출 금지.

## 30. 다국어

문서 정책:
1. English canonical
2. Korean second language

서비스 콘텐츠는 locale별 실제 검색 의도와 관할이 다르다.

영문 계산기:
한국어 계산기를 직역해서 생성 금지.

예:
KR salary calculator와 US take-home pay calculator는 같은 family일 수 있지만 formulaVersion과 sourceSet은 독립.

한국어 article에 미국 계산 위젯이 자동 삽입되지 않도록:
locale + jurisdiction + calculatorId
3개를 같이 검증한다.

## 31. 내부 업데이트 지표

v922 구현 이후 관리자 화면에서 최소 다음을 볼 수 있어야 한다.

- 총 keyword clusters
- verified demand clusters
- existing calculator coverage
- calculator gaps
- source verified calculators
- stale calculators
- widget-ready calculators
- AI drafts
- QA pass drafts
- editor approved
- published
- indexed evidence
- GSC clicks
- article→calculator CTR
- second useful action rate

“AI가 N개 글 생성”
자체는 KPI가 아니다.

## 32. v922 수용 기준

기획 수용:
- 최신 19대 기준 반영
- 검색 공급자 계약 정의
- 계산기 중복 방지
- formula/source 버전
- typed widget
- 내부 AI 권한
- 편집 승인
- SEO
- analytics
- 테스트
- rollout
가 문서화되면 완료.

기능 하나의 개발 완료는 별도다.

계산기+블로그 1쌍 완료 기준:
- 실검색 evidence 저장
- formula source 검증
- golden test PASS
- 실제 계산기 작동
- widget 등록
- 관련 글 출처 포함
- 자동 QA PASS
- 편집 승인
- branch CI PASS
- exact SHA Test PASS
- 관리자/공개 UI 검증
- 프로젝트 운영승격 절차 통과
- Production health 확인
- 이후 GSC 성과는 관찰값으로 기록

## 33. v922에서 즉시 하지 않는 것

- DB 변경
- 런타임 코드 변경
- 검색량 임의 생성
- 신규 계산기 20개 자동생성
- AI 블로그 자동 게시
- Google 색인 강제 주장
- 운영승격
- Production WLD/원장 변경
- 기능스위치 변경

이번 v922는 구현 전에 충돌 없는 설계를 확정하는 상세 기획 단계다.

## 34. 핵심 결론

가장 중요한 구현 방향은 “AI로 글 많이 만들기”가 아니다.

정확한 방향은:

**실제 검색수요를 API로 측정  
→ 기존 19개 계산기를 우선 활용  
→ 부족한 계산기만 만든다  
→ 공식 계산식과 출처를 버전 관리한다  
→ 각 계산기를 블로그용 안전 위젯으로 등록한다  
→ 내부 AI는 검증된 자료만 받아 글 초안을 만든다  
→ 자동 QA와 사람 편집 승인을 통과한다  
→ 검색에 공개한다  
→ GSC 실제 성과로 다음 계산기를 결정한다.**

이 방식이면 검색량이 큰 계산기, 블로그 콘텐츠, 내부 AI, SEO, 광고수익을 하나의 품질 관리 성장 루프로 연결할 수 있다.
