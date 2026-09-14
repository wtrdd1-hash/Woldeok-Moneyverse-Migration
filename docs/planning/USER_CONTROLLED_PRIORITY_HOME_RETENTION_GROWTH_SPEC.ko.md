# 월덕 머니버스 — 사용자 통제형 우선순위 홈·리텐션 성장 명세

> 버전: v2026.09.14.68
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `MY_MONEYVERSE_IDENTITY_HOME_GROWTH_SPEC.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`, `PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md`, `CREATOR_COMMUNITY_QUALIFIED_ACQUISITION_GROWTH_SPEC.md`
> 영문 기준 문서: [USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.md](USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.md)
> 변경 유형: 문서 전용. 런타임, DB, API, 인증, 인프라, 스케줄러, 보안 코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

Moneyverse에는 이미 identity home, comeback catch-up, D7 continuity, collection ownership, season, notification, qualified acquisition 기획이 있다. 이번에 남은 리텐션 공백은 **우선순위 통제권**이다.

사용자는 컬렉션, 직업, 가상기업, 시즌, 프로젝트, 학습 replay, 공간, 커뮤니티 등 여러 관심사를 가질 수 있지만 큰 기능 그리드나 불투명한 추천 모델은 매 복귀 때마다 “내가 무엇을 하던 중이었지?”를 다시 찾게 만든다.

이번 canonical loop는 다음과 같다.

`첫 의미 선택 → 진행 스레드 1~3개 직접 고정 → 홈이 그 선택을 반영 → 다음 의미 행동 하나 → D1 인식 → D3 진전 → D7 결과 → 우선순위 재선택 → D30 장기 기록`

소비자 약속:

**“머니버스는 내가 중요하다고 고른 것을 기억하고 바로 이어갈 수 있게 하며, 마음이 바뀌면 내가 직접 바꿀 수 있다.”**

이는 추천엔진·DB·state machine 명세가 아니다.

## 2. 명시적 사용자 통제가 필요한 이유

개인화는 복잡성을 줄여야 하며 사용자를 몰래 고정된 persona로 만들어서는 안 된다.

원칙:
- 사용자가 관심 스레드를 pin/unpin/reorder/pause할 수 있어야 한다.
- active set은 이해 가능한 소수로 유지한다.
- 행동 기반 추천은 선택 가능한 제안일 뿐 강제 identity가 아니다.
- 가능하면 추천 이유를 설명한다.
- `덜 보기` / `지금은 안 보기`가 불이익 없이 작동해야 한다.
- 실제 투자 숙련도, 신용도, 건강, 정치, 종교, 성적 지향, 계정보안 위험, moderation suspicion 같은 민감 특성을 성장 개인화에 추론·노출하지 않는다.

목표는 continuity이지 감시형 예측이 아니다.

## 3. 우선순위 세트

사용자가 장기적으로 유지할 수 있는 active priority는 **1~3개**면 충분하다.

예:
- 컬렉션 챕터 완성;
- 직업 path 이어가기;
- 가상기업/세계 스레드 팔로우;
- 시즌 목표 준비;
- 학습 replay/journal 이어가기;
- 방/박물관/공간 개선;
- 클럽/도시/커뮤니티 프로젝트 참여.

우선순위는 daily chore가 아니며 하루 빠졌다고 만료되지 않는다.

각 priority는 소비자 언어로 네 질문에 답해야 한다.
1. 왜 여기에 있는가 — 사용자가 직접 골랐거나 명시적으로 제안을 수락했는가.
2. 무엇이 변했는가 — 상태/진전 한 줄.
3. 지금 무엇을 할 수 있는가 — meaningful next action 하나.
4. 더 이상 보고 싶지 않으면 어떻게 하는가 — pause/unpin/change가 명확해야 한다.

## 4. 생애주기별 홈 경험

### 방문자 / 가입 전
숨은 추적 기반 개인화를 하지 않는다. 검색·공유·creator 유입의 명시적 맥락을 보존하고 관련 sample 하나를 제공한다.

### D0 / 첫 의미 행동
사용자가 실제 선택을 한 뒤 그 스레드를 첫 priority로 유지할지 제안한다. 가치가 증명되기 전에 3개 관심사를 모두 고르게 하지 않는다.

### D1
**“내가 고른 것 이어하기”**가 첫 메시지다. generic novelty, 잔액, 광고, 기능 탐색보다 저장된 스레드를 먼저 보여준다.

