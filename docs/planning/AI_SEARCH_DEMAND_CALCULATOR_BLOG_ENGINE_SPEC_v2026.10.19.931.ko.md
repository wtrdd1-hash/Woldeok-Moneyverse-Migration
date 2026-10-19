# 내부 AI 검색수요 기반 금융 계산기·블로그 위젯 성장 엔진 기획서 — v2026.10.19.931

**한국어 번역본** | [English canonical](AI_SEARCH_DEMAND_CALCULATOR_BLOG_ENGINE_SPEC_v2026.10.19.931.md)  
**상태:** PROPOSED / PLANNING ONLY / 구현·Test·운영 미반영  
**기준 main:** `74d98ca58db9201a187dd6f20107e32393358684` (2026-10-19 KST)  
**목표:** 실제 검색수요를 근거로 신규 계산기 후보를 선정하고, 월덕 머니버스 내부 AI가 각 계산기의 설명·예시·FAQ·관련 블로그 초안을 만들며, 동일 계산 로직을 블로그 안의 인터랙티브 위젯으로 재사용하는 “계산기 → 검색 유입 → 블로그 학습 → 계산 실행 → 가입/재방문” 성장 루프를 구축한다.

---

## 0. 결론

이번 기능은 “AI가 키워드를 보고 글을 무한 생성하는 자동 SEO 공장”으로 만들면 안 된다. 현재 소스의 AI 블로그 자동발행은 과거 출처 미검증 수치, 제목 중복, 사실성 문제 때문에 `/api/blog/generate`가 `EDITORIAL_REVIEW_REQUIRED` 503으로 fail-closed 상태다. 이 안전 경계는 유지한다.

새 시스템은 다음 4계층으로 설계한다.

1. **Demand Intelligence**: GSC·네이버·내부 검색·도구 사용 데이터로 검색수요 후보를 수집하고 내부 AI가 군집화·의도분류·기회점수를 계산한다.
2. **Calculator Registry**: 계산 수식, 적용 국가/연도, 공식 출처, 입력/출력 스키마, 검증 테스트를 하나의 계산기 레지스트리로 관리한다.
3. **Widget Renderer**: 계산기 전체 페이지와 블로그 인라인 위젯이 같은 계산 코어를 사용한다. 블로그는 계산기를 복제 구현하지 않는다.
4. **Editorial AI**: 내부 AI는 기사 초안을 작성하되, 공식 출처·기준일·계산 테스트·중복 검사·편집 승인 전에는 공개하지 않는다.

**1차 개발 대상은 새 계산기 6개를 무조건 만드는 것이 아니라, 검색 데이터로 매주 재점수화한 뒤 상위 후보 중 현재 없는 계산기부터 3~5개를 선택하는 방식**으로 한다.

---

## 1. 현재 코드·문서에서 확인한 출발점

### 1.1 이미 존재하는 계산기
현재 `frontend/src/app/tools`에는 다음 계열이 있다.

- 연봉 실수령액
- 대출 이자
- 복리
- 증여세
- 양도소득세
- 배당세
- ISA
- 연금/은퇴
- FIRE
- 청년도약계좌
- 주식 평단가·수익률
- 부동산
- 가상자산 APY
- 김치프리미엄
- 목표자산
- 세금
- 퀀트 스튜디오 등

따라서 신규 개발은 중복 계산기를 늘리는 방식이 아니라 **기존 계산기 강화 + 검색수요 공백 계산기 추가**로 진행한다.

### 1.2 블로그 위젯
`frontend/src/components/blog/blog-inline-calculator.tsx`에는 복리 계산기용 인라인 위젯이 이미 존재한다. 그러나 현재 구조는 원금·이율·기간 3개 입력에 고정되어 있어 대출, 세금, DSR, 퇴직금, 연금 등으로 일반화하기 어렵다.

### 1.3 AI 블로그
`frontend/src/app/api/blog/generate/route.ts`는 현재 자동 금융글 발행을 차단한다. 기존 검토 문서에서 AI 글 171편 중 제목 중복과 출처/시점 미검증 사례가 발견됐다. 새 기능은 이 API를 단순 재활성화하지 않는다.

