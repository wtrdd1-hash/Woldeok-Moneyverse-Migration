# 월덕 머니버스 — 리텐션 안전 수익화 진입 성장 명세

> 버전: v2026.09.14.64
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `MONETIZATION_COMPLIANCE_SEO_SPEC.md`, `BILLING_SUBSCRIPTION_CONSUMER_PROTECTION_SPEC.md`, 최근 acquisition/activation/retention 명세
> 영문 기준 문서: [RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md](RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md)
> 변경 유형: 문서 전용; 런타임, DB, API, 인증, 인프라, 보안 코드 변경 없음

## 1. 이번에 선택한 공백

최근 성장 기획은 왜 처음 들어오는지, 공개 콘텐츠가 어떻게 첫 의미 행동으로 이어지는지, 컬렉션/정체성 루프가 왜 남게 만드는지, comeback과 시즌 연속성이 어떻게 작동하는지까지 상당히 구체화했다. 남은 큰 공백은 소비자 성장 프레임의 7번째 질문이다.

**사용자가 충분한 가치를 받은 뒤 정확히 언제 광고·스폰서·선택적 구독을 보여줘야 activation·신뢰·리텐션을 해치지 않는가?**

기존 수익화 명세에는 허용/금지 화면과 법규 조건이 잘 정의되어 있지만, 신규·활성·복귀·장기 사용자별 `monetization readiness gate`는 충분히 구체화되지 않았다.

이번 핵심 루프:

`약속한 가치 → 첫 의미 행동 → 연속성 증명 → 수익화 자격 → 낮은 방해의 수익화 → 리텐션/신뢰 검증 → 그 뒤 확대`

이는 광고기술 구현 명세가 아니라 소비자 순서와 수익성 판단 프레임이다.

## 2. 소비자 약속

**“머니버스는 사용자가 찾아온 이유를 먼저 충족한 뒤에야 수익화를 노출한다.”**

적합한 신규 방문자의 첫 의미 상호작용이 광고가 되어서는 안 된다.

최적화 목표는 raw impression, raw CTR, 단기 ARPDAU가 아니라 `retention-adjusted contribution`이다.

금지:
- 답, preview, 첫 authored choice, 첫 의미 행동을 interstitial로 끊기;
- 약속된 D7/comeback 답변과 사용자 사이에 광고 넣기;
- 광고를 매수/매도/대출/상환/로그인/보안/지갑/핵심 게임 버튼처럼 보이게 만들기;
- 잔액, 부채, WDX 보유, 카지노 손실, 보안 상태, 비공개 소셜 행동으로 광고 개인화하기;
- WLD/WDX 수익률, 거래 우위, 대출 조건, 랭킹, 확률, moderation 우위를 유료화하기;
- archive/history/progress 보존을 결제로 잠그기;
- 가짜 희소성·카운트다운·손실위협으로 구독 압박하기;
- D7/D30이 악화돼도 클릭·단기광고수익만으로 성공 판정하기.

## 3. 생애주기별 수익화 준비 게이트

### Gate 0 — 비회원 첫 가치
상태: 검색/공유/직접 유입의 첫 익명 방문자.
수익화 강도: 최소.

수익화가 눈에 띄기 전에 반드시 충족:
- Moneyverse가 무엇인지 이해;
- 관련 화면에서 game-only/no-cash-redemption 의미 이해;
- 찾아온 답 또는 공개 artifact의 약속된 가치를 충분히 전달;
- 선택적 다음 행동 하나가 보임.

허용 후보:
- 약속된 가치 이후 명확히 분리된 reviewed display/native 1개 수준.

피할 것:
- 답보다 먼저 나오는 광고;
- CTA/본문을 가리는 sticky 포맷;
- Moneyverse 콘텐츠/게임조작처럼 보이는 sponsor module;
- 비공개 Moneyverse 상태 기반 개인화.

### Gate 1 — 첫 세션 activation
상태: 인증 후 첫 의미 행동 완료.
수익화 강도: 여전히 보수적.

보호 구간:
`인증 연속성 → 첫 의미 행동 → 결과/피드백 → 다음 목표`.

이 구간 안에는 interruptive ad를 넣지 않는다.

