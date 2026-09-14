# 월덕 머니버스 — 점진적 복잡도 및 첫 주 성장 기획

> 버전: v2026.09.14.82
> 상태: Living 소비자 성장 기획
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `SIGNUP_FRICTION_INTENT_RECOVERY_GROWTH_SPEC.md`, `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`, `USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`, `SEASON_SYSTEM_SPEC.md`
> 영문 기준 문서: [PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.md](PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.md)
> 변경 유형: 문서-only. 런타임·DB·API·인증·migration·scheduler·인프라·보안코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

Moneyverse에는 가입 전 가치, 가입 의도 복구, 첫 세션 종료, 사용자 우선순위, 소셜 연속성, 리텐션 우선 수익화 기획이 이미 있습니다. 남은 가장 큰 초기 리텐션 공백은 **첫 의미 행동 이후 복잡도를 어떤 순서로 넓힐 것인가**입니다.

기존 `PRODUCT_GROWTH_PLAN.md`는 첫 7일 동안 매일 하나의 주요 시스템을 소개하는 안을 담고 있습니다. 반면 현재 공개 시작 가이드는 첫 방문 설명 안에서 은행·국채·대출·8대 직업·사업·주식·상점·카지노/미니게임까지 거의 전체 경제를 노출합니다. 어느 쪽이든 사용자의 목표보다 제품의 기능목록이 무엇을 배워야 할지 결정할 위험이 있습니다.

이번 회차는 달력 중심 노출보다 사용자 준비도와 의도를 우선하는 성장 계약을 정의합니다.

`첫 가치 → 선택한 핵심 스레드 → 명확한 결과 → 인접 개념 하나 preview → 사용자가 계속/탐색/나중에 선택 → 두 번째 일관된 가치 → D1/D3 연속성 → D7 이해 가능한 루프 → D14 자발적 확장 → D30 깊이와 지속 기록`

이 문서는 새로운 기능 잠금 구현을 요구하지 않습니다. 소비자 노출 순서와 실험 원칙만 정의합니다.

## 2. 소비자 약속

**“머니버스는 내가 준비됐을 때 더 깊어지고, 하나를 즐기기 위해 전체 경제를 먼저 배울 필요는 없다.”**

신규 사용자가 직업, WLD 원장, 예금, 국채, 대출, WDX, 사업, 카지노, 클럽, 시즌, 컬렉션을 한꺼번에 이해하도록 요구하지 않습니다.

다음을 구분합니다.
- **available** — 기능이 존재함;
- **visible** — 탐색하면 찾을 수 있음;
- **recommended now** — 지금 사용자의 목표와 관련 있음;
- **understood enough to act** — 안전한 의미 행동을 할 최소 맥락을 이해함.

기능이 존재한다고 해서 첫 주에 모두 같은 비중으로 보여야 하는 것은 아닙니다.

## 3. 첫 30초·첫 3분·첫 세션

### 첫 30초
제품 약속 하나, 필요한 game-only 경계, proof/sample 하나, 주요 행동 하나를 보여줍니다. 전체 경제 기능목록을 첫 화면의 주인공으로 만들지 않습니다.

### 첫 3분
사용자는 다음과 같은 시작 의도 중 하나를 고를 수 있어야 합니다.
- Build/직업;
- Collect/큐레이션;
- 가상기업·세계 스레드 탐색;
- 제한된 시뮬레이션을 통한 학습;
- 시즌/프로젝트 follow.

첫 경험은 다음 방문 때 사용자가 알아볼 수 있는 상태 하나를 만들어야 합니다.

### 첫 세션
첫 의미 결과가 나온 뒤, 그 결과를 설명하거나 확장하는 경우에만 인접 개념 하나를 제안합니다.
- 직업 결과 → 관련 컬렉션/도구 preview;
- 컬렉션 결과 → 관련 세계/lore;
- 가상기업 학습 sample → watch/follow 또는 replay;
- 시즌 스레드 → 관련 프로젝트나 컬렉션 목표 하나.

예금, 대출, 주식거래, 카지노가 존재한다는 이유만으로 기본 다음 행동으로 만들지 않습니다.

## 4. 복잡도 사다리

### Layer 0 — Orientation
질문: `머니버스가 무엇이고 지금 무엇을 할 수 있는가?`

인지부하는 제품 분류 하나, 주요 CTA 하나, game-only 의미, sample/result 하나 정도로 제한합니다.

### Layer 1 — Core thread
질문: `나는 무엇을 성장시키려는가?`

