# 월덕 머니버스 — 유료 획득 품질·리텐션 경제성 성장 명세

> 버전: v2026.09.14.89
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `BRAND_PROMISE_DISCOVERY_POSITIONING_GROWTH_SPEC.md`, `TRUST_PROOF_CREDIBILITY_CONVERSION_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> 영문 기준 문서: [PAID_ACQUISITION_QUALITY_RETAINED_ECONOMICS_GROWTH_SPEC.md](PAID_ACQUISITION_QUALITY_RETAINED_ECONOMICS_GROWTH_SPEC.md)
> 변경 유형: 문서 전용. 런타임·DB·API·인증·migration·scheduler·인프라·보안 코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

Moneyverse에는 이미 organic discovery, 브랜드 약속, 가입 전 가치, 가입 intent 복구, 첫 주 complexity, D1~D30 continuity, social/viral, trust proof, retention-safe monetization 기획이 있다. 이번에 가장 크게 남은 acquisition 공백은 **유료 유입의 품질**이다.

핵심 질문은 다음이다.

**Moneyverse가 돈을 써서 관심을 사올 때 클릭·싼 가입·금융 키워드 호기심을 최적화하지 않고, 실제로 건강한 D7/D30 사용자와 양의 기여이익을 만들 수 있는가?**

현재 공개 홈은 cold paid traffic의 기본 목적지로 쓰기에는 복잡하다. 첫 화면에서 지갑, 미니게임 5종, 거래소, 상점, 퀘스트, 로비와 sponsored placement가 동시에 보이고, 핵심 브랜드 설명은 그 아래에 있다. WLD/보상이 game-only라는 고지는 분명하지만, 광고가 약속한 좁은 가치 하나가 broad homepage에서 쉽게 희석될 수 있다.

선택한 루프:

`정직한 paid creative → source-matched public-safe landing → proof/sample 하나 → 사용자가 고른 관심사 → contextual signup → 의미 activation → D1 약속 유지 → D7 retained intent → D30 durable history → contribution margin → 그 다음에만 spend 확대`

이 문서는 광고 플랫폼 연동·tracking 구현 명세가 아니다. 소비자 흐름, 채널 경제성, 실험 규칙, 개인정보·어뷰징 gate를 정의한다.

## 2. Paid acquisition은 트래픽 목표가 아니라 품질 증폭기

유료 유입은 destination experience가 이미 가치를 증명한 뒤에만 확대 대상이 된다.

성공으로 정의하지 않는 것:
- CPM, CPC, CTR, impression 단독;
- raw 회원가입;
- 앱 설치 또는 OAuth 완료;
- raw referral acceptance;
- 의미 행동 없는 sessions/user 증가;
- 유료 유입에서 발생한 단기 광고수익.

핵심 성공 단위:

**fraud-adjusted D30 retained user + 양의 예상 contribution margin + 허용할 수 없는 trust/privacy/safety 악화 없음.**

Meaningful activation, D1, D3, D7은 중간 판단지표지만 D30 경제성을 무시할 면허가 아니다.

## 3. Acquisition promise family

Paid creative는 Moneyverse 전체를 한 번에 광고하지 않고 소비자 약속 하나만 정직하게 내세운다.

### A. Persistent world / identity
약속: 직업, 컬렉션, 프로젝트, 공간/아카이브처럼 시간이 지나도 남는 정체성과 기록을 만든다.

장기 리텐션과 잘 맞고 실제 금융서비스 오인 위험도 상대적으로 낮아 우선순위가 높다.

### B. Collection / lore / season discovery
약속: 허구 기업, 컬렉션, 시즌 chapter, world story 하나를 탐색하고 선택적으로 개인 thread로 보존한다.

Landing 자체가 가입 전에도 유용해야 한다.

### C. Learning / simulation
약속: 경제·시장 개념 하나를 명확히 허구/game-only인 sample 또는 replay로 이해한다.

고위험 표현 주의: 실제 투자성과, 보장수익, 예금, 실제 증권, 현금환전을 암시하지 않는다.

### D. Community / cooperative project
약속: public-safe club/project/community outcome 하나를 먼저 이해하고 선택적으로 참여한다.

스팸, 사칭, 괴롭힘, doxxing, 가짜 활동을 함께 검토한다.

### Cold paid acquisition에서 기본적으로 피할 표현
- `돈 벌기`, `수익 내기`, `안전한 투자`, `고수익`, `손실 복구`, `추천 종목`, `보장 수익`;
- 대출·부채 urgency;
- 카지노 승리 중심 creative;
- wealth leaderboard/status bait;
- raw WLD giveaway 또는 가입보너스 중심 creative;
- sponsorship/material connection을 숨긴 creator claim.

## 4. Creative → landing → product continuity 계약

모든 캠페인은 primary landing intent 하나에 매핑한다.

Cold visitor는 첫 30초 안에 다음을 이해해야 한다.
1. 광고가 무엇을 약속했는가?
2. 랜딩도 같은 것을 실제로 제공하는가?
3. 금융유사 표현이 있다면 virtual/game-only임이 분명한가?
4. 계정정보를 주기 전에 유용한 값을 받을 수 있는가?
5. 이 관심을 보존하는 optional next action 하나는 무엇인가?

권장 순서:

`광고 약속 → 같은 headline/context → proof/sample → authored choice 하나 → 필요할 때만 contextual signup`

좁은 creative를 generic feature grid로 보내지 않는다. 안전한 source-matched public page가 가능하다면 그쪽을 우선한다.

Cloaking, reviewer/user별 실질적으로 다른 페이지, fake scarcity, 숨은 redirect chain, 오해시키는 button label은 금지한다.

AI/ad-platform 생성 creative는 broad rollout 전에 Moneyverse brand, game-only, consumer-safety 규칙에 맞는 human review를 거쳐야 한다. 자동 확장 때문에 virtual learning/world 메시지가 실제 금융·도박 메시지로 변하면 안 된다.

## 5. 첫 30초 / 첫 3분 / 첫 세션

### 첫 30초
- 약속 하나;
- 믿을 이유 하나;
- 필요한 game-only 설명 하나;
- sample/proof 하나;
- CTA 하나.

### 첫 3분
사용자는 useful thing 하나를 소비하거나 시도하고 authored interest 하나를 만든다.
- 허구 기업/world thread follow 또는 save;
- 직업/컬렉션 방향 선택;
- bounded learning replay/sample;
- season/project chapter 탐색;
- `계속 / 다른 것 보기 / 나중에` 선택.

### 첫 세션
가입하면 auth 이후에도 paid source intent를 정확히 복구해 의미 행동 하나로 이어야 한다. 계정 생성은 activation이 아니다.

첫 세션은 결과와 선택적 continuation으로 닫고, feature tour나 즉시 수익화 압박으로 끝내지 않는다.

## 6. Paid cohort의 D1 / D3 / D7 / D14 / D30

### D1 — promise kept
가입 직전 광고에서 선택한 exact thread를 우선 복원한다. wallet wealth, casino, debt, generic home이 default 복귀 이유가 되어서는 안 된다.

### D3 — useful continuity
실제 변화, 관련 context 또는 정직한 unchanged state + 다음 행동 하나를 보여준다. 광고비를 정당화하려고 가짜 novelty를 만들지 않는다.

### D7 — retained intent
같은 identity/collection/learning/project/world loop가 실제로 진행되거나 의미 있게 advance돼야 한다. 캠페인 유지의 첫 serious quality gate다.

### D14 — voluntary breadth
core value가 명확해진 후에만 adjacent system을 제안한다. feature breadth 자체는 성공지표가 아니다.

### D30 — durable history
유료 유입 사용자는 collection chapter, profession path, project record, learning replay history, season memory, public-safe share outcome 같은 지속 기록 하나가 남아야 한다.

Paid source 사용자를 붙잡기 위해 organic보다 더 큰 WLD grant, 더 강한 FOMO, 더 많은 알림을 사용하지 않는다.

## 7. Channel economics와 scale gate

### 필수 추적 항목
- spend;
- qualified landing visit;
- meaningful activation;
- D1/D3/D7/D14/D30 retained users;
- 위 지표의 fraud-adjusted cohort;
- applicable한 ad/subscription/cosmetic/sponsor contribution;
- moderation/support/refund/chargeback/fraud 비용;
- attributable infra/content 비용;
- contribution margin과 payback period.

Useful derived metrics:
- `CAC_activation = spend / meaningful activations`;
- `CAC_D7 = spend / fraud-adjusted D7 retained users`;
- `CAC_D30 = spend / fraud-adjusted D30 retained users`;
- `retained contribution = cohort revenue - variable ad/payment/support/moderation/fraud/content costs`;
- `LTV/CAC`는 mature cohort가 뒷받침할 때만 사용하며 낙관적 추정으로 만들지 않는다.

### Scale gate

예산을 크게 늘리기 전 최소조건:
1. landing promise comprehension이 허용 수준;
2. meaningful activation이 baseline 이상 또는 사전 목표 충족;
3. D7 mature cohort가 건강함;
4. 가능하면 permanent standard 전 D30 확보;
5. fake-signup/referral/invalid-traffic signal이 통제됨;
6. finance-like misunderstanding, privacy complaint, phishing report가 유의하게 악화되지 않음;
7. retained contribution에서 현실적인 payback path가 보임.

가입은 싸지만 D7/D30이 약한 캠페인은 실패다.

## 8. Attribution과 incrementality

Last-click만으로 paid media가 durable value를 만들었다고 판단하지 않는다.

세 관점을 함께 사용한다.
- platform attribution: 운영 최적화;
- first-party cohort: activation/D7/D30 품질;
- 충분한 규모일 때 holdout, geo/time controlled comparison 등 incrementality evidence.

Attribution을 개선한다는 이유로 private economy/security 데이터를 광고 플랫폼에 넘기지 않는다.

향후 별도 privacy/legal review 없이는 advertising optimization payload로 쓰지 않는 항목:
- WLD/WDX exact balance/holdings;
- debt/loan state;
- casino win/loss;
- exact private portfolio;
- private club/social graph;
- moderation/recovery/account-security state;
- credential/token/session/recovery material;
- inferred sensitive trait.

Acquisition quality를 측정하는 데 필요한 최소 event set만 사용한다. 새로운 pixel, Conversion API/server event, audience sync, enhanced matching은 실제 구현 전에 별도 privacy/security/legal QA가 필요하다.

## 9. Paid retargeting / comeback

Retargeting은 압박 권한이 아니다.

가능한 theme:
- 사용자가 명시적으로 관심을 보인 world/collection/project thread;
- 실제 공개된 새 season chapter;
- 유용한 교육 continuation;
- 이전 관심사와 관련된 public archive/update.

피할 것:
- `잔액이 기다리고 있다`;
- debt/loss/casino urgency;
- 가짜 reward expiry;
- private state를 광고 creative에 노출;
- stalking처럼 느껴지는 frequency;
- 명확한 법적·privacy·safety 근거 없는 minor/sensitive cohort targeting.

성공은 retarget click이 아니라 comeback → meaningful action → D7/D30이다.

## 10. Paid acquisition과 SEO/content의 관계

Paid media가 people-first organic content를 대체하지 않는다.

충분히 유용한 public guide, 허구 기업 page, season archive, glossary/learning content, public-safe project retrospective는 organic과 paid destination을 동시에 할 수 있다.

Keyword/ad group마다 실질적으로 같은 thin landing을 대량 생산하지 않는다. campaign parameter, referral token, account-specific state, private personalization은 색인하지 않는다.

Paid landing이 강한 D7/D30을 보이면 canonical public page를 개선하는 학습으로 환원하고 permanent doorway page farm을 만들지 않는다.

## 11. Viral/referral 상호작용

Paid acquisition과 referral은 경제성과 abuse 분석에서 분리한다.

다음 신호에 큰 WLD/WDX reward를 겹쳐 지급하지 않는다.
- raw signup;
- invite acceptance;
- page view;
- share;
- ad click;
- notification opt-in.

Referral benefit이 있다면 delayed, capped, verified multi-day healthy participation을 조건으로 하고 경제우위보다 cosmetic/honor/collection/convenience를 우선한다.

특히 확인할 abuse:
- paid traffic으로 referral payout 구매;
- affiliate self-referral;
- multi-account farm;
- bot signup;
- device/network recycling;
- coupon/reward duplication;
- coordinated creator/referral manipulation.

## 12. Paid acquisition 이후 monetization

Moneyverse가 사용자를 돈 주고 데려왔다는 이유로 그 사용자가 곧바로 monetization-ready가 되는 것은 아니다.

기존 순서를 유지한다.

`약속된 가치 → meaningful activation → continuity proof → monetization eligibility → 낮은 방해의 수익화 → D30/trust 검증`

CAC를 빨리 회수하려고 첫 세션 ad load를 늘리지 않는다. paid promise와 첫 결과 사이에 sponsor/subscription pressure를 넣지 않는다.

수익성은 다음을 함께 본다.
- ad-induced churn;
- session abandonment;
- D1/D7/D30;
- subscription conversion/cancellation;
- cohort revenue;
- contribution margin;
- support/moderation/privacy cost.

## 13. KPI 추가

### Acquisition quality
- qualified visit rate;
- ad-promise comprehension;
- landing-message match comprehension;
- first-sample completion;
- authored-interest rate;
- visitor → signup;
- visitor/signup → meaningful activation;
- time-to-first-value;
- first-session completion;
- campaign/creative/landing/source별 D1/D3/D7/D14/D30;
- paid returning-user share;
- meaningful actions/session;
- activation/D7/D30 retained user당 paid CAC;
- retained LTV/CAC와 contribution margin.

### Trust / fraud / privacy guardrail
- invalid/suspicious traffic rate;
- fake-signup rate;
- referral/affiliate fraud rate;
- suspicious reward duplication;
- ATO/phishing report signal;
- finance-like misunderstanding rate;
- spam/report rate;
- privacy complaint rate;
- 가능한 범위의 tracking opt-out/complaint signal;
- landing/ad mismatch complaint;
- minor/sensitive-targeting incident;
- downstream ad-induced churn.

## 14. 실험 backlog

### A. Source-matched landing vs generic homepage
가설: 광고 약속과 한 가지 public-safe landing을 맞추면 의미 activation과 D7이 좋아지고 오인은 늘지 않는다.
대상: first-time paid visitor.
Control: generic homepage.
Treatment: 약속 일치 landing + proof/sample 하나 + CTA 하나.
Primary: meaningful activation, D7.
Guardrail: bounce, finance-like misunderstanding, fake signup, privacy/phishing complaint.
관찰: mature D7 필수, 가능하면 permanent default 전 D30.
성공: strongest promise family부터 확대. 실패: targeting을 더 늘리기 전에 creative/landing promise부터 단순화.

### B. Signup optimization vs meaningful activation optimization
가설: higher-quality privacy-safe conversion proxy를 사용하면 volume은 줄어도 retained user 품질이 높아진다.
Control: signup optimization.
Treatment: meaningful-activation optimization.
Primary: CAC_D7, D7 retention.
Guardrail: qualified volume, D30, fake signup, privacy leakage.
관찰: platform learning에 충분한 conversion + mature D7.

### C. Broad discovery vs qualified intent controls
가설: 좁은 promise/intent control이 click은 줄여도 activation과 D30 economics를 개선한다.
Control: reviewed safe creative 기반 broad discovery.
Treatment: 더 강한 intent/placement/keyword exclusion + source-matched destination.
Primary: fraud-adjusted CAC_D30 또는 가장 성숙한 retained CAC.
Guardrail: reach, activation, finance/casino misunderstanding, invalid traffic.
관찰: D7 필수, D30 권장.
오해시키는 finance/profit creative는 실험군으로도 사용하지 않는다.

### D. Platform attribution only vs incrementality-informed budget review
가설: first-party retained cohort와 holdout/incrementality를 함께 보면 자연전환을 paid channel에 과도하게 귀속하는 일을 줄일 수 있다.
Primary: spend당 incremental D30 retained user.
Guardrail: measurement noise, privacy, operational cost.
관찰: 여러 campaign cycle; underpowered test에서 강한 결론 금지.

### E. Immediate retargeting vs value-triggered retargeting
가설: 사용자가 public-safe interest를 명확히 보여준 뒤 quiet period를 두고 retarget하면 complaint/fatigue가 줄고 comeback 품질이 높아진다.
Primary: comeback → meaningful action → D7.
Guardrail: frequency, hide/report, privacy complaint, phishing confusion.
관찰: 여러 주 + mature D7.

## 15. 보안·악용·개인정보 검토

### HIGH — paid-ad impersonation / phishing / ATO
사용자 영향: 공격자가 Moneyverse 광고, `WLD 보상`, 계정보호 공지, 가짜 로그인 page를 사칭할 수 있다.
악용 시나리오: sponsored-looking creative가 credential/OAuth/recovery 탈취 페이지로 연결된다.
최소 보호조건: canonical domain 일관성, official brand 명확성, growth 메시지에서 password/OAuth/recovery code 요구 금지, URL에 secret 금지, 가능한 운영 범위에서 명백한 사칭 신고/모니터링.
별도 개발/QA: 새 deep-link/auth campaign 또는 anti-impersonation tooling 구현 시 필요.

### HIGH — AI/broad creative가 실제 금융·도박 claim으로 drift
사용자 영향: Moneyverse가 실제 투자/예금/도박/손실복구 서비스처럼 오인될 수 있다.
악용 시나리오: 자동 text expansion이 `고수익`, `안전한 종목`, `손실 복구` 같은 문구를 생성한다.
최소 보호조건: human-reviewed creative library, 필요한 game-only 표시, unsafe claim exclusion, cash redemption/guaranteed return/real-security framing 금지.
별도 검토: finance-adjacent paid campaign 전 product/legal/trust review.

### HIGH — invalid traffic / bot / fake signup / referral arbitrage
사용자·사업 영향: spend 낭비, 실험 왜곡, reward duplication, economy abuse.
악용 시나리오: bot/multi-account farm이 paid traffic과 signup/referral/reward incentive를 결합한다.
최소 보호조건: fraud-adjusted metric, raw ad click/signup/share에 meaningful WLD/WDX 지급 금지, delayed/capped referral, scale 전 anomaly review.
별도 개발/QA: paid acquisition과 economy reward 결합 전 필요.

### HIGH — advertising/analytics data leakage
사용자 영향: private economy/social/security data가 pixel/API/audience upload를 통해 제3자로 나갈 수 있다.
악용 시나리오: exact WLD/WDX/debt/casino/private-social state가 targeting/profile data가 된다.
최소 보호조건: purpose limitation, data minimization, public-safe event taxonomy, secret/private state 금지, age/region review, vendor/legal basis 확인.
별도 privacy/security/legal QA: 새 tracking vendor, server-side conversion API, enhanced matching, audience sync 전 필요.

### MEDIUM — landing mismatch / cloaking / affiliate deception
영향: trust 악화, 플랫폼 제재, scam-like 경험.
최소 보호조건: reviewer/user에게 creative와 destination이 실질적으로 일치, cloaking/hidden redirect 금지, affiliate/creator도 동일 claim/disclosure rule 적용.
별도 QA: affiliate network 확대 전 필요.

기존 OAuth/session/RBAC/admin/ledger/market-integrity/privacy/community 경계는 유지한다. 이번 회차에서 보안 코드는 수정하지 않는다.

## 16. 한국·미국 법규/정책 주의점

- WLD/WDX는 virtual/simulated/game-only이며 paid creative에서 실제 증권·예금·법정화폐·현금환전·보장수익을 암시하지 않는다.
- 광고·후기·creator endorsement는 사실에 부합해야 하고 필요한 경우 material connection을 명확히 공개한다.
- Paid acquisition은 타사 행태정보를 더 넓게 수집·이용할 이유가 아니다. 새 tracking/targeting에는 실제 법적 근거와 필요한 고지·통제가 있어야 한다.
- minor/sensitive targeting은 보수적으로 다루고 별도 검토 후에만 확대한다.
- 서비스 동의를 광고 동의로 몰래 확장하거나 광고 거부를 어렵게 하지 않는다.
- subscription/paid plan 광고는 중요한 조건, 명시적 동의, 취소·환불 조건을 숨기지 않는다.

본 문서는 제품 기획이며 법률의견이 아니다. 실제 launch에서는 당시 구현·audience·지역·vendor stack 기준으로 최신 legal/compliance review가 필요하다.

## 17. Research note — 2026-09-14

### 직접 채택

1. **Google Ads — AI Max / DSA migration, 2026-04-15, 2026-06-11 업데이트**
   - 출처: https://blog.google/products/ads-commerce/dsa-upgrade-to-ai-max-2026/
   - 시사점: 검색 matching, creative, final URL expansion이 더 자동화·확장되는 방향.
   - 채택: Moneyverse는 campaign platform의 확장 자체보다 creative/landing intent control, human review, D7/D30 quality gate를 우선한다.
   - Google 내부 성과수치는 Moneyverse 예상치로 사용하지 않는다.

2. **Google Ads — AI Max steering features, 2026-04-30**
   - 출처: https://blog.google/products/ads-commerce/ai-max-new-features/
   - 시사점: AI expansion에도 brand/messaging steering control이 중요하다.
   - 채택: approved claim/promise set를 유지하고 특히 finance-like vocabulary에 campaign control을 safety/quality 장치로 사용한다.

3. **TikTok for Business — Attribution Portfolio, 2026-05-13**
   - 출처: https://ads.tiktok.com/business/en-US/blog/attribution-analytics-performance-comparison
   - 시사점: discovery→conversion은 multi-touch이며 last-click만으로 전체 영향을 판단하기 어렵다.
   - 채택: platform attribution + first-party retained cohort + incrementality evidence를 결합한다.

4. **Meta — 2026 AI Drives Performance, 2026-01**
   - 출처: https://about.fb.com/news/2026/01/2026-ai-drives-performance/
   - 시사점: incremental attribution과 자동화된 ranking/creative 비중이 커지고 있다.
   - 채택: incrementality-aware measurement와 automated creative의 human-reviewed brand/safety boundary를 방향성으로 채택. Meta 내부 uplift는 Moneyverse 예상치로 사용하지 않는다.

5. **Google Ad Traffic Quality — invalid activity guidance, current**
   - 출처: https://www.google.com/ads/adtrafficquality/invalid-activity/
   - 시사점: bot, fraud, accidental interaction 등 진짜 관심이 아닌 traffic이 존재한다.
   - 채택: click 대신 fraud-adjusted activation/D7/D30 및 accidental-click guardrail 사용.

### 신뢰·개인정보·악용 guardrail

6. **Meta — scam advertiser legal action, 2026-02-26**
   - 출처: https://about.fb.com/news/2026/02/meta-takes-legal-action-against-scam-advertisers/
   - 시사점: celeb-bait, cloaking, brand impersonation, subscription fraud가 실제 paid-ad 공격 패턴이다.
   - 채택: cloaking 금지, creative/destination consistency, canonical domain, creator/affiliate claim 통제.

7. **Meta — advertiser verification / anti-scam expansion, 2026-03**
   - 출처: https://about.fb.com/news/2026/03/meta-launches-new-anti-scam-tools-deploys-ai-technology-to-fight-scammers-and-protect-people/
   - 시사점: advertiser identity와 high-risk category verification이 anti-scam의 중요한 축이다.
   - 채택: brand identity/canonical destination consistency를 growth trust requirement로 취급한다.

8. **개인정보보호위원회 — TikTok·Apple 제재, 2026-07-27**
   - 출처: https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS215&mCode=C040060000&nttId=12343
   - 시사점: 적법 근거 없는 타사 행태정보 수집·이용은 현재 집행 관심사항이다.
   - 채택: private Moneyverse economy/social/security data를 광고용 profiling에 무제한 사용하지 않고 새 tracking은 별도 privacy/legal QA.

9. **KISA 불법스팸대응센터 — 정보통신망법 안내서 제7차 개정, 2026-03-04**
   - 출처: https://spam.kisa.or.kr/spam/main.do
   - 시사점: 모호한 광고 수신 동의, 앱푸시 광고 거부를 어렵게 만드는 UX 등을 명확히 경계한다.
   - 채택: paid retargeting/marketing에서 서비스 동의를 숨은 광고동의로 확장하지 않고 manipulative opt-out friction을 쓰지 않는다.

## 18. Runtime Product Reality Audit — 2026-09-14

Runtime verification: **공개 웹 홈 기준 가능**.

`https://easy-scraping.com/`에서 확인:
- WLD와 보상이 game-only virtual data라는 안내가 반복됨;
- 첫 viewport에서 지갑·미니게임이 보이고 quick-link grid에 지갑, 게임, 거래소, 상점, 퀘스트, 로비가 함께 노출됨;
- product explanation 앞과 중간에 sponsored placement가 있음;
- 핵심 brand explanation인 `Discord로 이어지는 커뮤니티 가상경제`, `활동은 기록으로 남음`은 초기 shortcut 영역 아래에 위치;
- 가입 전 시작 가이드·상점 preview·운영소식·community lobby context가 있음;
- 운영소식은 현재 quiet state.