### 1.4 SEO 측정
DB에는 `seo_gsc_credentials` 1개 구성이 존재하고 `seo_crawler_logs`가 있다. 자격증명 값 자체는 앱 밖으로 노출하지 않는다. 기존 v688/v860 설계의 “노출/클릭/색인/접수 구분”을 그대로 따른다.

---

## 2. 핵심 제품 목표와 비목표

### 목표
- 검색량과 실제 노출 가능성이 높은 계산기 주제를 정량 점수로 선정
- 이미 있는 계산기를 우선 개선하여 빠르게 검색 의도 적합성 향상
- 계산기와 연결된 고품질 블로그를 1:N 구조로 생성
- 블로그 본문 안에서 실제 계산을 수행할 수 있는 위젯 제공
- 계산기 실행 → 관련 글 → 다른 계산기 → 저장/가입 → 재방문을 측정
- KO 기본 우선 시장을 운영하면서 EN/JA/ZH는 각 국가 규정이 검증된 계산기만 별도 활성화
- 공식 출처와 기준연도가 바뀌면 영향을 받는 계산기/글을 자동 재검토 큐에 넣기

### 비목표
- 검색량 숫자를 근거 없이 만들어 표시
- AI가 공식 세율·연금·대출 규정을 기억만으로 작성
- 동일 키워드 변형마다 수천 개 얇은 pSEO 페이지 생성
- 검토되지 않은 AI 글 자동 공개
- 계산 결과를 개인화 금융·세무·투자 자문으로 표현
- WLD 가상경제 수익을 실제 금융 수익으로 혼동시키기
- 가짜 리뷰, 가짜 이용자 수, 가짜 별점 구조화 데이터 생성

---

## 3. 검색수요 선정 엔진

### 3.1 입력 데이터 우선순위

**Tier A — 1차 실제 자사 데이터**
- Google Search Console: query, page, country, device, impressions, clicks, CTR, position
- 네이버 서치어드바이저: 콘텐츠 노출/클릭, 수집·색인 상태
- 내부 도구 페이지 조회/계산 실행/완료 이벤트
- 내부 사이트 검색어
- 블로그 → 계산기 클릭
- 계산기 → 회원가입/저장/재방문

**Tier B — 외부 수요 참고**
- Google Trends 상대 추세
- 네이버 DataLab 상대 추세
- Google Ads Keyword Planner 또는 승인된 키워드 API가 연결된 경우의 월간 검색량
- 네이버 검색광고 키워드 도구가 합법적으로 연결된 경우의 PC/모바일 월간 검색수
- 검색 결과 SERP 구성과 경쟁 페이지 품질

**Tier C — AI 추론**
- 질의 군집
- 검색 의도
- 계산식으로 해결 가능한지
- 기존 사이트 기능과 연결 가능성
- 시즌성/정책 변경 위험

AI 추론은 Tier A/B를 대체하지 않는다.

### 3.2 상태 구분
각 키워드는 반드시 다음 중 하나로 표시한다.
- `MEASURED`: 실제 검색량/노출값 있음
- `RELATIVE_TREND_ONLY`: 트렌드 상대값만 있음
- `GSC_IMPRESSION_ONLY`: 자사 노출만 있음
- `INFERRED_DEMAND`: 수요 추정만 있음
- `NO_DATA`: 증거 없음

관리자 화면에서 `INFERRED_DEMAND`를 “월간 검색량”으로 표시하면 안 된다.

### 3.3 Opportunity Score
0~100 점.

```text
Opportunity =
  0.25 * DemandScore
+ 0.15 * TrendScore
+ 0.15 * IntentFit
+ 0.15 * SiteAuthorityFit
+ 0.10 * ExistingGap
+ 0.10 * ConversionFit
+ 0.10 * FreshnessAdvantage
- RiskPenalty
```