사용자가 제한된 핵심 스레드 하나를 고르고 복귀 화면이 이를 기억합니다.

### Layer 2 — Adjacent system
질문: `내 목표에 무엇이 더 도움이 되는가?`

한 번에 하나의 강하게 연관된 시스템만 보여주고, 왜 관련 있는지 한 문장으로 설명할 수 있어야 합니다.

### Layer 3 — Connected loop
질문: `두세 개 시스템이 내 목표와 어떻게 연결되는가?`

D7에는 다음처럼 일관된 루프를 이해할 수 있습니다.
- 직업 → 컬렉션 → 개인 공간;
- 가상기업/세계 학습 → replay/watchlist → 주간 recap;
- 시즌 → 프로젝트 → archive;
- 수집 → 큐레이션 → 공유.

전체 경제 시스템을 경험해야 onboarding 성공으로 보지 않습니다.

### Layer 4 — Voluntary breadth
질문: `이제 어떤 새 방향을 탐색하고 싶은가?`

D14 이후부터 breadth는 점점 사용자 선택이 되어야 합니다. `나중에`, 숨김, 순서 변경으로 불이익을 주지 않습니다.

### Layer 5 — Long-term identity
질문: `여기서 나는 무엇을 만들고 어떤 사람이 되었는가?`

D30+ 가치는 기능 방문 수보다 지속 기록, 숙련도, 컬렉션, 공간, 프로젝트, 시즌 기억, 사회적 기여를 중심으로 봅니다.

## 5. D0~D30

### D0
의미 결과 하나와 이해한 continuation 하나가 성공입니다. 많은 기능 페이지를 열었다는 이유로 높은 activation으로 평가하지 않습니다.

### D1
핵심 스레드를 복구하고 실제 변화 또는 다음 행동 하나를 설명합니다. day-2 튜토리얼 달력을 맞추기 위해 새 시스템을 억지로 앞세우지 않습니다.

### D3
진전이 있다면 목표를 실제로 확장하는 인접 시스템 하나를 preview합니다. 진전이 없다면 복잡도를 늘리기보다 원래 스레드를 더 쉽게 이어가게 합니다.

### D7
사용자가 자신의 현재 Moneyverse 루프를 간단히 설명하고 결과·milestone·다음 목표를 볼 수 있어야 합니다. 7개 시스템을 얕게 보는 것보다 2~3개가 연결된 coherent loop를 우선합니다.

### D14
두 번째 priority, 커뮤니티 프로젝트, 시즌 분기, 새로운 컬렉션/사업 방향 등 자발적 breadth를 제안할 수 있습니다. 한 경로에 집중하는 선택도 정상으로 인정합니다.

### D30
지속 정체성/기록과 사용자가 선택한 깊이를 측정합니다. breadth는 의미를 더하면서 혼란·악용·이탈을 늘리지 않을 때만 가치가 있습니다.

## 6. 고위험 시스템 노출 순서

은행, 대출, WDX 거래, 카지노/확률형 놀이 등 금융처럼 보일 수 있는 surface는 이해도 위험이 큽니다.

성장 원칙:
- onboarding 완료의 필수 증거로 만들지 않음;
- WLD 잔액이 일정 수준을 넘었다는 이유만으로 자동 추천하지 않음;
- 의사결정 근처에서 fictional/game-only 의미를 보여주고 footer에만 숨기지 않음;
- `안전한 수익`, `보장 수익`, `손실 복구`, `저위험 이익`, `저평가 우량주` 같은 결과 보장형 문구를 피함;
- 손실·부채·카지노 결과를 comeback 압박에 사용하지 않음;
- 사용자 자가 한도와 기존 안전/법적 gate를 보존함;
- 아동·청소년과 관련된 확대는 별도 정책/법률 검토를 거침.

기존 원장, 권한, 시장조작 방지, 확률, 계정보안 계약은 변경하지 않습니다.

## 7. 세션 길이별 경험

### 1~3분 quick check
`핵심 스레드 인식 → 변화 하나 이해 → 행동하거나 미루기`.
새 시스템을 배워야 할 의무는 없습니다.

### 5~15분 meaningful session
일관된 활동 하나를 끝내고 결과 뒤에 인접 개념 하나를 선택적으로 preview합니다.

### 30분+ deep session
여러 시스템 탐색, 큐레이션, 사업/세계 계획, 커뮤니티·시즌 참여를 허용합니다. 깊은 사용이 더 많은 방해·광고를 자동 정당화하지는 않습니다.

## 8. Funnel과 cohort KPI

핵심 funnel:

`qualified visit → first value → authored core thread → meaningful result → understood continuation → D1 same-thread return → relevant adjacent-system acceptance → D3 coherent progress → D7 coherent-loop outcome → D14 voluntary breadth → D30 durable history`

추가 KPI:
- first-value comprehension;
- primary-next-action clarity;
- first-result → understood-continuation rate;
- feature-grid backtracking/confusion exit rate;
- 첫 의미 가치 전 열어본 시스템 수;
- D1 exact-thread continuation;
- D3 same-thread progress;
- adjacent preview accept/defer/hide rate;
- adjacent system → meaningful value rate;
- D7 coherent-loop completion;
- D7 next-goal clarity;
- D14 voluntary-breadth rate;
- D30 durable-history coverage;
- shallow-feature-sampling rate;
- 시스템 혼란으로 인한 help/support 사용률.

Guardrail:
- D1/D7/D30 retention;
- ad-induced churn;
- abuse/fake-account rate;
- suspicious reward duplication;
- WDX manipulation/collusion signal;
- casino/loan 관련 complaint;
- phishing/ATO signal;
- privacy complaint;
- 해당 시 youth-safety report.

`사용자당 방문 기능 수`는 성공 KPI로 쓰지 않습니다.

## 9. 실험 backlog

### 실험 A — intent-led first week vs calendar-led system tour
- 가설: 사용자가 고른 핵심 스레드를 유지하고 관련된 시스템만 단계적으로 보여주면 D7 품질이 높아진다.
- 대상: authored thread 하나를 만든 신규 activation 사용자.
- Control: 날짜에 따라 여러 기능을 순차 소개.
- Treatment: core-thread-first progressive complexity.
- Primary: D7 coherent-loop outcome + retention.
- Guardrail: 혼란/help exit, abuse, finance-like misunderstanding.
- 관찰: 최소 D7 mature cohort, 대규모 확대 전 D30 확인.

### 실험 B — adjacent preview 1개 vs 동등 feature grid
- Entry: 첫 의미 결과 뒤.
- Control: 여러 기능 카드를 동등 노출.
- Treatment: 설명 가능한 인접 preview 1개 + 보조 `전체 탐색`.
- Primary: next meaningful action, time-to-next-value.
- Guardrail: discoverability complaint, 반복 backtracking.

### 실험 C — finance-like system explain-before-entry
- Control: 직접 finance/casino shortcut.
- Treatment: game-only 목적 + 할 수 있는 것/배울 수 있는 것 + 선택적 계속하기.
- Primary: click이 아니라 qualified meaningful use.
- Guardrail: 오인, 손실추격/부채압박 signal, youth-safety complaint.

### 실험 D — reversible `나중에` vs 지속 추천
- Primary: D7/D30 retention과 추천 신뢰.
- Guardrail: discoverability, notification/spam complaint.

### 실험 E — coherent session closure 이후 monetization
- `결과 → continuation 선택` 및 첫 인접 설명 구간을 interruptive monetization에서 보호.
- Primary: retention-adjusted contribution, D7/D30, ad-induced churn.

## 10. Acquisition·SEO·콘텐츠 영향

유입 creative는 전체 경제 stack이 아니라 구체적인 첫 경험을 약속합니다.

검색 콘텐츠는 직업, 가상기업, 컬렉션, 시즌, 초보 금융개념을 설명할 수 있지만 각 페이지 자체가 독립적으로 유용해야 합니다. `day 1/day 2/day 3`, `레벨 × 기능`, 가짜 unlock 조합 페이지를 검색 유입 목적으로 대량 생성하지 않습니다.

SEO 평가는 다음까지 연결합니다.
`organic visit → sample → authored thread → activation → D7 coherent loop → D30 durable history → contribution`.

개인 진행, 추천, 잔액, 부채, 포트폴리오, 카지노 이력, moderation/security/recovery 상태는 기존 원칙대로 비공개/검색제외입니다.

## 11. 바이럴·소셜 영향

컬렉션 챕터, 프로젝트 기여, 시즌 milestone, 학습 replay, 큐레이션 공간처럼 설명할 가치가 있는 결과가 생긴 뒤 공유합니다.

초기 viral status를 WLD 자산, 대출액, 카지노 승리, WDX 수익으로 만들지 않습니다. 수신자는 고위험 경제 행동을 하지 않아도 공유 산출물을 이해할 수 있어야 합니다.

Referral 보상은 계속 downstream·capped·fraud-adjusted로 유지하고 raw invite/open/signup/unlock에는 의미 있는 WLD/WDX를 지급하지 않습니다.

