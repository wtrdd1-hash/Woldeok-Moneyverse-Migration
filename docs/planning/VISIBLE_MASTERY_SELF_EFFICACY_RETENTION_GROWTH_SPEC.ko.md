# 월덕 머니버스 — 보이는 숙련도·자기효능감 리텐션 성장 기획

> 버전: v2026.09.14.83
> 상태: Living 소비자 성장 기획
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PROGRESSIVE_COMPLEXITY_FIRST_WEEK_GROWTH_SPEC.md`, `FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md`, `LONG_TERM_ASPIRATION_IDENTITY_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> 영문 기준 문서: [VISIBLE_MASTERY_SELF_EFFICACY_RETENTION_GROWTH_SPEC.md](VISIBLE_MASTERY_SELF_EFFICACY_RETENTION_GROWTH_SPEC.md)
> 변경 유형: 문서-only. 런타임·DB·API·인증·migration·scheduler·인프라·보안코드 변경 없음.

## 1. 이번 회차에서 선택한 공백

Moneyverse에는 가입 전 가치, 가입 의도 복구, 첫 주 점진적 복잡도, 사용자가 직접 고르는 continuation, D1~D30 복귀 이유, 소셜 연결, 컬렉션, 장기 aspiration까지 이미 별도 기획이 있습니다. 이번에 남은 핵심 공백은 **사용자가 단순히 WLD가 늘고 있다고 느끼는 것이 아니라 실제로 내가 더 잘하고 있고, 더 이해하고 있고, 더 의미 있는 것을 만들고 있다고 느낄 수 있는가**입니다.

현재 공개 가이드에는 직업 EXP와 숙련도 표현이 존재하지만 전체 성장 서사는 여전히 WLD 자산구간, 예금, 주식, 사업, `대표 자본가`에 강하게 묶여 있습니다. 따라서 사용자가 활동을 반복해도 `나는 무엇을 잘하게 되었는가`, `무엇이 그걸 증명하는가`, `다음 개인 목표는 무엇인가`가 명확하지 않을 수 있습니다.

이번 기획의 핵심 루프는 다음과 같습니다.

`의미 행동 → 이해 가능한 성장 증거 → 사용자가 고른 mastery thread → 다음 달성 가능한 단계 → D1 인식 → D3 재적용 → D7 before/after → D14 자발적 심화 → D30 durable mastery record → 선택적 공유/aspiration`

새 backend progression engine이나 보상 계약은 요구하지 않습니다.

## 2. 소비자 약속

**“내가 무엇을 더 잘하게 되었는지, 왜 의미 있는지, 다음에 무엇을 시도할 수 있는지 알 수 있다.”**

숙련도는 부, 체류시간, 기능 방문 수, 카지노 이용량, 대출 사용, 거래 횟수와 동일하지 않습니다.

유효한 mastery signal은 다음 중 하나 이상을 주로 나타내야 합니다.
- 실제 완료한 과제나 기술;
- 가상경제 개념을 더 깊게 이해한 결과;
- 컬렉션/큐레이션 milestone;
- 직업 깊이;
- 프로젝트/사업 운영 milestone;
- 안전한 가상시장 학습 또는 replay 품질;
- 건설적인 커뮤니티/프로젝트 기여;
- 시즌·세계관 이해와 기록;
- 의도적인 창작·정체성 표현.

## 3. 첫 30초·첫 3분·첫 세션

### 첫 30초
글로벌 점수를 이해시키려 하지 않습니다. 제품 약속 하나, proof/sample 하나, 의미 행동 하나만 우선합니다. mastery preview가 필요하다면 `첫 직업 작업을 완료하면 내 직업 기록이 시작돼요`처럼 설명하고 `계정 파워 상승` 같은 추상 표현은 피합니다.

### 첫 3분
사용자가 시작 의도를 하나 고른 뒤 그 선택과 연결된 observable outcome 하나를 보여줍니다.
- 직업: 첫 작업 완료, 다음 직업 milestone까지 진행;
- 컬렉션: 첫 작품/아이템 큐레이션, 다음 set theme 선택;
- 학습/replay: 시장 이벤트 원인 하나 이해, 다음 상황 비교;
- 프로젝트: 첫 bounded contribution 기록, 무엇이 바뀌었는지 확인.

지갑 잔액 증가는 competence의 대리 지표로 사용하지 않습니다.

### 첫 세션 종료
첫 결과 뒤 mastery continuation 하나와 `나중에`/`오늘은 끝내기`를 제공합니다. 사용자가 나갈 때 최소한 다음 중 하나는 알아야 합니다.
1. 무엇이 좋아졌는지;
2. 다음 달성 가능한 단계가 무엇인지;
3. 오늘은 더 하지 않아도 된다는 것.

## 4. mastery evidence 모델