구간 이후 후보:
- 저위험 공개/콘텐츠 면의 contextual ad;
- 금융행동과 혼동되지 않는 명확히 표시된 sponsor module;
- 다음 목표를 밀어내지 않는 비-P2W 정체성/꾸미기 가치 preview.

### Gate 2 — D1/D3 연속성
상태: 사용자가 다시 돌아와 같은 thread/goal을 인식.
수익화 강도: 확대가 아니라 실험 단계.

자격 신호:
- thread/collection/profession/learning/season 중 하나의 continuity event 존재;
- onboarding 혼란이 해결됨;
- 현재 민감 경제/보안 행동 중이 아님.

측정:
- D7 retention;
- meaningful actions/session;
- 세션 이탈;
- 광고 숨김/신고;
- next-best-action 완료율.

### Gate 3 — D7 반복 가치
상태: 최소 한 번 의미 있는 복귀 사이클 경험.
수익화 강도: 보다 넓은 테스트를 처음 정당화할 수 있는 시점.

후보:
- 저위험 콘텐츠면 contextual/native ad;
- 실제 광고 경험 뒤 ad-free subscription 제안;
- 비-P2W profile/collection/room/archive/gallery 표현 상품;
- 독립적 가치가 있는 명확한 sponsor content/event.

진행 보존이나 가짜 손실 회피를 결제 이유로 만들지 않는다.

### Gate 4 — D30+ 장기 가치
상태: durable record/identity/history 존재.
수익화 강도: interruption보다 표현/편의 중심.

후보:
- archive/gallery 표현 테마;
- profile/space cosmetics;
- 선택적 ad-free plan;
- sponsor 지원 editorial/community project;
- 핵심 history 접근권을 막지 않는 presentation/export 편의.

장기 수익화의 중심은 `support/express/enhance`이고 `pay to remain competitive`가 아니다.

### Comeback 사용자
휴면 복귀 자체를 수익화 준비 완료로 보지 않는다.

순서:
`남아 있는 것 → 바뀐 것 → 복귀 행동 하나 → 결과 → 그 뒤 수익화`.

catch-up 요약과 첫 복귀 행동 사이에 광고를 넣지 않는다. “자산/보상이 곧 사라진다”로 구독을 압박하지 않는다.

## 4. 세션 길이별 수익화 원칙

### 1~3분 quick check
의도: 변화 하나 이해 또는 작은 목표 이어가기.
규칙: 핵심 답/행동을 보호하고 interruptive ad는 피한다. 가치 전달 후 주변 배치만 테스트 후보.

### 5~15분 meaningful session
의도: 하나의 완결된 활동 완료.
규칙: 결과/피드백 뒤 자연스러운 경계에서만 수익화를 고려하고 민감하거나 집중이 필요한 행동 중간에 넣지 않는다.

### 30분+ deep session
의도: 탐색, 큐레이션, 커뮤니티, 긴 활동.
규칙: 오래 머문다고 광고량을 비례해 늘리지 않는다. fatigue/hide/exit를 보고 수익화 압력을 오히려 완만하게 한다.

## 5. 사용자 가치에 따른 수익화 포트폴리오

### Contextual display/native 광고
적합 후보:
- 충분한 공개 가이드;
- 시즌/세계관/lore 페이지;
- 승인된 공개 archive;
- 핵심 가치 전달 이후의 저위험 콘텐츠면.

성공 조건:
`추가 수익 > 추가 retention/trust 손실 + 운영/privacy 비용`.

### 광고제거 구독
가치:
- eligible 광고 제거;
- 선택적 편의/표현 혜택;
- 경제 우위 없음.

사용자가 어떤 광고가 사라지는지 이해할 만큼 경험한 뒤 제안한다.

### 꾸미기 / 정체성 / 공간 / 아카이브 상품
경제 우위를 팔지 않고 자기표현과 aspiration에 맞기 때문에 장기 수익화 우선 후보.

예:
- profile frame/theme;
- collection/gallery layout;
- room/office visual theme;
- archive/anthology presentation;
- seasonal cosmetic pack.

핵심 progress/history는 결제 없이 유지한다.