RiskPenalty:
- 법/세율 자주 변경 +0~10 감점
- YMYL 정확성 검증 어려움 +0~10
- 검색수요 데이터 없음 +0~10
- 기존 페이지 cannibalization 가능성 +0~10
- 유사 페이지를 이미 보유 +0~10

### 3.4 키워드 군집
AI는 단일 키워드가 아니라 “계산 문제” 단위로 군집화한다.

예:
- “연봉 5000 실수령”, “5000만원 실수령액”, “월급 세후” → `salary_net`
- “2억 대출 이자”, “주담대 월 상환액”, “원리금균등” → `loan_amortization`
- “dsr 계산기”, “스트레스 dsr”, “대출 가능 금액” → `dsr`
- “퇴직금 계산기”, “평균임금 퇴직금”, “1년 퇴직금” → `severance`

---

## 4. 계산기 후보 포트폴리오

아래 표의 “수요”는 현재 문서 작성 시점의 **전략적 수요 등급**이다. 실검색량 숫자가 아니다. 실제 구현 순위는 Demand Intelligence가 다시 계산한다.

| 우선 | 계산기 | 상태 | 수요 가설 | 핵심 검색 의도 | 블로그 확장성 |
|---|---|---|---|---|---|
| P0 | 연봉 실수령액 | 기존 | 매우 높음 | 월 실수령, 4대보험, 세후 | 연봉별/공제별 |
| P0 | 대출 이자/상환 | 기존 | 매우 높음 | 주담대 월납입, 총이자 | 금리·기간·상환방식 |
| P0 | **DSR/스트레스 DSR** | 신규 후보 | 매우 높음 | 대출 가능액, 규제 | DSR 개념/사례 |
| P0 | **퇴직금** | 신규 후보 | 매우 높음 | 근속기간, 평균임금 | 퇴직소득·중간정산 |
| P0 | 복리/적립식 | 기존 | 높음 | 목표 자산, 장기 저축 | 72법칙, FIRE |
| P0 | 증여세 | 기존 | 높음 | 부모→자녀, 면제한도 | 관계별/기간별 |
| P1 | **예금 이자·세후 이자** | 신규 후보 | 높음 | 세전/세후 금리 | 예금 vs 적금 |
| P1 | **적금 만기 수령액** | 신규 후보 | 높음 | 월납입, 금리, 만기 | 단리/납입시점 |
| P1 | **주택 취득세** | 신규 후보 | 높음 | 집값별 취득세 | 주택 수/지역 |
| P1 | **중개보수** | 신규 후보 | 높음 | 매매/전월세 복비 | 거래금액별 |
| P1 | **전월세 전환율** | 신규 후보 | 중상 | 보증금↔월세 | 주거비 비교 |
| P1 | 국민연금/은퇴 | 기존 | 높음 | 예상수령/은퇴자금 | 공적·사적연금 |
| P1 | 양도소득세 | 기존 | 높음 | 매도 세금 | 자산 유형별 |
| P1 | ISA 절세 | 기존 | 중상 | 세후 투자수익 | 계좌 비교 |
| P1 | 배당세 | 기존 | 중상 | 배당 세후수익 | 국내/해외/ISA |
| P2 | **신용카드 할부 이자** | 신규 후보 | 중상 | 할부 수수료 | 소비자 금융 |
| P2 | **자동차 할부/오토론** | 신규 후보 | 중상 | 월 납입 | 차 가격/선납금 |
| P2 | **부가세 공급가액** | 신규 후보 | 중상 | VAT 포함/별도 | 사업자 실무 |
| P2 | **마진율/마크업** | 신규 후보 | 중상 | 판매가·원가 | 소상공인 |
| P2 | **손익분기점** | 신규 후보 | 중상 | 고정비·변동비 | 사업 시뮬레이션 |
| P2 | FIRE | 기존 | 중상 | 은퇴 필요자산 | 인출률 |
| P2 | 주식 평단가 | 기존 | 중상 | 물타기 평단 | 손익·세금 |
| P2 | 청년도약계좌 | 기존 | 정책성 | 만기 수령액 | 정책 변경 |
| P3 | 환율 수수료 | 후보 | 시즌성 | 실제 환전액 | 해외여행/투자 |
| P3 | 인플레이션 구매력 | 후보 | 교육형 | 미래 구매력 | CPI·실질수익 |
| P3 | CAGR | 후보 | 글로벌 | 연평균 성장률 | 투자 교육 |