### 4.1 증거 유형
- **Completion evidence:** bounded task/chapter/set/project step 완료.
- **Understanding evidence:** 안전한 simulation/replay에서 개념을 올바르게 해석하거나 적용.
- **Consistency evidence:** punitive streak 없이 시간에 걸친 유용한 행동 반복.
- **Curation evidence:** 컬렉션/공간을 의도적으로 구성·복원·설명.
- **Contribution evidence:** 안전한 기여로 club/community project가 실제 변화.
- **Reflection evidence:** 과거 선택과 현재 결과를 비교하고 해석.

### 4.2 품질 규칙
성장 증거는 가능하면 다음을 만족해야 합니다.
- 원장이나 analytics 화면 없이 이해 가능;
- 실제 사용자 행동과 연결;
- 단순 click/open farming으로 부풀리기 어려움;
- 가능한 한 raw WLD wealth와 분리;
- 정체성/소셜 노출이 있으면 private/reversible;
- 진행이 없을 때는 없다고 솔직하게 표시.

## 5. D1~D30 return ladder

### D1 — novelty보다 recognition
첫 세션에서 사용자가 고르거나 만든 exact mastery thread를 먼저 보여줍니다.

### D3 — feature breadth보다 application
같은 개념을 조금 다른 맥락에서 한 번 더 써볼 기회를 줍니다. 관련된 다음 단계가 없으면 가짜 novelty를 만들지 않습니다.

### D7 — before/after가 보이는 주간 증거
`계속했더니 무엇이 달라졌는가`에 답할 수 있어야 합니다. 직업 milestone, collection chapter, project contribution, replay insight, season knowledge record 등이 후보입니다.

### D14 — voluntary depth
조금 더 어려운 변형, adjacent specialty, curation role, social contribution을 제안할 수 있습니다. `나중에` 선택에 불이익을 주지 않습니다.

### D30 — durable mastery record
직업 chapter, collection exhibition, learning replay history, project record, season archive, public-safe earned badge 등 의미가 남는 기록을 만듭니다.

## 6. 세션 길이별 설계

### 1~3분 quick check
- 현재 mastery thread 인식;
- 실제 변화 하나 또는 next step 하나;
- 행동/미루기/종료 선택.

### 5~15분 meaningful session
- 하나의 일관된 practice/creation loop;
- 종료 시 성장 증거 표시;
- 더 깊게 할지 종료할지 선택.

### 30분+ deep session
- 큐레이션, 프로젝트, strategy replay, 컬렉션 구축, world exploration, 협업 창작;
- 긴 세션의 결과가 잔액만 늘리는 것이 아니라 기록/산출물로 남아야 함.

오래 플레이했다고 광고량을 자동으로 늘리지 않습니다.

## 7. mastery와 경제

WLD를 원하는 이유는 표현, 복원, 컬렉션, 공간, 프로젝트, 선택적 prestige를 돕기 때문이어야 하며 부 자체를 mastery라고 부르지 않습니다.

금지 방향:
- mastery를 주로 WLD 잔액으로 순위화;
- 일반 onboarding/mastery 완료에 예금·대출·주식·카지노 사용 강제;
- 운이나 시스템 제어가 큰 결과를 `실력`으로 표현;
- 실제 돈으로 mastery level, leaderboard priority, 가상시장 우위 판매;
- 부채·손실·카지노 결과를 `숙련도 복구` comeback trigger로 사용.

unlimited-by-default 플레이 원칙은 유지하되 diminishing reward나 evidence-quality 원칙은 허용할 수 있습니다. scarcity를 만들기 위한 임의 하드캡은 피합니다.

## 8. social/viral loop

공유 가능한 mastery는 의무가 아니라 산출물이어야 합니다.

후보:
- 완성된 collection chapter;
- 어떤 활동을 했는지 설명되는 profession milestone;
- educational replay summary;
- safe project contribution;
- season/world knowledge archive;
- curated personal space/exhibit.

수신자는 로그인하지 않아도 내용을 이해할 수 있어야 하며 관련 sample/CTA 하나만 제공합니다.

share URL/card에는 session token, private balance, debt, exact portfolio position, private membership, moderation/security state, non-public social graph를 포함하지 않습니다.

raw badge view/share/profile visit에는 경제보상을 붙이지 않습니다.

## 9. Acquisition·콘텐츠·SEO

mastery는 공개 콘텐츠 자체가 독립적인 가치가 있을 때만 acquisition 자산이 됩니다.

색인 후보:
- 충분한 초보자 설명;
- 검토된 가상기업/세계관 가이드;
- 교육형 simulated-market replay;
- collection/project retrospective;
- 실제 내용이 충분한 season archive;
- 점수 홍보가 아니라 개념을 가르치는 public-safe mastery guide.