### Sponsored content / B2B2C
조건:
- sponsorship 표시는 인접하고 분명함;
- sponsor를 무시해도 콘텐츠 자체 가치가 있음;
- sponsor가 WDX 가격, 대출, 카지노, 랭킹, 중립 분석에 영향 못 줌;
- creator/material relationship 고지.

## 6. 수익화 순서 모델

핵심:
`적합한 유입 → 첫 가치 → meaningful activation → D1/D3 continuity → D7 반복 가치 → 수익화 실험 → D30 retention → LTV/CAC·contribution margin`.

반대로 하면 안 되는 구조:
`트래픽 → 노출 → 클릭 → 수익 → 사용자가 남기를 기대`.

Paid acquisition 확대 조건에는 activation, D7/D30, refund/chargeback/support cost, fraud-adjusted CAC, revenue, infrastructure/moderation cost, contribution margin/payback을 함께 넣는다.

## 7. KPI 추가

### Monetization readiness
- 첫 monetization impression 전에 first-value gate 도달 비율;
- next-goal 설정 전에 monetized된 activated user 비율;
- D7-qualified monetization eligible share;
- comeback reorientation/action 뒤에만 monetized된 세션 비율.

### 광고
- 전체 방문자당이 아닌 eligible user당 impressions;
- first value 전/후 ad exposure;
- post-ad session abandonment;
- accidental-click signal;
- hide/report rate;
- ad-load cohort별 D1/D7/D30;
- ad-load cohort별 meaningful actions/session;
- 법적으로 허용될 때 contextual vs personalized incremental value;
- retained user당 ad revenue.

### 구독
- offer view → terms view → purchase;
- cancellation initiation/completion;
- refund/chargeback/complaint;
- comparable cohort 기준 subscriber/non-subscriber D30/D90;
- ad-free satisfaction;
- paid benefit comprehension.

### 표현 상품
- D7/D30 이후 attach rate;
- retention 악화 없는 반복 구매;
- 구매 후 showcase/share 생성;
- fairness/P2W complaint.

### 수익성
- ARPU/ARPDAU;
- cohort revenue;
- LTV/CAC;
- gross/contribution margin;
- 의미 있을 때 30/60/90일 payback;
- `retention-adjusted contribution = contribution × retained-quality factor`를 내부 의사결정 프레임으로 사용하되 회계 지표로 보지 않음.

### 신뢰/보안 guardrail
- privacy complaint;
- youth/ad complaint;
- phishing/ATO signal;
- sponsor disclosure complaint;
- fake signup/referral/ad fraud;
- suspicious reward duplication;
- finance-like claim complaint.

## 8. 실험 backlog

### A. Value-before-ad vs early-ad
가설: 약속된 가치 이후 첫 의미 광고를 보여주면 즉시 노출 감소보다 D7/D30 개선 효과가 커진다.
대상: 신규 익명/신규 사용자.
Control: 현재 reviewed early placement.
Treatment: answer/preview/first action 보호 후 eligible ad.
Primary: retention-adjusted contribution, D7, first-session completion.
Guardrail: revenue/session, latency, accidental click, complaint.
관찰: 최소 D7, 확대 전 D30 확인.

### B. D7-gated subscription vs first-session offer
가설: 반복가치를 경험한 뒤 광고제거 가치를 더 정확히 이해한다.
대상: reviewed ad를 실제 경험한 eligible user.
Control: 초기 lifecycle 구독 제안이 있을 경우 그 baseline.
Treatment: repeat-value milestone 이후 첫 의미 제안.
Primary: subscription conversion quality, cancellation/refund, D30.
Guardrail: 가격/갱신 이해, complaint, churn.
관찰: billing decision window + D30.

### C. Expression product vs economy-adjacent paid benefit
가설: 정체성/archive cosmetics가 fairness 손실 없이 D30+ 사용자를 수익화한다.
대상: D30 established user.
Primary: attach rate + D90 retention + fairness.
Guardrail: P2W complaint, spend concentration, youth concern.
관찰: 가능하면 D90.

### D. Contextual sponsor module vs generic display
가설: 핵심 가치 뒤 명확한 sponsor module이 일반 interruptive display보다 사용자 수용성이 높다.
대상: 충분한 공개 콘텐츠/시즌 페이지.
Primary: revenue per retained visitor + D7/direct return.
Guardrail: disclosure comprehension, accidental click, trust complaint, SEO quality.
관찰: 여러 콘텐츠 주기 + D30.