### 4.1 1차 추천 개발 묶음
실측 데이터가 없다는 전제의 **초기 후보**:
1. DSR/스트레스 DSR
2. 퇴직금
3. 예금 세후이자
4. 적금 만기
5. 취득세 또는 중개보수

하지만 GSC/네이버 실측 후 순위가 바뀌면 그대로 바꾼다.

---

## 5. Calculator Registry 설계

모든 계산기는 공통 레지스트리에 등록한다.

```ts
type CalculatorDefinition = {
  id: string;
  localePolicy: 'KR_ONLY' | 'LOCALIZED_RULESET' | 'GLOBAL_FORMULA';
  version: string;
  title: Record<Locale, string>;
  category: 'income' | 'loan' | 'tax' | 'saving' | 'investment' | 'housing' | 'business';
  inputs: CalculatorInputSchema[];
  outputs: CalculatorOutputSchema[];
  presets: CalculatorPreset[];
  sources: OfficialSource[];
  legalDisclaimerKey: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  computeModule: string;
  validatorModule: string;
  freshnessPolicy: FreshnessPolicy;
  seoClusterId: string;
  widgetMode: 'compact' | 'standard' | 'table';
};
```

### 강제 규칙
- 계산식은 AI가 런타임에 생성하지 않는다.
- AI는 입력값을 직접 계산하는 대신 검증된 compute module을 호출한다.
- 세금/연금/규제 계산기는 적용연도와 출처가 없으면 활성화할 수 없다.
- 입력값 범위를 검증하고 NaN/Infinity/음수 오류를 노출하지 않는다.
- 원화는 정수 반올림 규칙을 계산기별로 명시한다.
- 계산값은 서버/클라이언트 동일 fixture로 테스트한다.

---

## 6. 블로그용 범용 계산기 위젯

현재 `BlogInlineCalculator`를 삭제하지 않고 호환 래퍼로 남긴 뒤 범용 `BlogCalculatorWidget`을 추가하는 방향을 권장한다.

### 6.1 호출 예시
```tsx
<BlogCalculatorWidget
  calculatorId="dsr"
  presetId="salary-60m-loan-300m"
  compact
  sourceContext={{ articleSlug }}
/>
```

### 6.2 위젯 기능
- 블로그 문맥에 필요한 입력 2~5개만 노출
- 핵심 결과 1~3개 출력
- 전체 계산기로 “정밀 계산” CTA
- 결과 공유 URL
- 현재 기준연도/출처 표시
- `lastVerifiedAt` 표시
- 모바일 320px 대응
- 키보드/스크린리더 지원
- JS 실패 시 계산식 설명 + 전체 계산기 링크 제공

### 6.3 위젯 타입
- `COMPACT_SINGLE_RESULT`: 기사 중간 1개 결과
- `COMPARE_TWO_SCENARIOS`: 두 조건 비교
- `AMORTIZATION_PREVIEW`: 대출 상환 12개월 미리보기
- `TAX_BREAKDOWN`: 세금 항목별 분해
- `GOAL_PROGRESS`: 목표 금액 달성기간
- `WHAT_IF`: 금리/기간 변경 슬라이더

### 6.4 재사용 원칙
전체 페이지와 위젯은 동일 compute module을 import한다. 수식 중복 구현 금지.

---

## 7. 내부 AI 블로그 생성 파이프라인

### 7.1 발행 상태
`IDEA → DATA_READY → DRAFTED → FACT_CHECKED → EDITOR_APPROVED → SCHEDULED → PUBLISHED → MONITORED → REFRESH_REQUIRED`

