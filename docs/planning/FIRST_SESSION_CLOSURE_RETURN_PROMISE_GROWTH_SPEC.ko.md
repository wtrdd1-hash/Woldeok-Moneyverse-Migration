# 월덕 머니버스 — 첫 세션 종료·복귀 약속 성장 명세

> 버전: v2026.09.14.76
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `USER_CONTROLLED_PRIORITY_HOME_RETENTION_GROWTH_SPEC.md`, `WORLD_PULSE_FRESHNESS_RETENTION_GROWTH_SPEC.md`, `ZERO_STATE_CONTINUITY_QUIET_SURFACE_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> 영문 기준 문서: [FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md](FIRST_SESSION_CLOSURE_RETURN_PROMISE_GROWTH_SPEC.md)
> 변경 유형: 문서 전용. 런타임, DB, API, 인증, migration, scheduler, 인프라, 보안 코드 변경 없음.

## 1. 이번 회차에서 선택한 공백
Moneyverse는 유입, 첫 가치, 사용자 직접 priority, D1/D7 연속성, 시즌, 컬렉션 역사, 사회적 소속, quiet state 기획이 이미 상당히 상세하다. 이번에 남은 activation/retention 공백은 더 좁다. **첫 세션에서 어떤 행동을 완료한 뒤에도 사용자가 스스로 ‘다음에 돌아와서 이어갈 이유’를 만들지 않은 채 세션이 끝날 수 있다.**

현재 Production 시작 가이드는 로그인, 지갑, 퀘스트, 직업, 첫 보상, 은행/상점 이용까지 설명하고 첫날 체크리스트도 제공한다. 하지만 체크리스트의 마지막은 남은 WLD를 복리예금에 넣는 것이며, 첫 세션을 마치기 전에 사용자가 직접 다음 목표를 저장하거나 다음 방문에서 무엇을 기대할지 정하는 종료 단계는 명시적으로 보이지 않는다.

이번 좁은 성장 루프:

`첫 가치 → 결과 확인 → 이어갈 스레드 하나 직접 선택 → 명확한 복귀 약속 → 세션 종료 → D1 정확한 스레드 인식 → D3 진전/맥락 → D7 완료 또는 갱신 → D30 지속 기록`

소비자 약속:

**“세션을 끝내기 전에 다음에 이어갈 것 하나를 직접 고르고, Moneyverse가 그것을 기억한다.”**

이 문서는 scheduler, reminder engine, task state machine, DB schema, API 계약 문서가 아니다.

## 2. 세션 종료도 제품 경험이다
첫 세션은 퀘스트 완료, WLD 수령, 지갑 열기, 클럽 가입, 시즌 페이지 조회만으로 성공으로 끝난 것이 아니다. 좋은 종료는 사용자가 다음 세 가지를 이해하는 상태다.

1. 이번에 무엇을 해냈는가;
2. 무엇을 계속하기로 골랐는가;
3. 다음 방문에서 무엇이 이어질 수 있는가.

이어갈 것을 선택하지 않고 종료해도 불이익이 없어야 한다.

## 3. 첫 30초 / 첫 3분 / 첫 세션 종료
### 첫 30초
기존 브랜드와 game-only 경계를 명확히 유지한다. 이해 가능한 가치 증명 하나와 행동 하나만 보여준다. 은행, 대출, 주식, 사업, 카지노, 컬렉션, 시즌, 클럽을 동시에 이해하도록 요구하지 않는다.

### 첫 3분
실제 상태를 하나 만드는 authored choice를 목표로 한다. 예:
- 직업 방향 하나 선택;
- 가상기업/세계 스레드 하나 follow;
- starter collection theme 하나 선택;
- learning path 하나 저장;
- bounded project 하나 참여.

### 첫 세션 종료
첫 의미 결과가 나온 뒤 compact closure 선택을 제공한다.
- **이어서 하기:** 방금 행동에서 자연스럽게 이어지는 정확한 스레드 하나;
- **다른 것 보기:** 인접한 대안 하나;
- **오늘은 끝내기:** 아무 불이익 없이 종료.

스레드를 고르면 실제로 보장할 수 있는 미래만 preview한다.
- “다음에는 이 직업 경로를 이어갈 수 있어요.”
- “이 가상기업 스레드를 저장했어요. 실제 세계 업데이트가 게시되면 여기서 이어집니다.”
- “starter collection theme이 저장됐어요. 다음 단계는 관련 artifact 하나예요.”
- “이 프로젝트를 저장했어요. 다음 의미 있는 milestone이 여기 나타납니다.”

실제로 일정이 없거나 지원하지 않는 변화를 약속하지 않는다.

## 4. D1 / D3 / D7 / D14 / D30
### D1 — novelty보다 recognition
복귀 첫 화면은 generic feature, wallet balance, 광고, 새로운 기능보다 사용자가 고른 exact thread를 먼저 인식한다. 변화가 없으면 없다고 말하고 evergreen next step 하나를 보여준다.

### D3 — 연속성 증명
진전, 새로운 관련 맥락, 이용 가능한 다음 행동, 또는 정직한 unchanged state 중 하나를 보여준다. 가짜 활동을 만들지 않는다.

### D7 — 완료 또는 갱신
좋은 D7은 원래 복귀 약속을 완료하고 archive/extend/replace를 고르게 하거나, 실제 진전을 보여주고 사용자가 직접 이어갈지 다시 결정하게 한다.

### D14 — 정체성 형성
같은 스레드를 반복했다면 직업 경로, 컬렉션 챕터, 세계 관심사, 프로젝트 역할, 학습 기록 같은 optional identity signal로 발전할 수 있다. 공개는 reversible이며 필요 영역은 기본 private다.

### D30 — 지속 기록
첫 세션 선택은 collection chapter, profession/project history, followed world thread, learning replay, season memory, shared-project chapter 중 하나의 지속 기록으로 남는 것이 이상적이다. 장기 가치는 WLD 잔액만 커지는 것이 아니다.

## 5. 세션 길이별 역할
- **1~3분:** 스레드 인식 → 현재 상태 → 행동 하나 또는 종료.
- **5~15분:** 고른 스레드를 실제로 진전시키고 다음 복귀 약속을 설정/갱신.
- **30분+:** build, curate, explore, collaborate. 종료 시에도 여러 의무를 쌓지 않고 primary next thread 하나만 둔다.

일일 숙제, punitive streak reset, loss threat, artificial hard cap으로 습관을 만들지 않는다.

## 6. Acquisition / Activation 영향
SEO, creator, referral, share-card 유입은 첫 스레드를 제안할 수 있지만 실제 value 이후 저장되는 continuation은 사용자가 직접 선택해야 한다.

수정 funnel:

`qualified visit → 명확한 약속 → useful sample → authored choice → 필요 시 contextual signup → meaningful result → return-promise 선택 → D1 exact-thread recognition → D7 resolve/renew → D30 durable history`

로그인 성공, referral code 입력, 광고 클릭, 지갑 열기, 알림 허용은 activation이 아니다.

## 7. UX / 문구 원칙
좋은 closure 문구:
- “첫 작업을 끝냈어요. 이 직업을 다음 경로로 이어갈까요?”
- “이 컬렉션 테마를 다음에 이어가도록 저장할까요?”
- “이 세계 스레드를 팔로우하고 실제 변화가 생길 때 이어볼까요?”

금지/제한:
- “내일 안 오면 보상을 잃어요.”
- “돈이 놀고 있어요.”
- “확정 수익을 놓치지 마세요.”
- “오늘 손실을 복구하세요.”
- fake countdown, fake unread badge, fake pending reward.

empty/quiet state는 v75의 `State → Reason → Continuity → Next`를 유지한다.

## 8. LiveOps / Season
시즌은 truthful return anchor가 될 수 있지만 첫 세션을 FOMO에 의존시키지 않는다.

실제 콘텐츠가 있을 때만 D-14/D-7/D-3/D-1 preview를 사용한다. 시즌 관심을 저장할 수 있지만 preview를 놓쳐도 진척이 훼손되지 않는다. 중도 진입/복귀 사용자는 catch-up context와 next action 하나를 받는다.

## 9. Social / Viral
공유는 첫 가치 이전이 아니라 meaningful first-session outcome 뒤가 우선이다.

공유 후보:
- 첫 collection theme/result;
- 첫 profession choice/result;
- 첫 educational replay;
- 첫 안전한 community/project contribution;
- 첫 fictional-world choice.

수신자 흐름:
`로그인 없이 artifact 이해 → useful preview → 자신의 선택 → 저장/이어가기 시 가입 → activation → D7`

share URL/card에 session token, PII, private balance, WDX position, debt, casino history, moderation status, recovery state를 포함하지 않는다.

## 10. SEO
personal next-session state, private saved goal, pending reward, wallet state, debt, casino outcome, recovery/security state, thin dynamic comeback page는 색인하지 않는다.

색인 후보는 독립적으로 유용한 people-first 콘텐츠로 제한한다: guide, 가상기업/세계 페이지, season archive, glossary/education, project retrospective, 검토된 community content.

성공 KPI는 impressions가 아니라 `organic visit → sample → authored choice → signup → activation → return promise → D7/D30`이다.

## 11. Monetization
첫 세션 closure는 protected moment다. 첫 의미 결과와 ‘이어갈지/종료할지’ 결정 사이에 interruptive ad, subscription gate, sponsor module을 넣지 않는다.

수익화는 기존 retention-first 원칙 유지:
- 약속된 가치 뒤 자연스러운 경계에서 광고;
- 반복가치와 실제 제거 대상 광고를 이해한 뒤 광고제거 구독;
- attachment 이후 비-P2W identity/space/collection 상품;
- WLD/WDX 우위, 대출조건 우위, trading/casino/moderation/ranking 우위 판매 금지.

구독 조건, 자동갱신, 가격, 취소는 명확해야 하며 명시적 동의와 쉬운 취소를 전제로 한다.

## 12. 보안 / 개인정보 / 악용 검토
### HIGH — 가짜 ‘미완료 목표/대기 보상’ phishing
영향: credential theft, account takeover.
악용: 가짜 Moneyverse 메시지가 저장 목표·보상·시즌·지갑 조치를 완료하라며 로그인/OAuth/recovery 정보를 요구.
최소조건: canonical domain 일관성, growth content에서 credential/auth/recovery code 요구 금지, URL에 secret/session/recovery 금지, fake urgency 금지.
별도 dev/QA: external deep-link, push/email comeback, 새 login handoff 도입 시 필요.

### HIGH — return promise에서 민감상태 노출
영향: private WLD/WDX, debt, casino activity, club/social graph, security state가 home/lock screen/share/analytics에 노출.
최소조건: public-safe allowlist, personalized continuation 기본 private, finance/security 민감필드 growth copy 및 third-party analytics 제외.
별도 dev/QA: public/personalized surface 또는 새 analytics SDK 도입 시 필요.

### HIGH — reward farming / multi-account abuse
악용: alt account/script가 next goal 생성·완료를 반복하며 referral/comeback/economic incentive farm.
최소조건: save/pin/open/return-promise 생성 자체에 의미 있는 WLD/WDX 지급 금지. 보상이 필요하면 downstream verified participation만 제한적으로 검토.
별도 dev/QA: economic reward 연결 전 필요.

### HIGH — finance-like manipulation
악용: WDX 손실, debt, casino 결과, idle money를 이용해 복귀 압박.
최소조건: loss-chasing/debt urgency/guaranteed-return 문구 금지, WLD/WDX virtual/game-only 의미 유지.
별도 dev/QA: finance-adjacent personalized comeback 도입 전 필요.

### MEDIUM — analytics overcollection
private economy/social history 전체를 광고벤더에 넘기기보다 thread category와 lifecycle outcome 정도로 최소 측정한다.

기존 OAuth/session/RBAC/admin/ledger/privacy/community 경계는 변경하지 않는다.

## 13. 실험 backlog
| 실험 | 가설 | 코호트/진입 | Control | Treatment | Primary | Guardrail | 최소 관찰 | 다음 행동 |
|---|---|---|---|---|---|---|---|---|
| E1 Closure | 명시적 closure가 복귀의도를 만든다 | 신규 activated | 행동 후 종료 | 결과→다음 스레드 선택 | D1 exact-thread return | 완료율, exit, complaint | D7 성숙 | D1+D7 동시 개선 시 유지 |
| E2 One vs three | next thread 하나가 과부하를 줄인다 | 첫 세션 완료자 | 동등 추천 3개 | primary 1개+변경 옵션 | 선택률 + D7 | bounce, reversal | 2주/D7 | quality 개선 시 확대 |
| E3 User-authored | 직접 선택이 durable retention을 높인다 | 신규 | 자동 next action | explicit save/choose | D30 durable thread | opt-out, privacy complaint | D30 | opaque personalization 우위 없으면 제외 |
| E4 Protected closure | closure 전 광고 제거가 retained quality를 지킨다 | eligible first session | closure 전 광고 | closure 이후 광고 | D7 quality | revenue/user, ad churn | D30 | retention-adjusted contribution 비교 |
| E5 Honest unchanged | 변화 없음 정직성이 신뢰를 높인다 | 변화 없는 D1/D3 | filler novelty | unchanged+evergreen step | meaningful action + D7 | trust complaint, exit | D14 | 신뢰/리텐션 기준 채택 |

## 14. KPI
Activation:
- visitor→signup;
- meaningful activation;
- time-to-first-value;
- first-session completion;
- first-result→return-promise selection;
- first authored continuation.

Retention:
- D1 exact-thread recognition/continuation;
- D3 same-thread progress;
- D7 resolution-or-renewal;
- D14 identity attachment;
- D30 durable-history coverage;
- returning-user share, WAU/MAU, sessions/user, meaningful actions/session, comeback rate.

Growth/revenue:
- organic/referral/share→activation→return promise→D7/D30;
- CAC/fraud-adjusted CAC;
- LTV, ARPU/ARPDAU, subscription conversion, cohort revenue, retention-adjusted contribution;
- ad-induced churn.

Trust/safety:
- abuse/fake-signup/referral-fraud;
- ATO signal;
- spam/report;
- privacy complaint;
- suspicious reward duplication;
- finance-like misunderstanding.

## 15. 최신 레퍼런스
- **Supercell, 2026-05-13 Collection Levels & Mastery Changes — 직접채택 원칙:** 진행이 명확하고 사용자가 다음 목표까지 얼마나 남았는지 알아야 한다는 방향. 경제 구조 자체는 채택하지 않음.
- **Xbox, 2026-04-30 April Update — 직접채택 원칙:** 사용자가 직접 고정한 `Jump back in` 대상이 해제 전까지 앞에 남는 구조. user control과 빠른 복귀 접근만 채택.
- **Clash Royale, 2026-09-07 Minion Academy — 참고:** 한 시즌의 실제 신규 활동을 소수의 구체 항목으로 묶어 전달하는 live-service anticipation 사례. FOMO/보상경제는 채택하지 않음.
- **Google Search 현재 people-first 가이드 — 직접:** 공개 콘텐츠는 검색엔진이 아니라 사람에게 독립적 가치를 제공해야 함. thin continuation 페이지 대량생성 금지.
- **FTC 2026년 5~6월 subscription 집행 — 직접 guardrail:** 중요조건의 명확한 고지, express informed consent, 쉬운 cancellation.
- **FTC 2026년 9월 personalized pricing 제안 — 참고만:** 아직 proposed policy/comment 단계. 별개로 Moneyverse는 hidden willingness-to-pay pricing을 채택하지 않음.

## 16. Runtime Product Reality Audit — 2026-09-14
검증: **가능**.

현재 Production에서 확인한 사항:
- 홈은 WLD/보상이 game-only 가상 데이터임을 명확히 고지하고 wallet/game/exchange/shop/quest shortcut을 브랜드 설명보다 앞에 노출한다.
- Monthly Notes는 검토 완료 공개 소식을 준비 중이다.
- 로비는 대화가 없을 때 먼저 인사하라는 zero state를 보여주며 개인정보/계정정보를 남기지 말라고 안내한다.
- 시작 가이드는 4단계 quick start와 7개 첫날 체크리스트를 제공하고 마지막 단계는 남은 WLD를 복리예금에 넣는 것이다. ‘처음에는 하나만’이라는 문구는 있지만 첫 세션 마지막에 user-authored next-return promise를 저장하는 흐름은 공개 화면에서 확인되지 않았다.
- 운영소식 페이지는 게시된 공지가 없는 상태에서 sponsored advertisement가 존재한다.

따라서 `첫 의미 결과 → 사용자 선택 continuation 하나 → D1 recognition`은 현재 구현 사실이 아니라 **검증 전 성장 가설**로 기록한다.

## 17. 결정과 다음 우선순위
온보딩 단계를 더 늘리지 않는다. 다음 좁은 루프 하나를 검증한다.

`첫 의미 결과 → continuation 하나 선택 → 세션 종료 → D1 exact-thread recognition → D3 진전/정직한 unchanged → D7 resolve/renew → D30 history`

streak punishment, fake pending reward, finance-loss urgency, raw WLD/WDX return bonus, opaque automatic goal assignment, 조기 광고로 해결하지 않는다.