### E. Lifecycle ad-load cap vs uniform load
가설: fragile cohort의 load를 낮추면 장기 revenue가 개선된다.
대상: 신규, D1~D6, D7~D29, D30+, comeback.
Primary: cohort LTV/contribution, D7/D30/D90.
Guardrail: revenue concentration, session distortion, complaint.
관찰: 최소 D30, 장기군은 D90.

## 9. 최신 시장 레퍼런스 — 2026-09-14

### Discord Quests / Play Quest+
Discord는 2026-08-20 Play Quest+를 발표했고 Quests FAQ는 2026-08-31 갱신됐다. Quests는 opt-in이며 주변 제품과 구분되고 사용자는 personalization을 비활성화할 수 있다.

직접 채택:
- opt-in/명확히 분리된 sponsor experience를 deceptive blending보다 우선;
- 단순 노출보다 사용자가 자발적으로 하는 의미 행동과 연결;
- personalization은 제어 가능해야 하며 Moneyverse 비공개 경제 데이터를 쓰지 않음.

미채택:
- Discord reward economy와 공개 완료율을 Moneyverse 예측치로 사용;
- WLD/WDX 경제 우위를 주는 보상;
- 친구에게 광고 참여를 기본 노출.

### Discord Ads Policy — 2026-09-09 업데이트
현재 정책은 광고 자체뿐 아니라 landing page, username, reward 등 연결 면 전체를 다룬다. Moneyverse도 광고 사각형 하나가 아니라 sponsor journey 전체를 검토한다.

### FTC 구독 집행 — 2026
FTC는 2026년 1월 JustAnswer 사건에서 반복구독 조건 고지 및 affirmative consent 문제를 제기했고, 2026년 6월에는 hidden cost/recurring charge와 cancellation barrier를 문제 삼는 광범위한 subscription enterprise 사건을 제기했다. 이는 Moneyverse에 대한 법적 판단이 아니라 제품 guardrail 근거다.

직접 채택:
- 가격·주기·반복결제를 결제 전 명확히 표시;
- affirmative informed consent;
- 쉬운 cancellation;
- 낮은 초기 가격이 반복비용을 가리지 않게 함.

### 한국/청소년 개인정보 신호
개인정보보호위원회 2026-04-01 국외동향은 미국 COPPA 2.0 논의에서 청소년 보호 확대와 맞춤광고 제한을 소개한다. 이를 현재 한국법으로 간주하지 않고 청소년 개인화/광고 확대 전 최신 법률 재검토 trigger로 사용한다.

## 10. SEO / 브랜드 영향

수익화 때문에 공개 페이지가 검색·공유될 이유가 약해지면 안 된다.

원칙:
- 원본의 충분한 콘텐츠가 우선;
- sponsor 표시 명확;
- Moneyverse domain authority를 빌리기 위한 sponsor/제3자 페이지 금지;
- 광고 inventory 확보를 위한 대량 페이지 생성 금지;
- monetization 변경 뒤 organic landing → activation → D7/D30 측정;
- original content보다 광고가 위에서 지배하는 레이아웃 지양.

브랜드 방향:

**Moneyverse는 모든 방문에서 최대한 뽑아내는 서비스가 아니라, 이해 가능한 선택적 가치교환으로 운영되는 서비스처럼 느껴져야 한다.**

## 11. 보안·개인정보·악용 검토

### High — 광고/스폰서 사칭 및 phishing
사용자 영향: credential 탈취, 악성링크, ATO.
시나리오: sponsor module 또는 외부 landing이 Moneyverse 로그인/보상수령/지갑 행동처럼 보임.
최소 보호: 명확한 광고 표시, 공식도메인 구분, 외부링크 명시, sponsor의 credential/OAuth code 수집 금지, 목적지 검토, outbound URL에 민감상태 금지.
별도 개발/보안 QA: sponsor/external link 확대 전 필요.