`DRAFTED` 이하 문서는 공개 sitemap에 들어가지 않는다.

### 7.2 AI 입력
- calculator definition
- keyword cluster
- 검색 의도
- 공식 출처 원문/요약
- 출처 fetch 시각
- 계산 fixture
- 기존 글 embedding/중복 검사 결과
- 국가/언어
- 금지 표현 목록
- 사이트 내부 관련 페이지

### 7.3 AI 출력 구조
1. 검색 질문을 그대로 해결하는 제목
2. 2~3문장 답 요약
3. 계산기가 필요한 이유
4. 공식 규칙/수식
5. 실제 예시 2개
6. 인라인 계산기 위젯
7. 결과 해석
8. 자주 틀리는 점
9. 공식 출처
10. 기준일
11. 관련 계산기/글
12. AI-assisted disclosure

### 7.4 자동 생성 금지 내용
- “최신 금리”를 출처 없이 확정
- 특정 투자수익 보장
- 세금 환급 보장
- 대출 승인 가능성 단정
- 국민연금 확정 수령액으로 표현
- 가짜 사용자 수/리뷰
- 경쟁사 내용을 재서술만 한 글
- 키워드 순서만 바꾼 중복글

### 7.5 중복 방지
- title normalized similarity > 0.82 차단
- article embedding cosine similarity > 0.90 차단
- 같은 `calculatorId + intent + locale` 조합은 canonical 1개 원칙
- 새 글이 기존 글보다 추가 가치가 없으면 기존 글 refresh 제안

---

## 8. “검색량 높은 계산기” 자동 발굴 작업

매주 1회 내부 AI job.

### Step A. 데이터 수집
- 최근 28일 GSC
- 전 28일 대비 변화
- 최근 90일 네이버
- 계산기 실행률
- 블로그 클릭
- 색인/크롤링 오류

### Step B. 후보 생성
예: 검색어에 “계산”, “얼마”, “실수령”, “이자”, “세금”, “수령액”, “상환”, “비율”, “퇴직금”, “DSR” 등 계산 의도 신호 탐지.

### Step C. 기존 기능 매칭
- exact calculator 있음 → 개선 backlog
- 부분 기능 있음 → 확장
- 없음 → 신규 후보

### Step D. AI 점수화
상위 20개를 관리자에게 제시한다.

### Step E. 사람 승인
운영자가 “조사”, “기획”, “개발 후보”, “보류”, “제외”로 분류.

**AI가 자동으로 새 페이지를 공개하지 않는다.**

---

## 9. 관리자 화면

`/admin/seo/calculators` 제안.

### 카드
- 키워드 군집
- 실제 측정 상태
- GSC 노출/클릭
- 추세
- 현재 평균순위
- 현재 연결 페이지
- 계산기 존재 여부
- AI Opportunity Score
- 규정 최신성 위험
- 예상 개발 난이도
- 추천 액션

### 상세
- 질의 목록
- 기간별 그래프
- 경쟁 SERP 메모
- 공식 출처
- 콘텐츠 갭
- 추천 계산기 입력/출력
- 추천 블로그 5개
- cannibalization 경고

### 버튼
- “기획안 생성”
- “초안 큐 생성”
- “기존 계산기 개선 제안”
- “출처 재검증”
- “편집 검토 요청”

“즉시 자동 공개” 버튼은 두지 않는다.

---

## 10. 데이터 모델 제안

### `seo_keyword_clusters`
- id
- locale
- cluster_key
- primary_query
- intent
- measurement_status
- demand_score
- trend_score
- opportunity_score
- measured_at

### `calculator_definitions`
- id
- version
- locale_policy
- effective_from
- effective_to
- status
- source_hash
- verified_at

### `calculator_sources`
- calculator_id
- source_url
- source_name
- jurisdiction
- fetched_at
- content_hash
- effective_date

### `content_editorial_jobs`
- id
- calculator_id
- keyword_cluster_id
- locale
- state
- ai_model_key
- source_bundle_hash
- draft_hash
- reviewer_id
- approved_at
- published_post_id

