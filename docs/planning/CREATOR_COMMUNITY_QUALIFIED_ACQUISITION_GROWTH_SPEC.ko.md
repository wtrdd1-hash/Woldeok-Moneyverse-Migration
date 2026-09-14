# 월덕 머니버스 — 크리에이터·커뮤니티 Qualified Acquisition 성장 명세

> 버전: v2026.09.14.67
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `BRAND_CONTENT_GROWTH_ENGINE_SPEC.md`, `RETENTION_TO_VIRAL_GROWTH_LOOP_SPEC.md`, `BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.md`
> 영문 기준 문서: [CREATOR_COMMUNITY_QUALIFIED_ACQUISITION_GROWTH_SPEC.md](CREATOR_COMMUNITY_QUALIFIED_ACQUISITION_GROWTH_SPEC.md)
> 변경 유형: 문서-only. 런타임, DB, API, 인증, 인프라, scheduler, 보안 코드는 변경하지 않는다.

## 1. 이번 회차에서 선택한 공백

기존 기획은 SEO, 공개 콘텐츠, 공유 아티팩트, referral 안전장치, 브랜드 약속, onboarding, D1~D30 retention, permission-to-return까지 상세하다. creator/community 협업도 이미 포맷 또는 disclosure 요구사항으로 언급되어 있다.

남은 acquisition 공백은 end-to-end 품질이다. **어떤 creator/community가 Moneyverse에 사람을 데려와야 하는지, 그 유입자가 첫 30초에 무엇을 봐야 하는지, 그리고 reach·repost·raw signup이 아니라 activation/D7/D30으로 협업 품질을 어떻게 판단할지**가 아직 충분히 닫히지 않았다.

Canonical loop:

`신뢰 가능한 creator/community 맥락 → 기대와 일치하는 공개 landing → 30~90초 가치 증명 → 사용자 선택 하나 → contextual signup → meaningful activation → D1 recognition → D7 continuation → 선택적 공유/커뮤니티 참여`

소비자 약속:

**“Moneyverse 밖에서 흥미를 느낀 바로 그 내용을, 안에서도 실제로 이어갈 수 있다.”**

## 2. 파트너 선정 원칙

먼저 reach를 사고 나중에 fit을 찾지 않는다. 다음 실제 Moneyverse intent와 겹치는 audience를 우선한다.

- simulation/economy-game 관심;
- 수집·꾸미기·world-building;
- 명확한 simulated 맥락의 경제/금융 입문 학습;
- community project·협력 창작;
- 가상기업/세계 storytelling;
- 게임 디자인·전략 회고·교육 replay.

다음 audience expectation 중심 파트너는 피한다.

- 실제 투자종목 추천·수익보장·부자되기 콘텐츠;
- 현금 도박·도박 팁;
- 쿠폰/referral farming 커뮤니티;
- bot traffic·구매 engagement·giveaway-only 참여 비중이 큰 곳;
- 괴롭힘·doxxing·사칭 등 unsafe community norm.

팔로워 수는 진단 입력이지 성공 KPI가 아니다.

## 3. 협업 포맷 우선순위

### A. Creator-guided playable story
Creator가 가상기업, collection, profession, season 질문 하나를 설명하고 같은 주제를 이어가는 public-safe 30~90초 sample로 연결한다.

### B. Authored output 중심 community challenge
Collection 배열, learning replay, season reflection, 가상기업 thesis, community project artifact 등 사용자가 직접 결과물을 만든다. 보상과 인정은 wealth/transaction volume보다 창의·학습·기여를 중심으로 한다.

### C. Curated creator/community spotlight
프로젝트·archive·collection·교육 결과를 opt-in public-safe 이야기로 소개한다. 독립적 reader value와 sponsor/material-connection disclosure가 필요하다.

### D. Creator code/referral link
사용자가 이미 제품가치를 이해한 뒤 attribution/편의를 위해 사용한다. 코드 자체를 product promise로 만들지 않는다. raw click/install/signup에 의미 있는 WLD/WDX 우위를 주지 않는다.

### E. Giveaway-first campaign
가장 낮은 우선순위다. Reach는 만들 수 있지만 intent quality와 bot/multi-account/referral fraud를 악화시킬 수 있다. 사용하더라도 경제 우위형 상품은 피하고 activation/D7 품질로 성공을 평가한다.