## 12. 수익화 영향

첫 주 복잡도 ramp는 학습 보호구간입니다.

다음 시스템을 설명하는 다리 자체를 광고·스폰서·구독 제안으로 만들지 않습니다. 수익화는 기존 eligibility gate에 따라 가치 전달 뒤 저위험 surface에서만 검토합니다.

사용자의 애착, 자산, 부채, 카지노 활동, 진행 urgency를 추론해 가격을 다르게 매기지 않습니다. 유료상품은 경제우위나 finance-like 기능 빠른 접근보다 표현, 편의, 광고제거를 우선합니다.

## 13. 보안·악용·개인정보 교차검토

### HIGH — 가짜 unlock/next-step 피싱 및 ATO
- 시나리오: `다음 시스템이 열렸습니다`, `진행도 수령`, `포트폴리오 준비 완료` 같은 사칭 메시지로 credential 탈취.
- 사용자 영향: credential/session 탈취, 계정탈취.
- 최소조건: canonical domain/brand 일관성, 성장 메시지에서 password/OAuth/recovery code 요구 금지, 공개/share/deep link에 session/verification secret 금지.
- 별도 QA: 신규 email/push/external deep-link progression 메시지 구현 전 필요.

### HIGH — progression 추천에서 민감상태 노출
- 시나리오: public/share/알림에 WLD/WDX, 부채, 카지노, private club, moderation/security 상태 노출.
- 최소조건: personalized progression 기본 비공개, public-safe allowlist, URL/metadata/analytics/lock-screen에 민감값 금지.
- 별도 QA: personalized public surface 구현 전 필요.

### HIGH — 경제적 unlock/reward farming
- 시나리오: 봇·다계정이 tutorial/unlock/referral/adjacent reward 반복 수령.
- 최소조건: raw page open, unlock, recommendation, `나중에`, 단순 feature visit에 의미 있는 WLD/WDX 보상 금지.
- 별도 fraud QA: progression-linked 경제보상 도입 전 필요.

### HIGH — finance/casino 복잡도를 이용한 조작
- 시나리오: 손실·부채·잔액변화 뒤 WDX/대출/카지노를 추천하거나 커뮤니티 담합으로 시장조작.
- 최소조건: loss-chasing/debt-urgency 추천 금지, fictional/game-only 표시, anti-collusion/market-integrity 유지, popularity signal이 WDX 가치/보상을 직접 결정하지 않음.
- 별도 product/legal/security QA 필요.

### HIGH — 아동·청소년의 고위험 progression 노출
- 사용자 영향: 부적절한 금융/확률 압박, tracking, 상업 타기팅.
- 최소조건: 성장실험이 기존 age/legal gate를 약화하지 않음, engagement만으로 허용을 추론하지 않음, 청소년 대상 profit/jackpot/debt 문구 금지.
- 별도 legal/privacy/safety QA 필요.

### MEDIUM — analytics 과수집
복잡도 최적화를 위해 전체 cross-feature 행동 profile을 무제한 수집하지 않습니다. 이해도와 retained value 측정에 필요한 최소 이벤트만 사용하고 credential, recovery/security state, 불필요한 민감 경제·social 세부정보는 제외합니다.

## 14. 법규·정책 주의

- 미국: FTC의 2025년 Genshin Impact 사건은 아동·청소년 대상 인게임 구매·확률 정보·기만적 UX에 관한 게임 분야 중요 선례로 참고합니다. Moneyverse에 그대로 적용되는 개별 규칙이라고 단정하지 않습니다.
- 미국: FTC 2026-06 Genesis Tech 사건은 recurring price의 명확한 고지, 유효한 동의, 쉬운 취소의 중요성을 재확인합니다. onboarding을 구독조건 은폐에 이용하지 않습니다.
- 한국: 개인정보보호위원회 2026-03-23 아동·청소년 개인정보 보호 정책 논의는 youth privacy/safety가 지속적인 정책영역임을 보여줍니다. 연령 민감 기능 확대 시 출시시점 법률·개인정보 검토가 필요합니다.
- 한국/미국: 개인정보보호위원회의 2026-04-01 COPPA 2.0 국외동향은 미국 입법안의 진행 상황을 정리한 자료이며 한국 현행법이나 확정된 미국 규칙으로 취급하지 않습니다.
- WLD/WDX는 virtual/simulated/game-only이며 실제 예금·증권·현금환전·보장수익으로 표현하지 않습니다.

이 문서는 제품 기획이며 법률 자문을 대체하지 않습니다.