사용자×레벨×배지×날짜×milestone 조합의 얇은 페이지를 만들지 않습니다. 개인 mastery state, 진행도, 잔액, portfolio, debt, casino, recovery/security, moderation 상태는 private/non-indexable입니다.

Organic funnel:
`검색/발견 → 유용한 학습/sample → authored mastery thread → signup/activation → D7 visible improvement → D30 durable record → 선택적 공유/기여`

SEO 성공은 impressions만이 아니라 organic activation, D7/D30, retained contribution으로 봅니다.

## 10. 수익화

다음 구간을 보호합니다.
`action → result → 무엇이 좋아졌는지 이해 → next step 선택`

의미 결과와 성장 설명 사이에 interruptive ad, sponsor interstitial, subscription gate를 넣지 않습니다.

반복가치 이후 상대적으로 낮은 위험 후보:
- 광고 제거;
- non-P2W profile/space/exhibit cosmetic;
- 선택적 archive/gallery 표현;
- 투명한 season cosmetic;
- 시장/대출/매수/매도/보상 버튼과 혼동되지 않는 명확한 sponsor content.

사용자 mastery/attachment가 높다는 이유로 가격을 몰래 올리지 않습니다.

## 11. Funnel·cohort KPI

기존 핵심 KPI를 유지하고 다음을 추가합니다.
- first-value → mastery-evidence comprehension;
- first-session mastery-thread selection;
- time-to-first-visible-improvement;
- next-step comprehension;
- D1 exact-mastery-thread continuation;
- D3 same-thread application;
- D7 before/after comprehension 및 coherent-loop completion;
- D14 voluntary-depth adoption;
- D30 durable-mastery-record coverage;
- mastery artifact opt-in share → recipient activation → recipient D7;
- mastery 관련 satisfaction signal;
- recommendation defer/hide rate.

다음은 standalone mastery KPI가 아닙니다.
- features opened;
- WLD accumulated;
- casino volume;
- trades made;
- time spent.

Guardrail:
- abuse/fake-account rate;
- suspicious reward duplication;
- bot/macro evidence inflation;
- referral fraud;
- account-takeover signal;
- spam/report rate;
- privacy complaint rate;
- finance-like misunderstanding report;
- youth-safety complaint;
- ad-induced churn.

## 12. 실험 backlog

### 실험 A — visible improvement vs reward-only result
가설: 의미 행동 뒤 WLD/EXP만 보여주는 것보다 평문 before/after 성장 증거와 next step 하나를 보여주면 D7 same-thread continuation이 높아진다.
대상: core-thread 의미 행동을 1회 완료한 신규 활성 사용자.
Control: reward/result만 표시.
Treatment: reward/result + 이해 가능한 성장 증거 + next step 하나.
Primary: D7 same-thread continuation.
Guardrail: confusion exit, support 질문, reward farming anomaly, finance-like misunderstanding.
관찰: 최소 D7 성숙 cohort, broad 표준화 전 D30 확인.

### 실험 B — user-chosen mastery thread vs global score
가설: 글로벌 account level보다 사용자 선택 mastery thread 하나가 D1/D7 이해와 복귀 품질을 높인다.
Primary: D1 exact-thread continuation, D7 coherent loop.
Guardrail: hide/defer, churn, complaint.

### 실험 C — reflection recap vs generic weekly recap
가설: `무엇을 시도 → 무엇이 변화 → 무엇을 배움 → 다음 선택`이 generic activity list보다 D14 voluntary depth를 높인다.
Primary: D14 voluntary-depth selection.
Guardrail: notification opt-out, privacy complaint, fatigue.

### 실험 D — contextual public artifact vs raw achievement share
가설: 설명 있는 contextual artifact가 badge/score-only card보다 recipient activation/D7이 높다.
Primary: recipient meaningful activation, D7.
Guardrail: spam/report, doxxing, PII leakage, referral fraud.

### 실험 E — mastery comprehension 이후 monetization
가설: 결과 이해 뒤까지 interruptive monetization을 늦추면 eligible-user revenue를 크게 해치지 않으면서 D7/D30을 보호한다.
Primary: D7/D30 retained contribution.
Guardrail: ad-induced churn, accidental click, abandonment.

## 13. 보안·악용·개인정보 검토

### HIGH — 가짜 mastery/reward claim 피싱·ATO
악용: `숙련도 보상 대기`, `레벨 보존 인증`, `진행도 수령` 링크로 credential 탈취.
최소조건: canonical domain/brand 일관성, growth message에서 password/OAuth/recovery code 요구 금지, URL에 secret/session/recovery state 금지.
별도 QA: external deep link, push/email, account-linking 변경 시 필요.

### HIGH — private-state leakage
악용: mastery card에 WLD/WDX, debt, casino history, private club, portfolio, social graph, moderation/security state 노출.
최소조건: personalized state private-by-default, public-safe allowlist, 공개 artifact 명시적 opt-in, 민감 analytics payload 회피.
별도 QA: public personalized surface 구현 시 필요.