### D3
같은 priority 안의 progress 또는 adjacent-depth action 하나를 보여준다. 보조 discovery slot이 있어도 선택한 스레드를 밀어내지 않는다.

### D7
첫 priority를 해결하거나 의미 있게 진전시킨다: `처음 → 변화 → 내가 한 것 → 다음 선택`.

완료한 스레드는 archive, extend, replace 중 사용자가 선택한다.

### D14–D30
가능하면 enduring priority 하나, current/seasonal priority 하나, exploratory priority 하나의 구조를 허용하되 3개를 모두 채우도록 강제하지 않는다.

### 장기 미접속 복귀
이전에 고정했던 것, 실제로 바뀐 것, 안전한 restart 행동 하나를 보여준다. 접속하지 않았기 때문에 손해가 생겼다는 압박은 금지한다.

## 5. 세션 길이별 설계

### 1~3분 quick check
- 최우선 priority 확인;
- 변화 하나 이해;
- 행동 하나 수행하거나 미루기;
- 패널티 없이 종료.

### 5~15분 meaningful session
- priority 하나 진전;
- 필요하면 두 번째 priority 확인;
- 보이는 progress/history 하나 남기기.

### 30분+ deep session
- 큐레이션·비교·건설·탐색·커뮤니티 참여;
- 오래 머문다는 이유로 광고량을 비례 확대하지 않는다.
- 다른 기능을 탐색해도 pinned priority는 사라지지 않는다.

## 6. Acquisition/Activation 연결

유입 채널은 첫 priority를 **제안**할 수 있지만 가입 이후 소유권은 사용자에게 있다.

예:
- SEO guide → 가상기업 스레드 계속 보기;
- creator campaign → 컬렉션/세계 path 저장;
- 공유 showcase → 관련 컬렉션 챕터 시작;
- season page → 시즌 목표 follow.

Funnel:

`qualified visit → useful sample → authored choice → contextual signup → meaningful activation → 첫 priority 고정 → D1 recognition → D7 outcome → D30 durable record`

단순 가입, 로그인 성공, 지갑 열기, 광고 클릭, referral code 입력은 activation이 아니다.

## 7. Social/Viral 역할

priority 목록은 기본적으로 private workflow/identity context다. 공개 status가 아니다.

사용자는 나중에 priority로 만든 **결과물**을 선택적으로 공유할 수 있다: collection chapter, season reflection, learning replay, space transformation, community contribution 등.

기본 공유에서 제외:
- 잔액/WDX private position;
- 대출·부채 상태;
- 카지노 기록;
- 숨은 social graph;
- 계정/보안/복구 상태;
- moderation/fraud-risk label;
- 정밀 개인정보.

공유는 opt-in이고 되돌릴 수 있어야 한다.

## 8. LiveOps/Season 연결

새 시즌이 사용자의 priority를 자동으로 덮어쓰지 않는다.

D-14/D-7/D-3/D-1 preview에서 temporary seasonal priority를 제안할 수 있지만 사용자는 accept/ignore/pause/replace할 수 있어야 한다.

중도 진입/복귀 사용자에게는 catch-up을 제공하고 `다 놓쳤다`는 FOMO를 쓰지 않는다. 시즌 종료 후에는 archive/reinterpret 가능한 durable chapter를 남긴다.

## 9. SEO 경계

priority home은 private retention surface이며 SEO inventory가 아니다.

기본 noindex/private:
- 개인 priority page;
- 개인 progress summary;
- private saved thread;
- wallet/portfolio/debt/security/recovery/moderation 상태.

색인 후보는 독립적 가치가 충분한 season archive, original guide, fictional-company/world page, collection lore, 명시적 공개 curated showcase다.

## 10. 수익화 경계

사용자의 priority는 더 많이 과금하거나 공격적으로 target할 권한이 아니다.

- attachment·wealth·willingness-to-pay 추정으로 실제 결제 가격을 개인별로 바꾸지 않는다.
- private WLD/WDX/debt/casino/security 데이터를 광고 target에 쓰지 않는다.
- priority recognition과 첫 meaningful action 사이에 광고를 끼우지 않는다.
- 가능하면 contextual/non-personalized 광고를 우선한다.
- 반복가치 이후 expression/convenience를 팔되 경제 우위를 팔지 않는다.
- pin/open/click/share만으로 의미 있는 WLD/WDX를 지급하지 않는다.