## 15. Research note — 2026-09-14

직접 채택:
- Supercell, `New Collection Levels & Mastery Changes`, 2026-05-13 — 진행체계가 복잡해지고 보상이 개인 목표와 분리되는 문제를 직접 언급하며 더 단순하고 가시적인 progression으로 변경. `system count보다 clear next goal` 원칙에 반영. https://supercell.com/en/games/clashroyale/blog/news/new-collection-levels-and-mastery-changes
- Supercell, `June Update 2026` — 단순한 connected progression과 명확한 milestone 방향을 재확인하는 교차검증 자료. https://supercell.com/en/games/clashroyale/blog/release-notes/june-update-2026/
- Meta/Threads, `New Features to Celebrate 500 Million Monthly Users on Threads`, 2026-06 — community progress와 탐색 가능한 community identity를 강제 breadth가 아닌 자발적 visible progress 참고로 채택. https://about.fb.com/news/2026/06/meta-launching-new-features-500-million-monthly-threads-users/
- Google Search Central people-first 및 AI Search guidance — first-week/unlock 페이지 대량생성을 금지하고 독립적인 사용자 가치를 요구하는 SEO 근거. https://developers.google.com/search/docs/fundamentals/creating-helpful-content / https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Naver Search Advisor SEO 기본 가이드 — 한국 검색 최적화를 사용자 가치 중심으로 유지하는 근거. https://searchadvisor.naver.com/guide/seo-help

참고:
- Discord Community Onboarding FAQ — 신규 사용자가 하고 싶은 것을 직접 고르게 하고 선택지를 과도하게 늘리지 않으며 이후 변경 가능하게 하는 현행 UX 가이드. 기능 자체는 오래된 사례라 보조 근거로만 사용. https://support.discord.com/hc/en-us/articles/11074987197975-Community-Onboarding-FAQ
- Google Health Coach, 2026-05-07 — 많은 정보를 한꺼번에 주기보다 개인 목표에 맞춰 유용한 정보를 보여주는 일반 UX 패턴으로 참고. 건강 도메인 요구사항으로 해석하지 않음. https://blog.google/products-and-platforms/products/google-health/google-health-coach/

## 16. Runtime Product Reality Audit — 2026-09-14

검증: **공개 웹 surface 확인 가능**.

오늘 확인한 내용:
- Production 홈은 WLD/보상이 game-only 가상 데이터라는 고지를 명확히 제공함.
- 홈의 상단 quick link에는 지갑, 미니게임 5종, 실시간 가상주식, 상점, 퀘스트, 로비 등이 사용자의 선호 경로가 확인되기 전에 함께 노출됨.
- 공개 가이드는 `처음에는 하나만` 시작하라고 안내하는 점은 긍정적임.
- 동시에 같은 가이드의 초기 5대 기둥은 복리예금, 국채, 신용형 대출, 8대 직업, 사업, 주식거래, passive-income 표현, 상점 boost, 카지노/미니게임까지 소개함.
- 첫날 추천 순서는 남은 WLD를 복리 정기예금에 예치하는 것으로 끝나고, 성장 로드맵은 자산 구간과 `초보자 → 대표 자본가` 서사를 유지함.
- 운영소식은 여전히 공개 게시물이 없는 quiet state인데 sponsored placement가 존재함.

결론: 현재 런타임은 game-only 고지와 `하나부터 시작` 문구는 강하지만, 공개 정보구조의 복잡도는 최신 intent/identity/continuity 전략보다 훨씬 넓습니다. 이번 progressive-complexity 모델은 실제 cohort 검증이 필요한 성장 가설이며 이번 문서-only 회차에서 가이드나 내비게이션 코드는 수정하지 않습니다.

## 17. 결정 및 다음 우선순위

다음의 좁은 성장 계약을 채택합니다.

`첫 가치 → 선택한 core thread 하나 → 결과 → 설명 가능한 adjacent preview 하나 → 계속/미루기 사용자 선택 → D1 same-thread → D3 coherent progress → D7 coherent loop → D14 voluntary breadth → D30 durable history`.

이 coherent-loop 모델이 D7/D30 품질을 높이고 혼란·fraud·privacy·youth-safety·금융 오인 신호를 악화시키지 않는다는 근거가 생기기 전에는 **날짜별 기능 투어, mandatory feature checklist, finance/casino 기본 추천, feature-open 보상, breadth 기반 status, 첫 주 monetization interruption, 대량 unlock SEO 페이지**를 확대하지 않습니다.