### HIGH — bot/multi-account mastery farming
악용: 저비용 반복행동으로 reward/prestige/referral value 증식.
최소조건: raw opens/clicks/views/shares 보상 금지, meaningful downstream action 기준, 기존 eligibility/anomaly/ledger 보호 유지.
별도 QA: economy-linked mastery reward 추가 시 필요.

### HIGH — finance/casino manipulation을 mastery로 포장
악용: WDX 수익, debt 사용, casino win을 competence로 표현해 chasing/collusion/market manipulation 유도.
최소조건: simulated/game-only 고지, profit/loss chasing을 progression으로 사용하지 않음, market-integrity/probability control 유지.
별도 security/fraud/legal QA 필요.

### MEDIUM — analytics overcollection
악용: 상세 mastery/interest history가 제한 없는 광고 profile로 전환.
최소조건: 제품 측정에 필요한 범위만 수집, private economy/social history를 광고/분석 partner에 자유롭게 전달하지 않음, 동의/법적 경계 준수.

## 14. Research note — 2026-09-14

직접 채택:
- Supercell, 2026-05-13 `New Collection Levels & Mastery Changes`: progression 복잡성, 불명확한 진행률, 개인 목표와 동떨어진 보상을 문제로 보고 simple/visible progress와 next-goal proximity를 강조.
- Supercell, 2026년 6월 update/support: Collection Level이 더 명확한 overall progress representation으로 실제 출시되었는지 교차검증.
- Google Search Central 현행 people-first guidance 및 2026 Discover guidance: 공개 mastery/교육 콘텐츠는 독창적이고 유용해야 하며 scaled thin page와 과장형 engagement bait 금지.
- 개인정보보호위원회, 2026-07-27 TikTok·Apple 제재: cross-context behavioral data를 광고용 자유 데이터가 아니라 개인정보 규율 영역으로 취급.

참고:
- Supercell 현행 Card Mastery support: task-specific progress와 badge가 mastery 설명 방식의 사례. 보상경제 모델 자체는 복제하지 않음.
- FTC digital-dark-pattern 선례: progression/monetization 문구가 허위 확실성이나 accidental purchase를 만들지 않도록 하는 참고선. Moneyverse에 직접 적용되는 개별 판결로 단정하지 않음.

## 15. Runtime Product Reality Audit — 2026-09-14

검증 가능: public web home, guide, announcements.

확인한 상태:
- 홈은 WLD/보상이 game-only 가상 데이터라고 명확히 설명하고 activity가 기록으로 남는다고 안내.
- 빠른 바로가기는 여전히 지갑/미니게임/거래소/상점/퀘스트 중심이며 sponsored placement가 여러 곳 존재.
- 가이드에 profession EXP/mastery 표현은 있으나 전체 roadmap은 `seed WLD → 저축 → 주식/사업 → 대표 자본가`라는 자산중심 서사가 강함.
- 가이드는 game-only/no guaranteed return을 명시하면서도 복리이자, passive income, 저평가 우량주, 시세차익 같은 finance-like 표현을 사용.
- 첫날 checklist는 남은 WLD를 복리예금에 넣는 것으로 종료.
- 운영소식은 quiet state인 반면 sponsored inventory가 존재.

결론: 현재 공개제품은 **실력·학습·큐레이션 mastery보다 경제적 축적을 더 선명하게 보여준다.** 따라서 이번 visible-mastery loop는 아직 검증되지 않은 성장 가설이다.

## 16. 법규·정책 메모

- WLD/WDX는 virtual/simulated/game-only이며 실제 투자·예금·현금환전·수익보장을 암시하지 않음.
- 아동/청소년 확대, 맞춤광고, 확률형 기능, 실제 결제 구독 변경은 한국/미국 최신 법률·제품 검토 필요.
- 광고/스폰서는 명확히 표시하고 buy/sell/loan/repay/reward control과 혼동시키지 않음.
- 구독 조건, 자동갱신, 취소는 명확하고 이해하기 쉬워야 함.

## 17. 다음 성장 우선순위

먼저 좁은 루프 하나만 실제 cohort로 검증합니다.

`직업/컬렉션/학습 의미 행동 하나 → 평문 mastery signal 하나 → 사용자가 고른 next step 하나 → D1 recognition → D3 application → D7 before/after → D30 durable mastery record`

D7/D30이 개선되고 신뢰·악용·개인정보·finance-like misunderstanding guardrail이 악화되지 않는다는 근거가 생기기 전에는 global power score, wealth-based mastery, mastery-linked WLD farming, profit/loss comeback pressure, 민감 progress public card, mastery 이해를 끊는 광고를 확대하지 않습니다.