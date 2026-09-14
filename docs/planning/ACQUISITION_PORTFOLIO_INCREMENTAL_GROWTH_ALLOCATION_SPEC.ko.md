# Woldeok Moneyverse — 획득 포트폴리오 및 증분 성장 배분 기획

> 버전: v2026.09.15.90
> 상태: Living 소비자 성장 기획
> 기준일: 2026-09-15
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PAID_ACQUISITION_QUALITY_RETAINED_ECONOMICS_GROWTH_SPEC.md`, `BRAND_CONTENT_GROWTH_ENGINE_SPEC.md`, `CREATOR_COMMUNITY_QUALIFIED_ACQUISITION_GROWTH_SPEC.md`, `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md`
> 영문 기준본: [ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.md](ACQUISITION_PORTFOLIO_INCREMENTAL_GROWTH_ALLOCATION_SPEC.md)
> 변경 유형: 문서-only. 런타임, DB, API, 인증, migration, scheduler, 인프라, 보안 코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

Moneyverse에는 SEO/콘텐츠, creator/community, referral/viral, paid acquisition 각각의 기획이 이미 존재한다. 현재 가장 큰 획득 공백은 **채널 포트폴리오 배분**이다.

**여러 채널이 같은 사용자의 전환을 서로 자기 성과라고 주장할 때, 다음 광고비 1원·콘텐츠 1편·creator 운영 1단위를 어디에 투입해야 실제 증분 D30 유지 사용자와 기여이익이 늘어나는가?**

브랜드 검색, retargeting, creator 노출, referral 링크, paid search가 한 사용자를 동시에 접촉할 수 있다. 따라서 단순 attributed signup은 하단 funnel 채널을 과대평가하고 브랜드·콘텐츠·커뮤니티의 demand creation을 과소평가할 수 있다.

선택 루프:

`시장/브랜드 신호 → 채널별 qualified discovery → public value/proof → authored interest → meaningful activation → D1/D7/D30 cohort quality → incremental retained contribution → marginal allocation decision → 반복`

이 문서는 광고플랫폼 연동이나 tracking schema/backend attribution 구현 명세가 아니다. 소비자 성장 경제성, 의사결정 규칙, 실험과 privacy/abuse guardrail을 정의한다.

## 2. 채널별 점수판이 아니라 하나의 획득 포트폴리오

다음 획득군을 함께 본다.
- non-branded organic search와 유용한 공개 콘텐츠;
- branded/direct 수요;
- social/video/creator 콘텐츠;
- community/Discord discovery;
- referral 및 public-safe 공유 artifact;
- qualified intent가 확인된 paid search/social/display;
- 이해관계를 명확히 표시한 PR/sponsorship.

각 채널이 local metric만 최적화하는 동안 전체 D30 retained growth가 정체되는 상황을 허용하지 않는다.

### 포트폴리오의 1차 목표

**trust/privacy/safety guardrail을 지키면서 늘어난 incremental fraud-adjusted D30 retained user와 retained contribution margin.**

impression, CTR, creator view, referral send, branded click, raw registration/install은 진단지표이지 최종 목표가 아니다.

## 3. 수요 생성과 수요 포착 분리

### Demand creation
- 교육/world/season 공개 콘텐츠;
- creator/community storytelling;
- PR과 공개 프로젝트 결과;
- 공유 가능한 collection/project artifact;
- 나중에 Moneyverse를 직접 검색하게 만드는 브랜드 콘텐츠.

### Demand capture
- branded search;
- high-intent SEO;
- source-matched paid search;
- 실제 가치 경험 이후 retargeting;
- direct navigation/saved return link.

수요 포착 채널이 해당 관심을 직접 만들었다고 자동으로 간주하지 않는다. branded search conversion이 높아진 것은 upstream creator/content/community가 잘 작동한 결과일 수 있다.

Google Search Console의 branded query filter는 2026년 광범위하게 제공되므로 branded demand와 non-branded discovery를 분리하는 데 활용한다. 단, 그 구분 자체를 causal proof로 보지 않는다.

## 4. 채널 품질 계약

모든 획득 채널은 같은 소비자 계약을 유지한다.

`정직한 약속 → 유용한 public-safe proof/sample → authored interest 하나 → 필요할 때만 contextual signup → same-intent activation → 자발적 복귀`

사용자를 더 많은 단계로 이동시키거나 광고를 더 많이 보게 하거나 금융게임 surface를 많이 열었다는 이유로 추가 점수를 주지 않는다.

### 제외할 획득 표현
- 실제 수익·고수익·보장수익;
- 손실복구·부채 urgency;
- 카지노 승리 중심 유입;
- fake scarcity/fabricated social proof;
- raw WLD/WDX signup/referral bounty;
- sponsor 관계를 숨긴 creator endorsement;
- deceptive redirect, cloaking, 사칭.

## 5. Cohort 기간과 배분 gate

### 첫 30초
서비스 정체성, 필요한 game-only 경계, 유용한 다음 행동 하나를 이해하는지 본다.

### 첫 3분
계정생성보다 sample/proof completion과 authored interest를 본다.

### 첫 세션
meaningful activation과 clear continuation thread를 본다.

### D1
유입 당시 exact promise/thread를 다시 인식하는지 확인한다. generic wallet/finance/casino로 덮지 않는다.

### D3
실제 변화·유용한 맥락 또는 정직한 unchanged state와 다음 행동 하나를 제공한다.

### D7
같은 identity/collection/learning/project/world loop가 실제로 진전되는지 본다.

### D14
feature breadth는 자발적으로 확장되어야 한다.

### D30
획득 incentive가 없어도 남는 durable history와 제품 자체 복귀가 있어야 한다.

영구적인 포트폴리오 재배분은 표본이 허용할 때 D30 mature evidence를 우선한다. D7은 빠른 학습에 쓰되 D30 경제성 악화를 숨기는 데 사용하지 않는다.

## 6. 포트폴리오 측정 프레임

하나의 attribution number로 합치지 않고 세 관점을 함께 유지한다.

### A — 운영 attribution
platform/channel attribution은 creative·landing·audience 문제 진단에 활용한다. demand capture 과대평가 가능성을 항상 전제한다.

### B — first-party retained cohort
채널별로 다음을 비교한다.
- meaningful activation;
- D1/D3/D7/D14/D30 retention;
- durable-history coverage;
- referral/share quality;
- support/moderation/fraud burden;
- monetization eligibility 이후의 ad/subscription/cosmetic contribution;
- privacy complaint, phishing/scam misunderstanding.

### C — incrementality evidence
트래픽/비용이 충분할 때 holdout·geo·time 기반 등 신뢰 가능한 비교로 채널이 없었으면 발생하지 않았을 결과를 추정한다.

표본이 작으면 증분효과를 정밀하게 안다고 가장하지 않는다. 불확실성을 기록하고 reversible allocation을 우선한다.

## 7. 평균 ROI가 아니라 marginal allocation

핵심 질문은 과거 평균이 가장 좋은 채널이 아니라 **다음 투입 단위가 무엇을 만드는가**이다.

유용한 지표:
- incremental D30 retained user당 marginal CAC;
- marginal retained contribution;
- 근거가 있을 때 saturation/response curve;
- branded vs non-branded organic demand trend;
- creator/social 이후 발생한 branded/direct/search demand;
- referral/share visitor activation·D30 품질;
- content production cost와 shelf life;
- paid spend, support, moderation, fraud cost.

장기적으로 검색되는 유용한 글이 즉시 signup은 적어도 paid campaign보다 좋은 D30 경제성을 만들 수 있다. 반대로 organic/community가 닿지 않는 qualified user를 실제로 추가 확보한다면 paid도 scale할 수 있다.

## 8. SEO/content/creator를 누적 자산으로 보기

Google의 2026 Search Console 변화는 branded/non-branded 분석, generative-AI visibility, social/video platform property를 제공한다. 이를 owned site와 social/creator가 여러 surface에서 어떻게 발견되는지 파악하는 데 사용한다.

다만 impression 자체를 목표로 하지 않는다.

`non-branded discovery → useful public content → authored interest → activation → D7 → D30`

및

`creator/social exposure → later branded/direct/search return → activation → D30`

을 분리해서 본다.

검색 노출만을 위한 doorway page나 대량 generic AI content는 만들지 않고 people-first usefulness와 하나의 명확한 제품 목적을 유지한다.

## 9. 실험 backlog

### A. Branded-search credit test
가설: 일부 branded-search conversion은 creator/content/community가 만든 demand를 포착한 것이다.
Primary metric: incremental meaningful activation과 D30 retained user.
Guardrail: finance misunderstanding, fake signup, privacy complaint.
관찰: D30 mature cohort가 확보될 때까지 단기 검색량 증가만으로 예산을 재배분하지 않는다.

### B. Evergreen organic vs paid matched-intent
가설: 충분한 evergreen guide가 같은 intent의 반복 paid acquisition보다 적은 트래픽으로 더 좋은 D30 경제성을 만들 수 있다.
Primary metric: acquisition cost/effort 단위당 retained contribution.
Guardrail: content quality, search spam, ad-induced churn.

### C. Creator/community vs referral-code push
가설: 맥락 있는 public artifact가 code-first reward보다 raw invite는 적어도 visitor→activation→D30 품질은 높다.
Guardrail: spam/report, referral fraud, impersonation.

### D. Marginal paid-spend step test
가설: 제한적인 spend 증가가 platform-attributed conversion만 늘리는 것이 아니라 실제 incremental D30 user를 만든다.
Primary metric: spend당 marginal incremental D30 retained user.
Guardrail: invalid traffic, CAC_D30, privacy complaint, finance misunderstanding.

### E. Social/video search-discovery feedback
가설: 일부 creator/social post는 플랫폼 밖 Search/Discover와 branded demand까지 장기 discovery를 만든다.
Primary metric: search-driven qualified visit → activation → D30.
Guardrail: clickbait, fake follower/view, undisclosed sponsorship 금지.

## 10. SEO 및 public content

- 가능한 경우 branded/non-branded discovery를 분리한다.
- branded query 증가를 SEO 단독 성과로 보지 않는다.
- attribution을 위해 near-duplicate landing을 대량 생성하지 않는다.
- signup하지 않아도 가치 있는 공개 콘텐츠만 색인 후보로 둔다.
- account/portfolio/balance/debt/casino/recovery/moderation/security state는 검색에 노출하지 않는다.
- private cohort/acquisition 정보를 public proof로 공개하지 않는다.

## 11. Viral/referral과 포트폴리오

Referral/share도 downstream quality를 가진 획득 채널로 본다.

선호:
- public-safe collection/project/season/learning artifact;
- 링크를 받는 사람이 왜 봐야 하는지 이해하는 맥락;
- 필요 시 retained participation 이후의 cosmetic/honor/convenience 보상.

raw send/click/signup/install/account-linking/1-day activity에는 의미 있는 WLD/WDX를 주지 않는다. suspicious duplication과 referral arbitrage는 성장량에서 숨기지 말고 portfolio cost로 반영한다.

## 12. 수익성과 monetization

획득 출처가 retention-safe monetization 원칙을 바꾸지 않는다.

비싼 유저라는 이유로 첫 세션 광고량을 늘리지 않는다. 금융게임 우위를 팔지 않고 debt/loss/casino outcome을 monetization pressure에 사용하지 않는다.

포트폴리오 profitability에는 다음을 포함한다.
- media/creator/content acquisition cost;
- variable ad/payment 비용;
- support/moderation/fraud 비용;
- 콘텐츠 제작/유지 비용;
- eligibility 이후 subscription/ad/cosmetic/sponsor contribution;
- monetization으로 인한 churn/trust harm.

최적화 대상은 gross attributed revenue가 아니라 `incremental retained contribution`이다.

## 13. 보안·악용·개인정보 검토

### HIGH — cross-channel identity/tracking leakage
사용자 영향: private economy/social/security state가 광고·분석·creator 시스템에 노출될 수 있다.
악용: exact holdings, debt, casino result, private membership을 audience/conversion payload로 사용.
최소 보호: data minimization, public-safe event allowlist, credential/session/recovery 금지, private economy/security state 전송 금지.
별도 개발/QA: 신규 pixel, server-side conversion, enhanced matching, cross-platform audience sync에 필수.

### HIGH — referral/creator/paid arbitrage
영향: fake user가 경제/커뮤니티를 왜곡하고 예산을 소비.
악용: bot/multi-account가 referral/creator/paid incentive 순환.
최소 보호: raw acquisition event에 meaningful reward 금지, delayed/capped retained milestone, fraud-adjusted economics.

### HIGH — finance/gambling claim drift
영향: 실제 투자·예금·도박상품 오인.
악용: 자동 광고/affiliate/creator가 high-yield, loss-recovery, casino-win 메시지로 최적화.
최소 보호: human-reviewed claim, game-only 경계, prohibited claim list, 이해관계 공개.

### HIGH — acquisition surface phishing/impersonation
영향: ATO/credential theft.
악용: 가짜 Moneyverse 광고·creator page·referral·comeback link가 로그인 비밀 요구.
최소 보호: canonical domain/brand, password/OAuth code/recovery code 요구 금지, URL secret 금지.

### MEDIUM — measurement overcollection
영향: 과도한 profiling과 privacy complaint.
악용: attribution 개선 명목으로 search/creator/referral/social/private economy history를 무제한 결합.
최소 보호: purpose limitation, data minimization, retention limit, consent/legal basis 검토.

기존 OAuth/session/RBAC/admin/ledger/market-integrity/privacy/community 보안 경계는 변경하지 않는다.

## 14. 법규/정책 guardrail

- 한국: 적법한 근거 없이 third-party behavioral data를 맞춤광고/attribution으로 확장하지 않는다. 2026-07-27 개인정보위 TikTok·Apple 제재를 강한 경고 신호로 유지한다.
- 미국: endorsement/review는 진실해야 하고 material connection은 명확히 공개한다. fake review/follower, 특정 sentiment 조건 보상은 제외한다.
- 미성년/민감 사용자: 채널 효율을 위해 sensitive trait을 추론·타기팅하지 않는다. minors 대상 personalized advertising은 별도 법률·안전 검토가 필요하다.
- WLD/WDX는 virtual/simulated/game-only이며 실제 투자·예금·법정화폐·현금환전·보장수익을 암시하지 않는다.

## 15. Runtime Product Reality Audit — 2026-09-15

Production 공개 페이지 접근 가능.

오늘 확인한 상태:
- 홈 첫 화면에서 지갑, 미니게임 5종과 wallet/game/exchange/shop/quest/lobby quick link가 즉시 보인다.
- main product explanation 전후로 sponsored placement가 있다.
- 그 아래에서 Discord로 이어지는 community virtual economy와 활동기록이라는 설명이 나온다.
- WLD와 보상은 game-only이며 현금 환전이 없다는 고지가 반복적으로 명확하다.
- Monthly Notes에는 아직 공개된 소식이 없다.
- public lobby는 low-activity state다.
- 시작 가이드는 복리예금, 국채, 대출, 가상주식 시세차익·배당, 사업 배당, casino와 `초보자 → 대표 자본가`의 wealth roadmap을 여전히 강하게 전면화한다.
- announcements에는 공개된 공지는 없지만 sponsored advertisement는 있다.
- privacy policy는 login/ledger/security에 필요한 정보의 최소 처리와 목적 공개를 명시한다.

시사점: 여러 acquisition channel이 현재 broad finance/economy-heavy public experience로 수렴한다. generic homepage로 보낸 방문 수 자체를 채널 성공으로 평가하지 말고, channel-specific public value와 최신 identity/history brand promise가 activation/D30을 개선하는지 확인해야 한다.

## 16. 최신 조사 노트

### 직접 채택
1. Google Search Central branded queries filter — 2025-11-20 발표, 2026-03-11부터 대상 사이트에 광범위 제공. branded demand와 non-branded discovery 분리.
2. Google Search Generative AI performance reports — 2026-06-03 발표, 2026-08-31 worldwide rollout 완료. AI visibility는 discovery diagnostic이며 retained-growth KPI는 아님.
3. Google Search platform properties — 2026-07-07 발표, 2026-07-29 global availability. social/video 콘텐츠의 search discovery를 cross-surface portfolio에 포함.
4. Google Meridian v2.0/GeoX — 2026-09 현재 공식 문서. causal experiment와 MMM을 결합한 cross-channel budget evidence 방향 채택.
5. Google Meridian full-funnel MMM — 2026 공식 문서. lower-funnel이 upstream brand demand를 harvest하면서 과대 attribution될 수 있다는 원칙 채택.
6. 개인정보보호위원회 2026-07-27 TikTok·Apple 제재 — attribution을 위해 behavioral tracking을 무리하게 확장하지 않는 근거.

### 참고만
- platform/vendor uplift 수치를 Moneyverse 예상성과로 사용하지 않는다.
- 현재 단계에서 Meridian/MMM 구현을 요구하지 않는다. scale에 맞춰 attribution + retained cohort + controlled evidence를 삼각측량하는 것이 우선이다.
- FTC review/endorsement guidance는 마케팅 integrity guardrail로 사용하며 Moneyverse에 대한 특정 집행 예측으로 사용하지 않는다.

## 17. 다음 성장 우선순위

가장 작은 신뢰 가능한 채널 묶음으로 **통합 acquisition portfolio review**를 검증한다.

`non-branded organic/content + branded/direct + creator/community + referral/share + paid`

각 채널에서 promise comprehension → authored interest → meaningful activation → D7 → D30 → fraud-adjusted retained contribution을 비교하고, 큰 예산/편집/creator capacity 재배분 전에 bounded incrementality test를 최소 하나 수행한다.

platform-attributed conversion이 늘었다는 이유만으로 tracking, finance-keyword acquisition, referral reward, spend를 확대하지 않는다.
