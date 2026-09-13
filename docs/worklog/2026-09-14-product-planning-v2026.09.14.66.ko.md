# 2026-09-14 — 제품 기획 작업기록 v2026.09.14.66

## 시작 상태

저장소: `wtrdd1-hash/Woldeok-Moneyverse-Migration`

시작 `main`: `1d5ad140d93bb3142b6684c7f5901e9e67377059`

작업 전 확인:
- `docs/planning/PROJECT_PLAN.md`
- `docs/planning/PRODUCT_GROWTH_PLAN.md`
- `docs/planning/NOTIFICATION_REACTIVATION_GOVERNANCE_SPEC.md`
- `docs/planning/BRAND_PROMISE_TO_FIRST_VALUE_ALIGNMENT_GROWTH_SPEC.md`
- 저장소 검색으로 확인한 최근 collection/SEO/monetization growth 문서
- 현재 production homepage, 시작 가이드, 운영 소식 surface.

문서 작성 전 `main`을 다시 확인했고 `1d5ad140d93bb3142b6684c7f5901e9e67377059`로 동일했다. 해당 시점에 조정해야 할 동시 변경은 없었다.

## 선택한 공백

기존 구현기획에는 notification taxonomy, permission/consent 저장, quiet hours, frequency, dedupe, deep link, provider delivery, 법적 gate가 이미 상세히 있다. 이를 더 확장하는 것은 현재 소비자 성장 중심 우선순위와 맞지 않는다.

따라서 소비자 성장 공백을 다음으로 정의했다.

**사용자가 언제, 왜 Moneyverse의 interruption을 허용하는가? 어떤 메시지만 그 permission을 받을 가치가 있는가? 그리고 메시지가 클릭 후 정확한 복귀 이유를 D7/D30까지 보존하는가?**

선택한 canonical loop:

`첫 가치 → 사용자가 고른 미래 스레드 → 맥락형 복귀 permission → 실제 의미 변화 → 최소 메시지 → exact-context return → 의미 행동 → D7/D30 연속성`

## 기획 결정

`PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC`에 다음을 정의했다.

- optional notification permission은 first paint가 아니라 value 뒤에 얻는다.
- permission은 collection, season, fictional company/world, profession/project, requested recap 같은 user-chosen thread에 연결한다.
- 의미 있는 변화가 없다면 D1 outbound message는 필요하지 않다.
- 일반 daily reminder보다 사용자가 요청한 D7 weekly recap을 우선 후보로 본다.
- growth message는 recognize → explain → bound → continue 구조를 따른다.
- click/open은 activation이 아니며 exact-context return과 meaningful action이 downstream 목표다.
- outbound interruption보다 on-surface/in-app continuity를 우선한다.
- marketing/sponsored communication은 product continuity와 분리한다.
- permission/open/click 자체에 의미 있는 WLD/WDX를 지급하지 않는다.
- lock-screen private-state exposure와 phishing/impersonation을 High 위험으로 취급한다.

## Funnel / cohort 변경

추가한 lifecycle funnel:

`meaningful choice → permission-quality moment → category opt-in → useful state change → message → context-preserved return → meaningful action → D7/D30`

신규/수정 KPI:
- permission 설명 → category opt-in;
- 해당 시 OS grant;
- D7/D30 permission 유지;
- mute/unsubscribe/revocation;
- message → meaningful return;
- context-preserved return;
- message 이후 D7/D30;
- natural return vs message-assisted return;
- lifecycle-message cohort별 retained-user contribution;
- spam/privacy/phishing/ATO/fake-account guardrail.

## 실험 backlog

1. value-earned contextual permission timing vs generic early prompt.
2. category-specific opt-in vs generic all-notifications ask.
3. meaningful change + one action vs generic comeback message.
4. exact-context destination vs generic home landing.
5. weekly recap vs scheduled generic daily reminder.

모든 실험은 downstream retention과 opt-out/complaint/privacy/security guardrail을 함께 본다. CTR/open만으로 성공 판정하지 않는다.

## 최신 외부 조사 — 2026-09-14