### High — 비공개 경제데이터 기반 행동광고
사용자 영향: profiling, 차별, 사기 타기팅, 개인정보 피해.
시나리오: 잔액, WDX, 부채, 카지노, 보안상태, 비공개 social graph를 ad/measurement vendor로 전송.
최소 보호: 해당 필드 targeting 금지, data minimization, contextual/non-personalized 기본, 개인화 확대 전 법률/privacy review.
별도 QA: personalized ads 전 필요.

### High — rewarded-ad 경제 어뷰징
사용자 영향: 인플레이션, 불공정, bot/multi-account farming.
시나리오: watch/click/sponsor action에 의미 있는 WLD/WDX/경쟁 우위 지급.
최소 보호: raw ad view/click에 의미 있는 WLD/WDX/economy power 금지, cosmetic/noncompetitive reward도 별도 승인, fraud review.
별도 QA: rewarded advertising 전 필요.

### High — 구독/결제 phishing 및 dark pattern
사용자 영향: 무단결제, 신뢰 손실, 계정 공격.
시나리오: fake renewal/cancellation 경고 또는 헷갈리는 반복결제 가격.
최소 보호: 반복조건/확인 명확화, 쉬운 cancellation, asset-loss 긴급문구 금지, 공식 billing surface만 사용.
별도 billing/legal/security QA 필요.

### Medium — 광고측정 과수집
사용자 영향: 불필요한 cross-context tracking.
최소 보호: cohort/placement 성과에 필요한 데이터만 측정, 비공개 경제/계정 field export 금지, SDK/processor/retention/opt-out·consent 검토.

## 12. 법규/표현 주의

- WLD/WDX는 virtual/simulated/game-only이며 현금환전·실제 수익보장 없음.
- 광고/스폰서는 시장·은행·대출·카지노 행동과 혼동되면 안 됨.
- 대가성 sponsor/creator 관계는 명확히 고지.
- 구독의 조건·동의·취소·환불·미성년 결제는 출시 시점 최신 관할법 검토.
- personalized ads, youth ads, rewarded advertising, 새 ad SDK는 한국+미국 최신 privacy/legal/trust review 필요.
- 미국의 계류/제안 청소년 법안을 현행 한국법처럼 쓰지 않음.

## 13. Runtime Product Reality Audit — 2026-09-14

공개 런타임 접근 가능.

확인:
- 홈에서 WLD/보상이 game-only 가상 데이터임을 명확히 고지;
- 홈에 이미 여러 `SPONSORED ADVERTISEMENT` 배치 존재;
- 빠른 바로가기는 지갑·미니게임·거래소·상점·퀘스트 중심;
- 월간 공개소식은 아직 준비 중;
- 커뮤니티 로비는 비어/조용해 보일 수 있음;
- `/announcements`는 공개 공지가 없는데 sponsor slot은 이미 존재;
- `/guide`는 내용은 충분하지만 로그인/잔액부터 시작하고 예금·국채·대출·주식 차익/배당·사업·카지노를 강하게 전면화.

시사점:
Moneyverse에는 콘텐츠/연속성 루프 검증보다 먼저 광고 inventory가 이미 존재한다. 따라서 다음 최적화는 slot 추가가 아니라 **수익화 순서와 ad-load discipline**이어야 한다.

Runtime verification: 가능, 비파괴 공개면 확인만 수행.

## 14. 의사결정 순서

모든 수익화 제안은 이 순서로 판단한다.
1. 사용자가 약속된 가치를 받았는가?
2. 안전하고 비민감한 화면인가?
3. next-best-action을 해치지 않는가?
4. disclosure/consent를 이해하기 쉬운가?
5. 경제/P2W 우위를 만들지 않는가?
6. D7/D30이 건강한가?
7. fraud/support/privacy 비용까지 포함해 contribution이 개선되는가?
8. 그 뒤에만 frequency/reach를 확대한다.

## 15. 다음 성장 우선순위

다음 좁은 루프를 검증한다.

`신규 방문 → 약속된 가치 → meaningful activation → D7 반복 가치 → 첫 eligible monetization exposure → D30 retained quality + contribution`

이 루프가 수익과 리텐션을 함께 개선한다는 증거가 생기기 전에는 새 광고 inventory, personalized targeting, rewarded WLD/WDX 광고, 첫 세션 구독 압박, 경제 우위 상품을 우선 확대하지 않는다.