최종 평가는 impressions/user가 아니라 retained contribution이다.

## 11. 실험 backlog

### A — user-pinned priority vs algorithm-only recommendation
가설: 명시적 통제가 D1/D7 continuation과 trust를 높인다.
대상: 첫 meaningful action 완료 사용자.
Control: generic/algorithmic home.
Treatment: explicit pinned thread 1개 + next action 1개.
Primary: D1 exact-thread continuation, D7 priority outcome.
Guardrail: hide/unpin, 혼란, privacy complaint, abandonment.
최소 관찰: D7 성숙 cohort, 확대 전 D30.

### B — priority 1개 vs 동등 추천 3개
Primary: time-to-next-meaningful-action, D1/D3 continuation.
Guardrail: 다른 시스템 발견률, 반복행동 피로.

### C — editable controls vs silent personalization
Primary: priority retention + D7 meaningful action.
Guardrail: 설정혼란, support complaint, unwanted-personalization report.

### D — chosen priority first vs novelty first
Primary: D1/D7 continuation, meaningful-action session 비율.
Guardrail: discovery, 만족 신호, ad-induced churn.

### E — priority action 이후 monetization vs 이전 monetization
Primary: retained contribution, D30.
Guardrail: post-ad abandonment, accidental click, privacy complaint.

## 12. KPI

Activation/continuity:
- authored choice → first-priority adoption;
- priority adoption → meaningful activation;
- time-to-next-meaningful-action;
- D1 exact-priority continuation;
- D3 same-thread progress;
- D7 priority outcome/meaningful advancement;
- D14 priority revision without churn;
- D30 durable-record creation.

Engagement quality:
- priority meaningful-action session 비율;
- forced extra action 없는 quick-check completion;
- voluntary second-priority exploration;
- pause/unpin/reorder;
- `show less/not now` 사용;
- returning-user share.

Growth/economics:
- acquisition-source → first-priority fit;
- retained CAC by priority cohort;
- D30 LTV/contribution;
- ad-induced churn;
- 반복가치 이후 subscription conversion.

Trust/security:
- unwanted-personalization complaint;
- privacy complaint;
- ATO/phishing signal;
- fake-signup/referral fraud;
- suspicious reward duplication;
- spam/report.

## 13. 보안·악용·개인정보 검토

### HIGH — 민감 추론/비공개 상태 노출
영향: 개인 경제/게임 상태나 민감한 추론 identity가 홈·공유·analytics로 유출.
악용: debt, WDX loss, 숨은 관계, security/recovery status, 민감 특성을 추천문구가 노출.
최소조건: public-safe allowlist, 민감범주 성장개인화 제외, personalized home 기본 private, URL/analytics에 secret/session/recovery 금지.
별도 개발/QA: 신규 public personalization 또는 third-party personalization SDK 전 **필요**.

### HIGH — recommendation/deep-link phishing 및 ATO
영향: credential 탈취·계정탈취.
악용: `고정 목표가 바뀌었습니다`, `투자 목표 이어하기` 사칭 링크.
최소조건: canonical domain/brand, growth content에서 credential/auth code 요구 금지, 안전한 재인증 경계, 자산손실 긴급문구 금지.
별도 QA: 외부 notification/deep link 구현 시 **필요**.

### HIGH — finance-like manipulation
영향: 게임 추천을 실제 투자/신용 조언으로 오해하거나 위험행동을 반복.
악용: engagement가 높다는 이유로 WDX profit, loan, casino loss-recovery를 계속 추천.
최소조건: game-only framing, loss chasing/debt urgency/casino comeback/profit maximization을 기본 priority에서 제외, 현금결제로 금융게임 우위 판매 금지.
별도 QA: finance-adjacent personalized recommendation 구현 시 **필요**.

### MEDIUM — bot/multi-account farming
pin/unpin/open 자체에는 의미 있는 경제보상을 붙이지 않는다. 보상을 붙이는 경우 별도 fraud QA가 필요하다.

### MEDIUM — personalization data overcollection
제품 continuity 평가에 필요한 최소 데이터만 사용하고 private economy/security field를 광고·analytics vendor로 내보내지 않는다. 신규 SDK는 별도 privacy review가 필요하다.

## 14. 법·정책 주의