## 4. Creator/community 유입의 첫 30초

Landing은 source expectation을 보존하되 creator가 Moneyverse 경제 결과를 통제하는 것처럼 보이면 안 된다.

표시 순서:
1. 유입을 만든 정확한 topic/artifact;
2. Moneyverse가 persistent community simulation / game-only virtual economy라는 한 문장;
3. 가입 전 가능한 proof/sample 하나;
4. 필요한 경우 creator/sponsor 관계를 눈에 띄게 표시;
5. 다음 행동 하나만 제시.

Creator traffic을 generic home이나 지갑·대출·카지노·WDX profit 화면으로 바로 보내지 않는다.

## 5. 첫 3분과 가입 이유

가입 없이도 먼저 가치를 이해하게 한다.

`creator/community context → 짧은 sample → 선택 하나 → 결과/preview → “이 경로 저장하고 이어가기” signup`

예:
- 가상기업 scenario 선택;
- starter collection theme 선택;
- diversification/opportunity-cost replay;
- profession/project direction 선택;
- season/world 선택 비교.

가입 이유는 선택 저장·chapter 생성·thread follow·project 참여 같은 continuity다. OAuth 성공, 지갑 열기, 광고 클릭, creator code 입력은 activation이 아니다.

## 6. Partner cohort D1/D3/D7/D14/D30

- **D1:** 처음 들어온 topic/path가 그대로 기억되는지 확인.
- **D3:** 같은 관심에 인접한 lore/collection/profession/world/learning 하나만 깊게 연결.
- **D7:** 원래 thread가 어떻게 변했고 사용자가 실제 progress를 만들었는지 확인하는 partnership quality checkpoint.
- **D14:** opt-in curation/display/project/community 참여 제안.
- **D30:** campaign이 끝나도 남는 collection chapter, learning history, profession/project path, season record 등 durable state를 목표로 함.

## 7. Creator/community economics

가능하면 vanity가 아니라 qualified value에 비용을 지불한다.

`partner cost → qualified landing → authored choice → signup → activation → D7 → D30 → LTV/contribution`

Flat sponsorship, production fee, capped activation-quality bonus, non-cash community support 등이 후보다. uncapped raw-signup bounty는 피한다.

Creator/community가 판매할 수 없는 것:
- WDX 결과 우위;
- 대출조건 우위;
- casino odds/limit 우위;
- moderation priority;
- 숨겨진 검색/ranking 우대;
- 미표시 paid editorial conclusion.

## 8. Viral loop

목표는 `creator code → signup bounty`가 아니라 다음이다.

`creator가 의미 있는 맥락 소개 → 사용자가 자기 결과물을 만듦 → 선택적으로 공유 → 비회원도 이해 → 같은 가치 sample → activation/D7`

우선 artifact:
- curated collection/showcase;
- season reflection;
- educational replay;
- community project outcome;
- fictional-company/world interpretation;
- profile/space identity.

기본 공개 제외: 잔액, 비공개 WDX position, 부채/대출, casino history, private social graph, account/security/recovery, 정밀 개인정보.

## 9. SEO/public discovery

Creator/community page를 rented SEO inventory로 만들지 않는다.

색인 후보:
- 독창적 editorial value가 충분한 collaboration;
- public-safe project retrospective;
- 가입 없이 검색질문에 답하는 교육 replay/world/collection guide;
- authorship와 경제적 이해관계가 명확한 evergreen archive.

기본 noindex/unlisted 후보:
- thin campaign landing;
- referral/code page;
- giveaway entry;
- personalized campaign state;
- private/low-trust UGC;
- 제3자 검색평판을 빌리는 것이 주목적인 페이지.

SEO 성공은 `qualified visit → value → activation → D7/D30`으로 판단한다.

## 10. Monetization 경계

Creator traffic이라고 수익화를 앞당기지 않는다.

- 약속한 content/sample 뒤에 unrelated ad/subscription을 고려;
- paid/sponsored material 명확 표시;
- buy/sell/loan/repay UI를 흉내내는 native ad 금지;
- creator-specific 경제우위 금지;
- private economy/loss/debt/casino를 creator 광고 targeting에 사용 금지;
- view/like/repost/follow/signup 자체에 의미 있는 WLD/WDX 지급 금지.