직접채택/참고:
- Android Developers, Notification runtime permission, 2026-09-01 갱신: 기능 맥락에서 permission을 요청하고 가치를 투명하게 설명.
- Discord Mobile Notifications Settings 101, 2026-07-31 갱신: 앱 내부 결정과 OS 표시를 분리하고 세밀한 사용자 통제 제공.
- Apple Human Interface Guidelines / User Notifications: 시기적절한 고가치 정보, marketing 명시 permission, Time Sensitive priority의 marketing 남용 금지.
- KISA 불법스팸 방지 정보통신망법 안내서 제7차 개정, 2026-03-04: `혜택 알림/정보제공` 같은 모호한 광고동의 표현 금지, 앱푸시 광고 수신거부에 불필요한 로그인/복잡한 절차 금지, 혜택 제공만으로 사전동의 요건이 사라지지 않음.
- KISA 정부 사칭 메일 주의, 2026-05-19: 공식처럼 보이는 branding/link로 password 탈취 가능.
- FTC CAN-SPAM baseline: 상업 이메일의 기만 없는 발신/제목과 작동하는 opt-out.

외부 vendor의 re-engagement uplift 수치는 Moneyverse 예측치로 사용하지 않았다.

## Runtime Product Reality Audit

Runtime verification: 2026-09-14 가능.

관찰:
- homepage는 WLD/보상의 game-only 고지가 강하다.
- wallet, minigames, exchange, shop, quests가 빠른 shortcut으로 강하게 보인다.
- sponsored advertisement placement가 여러 곳 존재한다.
- 월간소식은 비어 있다.
- lobby는 조용하게 보일 수 있다.
- guide는 finance/wealth 중심이다.
- announcements는 게시물이 없는 상태인데 sponsored placement가 있다.

현재 public runtime에는 `chosen thread follow → useful return opt-in → exact-context return` 소비자 루프가 가시적으로 없다.

runtime code/copy는 수정하지 않았다.

## 보안·악용·개인정보

High:
- Moneyverse notification 사칭 / phishing / ATO;
- lock screen/shared device private-state leakage;
- commercial messaging을 required/service communication으로 위장.

Medium:
- notification fatigue/coercive retention;
- multi-account notification reward farming;
- analytics overcollection.

최소 조건에는 canonical-domain 일관성, privacy-minimized preview, public-safe field, commercial purpose/consent 분리, 쉬운 opt-out, permission/open/click에 의미 있는 WLD/WDX 지급 금지, attribution payload에 session/recovery/private economy data 금지를 포함한다.

실제 outbound messaging, 민감 개인화 push/email, commercial campaign, deep link는 구현 시 별도의 development/security/privacy/fraud/legal QA가 필요하다.

## 법규 메모

한국: KISA 2026-03-04 불법스팸 안내서 개정을 현행 소비자 메시징 guardrail로 사용한다. 각 채널/캠페인별 정확한 적용은 법률검토 필요.

미국: CAN-SPAM을 commercial email baseline으로 유지한다. Apple/Android 기준은 platform guidance/policy이며 법률검토를 대체하지 않는다.

## 이 버전의 파일

- `docs/planning/PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.md`
- `docs/planning/PERMISSION_TO_RETURN_LIFECYCLE_GROWTH_SPEC.ko.md`
- `docs/changelog/2026-09-14-permission-to-return-v2026.09.14.66.md`
- `docs/changelog/2026-09-14-permission-to-return-v2026.09.14.66.ko.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.66.md`
- `docs/worklog/2026-09-14-product-planning-v2026.09.14.66.ko.md`

## 검증 / 배포 상태

- 영문 canonical + 한국어 대응본 parity 유지.
- 문서 자체에는 runtime test 불필요.
- 런타임, DB, API, 인증, scheduler, 인프라, 보안코드 변경 없음.
- 문서-only 변경이므로 Test/Production 배포를 유발하지 않는다.
- Runtime verification은 별도로 가능했고 위에 기록했다.
- 최종 `main` SHA는 atomic tree/commit/ref update 후 기록한다.