### `content_quality_checks`
- job_id
- duplicate_score
- unsupported_claim_count
- source_coverage
- formula_fixture_pass
- locale_quality_score
- seo_quality_score

DB 구현 시 기존 보안 모델을 지킨다. 앱 역할에 테이블 직접 광범위 권한을 추가하지 않고 필요한 read/write function을 설계한다.

---

## 11. API 계약 초안

- `GET /api/v1/admin/seo/calculator-opportunities`
- `POST /api/v1/admin/seo/calculator-opportunities/recompute`
- `POST /api/v1/admin/editorial/jobs`
- `POST /api/v1/admin/editorial/jobs/:id/fact-check`
- `POST /api/v1/admin/editorial/jobs/:id/approve`
- `POST /api/v1/admin/editorial/jobs/:id/publish`
- `GET /api/v1/public/calculators/:id/definition`
- `POST /api/v1/public/calculators/:id/calculate` — 서버 계산이 필요한 규정형 도구만
- 일반 단순 수학 도구는 정적 compute module 우선

모든 관리자 mutation은 권한, CSRF/내부 인증, audit receipt를 요구한다.

---

## 12. 블로그 ↔ 계산기 콘텐츠 매핑 예시

### DSR
- DSR 40%면 대출 가능액은 어떻게 계산하나
- 스트레스 DSR이 월 상환액에 미치는 영향
- 신용대출과 주담대를 같이 보유한 경우
- 연봉 5천/7천/1억 예시
- 금리 1%p 상승 what-if

### 퇴직금
- 1년/3년/10년 근속 퇴직금 예시
- 평균임금과 통상임금 차이
- 상여금 포함 여부를 확인하는 법
- 중간정산 전 체크리스트

### 예금/적금
- 세전 4%와 세후 수령액
- 월 50만원 적금 만기
- 예금과 적금 금리가 같아도 이자가 다른 이유
- 단리/복리 차이

### 대출
- 2억/3억/5억 30년
- 원리금균등 vs 원금균등
- 금리 3/4/5/6% 비교
- 중도상환 시나리오

블로그 숫자는 항상 계산 모듈의 fixture를 통해 생성하며 AI가 산술을 임의 생성하지 않는다.

---

## 13. SEO 설계

Google은 계산기 같은 인터랙티브 기능 자체를 페이지의 주요 콘텐츠로 평가할 수 있다고 안내한다. 따라서 각 계산기 페이지는 텍스트 3,000자를 채우는 것이 목표가 아니라 **정확히 작동하는 계산기 + 계산 원리 + 출처 + 예시 + 오류 없는 UX**가 핵심이다.

### 각 계산기 페이지
- 고유 title/H1
- canonical
- 실제 번역이 존재할 때만 hreflang
- WebApplication structured data
- FAQ는 화면에 실제 표시되는 질문만
- breadcrumb
- 기준연도/검증일
- 공식 출처
- 계산 방법
- 관련 블로그
- 관련 계산기
- sitemap 등록

### 금지
- 검색어 조합별 대량 duplicate preset URL 자동 색인
- 값만 바뀐 수천 페이지
- AI 생성 글을 날짜만 갱신
- 가짜 AggregateRating
- 검증 없는 “2026 최신” 배지

**중요:** 현재 일부 기존 계산기에는 aggregateRating, “최신 완벽 반영” 같은 정적 문구가 있다. 신규 엔진 도입 전에 실제 근거가 없는 평점/최신성 표시는 별도 감사 대상으로 잡는다.

---

## 14. 분석 이벤트

- `calculator_landing_view`
- `calculator_input_changed`
- `calculator_result_completed`
- `calculator_preset_used`
- `calculator_source_opened`
- `calculator_related_article_opened`
- `article_calculator_widget_view`
- `article_calculator_widget_completed`
- `article_to_full_calculator`
- `calculator_save_started`
- `calculator_save_completed`
- `calculator_to_signup`
- `search_query_cluster_landed`