성장 시사점:
**generic homepage를 모든 cold paid campaign의 기본 landing으로 쓰지 않는다.** world/collection/learning/community 하나를 약속한 광고가 multi-feature first viewport에서 맥락을 잃을 가능성이 있으므로, spend 확대보다 source-matched landing/message continuity를 첫 실험으로 둔다.

보안 시사점:
현재 game-only boundary는 paid creative에서도 그대로 유지해야 하며 CTR이나 signup을 높이려고 약화하지 않는다.

## 19. 버전 기록

### v2026.09.14.89 — 유료 획득 품질·리텐션 경제성 성장
- paid acquisition을 click/signup 문제가 아니라 retained-user economics 문제로 정의.
- 4개의 안전한 promise family와 finance/profit/casino형 cold acquisition 제외 규칙 추가.
- creative→landing→sample→authored interest→signup→activation continuity 계약 추가.
- paid cohort D1/D3/D7/D14/D30 기준 추가.
- CAC_activation/CAC_D7/CAC_D30 및 retained contribution scale gate 추가.
- platform attribution + first-party cohort + incrementality 측정 모델 추가.
- privacy-minimized ad event 경계와 민감 optimization payload 금지 항목 추가.
- paid retargeting/comeback, SEO/content, referral, monetization 상호작용 규칙 추가.
- 5개 실험과 mature retention/trust/fraud/privacy guardrail 추가.
- HIGH 4개, MEDIUM 1개의 보안·악용·개인정보 위험 기록.
- 2026 Google/Meta/TikTok/PIPC/KISA 최신 근거를 직접 채택/guardrail로 구분해 기록.
- 공개 홈 runtime audit 가능. Source-matched paid landing의 실제 효과는 아직 미검증 성장 가설.

문서 전용 소비자 기획 업데이트이며 기존 구현·보안·경제 경계를 그대로 보존한다.