Sponsor revenue와 함께 bounce, activation, D7/D30, ad-induced churn, support cost, trust complaint를 본다.

## 11. 실험 backlog

### A. Contextual creator landing vs generic home
가설: source expectation 보존이 meaningful activation과 D7을 높인다.
주요지표: landing→meaningful activation, D7.
Guardrail: bounce, 금융서비스 오인, fake signup, privacy complaint, phishing report.
관찰: D7 성숙 후 1차 판정, scale 전 D30 확인.

### B. Authored challenge artifact vs follow/repost giveaway
주요지표: participant→activation→D7, artifact share→recipient activation.
Guardrail: bot/multi-account, spam/report, moderation load.

### C. Micro/niche fit vs larger broad-reach partner
주요지표: fraud-adjusted CAC per D30 retained activated user.
Guardrail: brand safety, disclosure complaint, support burden.

### D. 명확한 sponsor 표시 vs 모호한 표시
주요지표: trust/comprehension + activation/D7.
원칙: CTR을 위해 disclosure를 약화시키지 않는다.

### E. Reward-free referral attribution vs raw-signup economic bounty
주요지표: activated retained user, fraud-adjusted CAC.
Guardrail: fake signup, referral fraud, duplicate reward, linked-account abuse.
기본값: reward-free 또는 cosmetic/prestige 중심.

## 12. KPI

Acquisition quality:
- qualified creator/community visit;
- landing→sample;
- sample→authored choice;
- contextual signup;
- signup→meaningful activation;
- time-to-first-value;
- auth 이후 source-intent preservation.

Retention:
- D1 exact-source-interest recognition;
- D3 adjacent-depth;
- D7 original-thread continuation;
- D14 identity/community participation;
- D30 durable record.

Viral/community:
- artifact creation;
- opt-in share;
- recipient engaged visit→activation→D7;
- second-generation share;
- report/block/moderation.

Economics:
- partner spend;
- CAC per activation;
- fraud-adjusted CAC;
- D7/D30 retained CAC;
- cohort LTV/contribution;
- retention 이후 creator/community-assisted revenue.

Trust guardrails:
- fake-signup;
- referral fraud;
- suspicious reward duplication;
- ATO/phishing;
- impersonation/report;
- privacy complaint;
- sponsor-disclosure complaint;
- bot/fake-engagement signal.

## 13. 보안·악용·개인정보

### High — creator/공식 사칭·피싱
영향: 가짜 creator code/landing/reward를 믿고 credential·OAuth·recovery·payment 정보를 넘길 수 있음.
최소조건: canonical domain, official/creator identity 구분, growth message에서 credential 요구 금지, safe outbound link, URL에 secret/session/recovery 금지.
별도 개발/QA: 실제 creator deep link/campaign domain/account-linked reward 전 필요.

### High — referral/giveaway 다계정 farming
최소조건: raw click/follow/share/signup에 의미 있는 경제보상 금지, fraud-adjusted attribution, 경제보상 도입 전 별도 fraud QA.

### High — finance-like creator deception
영향: WLD/WDX·은행·주식·casino를 실제 수익/투자/도박기회로 오인.
최소조건: 승인된 claim, 인접한 game-only 설명, 금지문구 목록, unsafe creative 중단/삭제 경로.
별도 legal/trust review 필요.

### High — creator showcase public/private leakage
최소조건: public-safe allowlist, 명시적 opt-in, reversible visibility, balance/position/debt/social graph/security/recovery/moderation 비공개.

### Medium — fake social proof/purchased engagement
Bot follower/view 구매·보상을 성공으로 인정하지 않고 의심 traffic은 payout/실험에서 제외.

### Medium — community challenge harassment/doxxing
Bounded prompt, block/report/takedown, 강제 실명·연락처 금지, moderation capacity가 scale 전 필요.

### Medium — analytics overcollection
Source attribution 목적에 필요한 최소정보만 사용하고 private economy, credential, security/recovery state를 creator/ad/analytics partner에 보내지 않는다.

기존 auth/session/RBAC/ledger/admin/privacy 경계는 변경하지 않는다.

## 14. 법규·정책 주의