개인 연봉, 대출원금 등 사용자가 입력한 민감할 수 있는 숫자 원문은 분석 서비스로 전송하지 않는다. 범위 bucket 또는 이벤트 여부만 보낸다.

---

## 15. 내부 AI 역할 분리

### AI Keyword Analyst
검색어 군집과 intent만 생성.

### AI Product Planner
계산기 후보 스펙 초안 생성.

### AI Editorial Writer
공식 source bundle만 이용해 글 초안 생성.

### AI Fact Checker
문장별 source coverage와 계산 fixture를 검사.

### AI Duplicate Reviewer
기존 글과 의미 중복 판정.

### AI Refresh Planner
규정 source hash 변경 시 영향을 받는 글 목록 생성.

한 AI가 작성과 승인까지 모두 수행하지 않는다.

---

## 16. 출처·신선도 정책

계산기별 `FreshnessPolicy`.

- 세금/정책: 7일 단위 source check + 정책 변경 이벤트
- 연금/사회보험: 월 1회 + 연도 변경 시 강제 검토
- 대출 수학: 수식은 고정, 금리 예시는 “사용자 입력” 위주
- 시장 데이터: 기사 발행 시 timestamp 필수
- 글로벌 공식 제도: 국가별 공식기관 우선

공식기관이 변경됐거나 source hash가 바뀌면 공개 페이지를 즉시 삭제하는 대신 `REFRESH_REQUIRED` 표시 후 검토 큐. 계산이 명백히 잘못될 위험이 크면 해당 계산기만 fail-closed.

---

## 17. 다국어 전략

기본 문서 체계는 English canonical / 한국어 2번째로 유지하되 제품 시장별 콘텐츠는 locale별 규칙을 적용한다.

- `GLOBAL_FORMULA`: 복리, CAGR → 번역 가능
- `LOCALIZED_RULESET`: 세금, 연금 → 국가별 별도 compute/source
- `KR_ONLY`: 한국 DSR, 청년도약계좌 → 검증 없는 번역판 생성 금지

한국 계산기를 영어로 번역만 하고 “US DSR calculator”처럼 표시하면 안 된다.

---

## 18. QA

### 계산 정확성
- 공식 예제 fixture
- 경계값
- 0/음수/최대값
- 반올림
- 월/년 변환
- 상환 스케줄 합계
- 세율 구간 경계

### SEO
- canonical self-reference
- sitemap
- no duplicate title
- robots
- hreflang 왕복
- structured data validation
- 200/404 status

### 블로그
- 모든 수치 source 또는 calculator fixture 연결
- unsupported claims 0
- title duplicate 차단
- AI disclosure
- 기준일
- 관련 위젯 실제 동작

### UI
- 320/375/768/1024/1440
- 키보드
- 스크린리더 label
- reduced motion
- JS fallback

---

## 19. 구현 단계

### Phase 0 — 증거 수집
1. GSC 실제 query/page 28일/90일 확보
2. 네이버 노출/클릭 확보
3. 현재 모든 계산기 색인/CTR/실행률 매핑
4. 기존 가짜/근거부족 메타·평점·최신 배지 감사

### Phase 1 — 공통 계산 플랫폼
1. Calculator Registry
2. 공통 input/output schemas
3. compute module 규약
4. fixture test harness
5. generic blog widget

### Phase 2 — 수요 엔진
1. keyword ingest
2. cluster
3. opportunity score
4. admin dashboard
5. weekly recompute

### Phase 3 — 첫 신규 계산기
실측 상위 3개만 개발. TDD.

### Phase 4 — Editorial AI
1. source bundle
2. draft
3. fact check
4. duplicate check
5. human approval
6. publish receipt

### Phase 5 — 성장 루프
블로그 위젯 → 전체 계산기 → 저장/가입 → 관련 도구.

---

## 20. Release Gate