- 한국: 개인정보위의 2026-07-27 TikTok·Apple 제재 사례는 개인정보/타사 행태정보 활용에 적법근거와 투명성이 중요하다는 최신 guardrail이다. priority 데이터를 광고용 자유 데이터처럼 취급하지 않는다.
- 미국: FTC의 2026-08 personalized pricing statement는 현재 의견수렴 단계의 제안이며 모든 개인화가격을 금지하는 확정 규칙으로 취급하지 않는다. 다만 개인데이터로 willingness-to-pay를 추정해 가격을 숨겨서 달리하는 모델은 제품 기획에서 제외한다.
- 구독/광고표시/취소, 미성년자, creator endorsement 등은 실제 출시 시점의 최신 한국·미국 규정으로 재검토한다.
- WLD/WDX는 virtual/simulated/game-only이며 실제 투자·예금·법정화폐·환전·수익보장을 암시하지 않는다.

## 15. Runtime Product Reality Audit — 2026-09-14

Verification: **가능**.

현재 Production에서 확인된 사항:
- 홈은 WLD/보상이 game-only 가상 데이터라고 명확히 고지한다.
- 빠른 바로가기는 지갑·미니게임·거래소·상점·퀘스트를 전면에 둔다.
- 여러 `SPONSORED ADVERTISEMENT`가 이미 존재한다.
- 신규 안내는 한 번에 하나씩 시작하라고 말하지만 사용자가 직접 지속 priority를 고정하는 모델은 현재 공개 surface에서 확인되지 않는다.
- 월간/운영 소식은 아직 준비 중이다.
- 시작 가이드는 예금·국채·대출·시세차익·배당·패시브소득·카지노·`대표 자본가` roadmap을 강하게 전면화한다.

결론: user-controlled priority loop는 **현재 런타임 검증되지 않은 성장 가설**이다. 광범위한 개인화나 추가 광고 inventory 전에 실험 검증해야 한다.

## 16. Research note — 2026-09-14

직접 채택:
1. Meta/Threads, `New Features to Celebrate 500 Million Monthly Users on Threads`, 2026-06-16/17 — `Your Algo`에서 사용자가 topic과 적용기간을 비공개로 통제. 채택: 명시적·private·reversible interest control. https://about.fb.com/news/2026/06/meta-launching-new-features-500-million-monthly-threads-users/
2. Xbox Wire, `April Xbox Update`, 2026-04-30 — 최대 3개 favorite를 Home 앞에 pin. 채택: 작은 user-selected set의 즉시 접근. https://news.xbox.com/en-us/2026/04/30/april-xbox-update-2026/
3. Discord, `Profile Widgets FAQ`, updated 2026-09-08 — 관심 widget add/reorder/remove. 채택: silent permanent profiling 대신 사용자 재배치/삭제 통제. https://support.discord.com/hc/en-us/articles/35344672307607-Profile-Widgets-FAQ

정책 guardrail:
4. 개인정보보호위원회, TikTok·Apple 제재 카드뉴스, 2026-07-27 — 적법근거 없는 개인정보 수집·이용과 타사 행태정보 맞춤광고 활용이 집행 쟁점. 모든 개인화를 금지한다는 뜻이 아니라 privacy-by-design 기준으로 사용. https://m.pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS212&mCode=C040030000&nttId=12337
5. FTC, proposed personalized-pricing enforcement policy statement, 2026-08-19 — 현재 의견수렴 중. 채택: 개인데이터 기반 숨은 willingness-to-pay 가격차등 금지. https://www.ftc.gov/legal-library/browse/federal-trade-commissions-proposed-enforcement-policy-statement-regarding-personalized-pricing

참고:
- Threads `Dear Algo`, 2026-02-11 — temporary more/less preference는 reversible/time-bounded preference의 참고 사례. https://about.fb.com/news/2026/02/threads-dear-algo/

## 17. 다음 성장 우선순위

다음 한 루프를 먼저 검증한다.

`첫 meaningful choice → priority 1개 pin → D1 exact recognition → D3 progress → D7 outcome → keep/archive/replace 선택 → D30 durable record`

이 루프가 retention과 trust guardrail을 개선한다는 근거 전에는 opaque recommendation 확대, sensitive behavioral targeting, personalized pricing, finance-loss comeback nudge, priority-linked WLD/WDX reward, 추가 interruptive 광고 inventory를 확대하지 않는다.