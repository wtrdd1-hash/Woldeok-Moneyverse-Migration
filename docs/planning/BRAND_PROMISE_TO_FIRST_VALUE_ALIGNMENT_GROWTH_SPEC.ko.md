# 월덕 머니버스 — 브랜드 약속→첫 가치 정렬 성장 명세

> 버전: v2026.09.14.65
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `BRAND_CONTENT_GROWTH_ENGINE_SPEC.md`, `PRE_SIGNUP_ACTIVATION_GROWTH_SPEC.md`, `SEO_INTENT_TO_PLAY_ACTIVATION_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> 영문 기준 문서: [BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.md](BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.md)
> 변경 유형: 문서-only. 런타임, DB, API, 인증, 인프라, 보안 코드는 변경하지 않는다.

## 1. 이번 회차에서 선택한 공백

최근 기획은 acquisition, 컬렉션, 리텐션, comeback, season, viral, monetization까지 상당히 구체화됐다. 이제 가장 큰 소비자 성장 공백은 funnel이 없다는 것이 아니라 **funnel 전체에서 약속하는 제품의 모습이 서로 다를 수 있다는 점**이다.

현재 공개 서비스는 여전히 지갑, 복리예금, 국채, 대출, 주식 시세차익·배당, 사업 배당, 카지노, 자산 성장과 ‘대표 자본가’ 서사를 강하게 보여줄 수 있다. 반면 최근 성장기획은 학습, 사용자가 직접 고른 목표, 컬렉션, 정체성, 커뮤니티, 시즌, 아카이브, 장기 기록을 중심으로 진화했다.

이 차이는 클릭이나 가입이 늘어도 질 낮은 acquisition을 만들 수 있다.

- 사용자가 금융·도박·자산증식 서비스를 기대하고 들어올 수 있다.
- 실제 첫 세션이 유입 이유와 다르게 느껴질 수 있다.
- game-only 고지가 제품 약속을 보조하는 것이 아니라 뒤늦게 오해를 바로잡는 역할이 될 수 있다.
- 잘못된 기대 때문에 D1/D7 연속성이 약해질 수 있다.
- paid/organic 지표는 좋아 보여도 retention·trust가 나쁠 수 있다.

이번 canonical loop는 다음과 같다.

`명확한 브랜드 약속 → 구체적 증거 → 사용자가 고른 첫 선택 → 의도 보존 가입 → 첫 의미 가치 → D1 인식 → D7 이어짐 → branded/direct 재방문`

이 문서는 UI 컴포넌트나 구현 계약이 아니라 소비자 메시지 구조를 정의한다.

## 2. canonical 브랜드 포지션

### 카테고리
**지속형 커뮤니티 시뮬레이션 / 가상경제 게임.**

Moneyverse는 실제 투자앱, 은행, 카지노, 거래소, 저축상품, 재테크상품, 수익기회로 포지셔닝하지 않는다.

### 핵심 약속
**“하나의 길을 고르고, 기록을 쌓고, 다시 돌아왔을 때 내가 했던 선택이 이어지는 가상 세계.”**

보조 문장:

**Moneyverse는 실제 투자나 현금 환전 없이, 직업·컬렉션·가상기업·시즌·커뮤니티를 통해 배우고 만들고 수집하며 자신의 기록을 남기는 game-only 커뮤니티 가상경제다.**

### 이 약속을 선택한 이유
현재 최신 기획에서 강한 장기 루프를 하나로 묶을 수 있다.

- 강제 숙제가 아니라 authored choice;
- 컬렉션·공간을 통한 정체성;
- 직업·사업을 통한 성장경로;
- 가상기업·세계 이야기의 반복 콘텐츠;
- 시즌을 통한 시간에 따른 변화;
- archive/history를 통한 장기 리텐션;
- 선택적 커뮤니티 참여와 사회적 증거;
- WLD/WDX는 실제 금융가치가 아닌 game-only 시뮬레이션.

### 신뢰 경계
경제·시장·은행·카지노 개념이 등장할 때 다음 의미가 흔들리면 안 된다.

- WLD/WDX는 virtual/simulated/game-only 데이터다.
- 현금 환전이나 실제 증권 소유가 아니다.
- 수익, 원금, 투자성과를 보장하지 않는다.
- 실제 현금 도박으로 표현하지 않는다.
- 매일 접속하거나 결제하지 않으면 진행을 잃는다는 식으로 압박하지 않는다.

## 3. 메시지 계층

모든 소비자 surface는 문구가 조금 달라도 같은 순서를 따른다.

### Layer 1 — 사람에게 어떤 의미가 있는가
질문: **왜 관심을 가져야 하나?**

우선 표현:
- 내가 고른다;
- 내가 만든 것이 남는다;
- 시뮬레이션으로 배운다;
- 모으고 표현한다;
- 세계가 변한다;
- 다시 와도 내 기록이 이어진다.

### Layer 2 — 실제 무엇을 하는가
질문: **여기서 뭘 할 수 있나?**

전체 기능을 나열하지 말고 2~4개 증거만 보여준다.

- 직업/성장경로 선택;
- 컬렉션 시작·큐레이션;
- 가상기업/세계 스레드 따라가기;
- 시즌/프로젝트 참여;
- 짧은 가상경제 학습/시나리오 체험.

### Layer 3 — 무엇이 아닌가
질문: **실제 금융상품인가?**

finance-adjacent 화면에서 짧고 명확하게:
- game-only 가상데이터;
- 현금 환전 불가;
- 실제 투자·예금·증권 아님;
- 수익 보장 없음.

### Layer 4 — 지금 할 행동
질문: **다음에 뭘 하면 되나?**

한 번에 하나:
- 경로 하나 둘러보기;
- 샘플 하나 체험하기;
- 이야기 하나 따라가기;
- 컬렉션 하나 시작하기;
- 무엇이 바뀌었는지 보기.

신규 사용자의 첫 화면을 `지갑`, `예금`, `대출`, `거래`, `카지노`, `보상 받기`, `패시브 소득`, 전체 기능 grid로 시작하지 않는다.

## 4. 첫 30초

첫 방문자는 첫 화면과 짧은 스크롤 안에 네 질문에 답할 수 있어야 한다.

1. **Moneyverse가 무엇인가?** — 지속형 커뮤니티 시뮬레이션 / game-only 가상경제.
2. **처음 뭘 할 수 있는가?** — 하나의 경로, 샘플, 이야기, 컬렉션을 고른다.
3. **왜 다시 오는가?** — 내가 고른 진행/기록이 남고 세계가 변한다.
4. **실제 금융·현금 도박인가?** — 아니다.

첫 화면 우선순위:

- 하나의 명확한 브랜드 약속;
- 하나의 실제 증거/현재 세계 사례;
- 하나의 탐색 CTA;
- 가입/로그인은 secondary continuation;
- 경제용어가 있으면 짧은 game-only 고지.

브랜드를 이해하기 위해 WLD 잔액, 원장, 복리, 카지노 용어부터 해석하게 만들지 않는다.

## 5. 첫 3분과 첫 세션

### 0~1분: 관심경로 선택
최대 3개로 제한한다.

- **Build:** 직업/사업/공간 등 내가 키울 경로.
- **Collect:** 컬렉션·아카이브·정체성.
- **Explore:** 가상기업·세계·시즌 이야기와 짧은 시뮬레이션 선택.

`Learn`은 별도 네 번째 메뉴로 경쟁시키기보다 세 경로 안에 자연스럽게 포함한다.

### 1~3분: authored state 하나 만들기

- starter theme 선택;
- 직업/세계 목표 하나 선택;
- 가상 시나리오 답을 고르고 설명 보기;
- 공개 가능한 이야기 스레드 하나 follow;
- 샘플 컬렉션 배열.

가입 전에는 실제 spendable WLD/WDX, 주식, 대출, referral reward, 카지노 권리를 만들지 않는다.

### 가입 이유
방금 한 선택을 저장하는 이유로 연결한다.

- “이 경로를 저장하고 이어가기”;
- “이 컬렉션 챕터를 계속하기”;
- “이 가상기업 이야기를 따라가기”;
- “이 시즌 스토리를 이어가기”.

context가 있는 경우 generic `지금 가입`을 대표 전환문구로 두지 않는다.

## 6. D1/D3/D7/D14/D30 브랜드 연속성

브랜드는 광고문구가 아니라 가입 뒤 실제로 지켜져야 하는 약속이다.

### D1 — 인식
처음 고른 경로/컬렉션/이야기/선택을 먼저 보여준다.

약속: **“내가 골랐던 것을 기억한다.”**

### D3 — 관련성
전체 기능을 다시 펼치지 않고 같은 관심사 옆의 가치 하나만 붙인다.

약속: **“내 관심을 중심으로 세계가 연결되기 시작한다.”**

### D7 — 변화
처음 고른 스레드에서 무엇이 바뀌었는지와 다음 선택 하나를 보여준다.

약속: **“다시 온 이유가 있었다.”**

### D14 — 정체성
큐레이션·전시·해석·연결을 통해 진행을 ‘내 것’으로 만든다.

약속: **“체크리스트가 아니라 내 기록이 된다.”**

### D30 — 역사
컬렉션, 직업경로, 시즌기억, 프로젝트기여, 학습 replay, 세계스레드 중 하나를 지속 가능한 챕터로 남긴다.

약속: **“시간을 쓴 흔적이 남는다.”**

장기 monetization, sharing, prestige도 이 약속을 강화해야지 자산 숫자만 강조하는 방향으로 되돌아가면 안 된다.

## 7. surface별 메시지 구조

### 홈페이지
역할: 카테고리 이해 + 감정적 이유 + 증거 하나 + 행동 하나.

우선순위:
1. 브랜드 약속;
2. 필요한 경우 game-only qualifier;
3. 현재 증거(스토리/컬렉션/시즌/경로);
4. explore/sample CTA;
5. secondary login;
6. 깊은 기능 navigation;
7. 가치 전달 후 monetization.

지갑/status shortcut은 returning user에게 유용할 수 있지만 anonymous 첫인상을 정의하면 안 된다.

### 시작 가이드
역할: 복잡성을 줄이고 첫 성공세션을 만든다.

`자산을 불리는 사람`보다 authored progression과 continuity를 먼저 설명한다. 은행·시장·카지노는 전체 세계의 선택 가능한 simulation depth로 소개한다.

canonical 성공경로를 다음처럼 두지 않는다.

`WLD 벌기 → 복리 저축 → 시세차익 → 패시브소득 → 자본가`

대신:

`목표 하나 선택 → 의미 행동 하나 → 결과 이해 → 다음 목표 설정 → 원하면 더 깊은 경제 시스템 탐색`

### SEO landing
검색 질문에 완전히 답하고, 그다음 Moneyverse에서 직접 해볼 수 있는 고유 경험을 연결한다.

실제 투자 수익을 기대하게 만드는 검색문구로 유입시키고 simulation game으로 보내는 식의 promise mismatch는 금지한다.

### 공유 landing
공유된 artifact/story를 먼저 설명하고, 그 다음 Moneyverse context, 그 다음 related preview 하나를 제공한다. wealth card를 기본값으로 두지 않는다.

### 가입/인증 후
원래 intent를 보존한다. 컬렉션/이야기/학습으로 들어왔던 사용자를 일반 지갑 홈으로 강제로 보내지 않는다.

### 복귀
`그대로 남은 것 → 바뀐 것 → 행동 하나`가 먼저다. 광고나 unrelated finance grid가 먼저 나오지 않는다.

## 8. 카피 가드레일

### 우선 단어
- virtual / simulated / game-only;
- path, chapter, progress, collection, archive, world, story, season;
- choose, learn, build, collect, curate, explore, continue;
- fictional company/market;
- optional, transparent, user-controlled.

### 제한/맥락필요 단어
기능문서에서 사실관계상 필요할 수 있지만 acquisition/brand 핵심문구로는 부적절하다.

- guaranteed / safe return;
- passive income;
- seed money를 현실 성공의 은유로 사용하는 표현;
- 저평가 우량주/승리종목;
- 복리 자산증식을 핵심 목표로 표현;
- 부자가 되기/get rich/자본가를 canonical 성공정체성으로 표현;
- 손실복구;
- risk-free income;
- “안 오면 잃는다” comeback pressure;
- jackpot/승리 중심 casino acquisition.

### 정확성 원칙
가상 feature가 금융용어를 쓰면 `virtual/simulated` 의미를 footer에만 숨기지 않는다. 행동 전 사용자가 feature 성격을 이해해야 한다.

## 9. acquisition 품질과 cohort

canonical chain:

`qualified impression → promise 이해 방문 → proof engagement → authored choice → contextual signup → meaningful activation → D1 recognition → D7 continuation → D30 durable record → monetization/share`

유입 약속별로 따로 본다.

- learning;
- collection/identity;
- fictional world/company;
- profession/build;
- community/social;
- broad virtual-economy game.

finance/gambling 표현으로 값싼 click을 얻더라도 activation quality, D7/D30, 오해/complaint가 나쁘면 좋은 acquisition으로 보지 않는다.

paid acquisition은 `fraud-adjusted CAC → activation → D7/D30 → LTV/contribution`으로 평가한다.

## 10. KPI 추가

### 첫 방문 이해
- category comprehension;
- primary promise comprehension;
- game-only/no-cash comprehension;
- next-action clarity;
- 30초 qualified engagement;
- promise → proof engagement.

### 기대 일치
- landing promise → post-auth intent preservation;
- message cohort별 signup→activation;
- finance-like misunderstanding complaint;
- cash redemption misconception;
- casino/real-money misconception;
- feature expectation mismatch exit.

### retention
- D1 exact-intent recognition;
- D3 same/adjacent-thread continuation;
- D7 original-promise continuation;
- D14 identity/curation action;
- D30 durable-record;
- branded/direct returning share;
- returning-user share, WAU/MAU.

### growth/revenue
- organic promise → activation → D7/D30;
- share promise → activation → D7;
- message cohort별 CAC/fraud-adjusted CAC;
- LTV/contribution;
- retention eligibility 이후 ad/subscription/cosmetic revenue;
- ad-induced churn.

### trust guardrail
- phishing/ATO signal;
- impersonation/report;
- privacy complaint;
- youth/ad complaint;
- spam/fake-signup/referral fraud;
- misleading finance claim report;
- suspicious reward duplication.

## 11. 실험 backlog

### A. persistence/identity hero vs finance-feature-first hero
가설: 장기기록/정체성 중심 약속은 raw click보다 높은 activation/D7 품질을 만든다.
대상: 신규 direct/organic homepage 방문자.
Control: 현재 economy/feature-heavy 첫인상.
Treatment: canonical brand promise + 현재 proof 하나 + Explore CTA.
Primary: visit→meaningful activation, D7.
Guardrail: signup, bounce, game-only comprehension, finance 오해, 성능.
최소 관찰: D7 mature cohort. paid scaling 전 D30 확인.

### B. 하나의 proof vs feature grid
가설: 살아 있는 proof 하나가 많은 shortcut보다 첫 30초 이해를 높인다.
대상: anonymous first visit.
Primary: proof engagement→authored choice.
Guardrail: returning-user shortcut utility, accessibility, bounce.
최소 관찰: 최소 한 주 콘텐츠 cycle + D7.

### C. goal-first guide vs wealth-ladder guide
가설: `목표→행동→결과→다음 목표`가 first-session completion과 D7을 높이고 finance 오해를 줄인다.
대상: guide entrant/new signup.
Primary: guide→meaningful action, D1/D7.
Guardrail: guide completion, economy feature discovery, support/confusion.
최소 관찰: D7 후 D30 확인.

### D. contextual game-only qualifier
가설: 금융성 문구 옆의 짧은 game-only 고지가 activation을 크게 해치지 않으면서 오해를 줄인다.
대상: market/bank/business learning landing.
Control: global/footer-only.
Treatment: first relevant claim/action 근처 qualifier.
Primary: comprehension + activation quality.
Guardrail: clutter, bounce, complaint.

### E. paid creative message-cohort gate
가설: learn/build/collect/world identity creative가 wealth/profit creative보다 CPC가 높더라도 D30 retained contribution이 좋다.
대상: 향후 paid pilot.
Primary: retention-adjusted contribution, D30, fraud-adjusted CAC.
Guardrail: misleading ad, youth concern, fake signup, privacy complaint.
최소 관찰: D30. CTR/CPC만 보고 확대 금지.

## 12. 보안·악용·개인정보 검토

### High — 브랜드 사칭 / 피싱 / ATO
영향: 공격자가 공식 Moneyverse, 컬렉션 claim, 시즌 업데이트, 지갑/보상 메시지를 흉내 내 계정정보를 탈취할 수 있다.
시나리오: 소셜/Discord/검색에서 가짜 로그인이나 `챕터 이어받기` 링크 유도.
최소조건: canonical domain/brand 일관성, 공식 링크 규칙, share/notification URL에 secret/session/recovery 값 금지, 외부 이동 구분.
별도 개발/QA: deep-link, notification, 외부 campaign 구현 시 필요.

### High — 금융상품 오인/기만 위험
영향: WLD/WDX, 예금, 주식, 사업 배당, 카지노가 실제 금융가치나 수익보장처럼 보일 수 있다.
시나리오: `복리`, `패시브소득`, `저평가주`, `자본가`만 강조하고 game-only 의미를 축소.
최소조건: canonical virtual/simulated/game-only, 현금수익·보장수익 금지, 관련 문구 근처 qualifier, finance-adjacent marketing 법무/신뢰 검토.
별도 개발/QA: 보안코드 수정은 이번 문서 범위 아님. 실제 캠페인 전 consumer/legal review 필요.

### High — 공개/비공개 경계 누출
공개 proof/showcase에 잔액, WDX 포지션, 부채, 숨겨진 social graph, moderation/security/recovery 정보가 섞이면 안 된다.
최소조건: public-safe allowlist, private by default, 개인 artifact는 명시적·가역적 opt-in, URL/analytics에 민감값 금지.
별도 privacy/security QA: personalized public surface 구현 시 필요.

### Medium — bot/fake-signup/referral 조작
raw click/view/signup/share에 의미 있는 WLD/WDX 지급 금지. downstream verified milestone과 fraud-adjusted attribution 사용.

### Medium — tracking/analytics 과수집
brand cohort 측정을 위해 credentials, session ID, private balance/position/debt, casino loss, security/recovery state, 민감 추론값, 불필요한 미성년자 데이터를 ad/analytics vendor에 보내지 않는다.

### Medium — community/UGC 사칭·doxxing
사용자 이야기를 brand proof로 쓰면 opt-in/public-safe scope, report/block/takedown, 실명강제 금지, outbound link 안전정책이 필요하다.

기존 auth/session/RBAC/admin/ledger/privacy 경계는 바꾸지 않는다.

## 13. 미성년자·법규 주의

- 일반/청소년 유입에서 casino·투기수익 언어를 대표 브랜드 hook으로 사용하지 않는다.
- age-sensitive discovery, behavioral ad, creator/referral campaign은 최신 한국+미국 privacy/legal review 후 진행한다.
- 개인정보보호위원회의 2026-04-01 COPPA 2.0 국외동향은 한국 현행법으로 보지 않고 review trigger로만 사용한다.
- 한국 표시광고 제도상 거짓·과장·기만 광고 위험이 있으므로 가상금융 표현도 실제 제품 성격과 일치해야 한다.
- sponsor/creator 등 경제적 이해관계는 적절히 표시한다.
- WLD/WDX는 game-only이며 현금환전, 실제 증권/예금, 외부가치 경품으로 변경할 경우 이 문서 밖의 별도 법률/제품 검토가 필요하다.

## 14. SEO·콘텐츠 영향

브랜드 구조와 SEO는 같은 방향이어야 한다.

- title/description은 페이지와 제품의 실제 성격을 정확히 표현한다.
- 사이트의 primary purpose가 명확해야 한다.
- `Moneyverse`가 일관된 카테고리/약속과 연결돼야 한다.
- original world/collection/season/learning 콘텐츠 자체가 검색할 이유여야 한다.
- 실제 수익을 암시하는 thin finance keyword page 금지.
- 제3자/sponsor 콘텐츠가 domain reputation을 빌리기 위한 inventory가 되면 안 된다.
- account/portfolio/balance/security/recovery/moderation 개인 페이지는 공개검색에서 제외한다.

organic success는 계속 `qualified visit → activation → D7/D30 → retained contribution`으로 평가한다.

## 15. 최신 reference 검토 — 2026-09-14

### Discord — Building on the Social Layer of Games: What’s New from GDC 2026
URL: https://discord.com/blog/building-on-the-social-layer-of-games-whats-new-from-gdc-2026
분류: **직접 원칙 채택**.
시사점: 발견/소셜 맥락에서 실제 첫 플레이까지의 거리를 줄이는 것이 중요하다. Moneyverse도 brand promise가 feature catalog가 아니라 즉시 이해 가능한 작은 experience로 이어져야 한다.
Discord 내부 uplift 수치는 Moneyverse 예측치로 사용하지 않는다.

### Discord — You’re Now Discord Official / 2026-08-20 game discovery update
URLs:
- https://discord.com/blog/claim-your-game
- https://discord.com/press-releases/introducing-new-tools-to-power-game-discovery-and-social-play
분류: **trust/discovery 직접 채택**.
시사점: 하나의 canonical official identity가 search/share/community discovery의 혼동을 줄인다. Moneyverse도 search/share/Discord/comeback에서 official domain·brand signal을 일관되게 유지한다.

### Meta — Rewarding Original Creators on Facebook, 2026-03-13
URL: https://about.fb.com/news/2026/03/rewarding-original-creators-on-facebook/
분류: **방향성 참고**.
시사점: original content를 우대하고 copycat/impersonation을 줄이는 방향. Moneyverse acquisition도 generic finance summary보다 고유 world/collection/season/learning 콘텐츠에 투자한다.

### Instagram — Introducing Instants, 2026-05-13
URL: https://about.fb.com/news/2026/05/instants-share-in-the-moment/
분류: **privacy/control 참고**.
시사점: 낮은 마찰의 공유도 private archive, 선택적 공유, 차단·제한 같은 control과 결합할 수 있다. Moneyverse 장기기록도 기본 비공개·명시적·가역적 공개 원칙을 유지한다.

### Google Search Central — people-first + Site Reputation Policy 2026-08-28
URLs:
- https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- https://developers.google.com/search/blog/2026/08/update-site-reputation-policy
분류: **SEO 직접 채택**.
시사점: 명확한 사이트 목적, descriptive title, 독창적 가치, trust가 중요하며 제3자 콘텐츠가 사이트 reputation을 빌리는 구조는 위험하다.

### Naver Search Advisor — current content/title/spam guidance
URLs:
- https://searchadvisor.naver.com/guide/content-basic
- https://searchadvisor.naver.com/guide/markup-content
- https://searchadvisor.naver.com/guide/content-abusing
분류: **SEO/brand 직접 채택**.
시사점: 고유한 브랜드, 간결·정확한 title/description, 실질적 사용자 가치가 필요하며 혼동·피싱·스팸 콘텐츠를 피해야 한다.

### 한국 정책/법규 참고
- 공정위 표시광고 관련 법령·지침: https://case.ftc.go.kr/ocp/co/relateLaword4.do
- 개인정보보호위원회 COPPA 2.0 국외동향(2026-04-01): https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS105&mCode=D060030000&nttId=11938
분류: **guardrail/reference**. 광고 정확성과 청소년/개인정보 보수적 검토를 위한 근거이며 COPPA 2.0 동향을 한국법으로 간주하지 않는다.

## 16. Runtime Product Reality Audit — 2026-09-14

Runtime verification: **가능**.

현재 공개 homepage 관찰:
- WLD가 game-only라는 고지는 잘 보인다.
- 메인 brand hero보다 먼저 지갑/미니게임/주식/상점/퀘스트 shortcut이 보인다.
- `SPONSORED ADVERTISEMENT` 배치가 여러 개 이미 존재한다.
- hero는 “우리가 함께 만드는 작고 단단한 경제”와 Discord 연결 커뮤니티 가상경제를 설명한다.
- 월간소식은 아직 공개 콘텐츠 준비 상태다.
- lobby는 quiet/empty로 보일 수 있다.

현재 시작 가이드 관찰:
- “차세대 가상경제 포털” 표현을 사용한다.
- 초반 핵심기둥에서 복리예금, 국채, 대출, 주식 시세차익·배당, 사업 배당, 카지노를 강하게 노출한다.
- roadmap이 seed WLD → 저축/투자 → “대표 자본가”로 진행된다.
- 동일 페이지가 game-only를 고지하면서도 안정적 이자, 저평가 우량주, 패시브소득, 자산증식과 유사한 표현을 반복한다.

판단:
**현재 런타임은 신뢰고지는 비교적 강하지만 브랜드 계층은 최신 성장기획과 완전히 정렬되지 않았다.** 신규 사용자는 정체성/수집/세계/기록보다 자산증식형 경제기능을 제품의 중심으로 받아들일 가능성이 있다.

이번 문서는 실제 runtime 문구를 수정하지 않는다. 이후 별도 구현/QA 실험을 위한 growth hypothesis와 consumer guardrail만 기록한다.

## 17. 결정

다음 성장 우선순위로 **브랜드 약속→첫 가치 정렬**을 채택한다.

paid acquisition, referral payout, 추가 ad inventory, mass SEO를 확대하기 전에 아래 하나의 약속이 실제로 이어지는지 확인한다.

`search/share/home → 첫 30초 → sample → signup → first value → D1 → D7`

다음 회차에서는 finance/feature-heavy 유입보다 expectation-matched 유입이 activation·D7/D30·trust를 실제로 개선하는지 검증하는 방향을 우선한다.

## 18. 버전 기록

### v2026.09.14.65 — 브랜드 약속→첫 가치 정렬
- 현재 가장 큰 acquisition/activation 품질 공백을 promise inconsistency로 정의했다.
- canonical category, brand promise, proof hierarchy, trust qualifier를 정리했다.
- 첫 30초·첫 3분·D1/D3/D7/D14/D30의 메시지 연속성을 추가했다.
- homepage, guide, SEO, share, auth continuation, comeback의 메시지 구조를 정의했다.
- passive income, guaranteed return, wealth/capitalist, casino-first acquisition 표현 가드레일을 추가했다.
- CTR이 아닌 activation/D7/D30 기반 message cohort KPI와 5개 실험을 추가했다.
- phishing/impersonation, finance deception, public/private leakage, fraud, analytics, UGC 가드레일을 기록했다.
- Discord, Meta, Google, Naver, 공정위, 개인정보보호위원회 최신/현행 reference를 정리했다.
- 최신 identity/history 성장기획과 현재 finance-heavy 시작 가이드 사이의 runtime mismatch를 기록했다.

문서-only 변경이다. 런타임, DB, API, 인증, 인프라, 보안 코드, production configuration은 변경하지 않는다.