### 개발 완료로 인정하려면
- 신규 계산기 공식 fixture 100% PASS
- 관련 단위/통합 테스트 PASS
- AI 초안 unsupported financial claim 0
- 자동 공개 우회 없음
- 관리자 승인 audit receipt 존재
- sitemap/canonical/hreflang 검증 PASS
- 기존 블로그 503 safety gate를 의도치 않게 해제하지 않음
- 운영 금융 ledger 관련 기존 release blocker와 완전 분리
- Test 배포에서 실제 백엔드/프론트 동작 확인
- 운영 승격 시 기존 무중단 절차 준수

기획서 승인 자체는 운영 배포 승인이 아니다.

---

## 21. KPI

### SEO
- calculator query impressions
- non-brand clicks
- CTR
- top 10 / top 20 query count
- indexed calculator count
- duplicate/canonical error

### 제품
- calculator completion rate
- result → related article
- article widget completion
- widget → full calculator
- calculator → save/signup
- D1/D7 return

### 콘텐츠 품질
- source coverage
- refresh overdue count
- duplicate blocked count
- editorial rejection rate
- unsupported claim detection count
- correction/retraction count

### 목표 원칙
절대 방문자 목표를 근거 없이 약속하지 않는다. 초기 4주에는 “올바른 검색의도에서 계산 완료율이 증가하는가”를 1차 성공지표로 둔다.

---

## 22. 첫 30일 실행 백로그

### D1~3
- 모든 계산기 inventory 자동 생성
- GSC query ↔ calculator 매핑
- 검색량 상태 라벨 적용
- metadata 신뢰성 감사

### D4~7
- generic widget
- calculator registry prototype
- 기존 복리 위젯 migration compatibility
- 관리자 opportunity table mock

### Week 2
- 실제 데이터 기준 P0 신규 계산기 1~2개
- 각 계산기 관련 고품질 기사 2개 초안
- source/fact check workflow

### Week 3
- 3번째 계산기
- 블로그 위젯 3종
- internal linking
- refresh queue

### Week 4
- 검색 노출/CTR/계산완료 분석
- 저품질 후보 중단
- 승자 군집에만 추가 글/프리셋 투자

---

## 23. 레퍼런스

- Google Search Central — Generative AI content guidance  
  https://developers.google.com/search/docs/fundamentals/using-gen-ai-content/
- Google Search Central — Helpful, reliable, people-first content  
  https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search Central — Search Essentials / spam policies  
  https://developers.google.com/search/docs/essentials
- Naver Search Advisor — SEO 기본  
  https://searchadvisor.naver.com/guide/seo-basic-intro
- Naver Search Advisor — 콘텐츠 노출 및 클릭  
  https://searchadvisor.naver.com/guide/report-expose-ctr
- Naver Search Advisor — URL 검사  
  https://searchadvisor.naver.com/guide/url-inspection

Google 공식 문서는 생성형 AI를 이용해 사용자 가치 없이 많은 페이지를 만드는 방식이 scaled content abuse가 될 수 있다고 명시한다. 또한 계산기와 같은 인터랙티브 기능은 페이지 목적을 직접 수행하는 main content가 될 수 있다고 설명한다. 따라서 이 기획의 SEO 핵심은 “AI 글 개수”가 아니라 **검증된 계산 기능의 독창적 효용과 이를 설명하는 출처 기반 콘텐츠**다.

---

## 24. 최종 제품 정의

> 월덕 머니버스의 내부 AI는 검색량을 “만들어내는” 시스템이 아니라 실제 검색 데이터를 읽고 계산 가능한 문제를 발견하는 분석가다. 계산은 검증된 코드가 하고, AI는 설명과 연결을 담당한다. 블로그는 계산기의 광고판이 아니라 사용자가 결과를 이해하는 학습 화면이어야 하며, 계산기와 블로그가 같은 수식·출처·기준일을 공유해야 한다.

이 구조가 완성되면 한 계산기당 “도구 1개 + 핵심 블로그 여러 개 + 동일 위젯 + 출처 갱신 + 성과 측정”이 하나의 유지 가능한 콘텐츠 제품 단위가 된다.
