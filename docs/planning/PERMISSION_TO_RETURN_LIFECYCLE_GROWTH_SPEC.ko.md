# 월덕 머니버스 — 복귀 허용→가치 기반 라이프사이클 성장 명세

> 버전: v2026.09.14.66
> 상태: Living 소비자 성장 명세
> 기준일: 2026-09-14
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md`, `BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.md`, `RETENTION_SAFE_MONETIZATION_ENTRY_GROWTH_SPEC.md`
> 영문 기준 문서: [PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md](PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md)
> 변경 유형: 문서-only. 런타임, DB, API, 인증, 인프라, scheduler, 보안 코드는 변경하지 않는다.

## 1. 이번 회차에서 선택한 공백

Moneyverse에는 이미 알림 목적 분류, 동의, quiet hours, frequency, deep-link, 보안, 스팸 방지까지 다루는 구현 중심 알림 거버넌스 문서가 있다. 최근 성장기획도 acquisition, activation, collection, comeback, archive, brand, monetization까지 상당히 구체화됐다.

이번에 남은 소비자 성장 공백은 다르다. **사용자가 왜 Moneyverse에게 자신을 방해할 권한을 주어야 하는지, 어떤 메시지만 그 권한을 받을 가치가 있는지, 그리고 메시지를 눌렀을 때 일반 홈이 아니라 자신이 관심을 두었던 바로 그 맥락으로 어떻게 돌아가 의미 행동과 D7까지 이어지는지**가 충분히 정의되어 있지 않았다.

일반적인 `알림 허용` 요청 자체는 리텐션 전략이 아니다. push opt-in 비율이 높아도 이후 사용자가 앱을 mute하거나 스팸 신고를 하거나 발신자를 신뢰하지 않거나, 클릭 후 generic home에서 길을 잃으면 실패다.

canonical loop:

`첫 가치 → 사용자가 계속 보고 싶은 대상 선택 → 맥락형 복귀 알림 허용 제안 → 실제 의미 있는 변화 발생 → 최소 메시지 → 정확한 맥락 복귀 → 의미 행동 → D1/D7/D30 연속성`

소비자 약속:

**“내가 고른 것에 정말 돌아올 가치가 생겼을 때만 알려주세요.”**

이 문서는 소비자/제품 성장 수준을 정의하며 schema, API, scheduler, provider contract, backend 구조를 새로 늘리지 않는다.

## 2. 권한은 첫 화면에서 요구하는 것이 아니라 가치 뒤에 얻는다

Moneyverse는 첫 익명 화면이나 필수 onboarding checklist에서 push/email 권한을 요구하지 않는다.

가장 좋은 permission moment는 사용자가 실제로 미래에 돌아올 이유를 만든 직후다.

예:
- 특정 가상기업/세계 스레드를 follow함;
- 컬렉션 챕터나 다음 컬렉션 목표를 고름;
- 관심 있는 시즌/이벤트를 직접 저장함;
- 클럽/커뮤니티 프로젝트에 자발적으로 참여함;
- 직업/사업 목표를 선택함;
- weekly recap이나 특정 이벤트 reminder를 직접 요청함.

permission 설명은 무엇을 알려줄지 구체적으로 말해야 한다.

- “이 기업 이야기에 실제 변화가 생기면 알려드릴까요?”
- “이 컬렉션의 다음 챕터가 열리면 알려드릴까요?”
- “내가 고른 경로를 일주일에 한 번만 요약해 드릴까요?”

피해야 할 것:

- “최고의 경험을 위해 알림을 허용하세요.”
- “보상을 놓치지 않으려면 알림을 켜세요.”
- Moneyverse의 가치도 모르는 첫 화면에서 OS permission prompt를 바로 띄우는 방식;
- 선택적 마케팅 동의를 핵심 기능 이용 조건으로 묶는 방식.

OS 권한 팝업은 제품 수준 설명을 대신하는 것이 아니라 마지막 단계다.

## 3. 복귀 가치 우선순위

모든 이벤트가 외부 interruption을 받을 자격이 있는 것은 아니다.

### Tier A — 사용자가 직접 요청한 연속성
가장 높은 성장 가치.

- follow한 가상기업/세계 스레드가 실제로 변함;
- 선택한 시즌/프로젝트가 중요한 새 단계에 진입함;
- 사용자가 고른 컬렉션 경로에 관련 챕터가 생김;
- 사용자가 요청한 weekly recap이 준비됨.

### Tier B — 의미 있는 개인 진행
장기 상태를 이해하는 데 도움이 될 때 유효.

- 컬렉션 챕터를 curate/reinterpret할 새 이유가 생김;
- 직업/프로젝트 milestone으로 진짜 새 선택지가 생김;
- 가입한 클럽 프로젝트가 의사결정 지점에 도달함.

### Tier C — 넓은 제품/소식 업데이트
명시적으로 선택하지 않았다면 in-app이나 digest를 우선한다.

- 검토된 월간 세계 소식;
- 새 테마/시즌 preview;
- 저장한 관심사와 직접 관련 있는 교육 replay/guide.

### Tier D — 상업/프로모션
연속성과 분리되고 명확하게 통제되어야 한다.

- 구독 제안;
- sponsor promotion;
- cosmetic sale.

보안·거래·서비스 운영 메시지는 각각 필요한 목적 규칙을 따르며 growth inventory가 아니다.

## 4. 첫 세션 permission journey

### 첫 30초
기본적으로 외부 알림 요청을 하지 않는다.

사용자는 먼저 다음을 이해해야 한다.

1. Moneyverse는 지속형 커뮤니티 시뮬레이션 / game-only 가상경제다.
2. 지금 탐색할 구체적인 행동 하나가 있다.
3. 내가 고른 경로가 저장되어 이어질 수 있다.
4. 선택한 것을 계속 보고 싶을 때만 reminder를 선택할 수 있다.

### 첫 3분
사용자는 Build / Collect / Explore 또는 이에 해당하는 구체적 스레드 하나를 고른다.

저장 가능한 의미 선택이 생긴 뒤에만 좁은 permission offer를 한다.

> “이게 바뀔 때 한 번만 알려드릴까요?”

`나중에`를 선택해도 진행과 선택을 잃지 않는다.

### 첫 세션 종료
외부 permission nag보다 in-product next-step card가 우선이다.

미래 지향 상태가 실제로 만들어진 경우에만 notification permission을 요청할 정당성이 생긴다.

## 5. 라이프사이클 복귀 설계

### D1 — interruption보다 recognition
먼저 제품 안에서 “내가 고른 경로가 그대로 있다”를 증명해야 한다.

외부에 알릴 정도의 변화가 없다면 D1이라는 이유만으로 메시지를 보내지 않아도 된다. 24시간이 지났다는 사실만으로 보내는 `Day 1 reminder`는 성공조건이 아니다.

사용자가 직접 reminder를 요청했다면 좁고 맥락을 유지한다.

### D3 — 기능 나열이 아니라 인접 이유 하나
선택한 스레드가 발전했다면 변화 하나와 행동 하나만 보여준다.

지갑·은행·주식·카지노·상점·퀘스트를 한 번에 나열하지 않는다.

### D7 — 가치 증거가 있는 주간 recap
일반-purpose 리텐션 메시지 중 가장 강한 후보는 사용자가 선택한 weekly recap이다.

내용:
- 사용자가 무엇을 골랐는지;
- 무엇이 실제로 달라졌는지;
- 무엇을 했는지;
- 다음 행동 하나.

진행을 WLD 자산이나 WDX 수익률로만 환원하지 않는다.

### D14 — 정체성 심화
기존 경로와 직접 이어지는 경우에만 큐레이션, 전시, 직업, 세계, 클럽 프로젝트 선택을 보여준다.

### D30 — 장기 기록
월간/시즌 recap은 사용자의 기록으로 무엇이 남았는지, 앞으로 왜 다시 볼 이유가 있는지 보여준다.

`30일 됐으니 보상이 사라진다`는 압박을 사용하지 않는다.

### 휴면/come back
기존 catch-up 약속을 따른다.

`그대로 남은 것 → 실제로 바뀐 것 → 무시해도 되는 것 → 지금 할 행동 하나`

의미 있는 변화가 없다면 억지 메시지를 만들지 않는다.

## 6. 메시지 구조

growth-return 메시지는 네 가지를 통과해야 한다.

1. **Recognize** — 민감정보를 노출하지 않으면서 사용자가 고른 스레드를 알아보게 한다.
2. **Explain** — 실제로 무엇이 바뀌었는지 말한다.
3. **Bound** — 가짜 긴급성, 금융 압박, 허위 희소성을 쓰지 않는다.
4. **Continue** — 원래 스레드를 이어가는 정확한 행동 하나를 준다.

좋은 방향:

“Moonlight Archive 챕터에 이번 시즌과 연결되는 새 맥락이 생겼습니다. 무엇이 바뀌었는지 보고 아카이브에 넣을지 직접 골라보세요.”

나쁜 방향:

“긴급! 보상을 놓치고 있습니다. 지금 돌아오지 않으면 진행이 사라집니다.”

금융게임 메시지는 실제 수익, 보장 수익, 손실 회복, 긴급 매수/매도를 암시하지 않는다.

## 7. 클릭 이후 맥락 보존

notification click은 activation이 아니다.

복귀 흐름은 다음을 유지해야 한다.

`메시지 → 가능한 경우 안전한 관련 맥락 → 필요 시 인증/재인증 → 원래 목적지 → 의미 행동 하나`

광고 노출이나 기능 노출을 늘리기 위해 generic home으로 떨어뜨리지 않는다.

대상이 더 이상 존재하지 않는다면 안전하게 이유를 설명하고 가장 가까운 비민감 continuation을 제공한다.

## 8. outbound보다 in-app 우선

사용자 목표를 달성할 수 있는 가장 덜 방해적인 채널을 먼저 쓴다.

선택적 growth communication 권장 순서:

1. 현재 화면 next-best-action;
2. in-app inbox/recap;
3. 사용자가 요청한 digest/email/push;
4. 별도 동의한 marketing.

사용자가 자연스럽게 돌아온 경우 같은 이벤트에 다시 outbound reminder를 보낼 필요가 없다.

weak navigation이나 empty home을 외부 알림으로 덮지 않는다.

## 9. permission/preference UX 원칙

소비자 설정은 세 질문에 답해야 한다.

- **무엇을 알려주나요?** 시즌, 컬렉션, 커뮤니티 프로젝트, weekly recap, 제품 제안 등.
- **얼마나 자주인가요?** 정말 필요한 경우만 실시간, 그 외 digest/weekly/off 선택이 더 적합하다.
- **어디로 받나요?** in-app, email, push 등 가능한 채널.

보안/서비스 메시지는 유지하면서 선택적 growth/marketing만 mute할 수 있어야 한다.

광고성 선택은 명확한 이름을 써야 한다. 광고를 `혜택`, `중요 정보`, `커뮤니티 소식`으로 바꾸어 부르지 않는다.

## 10. 강압 없는 habit 설계

알림은 habit을 돕는 것이지 habit 자체가 되어서는 안 된다.

건강한 루프:

`사용자 의도 → 제품 변화/진행 → 선택적 reminder → 유용한 복귀`

피해야 할 루프:

`매일 알람 → 보상 수령 → countdown reset → 반복`

streak punishment, 자산손실 위협, churn했다고 더 큰 WLD 지급, 카지노 반복 prompt, 손실/수익률 압박으로 메시지량을 정당화하지 않는다.

## 11. Social / Viral 알림

사용자가 고른 관계·프로젝트를 반영할 때 social return 메시지는 가치가 있다.

허용 방향:
- 참여한 클럽 프로젝트가 milestone에 도달함;
- 명시적으로 공개한 콘텐츠에 반응이 생김;
- 공유한 컬렉션/스토리에 관련 맥락이 새로 생김.

lock screen에 기본적으로 노출하지 않을 정보:
- 비공개 social graph;
- 비공개 메시지 본문;
- WLD/WDX 보유;
- 부채/대출 상태;
- 카지노 기록;
- 실제 security alert에 꼭 필요한 범위를 넘는 계정/복구 정보.

community notification은 block/report/privacy 통제를 고려하고 harassment나 coordinated spam을 증폭시키면 안 된다.

## 12. LiveOps / Season anticipation

D-14/D-7/D-3/D-1 알림은 매번 새 정보가 있을 때만 가치가 있다.

- D-14: 무엇이 오고 왜 중요한지;
- D-7: 어떤 옛/새 스레드를 follow할지 사용자가 선택;
- D-3: 연결되는 실제 맥락 하나;
- D-1: 선택한 스레드의 짧은 reminder;
- 시작: generic home이 아니라 직접 continuation.

중도 진입자는 놓친 알림 4개를 한 번에 받는 것이 아니라 catch-up 경로를 받는다.

## 13. Acquisition / Brand 영향

알림 권한은 acquisition KPI가 아니라 이후에 얻는 trust asset이다.

paid/organic landing에서 `notification enable` 전환을 최적화하지 않는다. 먼저 first value와 authored choice를 최적화한다.

브랜드 원칙:

**Moneyverse는 사용자가 무엇을 중요하게 여겼는지 기억하지만, 메시지를 보낼 수 있다는 이유만으로 관심을 요구하지 않는다.**

이는 v65의 persistent choice / remembered history 약속을 강화한다.

## 14. SEO 영향

private notification inbox, preference state, unsubscribe page, deep-link continuation state, account reminder, 개인 recap 페이지는 SEO inventory가 아니다.

index 후보:
- 알림 선택을 설명하는 명확한 help page;
- season/event public archive;
- 독립적 가치가 있는 검토된 world/company/collection 콘텐츠.

개인별 `놓친 내용` 또는 notification landing을 대량 색인하지 않는다.

## 15. 수익화 경계

선택적 복귀 communication은 기본적으로 광고 inventory가 아니다.

- security/account 메시지에는 sponsor placement를 넣지 않는다.
- collection/season continuity 메시지에 무관한 판매 제안을 붙여 commercial message로 바꾸지 않는다.
- 구독/cosmetic promotion은 필요한 commercial preference/동의와 명확한 광고표시를 요구한다.
- advertiser가 user-selected continuity보다 우선순위를 살 수 없다.
- 비공개 경제행동, 최근 손실, 부채, 카지노 행동, 보안상태로 commercial notification을 개인화하지 않는다.
- 알림 허용, message open, 광고 click 자체에 의미 있는 WLD/WDX를 지급하지 않는다.

수익성 평가는 CTR/revenue뿐 아니라 unsubscribe, permission revoke, complaint, churn, support cost, D7/D30 영향까지 포함한다.

## 16. KPI framework

### Permission quality
- eligible value moment → permission 설명 노출;
- 설명 → category opt-in;
- 해당되는 경우 OS permission grant;
- 7/30일 permission 유지율;
- category mute/unsubscribe;
- notification permission revoke.

### Return quality
- delivered → meaningful return;
- context-preserved return rate;
- message → meaningful action;
- message 이후 D1/D3/D7/D14/D30;
- natural return vs message-assisted return;
- click 후 time-to-context;
- return session 만족/불만 신호.

### Business quality
- lifecycle messaging cohort별 retained-user contribution;
- reactivation LTV/CAC 영향;
- 반복 가치 이후 commercial opt-in conversion;
- notification-attributed revenue에서 churn/support 비용을 뺀 값.

### Trust/Safety guardrail
- spam/complaint;
- opt-out/unsubscribe;
- phishing/impersonation 신고;
- message campaign 이후 ATO signal;
- privacy complaint;
- suspicious reward duplication/fake account;
- social notification 관련 harassment/report.

CTR/open은 진단지표이지 primary success가 아니다.

## 17. 실험 backlog

### 실험 1 — value-earned permission timing
- 가설: durable choice 직후 permission ask가 첫 세션 generic prompt보다 raw prompt 수는 적지만 D30 permission 유지와 D7 품질이 높다.
- 대상: 첫 의미 선택을 완료한 신규 사용자.
- Control: 이른 generic notification prompt.
- Treatment: 저장/follow한 스레드 뒤 contextual ask.
- Primary: D30 permission retention + D7 retained rate.
- Guardrail: denial, revoke, complaint, activation 하락.
- 최소 관찰: D30.
- 성공판정: grant rate가 아니라 retained quality가 개선될 때만 채택.

### 실험 2 — category-specific promise vs generic alerts
- 가설: `weekly recap / 이 시즌 / 이 컬렉션` 단위 opt-in이 `모든 알림`보다 D30 유지·신뢰가 좋다.
- Primary: D30 category opt-in 유지 + message→meaningful action.
- Guardrail: unsubscribe, spam complaint.

### 실험 3 — change + one action vs generic comeback
- 가설: 실제 변화 + continuation 하나가 `보고 싶었어요`보다 return 후 D7을 높인다.
- 대상: 유효한 saved thread가 있는 7~29일 휴면 사용자.
- Guardrail: phishing report, opt-out, finance-like pressure complaint.

### 실험 4 — exact-context destination vs home landing
- 가설: 원래 스레드로 돌아가면 time-to-value가 짧아지고 meaningful action이 늘어난다.
- Guardrail: auth failure, privacy leak, destination error.

### 실험 5 — weekly recap vs scheduled daily reminder
- 가설: 매일 필요한 이벤트가 없는 사용자에게는 고신호 주간 recap 하나가 generic daily reminder보다 D30과 permission 유지가 좋다.
- Guardrail: sessions/user 품질, unsubscribe, notification revoke.

## 18. 보안·악용·개인정보 검토

### High — notification impersonation / phishing / ATO
**영향:** 가짜 Moneyverse 페이지에 credential/account data를 입력할 수 있다.

**악용:** 공격자가 `보상/시즌/계정 업데이트` 메시지를 Moneyverse처럼 꾸며 가짜 로그인 링크를 보낸다.

**최소 보호조건:** canonical domain 일관성, growth message에서 credential 요구 금지, 안전한 first-party destination, security와 promotion 구분, 사용자용 보안 안내 surface.

**별도 개발/QA:** 실제 outbound/deep-link 출시 전 필요.

### High — lock screen/shared device private-state leakage
**영향:** 보유, 부채, 관계, 보안정보 등이 노출될 수 있다.

**악용:** WLD/WDX 포지션, 대출 상태, 비공개 community 내용, recovery 정보가 preview에 들어감.

**최소 조건:** privacy-minimized preview, public-safe allowlist, 민감 class의 generic lock-screen wording, 상세 상태는 인증 뒤 표시.

**별도 개발/QA:** 민감 개인화 push/email 전 필요.

### High — marketing disguised as service/benefit communication
**영향:** spam complaint, 법규·정책 위험, 신뢰 손실.

**악용:** sponsor/subscription offer를 `중요 계정 안내`, `혜택 알림`으로 전송.

**최소 조건:** purpose 분리, 필요한 경우 명시적 marketing 선택, 쉬운 거부/unsubscribe, security/transactional surface 재사용 금지.

**별도 법률/QA:** commercial messaging 전 필요.

### Medium — notification fatigue / coercive retention
**영향:** permission revoke, churn, 강박적 사용.

**최소 조건:** meaningful-change threshold, category/frequency control, digest preference, quiet period, FOMO/streak-loss 압박 금지.

### Medium — bot/multi-account notification reward farming
**영향:** 알림 동작이 가치발행과 연결되면 fake account와 경제 악용 발생.

**최소 조건:** permission/open/click 자체에 spendable WLD/WDX 지급 금지.

### Medium — analytics overcollection
**영향:** attribution이 민감한 경제·사회 프로필을 vendor에 노출할 수 있다.

**최소 조건:** 가능한 aggregate/pseudonymous 측정, session secret/recovery/private balance/debt/casino history/unrestricted message content를 analytics payload에서 제외.

## 19. 한국 / 미국 정책 주의

### 한국
KISA가 2026-03-04 게시한 불법스팸 방지 정보통신망법 안내서 제7차 개정본은 다음을 명시적으로 강조한다.

- 광고 수신 동의를 요구하면서 `혜택 알림`, `정보제공` 등 모호한 표현을 사용하지 말 것;
- 앱푸시 광고 수신거부에 불필요한 로그인 등 복잡한 절차를 요구하지 말 것;
- 쿠폰·마일리지·적립금 같은 혜택이 있다고 해서 요구되는 사전 동의 없이 광고 메시지를 보낼 수 있는 것은 아님.

직접채택: 상업 메시지 목적을 명확히 쓰고, 거부를 쉽게 하며, product continuity와 commercial messaging을 분리한다.

KISA의 2026-05-19 정부 사칭 메일 주의 안내는 신뢰받는 기관 로고와 공문처럼 보이는 링크를 이용해 비밀번호를 탈취하는 실제 피싱 위험을 보여준다. Moneyverse return message도 로그인 링크 모호성과 phishing-like urgency를 줄이는 방향을 직접 채택한다.

각 실제 채널/캠페인에 어떤 법 조항이 적용되는지는 출시 시점 별도 법률 검토가 필요하다.

### 미국
FTC CAN-SPAM baseline은 상업 이메일의 기만적 header/subject를 금지하고 유효한 opt-out 경로를 요구한다. 직접채택: truthful commercial identity와 작동하는 unsubscribe/suppression.

Apple 플랫폼 지침도 notification 전 permission을 요구하고 marketing notification에는 명시적 permission과 Time Sensitive 남용 금지를 요구한다. 이는 플랫폼 정책/UX 근거이며 법률검토를 대체하지 않는다.

## 20. 최신 외부 근거 — 조사일 2026-09-14

### 직접채택
1. **Android Developers — Notification runtime permission, 2026-09-01 갱신**
   - 알림 permission은 사용자가 기능 맥락과 이유를 이해할 수 있는 순간에 요청하도록 권고한다.
   - 권한은 언제든 취소될 수 있으므로 책임 있게 사용해야 한다.
   - 채택: value-earned contextual permission timing.

2. **Discord Mobile Notifications Settings 101 — 2026-07-31 갱신**
   - Discord는 앱 내부 알림결정과 OS 표시설정을 구분하고 세부 통제를 제공한다.
   - 채택: 하나의 global growth switch보다 category/channel user control.

3. **Apple Human Interface Guidelines / User Notifications**
   - 알림은 시기적절하고 높은 가치의 정보여야 하며 marketing notification은 명시적 허용이 필요하고 Focus를 Time Sensitive로 우회해서는 안 된다.
   - 채택: high-value threshold와 interruption 절제.

4. **KISA 불법스팸 안내서 제7차 개정 — 2026-03-04**
   - 채택: 명확한 광고동의 문구, 낮은 마찰의 수신거부.

5. **KISA 정부 사칭 메일 주의 — 2026-05-19**
   - 채택: return messaging의 phishing/brand impersonation guardrail.

### 참고만 함
- Discord의 email category와 server별 notification control은 좋은 패턴이지만 taxonomy를 그대로 복제하지 않는다.
- re-engagement vendor가 제시하는 uplift 수치는 Moneyverse 예측치로 사용하지 않는다.

## 21. Runtime Product Reality Audit — 2026-09-14

Runtime verification: 가능.

공개 Production 관찰:
- homepage는 WLD/보상이 game-only 가상 데이터임을 명확히 고지한다.
- 빠른 shortcut은 여전히 지갑, 미니게임, 거래소, 상점, 퀘스트를 강하게 전면화한다.
- sponsored ad placement가 이미 여러 곳 존재한다.
- 월간 공개 소식은 아직 비어 있다.
- public lobby는 조용/empty하게 보일 수 있다.
- 시작 가이드는 여전히 로그인 → 지갑 잔액 → 퀘스트/직업 → 복리예금/상점과 finance-heavy wealth ladder를 전면화한다.
- 운영 소식은 게시물이 없는 상태인데 sponsored placement는 존재한다.

현재 public runtime에서는 `선택한 스레드를 follow → 가치 설명 뒤 permission opt-in → 실제 변화 한 번 → 정확한 복귀` 소비자 경로가 가시적으로 검증되지 않는다. 따라서 이번 loop는 기획 가설로 기록한다.

이번 자동화는 runtime을 수정하지 않는다.

## 22. 확장 gate

다음을 증명하기 전 outbound growth messaging을 확대하지 않는다.

1. 사용자가 먼저 brand/game-only 약속을 이해한다.
2. permission 요청 전에 durable authored choice가 존재한다.
3. 메시지 클릭이 같은 intent/context로 돌아간다.
4. message-assisted D7/D30이 unsubscribe/complaint/privacy/phishing을 악화시키지 않고 개선된다.
5. commercial messaging이 product continuity와 명확하게 분리된다.

그전에는 generic daily reminder, 첫 화면 push prompt, wealth/profit comeback copy, WLD/WDX click reward, account/security 메시지의 sponsor content, notification-driven ad inventory를 확대하지 않는다.

## 23. 다음 성장 우선순위

하나의 owned-return loop만 끝까지 검증한다.

`사용자가 컬렉션/세계/시즌 스레드 하나를 follow → contextual notification permission → 실제 state change 하나 → 짧은 return message → exact-thread continuation → meaningful action → D7-after-message → D30 permission retention`

이 루프가 natural return보다 나쁘거나 신뢰를 해친다면 해결책은 더 많은 메시지가 아니라 더 강한 제품 복귀 이유다.