- 한국: 추천·보증에서 경제적 이해관계는 공정위 지침에 따라 명확히 표시해야 하며 모호한 표현으로 숨기지 않는다.
- 미국: FTC Endorsement guidance 및 Consumer Reviews and Testimonials Rule 취지를 반영해 실제 경험, material connection, fake/incentivized-positive social proof를 엄격히 관리한다.
- 긍정적 의견을 조건으로 review/testimonial 보상을 주지 않는다.
- WLD/WDX는 virtual/simulated/game-only이며 cash redemption, deposit, real security, guaranteed income, real gambling win을 암시하지 않는다.
- 미성년자 대상 campaign, personalized ad, 외부 tracking SDK, real-value prize는 별도 최신 한국/미국 검토가 필요하다.

## 15. 최신 레퍼런스

조사일: 2026-09-14.

직접 채택:
1. YouTube **Brand Deal Desk**, 2026-07-01 — creator-brand fit, 협상, performance reporting을 강조. reach보다 downstream quality 평가 근거. https://blog.youtube/creator-and-artist-stories/youtube-brand-deal-desk-creator-series/
2. YouTube/Google **Search profiles**, 2026-06-04 — creator의 verified/canonical public identity. 사칭·가짜 링크 방지 원칙에 채택. https://blog.youtube/news-and-events/google-search-profiles-for-creators/
3. FTC **TruHeight final order**, 2026-07 — fake/incentivized-positive review와 bot social profile 관련 최신 집행. https://www.ftc.gov/news-events/news/press-releases/2026/07/ftc-approves-final-order-against-truheight-deceptive-unsubstantiated-advertising-supplements-kids
4. FTC **Consumer Review Rule warning letters**, 2025-12 — fake review, sentiment-conditioned incentive, fake social indicator 금지 재확인. https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-warns-10-companies-about-possible-violations-agencys-new-consumer-review-rule
5. 공정거래위원회 **추천·보증 등에 관한 표시·광고 심사지침 개정**, 2024-12-01 시행, 이번 조사에서 더 최신 공식 개정은 확인되지 않음 — 경제적 이해관계 명확 표시에 직접 적용. https://www.ftc.go.kr/www/selectBbsNttView.do?bordCd=3&key=12&nttSn=43669

참고만 하며 기본 mechanic으로 복제하지 않음:
6. Clash Royale 2v2 복귀 캠페인, 2026-09-09 — 특정 feature affinity와 social participation을 연결한 최신 사례. Moneyverse는 repost volume·경품응모를 핵심 KPI로 채택하지 않는다. https://supercell.com/en/games/clashroyale/ja/blog/community/%E3%82%AF%E3%83%A9%E3%83%AD%E3%83%AF2v2%E5%BE%A9%E6%B4%BB%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%9A%E3%83%BC%E3%83%B3/

## 16. Runtime Product Reality Audit

2026-09-14 공개 runtime 확인:
- `/` 정상 접근 및 WLD/보상이 game-only라는 고지가 명확함;
- 홈은 지갑·미니게임·거래소·상점·퀘스트 shortcut과 여러 sponsored placement를 우선 노출;
- Monthly Updates는 검토된 공개소식을 준비 중이라고 표시;
- `/announcements` 접근 가능하지만 게시 공지가 없고 sponsored placement는 존재;
- `/guide`는 복리예금, 국채, 대출, 가상주식 시세차익/배당, 사업수익, casino와 `대표 자본가` 성장서사를 강하게 전면화.

따라서 creator/community acquisition을 generic home/guide로 대규모 확장하지 않는다. 약속과 landing 맥락을 보존하고 expectation-match가 activation/D7/D30을 개선하는지 먼저 검증해야 한다.

## 17. 버전 기록

### v2026.09.14.67 — creator/community qualified acquisition
- follower count보다 audience/product fit 중심의 partner 선정 원칙 추가.
- collaboration 포맷을 downstream user quality 기준으로 정렬.
- creator/community cohort의 첫 30초·3분·signup·D1~D30 journey 정의.
- fraud-adjusted CAC, retained CAC, contribution을 creator economics에 연결.
- activation/D7/D30 및 trust guardrail을 포함한 실험 5개 추가.
- creator impersonation, referral farming, finance-like deception, public/private leakage, fake social proof, harassment, analytics privacy 위험을 명시.
- 기존 auth/session/RBAC/ledger/admin/privacy 경계 보존.

문서-only 소비자 기획 변경이다.