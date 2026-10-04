# 월덕 머니버스 — 검색→사용자 성장 루프 명세

> 버전: v2026.10.04.525
> 상태: Living 상세 기획 권위
> 기준일: 2026-10-04
> 상위 권위: `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, `PRODUCT_GROWTH_PLAN.md`
> 영문 기준 문서: [SEARCH_TO_USER_GROWTH_LOOP_SPEC.md](SEARCH_TO_USER_GROWTH_LOOP_SPEC.md)
> 변경 유형: 기획/문서 전용. 런타임, DB, API, Test, Production 구현을 주장하지 않는다.

## 1. 목적과 남은 공백

Moneyverse에는 기술 SEO, 가입 전 가치, 검색의도→플레이 활성화, 가입 마찰 복구, 리텐션, 추천/바이럴, 획득 채널 배분 기획이 각각 이미 강하게 존재한다. 현재 남은 문제는 운영 단위의 연결이다. **어떤 검색의도가 색인 가능한 랜딩을 가져야 하는지, 어떤 첫 행동이 가치를 증명하는지, 언제 가입을 요구해도 되는지, 인증을 지나서도 원래 의도를 어떻게 보존하는지, 그리고 그 방문자가 실제 유지 사용자로 바뀌는지를 하나의 권위 루프로 묶어야 한다.**

canonical 루프:

`적합한 검색 노출 -> 의도에 맞는 공개 가치 -> 맥락형 preview/행동 하나 -> 사용자 직접 의도 선택 -> 저장이 필요할 때만 맥락형 가입 -> 정확한 의도 복구 -> 의미 활성화 -> 명시적 복귀 약속 -> D1 인식 -> D7 유지 진행 -> D30 지속 기록 -> 선택적 public-safe 공유/재검색 유입`

검색 트래픽 자체가 제품 목표는 아니다. 실제 가치를 받고 의미 있게 활성화하며 자발적으로 재방문하고 안전·수익적으로 서비스할 수 있는 **증분 적합 사용자**가 목표다.

## 2. North Star와 비목표

1차 성장 결과:

**검색·개인정보·안전 품질게이트를 유지하면서 발생한 증분 fraud-adjusted D30 유지 사용자와 retained contribution.**

색인 URL 수, 노출, 클릭, CTR, 평균순위, preview 완료, 가입 완료, 활성화는 진단지표이며 어느 하나도 단독 성공 기준이 아니다.

본 명세는 다음을 승인하지 않는다.
- 페이지 수 목표;
- 키워드용 대량 AI 자동생성 페이지;
- doorway, cloaking, deceptive redirect;
- 유용한 답을 로그인 뒤에 숨기기;
- 가입/광고 클릭에 WLD/WDX 보상;
- 개인 계정·경제·보안 상태 색인;
- 생성/fallback 수치를 실제 검색수요처럼 표시;
- Google/Naver 순위 보장 주장;
- Moneyverse를 실제 금융상품으로 오인시키는 투자·예금·대출·도박형 획득 문구.

## 3. Route-family 색인 권위

과거 표현 중 “한국 웹 전체가 noindex”로 읽힐 수 있는 광역 shorthand는 **기획 권위 차원에서** route-family 분류로 supersede한다. 런타임 robots가 이미 바뀌었다는 뜻은 아니다.

| Route family | 기본 검색 상태 | 진입 조건 | 예시 |
|---|---|---|---|
| 공개 브랜드/about/start | INDEX_CANDIDATE | 고유·유용한 콘텐츠, 올바른 locale/canonical, private state 없음 | 홈, 소개, 시작가이드 |
| 공개 가이드/용어집 | INDEX_CANDIDATE | 검색의도를 독립적으로 해결, 유지관리, 비중복 | 가상경제 개념, game-only 용어 |
| 공개 도구/시뮬레이션 | INDEX_CANDIDATE | 비회원에게도 유용, 결정론/유지관리, spendable 보상 없음 | 계산기, 제한형 교육 시뮬레이터 |
| 공개 세계/뉴스/시즌 archive | INDEX_CANDIDATE | 충분한 맥락, 진실한 freshness, 검수된 게시상태 | world brief, 시즌 archive, 가상기업 이벤트 해설 |
| 선별 공개 커뮤니티/토론 | CONDITIONAL | moderation/trust 기준, 독립 가치, public-safe 작성자 정보, anti-spam | 선별 thread, 큐레이션 Q&A/토론 |
| opt-in 공개 프로필/artifact | CONDITIONAL | 명시적 공개범위, 독립 가치, 민감 경제정보 없음 | creator/profile showcase, 수집/프로젝트 artifact |
| 개인화/member home | NOINDEX/AUTH | 획득 랜딩으로 사용하지 않음 | dashboard, 추천 |
| 지갑/잔액/포트폴리오/주문 | NOINDEX/AUTH | 공개 금지 | 잔액, 보유, 거래내역 |
| 은행/신용/부채/자격 | NOINDEX/AUTH | 개인상태는 private, 공개 교육은 별도 route | 계정별 대출·은행 상태 |
| 카지노/확률/규제위험 action | NOINDEX/AUTH/BLOCK-AS-REQUIRED | jurisdiction/compliance fail-closed | 확률·베팅 action route |
| 계정/보안/복구 | NOINDEX/AUTH | 공개 금지 | 로그인 보안, 복구, session |
| 관리자/moderation/private social | NOINDEX/AUTH | 공개 금지 | admin, 신고, 제재, private club graph |
| Test/staging/internal | NOINDEX/필요시 CRAWL 차단 | Production sitemap 절대 금지 | Test host, 진단 |

모든 `INDEX_CANDIDATE`는 v510 `SeoDocument`/route registry 게이트를 그대로 통과해야 한다. Production host, HTTP 200, 자기일관 canonical, 게시 locale, 품질승인, 비공개 아님, 의미 있는 `lastmod`, 유효한 sitemap/hreflang membership이 모두 필요하다.

### 3.1 한국 공개검색 규칙

한국어는 계속 제품/공개 fallback locale이다. **공개 안전한 한국어 정보·도구·archive·검수 커뮤니티 route는 route-family 게이트 통과 후 색인할 수 있다.** 개인화·민감·거래·보안·moderation·jurisdiction 제한 route는 noindex/auth를 유지한다. locale과 법적 jurisdiction은 별도 축이다.

## 4. 검색 노출 포트폴리오

### 4.1 고가치 evergreen 가이드·용어집
가상경제 개념, Moneyverse 게임 시스템, 가상시장 구조, 수집, 직업, 시즌, game-only 용어처럼 서로 다른 사용자 질문에 답하는 소수의 깊은 페이지를 만든다. 계정 없이도 질문을 해결하고, 마지막에 관련 제품 행동 하나를 연결한다.

### 4.2 인터랙티브 도구·플레이 preview
이해에 실제 도움이 될 때 공개 안전 계산기, 시뮬레이션, 비교 탐색기, 수집 preview, 제한형 scenario replay를 우선한다. spendable WLD/WDX 발행, 주문 실행, 신용부여, private state 노출, 보장수익 시뮬레이션은 금지한다.

### 4.3 세계·시즌·이벤트 archive
가상세계의 의미 있는 변화와 시즌 결과를 안정적인 해설로 남긴다. freshness는 실제 source timestamp/의미변경에서 와야 하며 배포일시나 날짜만 바꾸는 행위로 만들지 않는다. 과거 archive는 실제 후속 thread가 있을 때만 현재 행동 하나로 연결한다.

### 4.4 선별 커뮤니티 검색면
공개 토론은 moderation/trust threshold를 넘은 일부만 index 후보가 된다. 가입하지 않아도 페이지 자체가 유용해야 한다. 신규·저신뢰·스팸성 UGC는 noindex/unlisted를 유지한다. 게시량을 늘리는 보상으로 검색노출을 주지 않는다.

### 4.5 공개 프로필과 지속 artifact
opt-in 프로필, 큐레이션 수집, 프로젝트 결과, 교육 replay, 시즌 artifact는 독립 가치가 있고 allowlist 필드만 포함할 때 공개/검색 후보가 될 수 있다. 잔액, private holdings, 부채, 카지노 이력, 비공개 멤버십, 제재·moderation 상태, 보안·복구 데이터는 금지한다.

### 4.6 이미지·영상·rich search appearance
시각자료가 실제로 유용한 페이지는 crawl 가능한 고품질 이미지, 설명적 alt/context, 안정적인 landing URL을 유지한다. 고가치 설명 콘텐츠는 필요할 때 dedicated video/watch content와 현재 자격에 맞는 정확한 `VideoObject`형 메타데이터를 사용할 수 있다. structured data는 화면 내용과 일치해야 하며 rich result를 만들기 위한 장식으로 넣지 않는다.

### 4.7 다국어 discovery
한국어 무접두 canonical URL이 제품 fallback 권위다. 게시된 EN/JA 및 후속 locale은 실제 동등 콘텐츠가 품질승인되어 게시된 경우에만 self-canonical + reciprocal hreflang을 사용한다. 기계번역 draft/혼합언어 페이지는 noindex이며 sitemap에서 제외한다.

### 4.8 내부 hub·entity cluster
crawl 가능한 내부링크, breadcrumb, topic hub로 가이드·도구·세계 entity·시즌·직업·수집을 실제 사용자 여정에 맞춰 연결한다. orphan page와 기계적 상호링크는 결함이다. hub 자체도 주제를 설명하고 탐색을 돕는 독립 가치가 있어야 한다.

### 4.9 획득형 외부 discovery
공개 계산기, 투명한 가상경제 보고서, 해설, archive, 커뮤니티/프로젝트 결과처럼 외부에서 인용할 이유가 있는 자산을 만든다. creator/community 협업은 실제 관련성이 있고 이해관계를 공개할 때 링크할 수 있다. 유료 링크, 링크교환, spam outreach, fake review/follower, 도메인 권위 임대는 금지한다.

### 4.10 Naver 및 지역 검색 운영
Naver Search Advisor verification, sitemap/RSS 등 현재 지원 submission, title/description 품질, crawl/index 진단, 적용 가능한 IndexNow를 유지한다. 종료된 rich-result 포맷을 성장목표로 잡지 않는다.

### 4.11 브랜드/social/creator의 수요 생성
creator, social, community, 공개 artifact 배포는 나중의 branded/direct/search 수요를 만들 수 있다. 이를 demand capture와 분리 측정하여 branded search 전환을 SEO 단독 성과로 과대평가하지 않는다.

### 4.12 검색결과 약속 규율
각 landing family는 화면의 실제 가치와 맞는 명확한 title, H1, description/snippet 후보를 갖는다. clickbait, fake scarcity, 조작된 social proof, 실제 금융수익처럼 보이는 표현은 금지한다. 검색결과 약속과 첫 viewport 약속은 같아야 한다.

## 5. 검색의도→사용자 전환 아키텍처

### 5.1 Intent registry
각 검색 landing family는 다음을 선언한다.
- `intent_cluster`;
- 사용자의 질문/문제;
- 독립 공개 가치;
- 1개의 primary preview/action;
- 허용 contextual CTA;
- 인증이 필요한 지점;
- post-auth continuation 목적지;
- meaningful activation event;
- D1/D7 continuation thread;
- privacy/jurisdiction/indexability class.

초기 intent cluster:
1. 초보 학습/가상경제 개념;
2. Moneyverse 제품/시스템 이해;
3. 가상기업/세계/entity 탐색;
4. 직업/mastery 성장;
5. 수집/정체성/큐레이션;
6. 시즌/이벤트/archive catch-up;
7. public-safe 계산기/시뮬레이션/도구;
8. 커뮤니티/프로젝트 discovery.

### 5.2 Answer first
가입을 요청하기 전에 방문자의 즉시 검색의도를 충족한다. 첫 30초에 답, Moneyverse가 왜 해당 맥락을 갖는지, finance-adjacent 주제라면 game-only 경계, 그리고 선택 행동 하나가 이해되어야 한다.

### 5.3 Feature wall 대신 preview 하나
의도에 맞는 저위험 상호작용 하나만 우선한다. organic 첫 세션에 지갑·은행·주식·상점·퀘스트·카지노·클럽 등 전체 기능을 쏟아내지 않는다.

예:
- 개념 가이드 -> 30~90초 trade-off simulation;
- 가상기업 설명 -> world thread 하나 follow;
- 직업 페이지 -> 경로 하나 선택 + 첫 task preview;
- 수집 페이지 -> starter theme 하나 선택;
- 시즌 archive -> 현재 continuation 하나 선택;
- 공개 도구 -> 민감하지 않은 결과/다음질문 저장.

### 5.4 계정 압박 전에 authored intent
안전한 경우 인증 전에도 방문자가 되돌릴 수 있는 선호/선택 하나를 만들 수 있어야 한다. 가입은 지속 저장·참여·보호된 개인화가 실제로 필요할 때 요청한다.

### 5.5 Contextual signup
CTA는 보존되는 상태를 말한다.
- `이 경로 저장하고 계속하기`;
- `이 세계 thread 팔로우하기`;
- `이 수집 챕터 시작하기`;
- `이 시뮬레이션 결과와 다음 단계 저장하기`.

진입 의도가 계정접근이 아닌 이상 일반 `지금 가입`은 보조 CTA다.

### 5.6 인증 후 정확한 의도 복구
OAuth/email/passkey/verification/recovery는 서버가 검증하는 opaque continuation token으로 allowlist 목적지와 비민감 authored intent를 보존한다. 인증 성공 후 정확한 continuation으로 돌아간다. 원래 continuation이 무효/위험한 경우가 아니면 generic dashboard로 초기화하지 않는다.

open redirect, URL secret, analytics에 OAuth code 기록, client가 임의 return URL을 신뢰하는 방식은 금지한다.

### 5.7 Meaningful activation
인증 성공은 activation이 아니다. 검색 유입 사용자가 world thread 저장, profession path 생성, collection 시작, learning replay 완료 등 intent registry가 정한 첫 지속 결과를 완료해야 활성화로 본다.

### 5.8 Return promise
첫 가치 뒤에는 최대 하나의 continuation thread를 사용자가 직접 고르게 한다. D1은 해당 thread 인식을 우선하고 D7은 실제 진전·완료·갱신 또는 정직한 unchanged state를 증명한다. 알림은 가치 경험 후 permission 기반으로만 제안하며 activation 선행조건으로 요구하지 않는다.

## 6. 마찰·신뢰 규칙

- 유용한 공개 콘텐츠 전에 강제 계정 없음;
- 성장 콘텐츠 안에서 password/OAuth/recovery code 요구 금지;
- 가짜 `지금 안 하면 잃는다` countdown 금지;
- raw signup/referral WLD 보상 금지;
- transactional auth 동의를 marketing 동의로 자동확장 금지;
- 인증 및 안전-critical CTA와 시각적으로 경쟁하는 광고 금지;
- 전환 최적화를 위한 불필요 인구통계/실제 금융데이터 수집 금지;
- 복귀 압박에 개인화 금융/카지노 outcome 사용 금지.

## 7. 측정 계약

### 7.1 필수 funnel event
구현 단계에서는 다음과 같은 안정적 semantic event로 수렴한다.
- `search_landing_view`;
- `answer_engaged`;
- `preview_start`;
- `preview_complete`;
- `intent_authored`;
- `signup_start`;
- `signup_complete`;
- `intent_restored_after_auth`;
- `activation_meaningful`;
- `return_promise_set`;
- `d1_return`;
- `d7_retained`;
- `d30_retained`.

canonical dimension: 검색엔진/source family, `intent_cluster`, landing family, locale, 적법한 coarse country, device class, experiment variant, 신규/복귀, content version. query text는 최소화·집계하고 민감하거나 희소한 query를 사용자 프로필에 복사하지 않는다. 검색 attribution 때문에 private 잔액·보유·부채·보안·moderation·복구 상태를 노출하지 않는다.

### 7.2 KPI 계층

**검색 도달/품질**
- route family별 eligible/indexed coverage;
- qualified non-brand impressions/clicks/CTR;
- branded vs non-branded demand trend;
- canonical/hreflang/sitemap/indexing defect;
- 인위적인 체류시간 목표가 아닌 유용 landing engagement.

**방문자→사용자**
- landing -> preview 시작/완료;
- preview -> authored intent;
- intent -> signup 시작/완료;
- signup -> exact intent restore;
- signup -> meaningful activation;
- time-to-first-value.

**리텐션**
- activation -> return promise;
- D1 exact-thread recognition/return;
- D7 original-thread continuation/resolution;
- D30 durable history;
- intent cluster별 retention.

**경제성**
- 콘텐츠/도구 유지비;
- moderation/fraud/support 부담;
- qualified organic session 및 content family당 retained contribution;
- marginal 콘텐츠/creator/paid 입력당 incremental D30 user.

## 8. 실험 backlog

| 실험 | 가설 | Primary metric | Guardrail |
|---|---|---|---|
| Answer-first vs auth-first | 인증 전 공개가치가 유지전환 개선 | signup->activation + D7 | leakage, abuse, 성능 |
| Contextual CTA vs generic signup | exact intent 보존이 auth 이탈 감소 | intent restore + activation | phishing 유사 문구, 혼란 |
| Interactive preview vs static article | 의미 인터랙션 하나가 첫 가치 개선 | preview->activation + D7 | CWV, 접근성 |
| Deep page/tool vs template 변형 | 적은 고가치 자산이 thin scale보다 우수 | organic->D30 + index quality | duplicate/thin/spam |
| Truthful title/snippet variant | 정확한 약속이 적합 CTR 개선 | qualified CTR + activation | clickbait, promise mismatch |
| Curated community proof | 검수된 토론이 신뢰 개선 | activation + D7 | UGC abuse/privacy |
| Exact-thread D1 vs generic dashboard | 원래 의도 인식이 복귀 품질 개선 | D1/D7 continuation | notification pressure |
| 적합 KR 공개색인 pilot | route 기반 색인이 안전하게 유입 확대 | qualified organic activation | privacy, compliance, index defect |

CTR이나 signup만 올라가고 D7/D30 품질이 떨어지면 성공이 아니다.

## 9. 검색/커뮤니티 안전 게이트

P0 blocker:
- private/account/security/moderation 데이터 색인/노출;
- canonical/hreflang이 private/Test/잘못된 locale/가짜 replacement를 가리킴;
- crawler와 사용자에게 materially 다른 cloaking;
- URL 수 목표 때문에 thin/duplicate 대량 색인;
- 조작된 Search Console/Naver/traffic 지표;
- 서비스를 실제 투자·예금·증권·도박으로 오인시키는 수익·금융 주장;
- 저신뢰 UGC 대량 색인;
- URL/metadata/structured data/log/analytics에 secret/session/recovery token;
- Test/staging URL의 Production sitemap 유입.

P1 quality gate:
- title/H1/body/snippet intent 불일치;
- orphan page;
- stale/fake `lastmod`;
- 느리거나 intrusive한 첫 viewport;
- 화면과 불일치하는 structured data;
- main content를 가리거나 accidental click을 만드는 광고;
- activation/retention이 지속적으로 약한데 vanity traffic 때문에 남긴 landing family.

## 10. 실행 순서

### Phase 0 — 진실·route inventory
source route, 현재 runtime robots/index 상태, Search Console/Naver coverage, sitemap/hreflang/canonical, KR 전체 noindex 모호성을 대조한다. robots 변경 전에 route-family 원장을 만든다.

### Phase 1 — 수동 검수 pilot 자산
서로 다른 intent에서 guide, tool/simulation, archive, public-safe community/artifact의 소수 대표군을 선정한다. 품질이 게이트이며 **URL 수는 KPI가 아니다.**

### Phase 2 — contextual signup + exact handoff
intent registry, one-preview flow, 안전 continuation token, post-auth exact restore, meaningful activation event를 구현한다. 인증/보안 불변식을 먼저 검증한다.

### Phase 3 — retained-user bridge
return-promise 상태, D1 exact-thread recognition, D7 continuation 측정을 구현한다. 그 다음부터 획득을 retained quality 기준으로 최적화한다.

### Phase 4 — 선별 검색면 확장
각각의 품질·privacy 게이트가 통과한 경우에만 Images/video/공개토론/profile/artifact 검색 노출을 늘린다. EN/JA 등은 locale 하나씩 확장한다.

### Phase 5 — 승자 확대·약자 통합
독립가치, 검색품질, activation, retention, 운영경제성이 증명된 intent cluster만 확장한다. 약한/중복 페이지는 merge, redirect, noindex, retire하고 canonical/sitemap을 정확히 정리한다.

## 11. 후속 런타임 구현의 수용·릴리스 게이트

이 명세를 실제 런타임에 구현해 승격하기 전:
1. exact candidate SHA 기록;
2. Test noindex 및 분석 격리 유지;
3. route-family indexability inventory 완성;
4. private/sensitive route 노출 표본 결함 0;
5. canonical/hreflang/sitemap 표본 대상 expected 200 canonical;
6. structured data가 화면 내용/현재 자격과 일치;
7. auth continuation은 external/open redirect 거부, secret 비노출;
8. meaningful activation/D1/D7을 login/pageview/ad event와 분리;
9. 검색 공급자 장애 시 analytics가 가짜 성공값을 만들지 않음;
10. responsive/accessibility/Core Web Vitals regression 검토;
11. backend health + 프로젝트 exact-SHA Test gate 통과;
12. 현행 release 계약에 따른 무중단 Production 승격/rollback.

v525 문서 작업만으로 위 런타임 게이트를 통과했다고 간주하지 않는다.

## 12. 기존 성장 명세와의 권위 관계

이 문서는 기존 권위를 삭제하지 않고 조합한다.
- `SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.ko.md`: answer-first intent-to-play;
- `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.ko.md`: 가입 전 유용 sample;
- `SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.ko.md`: 인증 intent 보존;
- `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.ko.md`: return promise와 D1/D7 continuity;
- `ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.ko.md`: retained/incremental channel 경제성;
- `GLOBAL_GROWTH_EXECUTION_SPEC.ko.md`: server-owned SEO read model, locale, sitemap/hreflang, release truth;
- `GLOBAL_GROWTH_SEO_REVENUE_SPEC.ko.md`: 다국어 검색과 광고 전용 성장경제.

과거 문장과 v525 route-family indexability 또는 end-to-end funnel 측정이 충돌하면 현재 기획 의도는 v525를 따른다. 별도 구현/릴리스가 있기 전 실제 runtime truth는 exact deployed source가 증명하는 상태다.

## 13. 현재 1차 운영 레퍼런스

- Google Search Central — Creating helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search appearance overview: https://developers.google.com/search/docs/appearance
- Google canonicalization: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Google sitemap guidance: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google discussion forum structured data: https://developers.google.com/search/docs/appearance/structured-data/discussion-forum
- Google profile page structured data: https://developers.google.com/search/docs/appearance/structured-data/profile-page
- Google video structured data: https://developers.google.com/search/docs/appearance/structured-data/video
- Google Search Console / Search Analytics API: https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- Naver Search Advisor — content basics: https://searchadvisor.naver.com/guide/content-basic
- Naver Search Advisor — markup/content: https://searchadvisor.naver.com/guide/markup-content
- Naver Search Advisor — robots/crawl basics: https://searchadvisor.naver.com/guide/seo-basic-robots
- IndexNow protocol: https://www.indexnow.org/documentation

위 자료는 메커니즘과 품질의 제약조건이지 순위·트래픽·수익 보장이 아니다.
