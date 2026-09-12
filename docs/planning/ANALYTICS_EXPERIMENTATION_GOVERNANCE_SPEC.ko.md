# 월덕 머니버스 — 분석 및 실험 거버넌스 명세

> 버전: v2026.09.13.7
> 상태: 구현 지향 Living 제품/데이터 명세
> 기준일: 2026-09-13
> 상위 명세: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`
> 영문 기준 문서: [ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.md](ANALYTICS_EXPERIMENTATION_GOVERNANCE_SPEC.md)

## 0. 목적

Moneyverse에는 이미 활성화, 리텐션, 경제, 성장, 수익, 안전 KPI와 A/B 실험 백로그가 존재한다. 이 문서는 이를 실제 구현 가능한 분석·실험 계약으로 구체화한다.

시스템은 다음 네 가지 질문에 신뢰성 있게 답할 수 있어야 한다.

1. 제품에서 무엇이 발생했는가?
2. 그것을 이해하기 위해 어떤 사용자/익명 세션 정보가 실제로 필요한가?
3. 당시 어떤 제품·실험·설정 버전이 적용 중이었는가?
4. 운영자가 개인정보, 안전, 경제 무결성, 사용자 신뢰를 훼손하지 않고 결과를 활용할 수 있는가?

분석 시스템은 경제 잔액, 주식 보유, 결제 권한, 권한관리, 계정 상태의 별도 원장이 아니다. 권위 데이터는 기존 백엔드/DB 계약을 따른다.

## 1. 핵심 원칙

1. **목적 제한:** 이름이 붙은 제품·신뢰성·부정방지·법규·수익·실험 목적이 없으면 이벤트를 수집하지 않는다.
2. **최소수집:** 가명화된 내부 ID와 거친 속성을 우선한다. 이메일 원문, 비밀번호, OAuth subject, 세션 쿠키, access token, 결제자격증명, 신분증, 자유형 메시지 본문, 무제한 request body를 일반 분석에 넣지 않는다.
3. **동의별 분리:** 제품 분석, 개인화, 광고 측정, 맞춤형 광고는 서로 다른 목적이다. 하나의 동의가 다른 목적까지 자동 허용하지 않는다.
4. **경제 지표는 서버 권위:** WLD 발행·소각·이전·잔액·수수료는 브라우저 클릭 이벤트가 아니라 ledger/read model에서 계산한다.
5. **이벤트 계약 버전화:** 이벤트 이름과 필수 필드 의미를 버전으로 관리하며, 실행 중 의미를 조용히 바꾸지 않는다.
6. **실험 안전 우선:** 전환율이 좋아도 보안·법규·악용·접근성·신뢰성·경제무결성·사용자압박 guardrail이 깨지면 중단한다.
7. **다크패턴 최적화 금지:** 오클릭, 과도한 거래, 징벌적 streak, 숨은 구독, 허위 긴급성을 성과로 최적화하지 않는다.
8. **재현 가능성:** 실험 배정 버전, metric 버전, 시작/종료시각, 모집단, 의사결정 기록을 보존한다.

## 2. 데이터 분류

### 2.1 기본 허용

- 내부 사용자 UUID 또는 가명 분석 subject ID;
- 필요한 경우 동의된 익명 세션 식별자;
- 이벤트 시각;
- locale 및 큰 단위의 platform class;
- allowlist 기반 route/screen ID;
- feature/experiment/config version;
- device class와 viewport bucket;
- `empty`, `loaded`, `error`, `maintenance` 등 제품 상태;
- `season_id`, 가상 `ticker`, `sku_id`, `quest_id` 같은 도메인 ID;
- 경제 분석에 필요한 경우 정수 안전 WLD 구간 또는 권위 집계값.

### 2.2 제한 데이터

다음은 목적, 보유기간, 접근정책이 명시돼야 한다.

- 정확한 IP;
- 정밀 위치;
- device fingerprint 속성;
- 생년월일/연령정보;
- 모더레이션·안전 case ID;
- 결제사업자 customer ID;
- fraud/risk score;
- 상세 referral/network 연계;
- 개인정보를 포함할 수 있는 자유형 검색어.

### 2.3 일반 분석 금지

- 비밀번호와 비밀번호 hash;
- session cookie, CSRF secret, access/refresh token;
- OAuth client secret/provider token;
- 이메일·전화번호 원문;
- 전체 주소;
- 카드번호·CVV/CVC;
- 신분증 이미지;
- 비공개 메시지·댓글 본문;
- 무제한 관리자 메모;
- secret key, DB credential, backup key.

보안시스템이 별도 사고대응 정책 아래 일부 증거를 보관할 수는 있지만 그것이 제품 분석 수집을 정당화하지 않는다.

## 3. 이벤트 계약

### 3.1 공통 envelope

```text
event_id
schema_version
event_name
occurred_at
received_at
subject_type       // anonymous | user | operator | system
subject_id         // 가명/내부 ID
session_id         // 분석용 세션 ID, 인증 secret 아님
source             // web | api | worker | discord | admin
locale
platform_class
route_key
release_sha
config_version
experiment_assignments[]
consent_snapshot_id
properties{}
```

`event_id`는 유일해야 하며 재시도로 중복 집계되지 않아야 한다.

### 3.2 이벤트 이름

도메인+행동 형태를 사용한다.

- `onboarding_started`
- `onboarding_step_completed`
- `job_completed`
- `shop_purchase_completed`
- `watchlist_item_added`
- `market_order_submitted`
- `market_order_filled`
- `trade_journal_reviewed`
- `business_settlement_completed`
- `season_reward_claimed`
- `subscription_checkout_started`
- `subscription_cancelled`
- `community_report_submitted`

도메인 맥락 없는 `click`, `action`, `success`, `engagement` 같은 이름은 금지한다.

### 3.3 클라이언트/서버 이벤트 구분

클라이언트 이벤트는 화면 노출, 필터, 탭, 폼검증, CTA 상호작용처럼 UI 관찰에 사용한다.

다음과 같은 권위 사실은 서버/DB 기반 이벤트를 사용한다.

- 계정 생성 성공;
- 검증된 직업 완료;
- WLD 원장 transaction commit;
- 주식 주문 접수/체결/취소;
- 거래소 판매 정산;
- 결제 entitlement 활성화;
- 시즌 보상 지급;
- 악용 제한 적용.

브라우저가 `purchase_success`를 보냈다는 사실이 실제 구매/원장 commit을 대신할 수 없다.

## 4. 식별자와 동의 상태

### 4.1 식별자 분리

필요한 경우 전용 analytics subject ID를 사용하고 내부 사용자와의 연결은 서버측에서 최소화한다. 외부 분석 사업자에게 인증 secret이나 로그인 식별자 원문을 전달하지 않는다.

익명 활동은 정책상 허용되는 경우 짧은 수명의 가명 ID를 사용할 수 있다. 로그인했다고 해서 과거 익명 이벤트를 자동 결합해서는 안 되며 동의/보유정책을 확인해야 한다.

### 4.2 동의 목적

최소 다음을 분리한다.

- `essential_service`
- `product_analytics`
- `personalization`
- `advertising_measurement`
- `personalized_advertising`

상태:

`UNKNOWN | GRANTED | DENIED | NOT_REQUIRED | RESTRICTED`

이벤트에는 당시 적용된 정책 버전과 consent snapshot을 연결한다.

### 4.3 철회

비필수 목적 동의를 철회하면:

- 필요한 경우 이후 수집을 중단하고;
- 지원되는 외부 destination에 변경된 상태를 전달하고;
- 관할법과 보유정책에 따른 삭제/억제를 수행하며;
- 필수 보안·fraud·billing·법적 증거는 별도 목적과 별도 보유계약으로 관리한다.

## 5. KPI 도메인

### 5.1 활성화

퍼널:

`signup_started -> account_created -> onboarding_started -> onboarding_completed -> first_verified_job -> first_shop_sink -> first_watchlist -> first_safe_market_action`

핵심 지표:

- 회원가입 완료율;
- 온보딩 완료율;
- 첫 검증 직업까지 시간;
- 첫 의미있는 소비처까지 시간;
- watchlist 사용률;
- D1 활성 리텐션.

### 5.2 리텐션

- D1/D3/D7/D30;
- WAU/MAU;
- 사용자당 활동일;
- 여러 시스템 참여율;
- 주간 미션 완료;
- 복귀미션 시작/완료;
- 알림 opt-out;
- 사용자 압박/불쾌감 신고 지표.

### 5.3 경제

권위 ledger/read model로 계산한다.

- 발행량;
- hard sink;
- 순발행;
- hard-sink 비율;
- transfer volume;
- 평균/중앙/P90/P95/P99 잔액;
- 상위 1%/10% 점유율;
- 소비처별 소각비중;
- 상위 소비처 집중도;
- 코호트별 구매일수;
- 고자산 잔액 증가율;
- 보호한도 발동률;
- 한계보상 적용률;
- 악용탐지 오탐률.

유저간 거래량은 `transfer`이며 소각이 아니다. 실제로 제거된 수수료만 hard sink다.

### 5.4 수익

현금수익 지표는 가상경제와 분리한다.

- gross billings;
- refund;
- dispute/chargeback;
- payment fee;
- net revenue;
- ARPU/ARPDAU;
- trial→paid;
- cancellation rate;
- failed-payment recovery;
- LTV;
- CAC/payback;
- 광고 eCPM/fill/CTR;
- 광고 후 이탈률;
- provider/support/infra/content 비용 반영 마진.

### 5.5 SEO

- organic impressions/clicks/CTR;
- indexed valid pages;
- non-brand organic sessions;
- organic signup conversion;
- landing engagement;
- Core Web Vitals pass rate;
- crawl/index error;
- duplicate canonical rate;
- EN/KO organic split.

Search Console/Naver 데이터는 공개 유입 분석이며 문서화된 필요와 privacy review 없이 개인 계정 데이터와 결합하지 않는다.

## 6. 실험 레지스트리

Production A/B 실험은 registry entry 없이 실행하지 않는다.

필수 필드:

```text
experiment_id
name
owner
hypothesis
surface
status
randomization_unit
eligibility_rule
exclusion_rule
control_variant
variants[]
allocation
start_at
planned_end_at
primary_metric_id
secondary_metric_ids[]
guardrail_metric_ids[]
metric_versions[]
minimum_sample_plan
minimum_runtime
stop_conditions[]
consent_requirements
age_region_restrictions
feature_flag_key
config_version
analysis_method
decision_record
```

상태:

`DRAFT -> REVIEWED -> READY -> RUNNING -> PAUSED -> ENDED -> DECIDED -> ARCHIVED`

긴급상태:

`RUNNING -> STOPPED_SAFETY`

## 7. 배정 규칙

### 7.1 안정적 randomization

서버에서 `experiment_id + randomization_unit_id`의 안정적 hash를 사용한다. 매 렌더링마다 `Math.random()`으로 배정하지 않는다.

인증 사용자 실험의 기본 단위는 내부 user다. 익명 session randomization은 가설이 진짜 session 단위이고 정책상 허용될 때만 사용한다.

실험 iteration 동안 배정은 고정한다.

### 7.2 exposure

배정만으로 exposure로 집계하지 않는다. variation이 실제 행동에 영향을 줄 수 있는 화면까지 도달했을 때 노출 이벤트를 기록한다.

필수 정보:

- experiment ID;
- iteration/version;
- variant;
- randomization unit;
- exposure timestamp;
- metric version set;
- feature/config version.

### 7.3 상호배제

같은 화면/결정에 동시에 영향을 주거나 같은 primary metric을 오염시킬 수 있는 실험은 mutual-exclusion layer 또는 명시적 exclusion rule을 사용한다.

## 8. metric 및 판정 원칙

### 8.1 metric 버전

실행 중인 experiment iteration의 metric 정의는 고정한다. query, denominator, attribution window, aggregation이 실질적으로 바뀌면 새 metric version 또는 새 iteration을 만든다.

각 metric은 다음을 문서화한다.

- numerator;
- denominator;
- 모집단;
- attribution window;
- aggregation unit;
- 방향;
- data source;
- late-arrival policy;
- exclusions;
- owner.

### 8.2 primary metric

기본적으로 하나의 primary decision metric을 사용한다. 결과를 본 뒤 secondary metric을 골라 승패 기준을 바꾸지 않는다.

### 8.3 guardrail

필요 시 다음을 기본 guardrail로 둔다.

- API/server error;
- latency/Core Web Vitals;
- accessibility regression;
- support/contact rate;
- report/block rate;
- fraud/abuse rate;
- 순발행 및 sink 왜곡;
- 시장 집중/조작 alert;
- cancellation/refund;
- notification opt-out;
- 사용자 압박 complaint;
- 미성년/제한계정 정책 위반.

중대한 guardrail 위반은 conversion lift와 상관없이 중단 사유다.

### 8.4 표본과 기간

초기 dashboard가 좋아 보인다는 이유만으로 조기 종료하지 않는다. 실험 시작 전 minimum sample과 minimum runtime을 정한다.

fixed-horizon 방식에서 무계획 반복 peeking을 피하고, sequential method를 쓸 경우 해당 방법이 sequential monitoring을 명시적으로 지원해야 한다.

주간/주기성 행동은 안전중단 사유가 없는 한 관련 주기를 충분히 포함한다.

## 9. Holdout

규모가 커지면 여러 실험의 누적효과를 보기 위해 작은 고정 holdout을 사용할 수 있다.

참고 기본값:

- 1–5%;
- 1–3개월;
- 포함 experiment와 동일 randomization unit;
- 보안수정, 법규준수, 명백한 접근성 개선은 holdout 대상으로 쓰지 않는다.

이는 플레이 한도가 아니라 측정 운영값이다.

## 10. 금지/제한 실험

### 10.1 금지

다음을 A/B 테스트하지 않는다.

- 인증/인가 약화;
- 보안통제 생략;
- 개인정보 노출;
- 법정 고지/권리 축소;
- 의도적으로 취소 어렵게 만들기;
- 가격·희소성·확률·가상재화 가치 오인;
- WLD/WDX 현금환전 암시;
- 강박행동 유도 목적의 FOMO/도박성 강화;
- 접근성 기능을 control group에서 제거;
- 아동/제한계정에 금지된 맞춤형 광고 노출.

### 10.2 사전검토 필요

- 계정 복구/인증;
- 연령확인;
- 맞춤형 광고;
- 유료 구독 checkout/cancel;
- 확률형 표현;
- 대출/연체 UX;
- 가상주식 주문/위험고지;
- 추천인 보상;
- 경제 공급에 큰 영향을 주는 faucet/sink.

## 11. 기본 한도 없음 정책과의 관계

실험 infra를 숨은 gameplay cap으로 사용하지 않는다.

허용되는 것은 rollout percentage, experiment eligibility, safety rate limit, traffic allocation, feature rollback이다. 이는 릴리스/측정 제어이며 영구적 사용자 성장제한이 아니다.

측정 편의를 위해 일일 플레이·XP·사업체·클럽·구매·성장 횟수를 임의 제한하지 않는다. 경제 실험은 가격, 소비처 발견성, 보상곡선, 한계보상을 우선 조정한다.

## 12. UI/UX

### 12.1 사용자 화면

variation 간 깜빡임을 피하고 가능한 경우 렌더 전 설정을 결정한다.

모든 variant는 다음을 정의한다.

- desktop/tablet/mobile;
- loading/skeleton;
- empty;
- error/offline/maintenance;
- keyboard navigation;
- visible focus;
- screen-reader label;
- reduced motion;
- 손익/상태를 색상만으로 전달하지 않기.

### 12.2 관리자 실험 콘솔

필수 화면:

1. experiment registry;
2. 상세/가설;
3. allocation/eligibility preview;
4. metric definition/version;
5. live guardrail;
6. exposure/sample quality;
7. result/uncertainty;
8. decision record;
9. audit history.

입력 중 자동 새로고침으로 값이 날아가면 안 된다. live metric은 비파괴 patch 또는 사용자 새로고침을 사용한다.

고위험 실험 시작, allocation 확대, 긴급중단에는 사유와 audit log를 남긴다.

## 13. 데이터 품질

의사결정용 이벤트/metric이 되기 전에 다음을 검증한다.

- schema accept/reject rate;
- duplicate `event_id`;
- client/server timestamp skew;
- subject missing rate;
- unknown event/property;
- exposure→conversion 순서;
- assignment balance;
- sample-ratio mismatch;
- release/config version consistency;
- late arrival;
- bot/Test/admin 제외;
- Test/Production 분리.

QA/관리자 이벤트는 실제 제품 metric을 오염시키지 않도록 식별/제외한다.

## 14. 저장과 보유기간

논리 계층을 분리한다.

1. **raw intake** — 가능한 짧게, 강한 접근통제;
2. **validated event store** — allowlist/정규화 필드;
3. **derived metrics** — 집계 지표;
4. **experiment snapshots** — 변경불가 의사결정 증거;
5. **security/fraud evidence** — 보안정책 별도 관리.

보유기간은 목적별로 버전화한다. “언젠가 쓸 수 있으니 전부 영구보관”은 금지한다.

삭제/익명화 workflow는 derived analytics까지 고려한다. 이미 비가역적으로 집계된 값은 개별 삭제가 불필요하거나 불가능할 수 있으며 그 근거를 문서화한다.

## 15. 외부 사업자 거버넌스

외부 analytics/experimentation destination마다 다음 register를 유지한다.

- provider;
- purpose;
- data categories;
- region/transfer;
- processor/controller 관계;
- retention;
- deletion 절차;
- consent integration;
- SDK/script source;
- owner;
- security review date;
- legal review status.

편리한 dashboard만을 이유로 추적 SDK를 추가하지 않는다. 기존 first-party event/read model로 해결 가능한지 먼저 본다.

광고 destination은 관련 동의·고지·법적 근거가 확인되지 않으면 제품 분석과 분리한다.

## 16. 릴리스/롤백

분석 코드도 일반 런타임 변경 절차를 따른다.

`개발 브랜치 -> 격리 Test exact-SHA -> schema/event 검증 -> backend/DB/API/UI/consent 검증 -> Production`

실험 rollout:

`DRAFT -> peer review -> Test exposure 검증 -> READY -> 낮은 비율 -> guardrail 관찰 -> 계획 비율 -> ENDED -> decision -> cleanup`

가능하면 일반 UI와 독립된 kill switch를 둔다.

## 17. 초기 이벤트 카탈로그

P0 범위:

### 계정/온보딩
- `signup_started`
- `account_created`
- `email_verification_completed`
- `onboarding_started`
- `onboarding_step_completed`
- `onboarding_completed`

### 직업/퀘스트
- `job_started`
- `job_completed`
- `quest_progressed`
- `quest_completed`
- `quest_reward_claimed`

### 시장 학습
- `watchlist_item_added`
- `market_tutorial_completed`
- `market_order_submitted`
- `market_order_filled`
- `trade_journal_created`
- `trade_journal_reviewed`
- `risk_lesson_completed`

### 경제/소비처
- 권위 ledger transaction category와 연결된 analytics fact;
- `shop_purchase_completed`;
- `craft_completed`;
- `marketplace_listing_created`;
- `marketplace_sale_settled`;
- `business_expansion_completed`;
- `city_project_contribution_completed`.

### 시즌/소셜
- `season_profile_created`;
- `season_mission_completed`;
- `season_reward_claimed`;
- `club_joined`;
- `community_report_submitted`.

### 결제
- `pricing_viewed`;
- `checkout_started`;
- `subscription_activated`;
- `subscription_cancelled`;
- `refund_completed`.

## 18. 초기 실험 백로그와 guardrail

### EXP-ONB-001 — 온보딩 길이

가설: 5단계보다 3단계 필수+2단계 추천 구조가 완료율을 높이되 D1 의미행동은 떨어뜨리지 않는다.

- Primary: onboarding completion.
- Secondary: first verified job time, D1 activated retention.
- Guardrail: support error, tutorial confusion exit, starter grant duplication, accessibility gap.

### EXP-HOME-001 — 추천행동 수

가설: 세 가지 동일 CTA보다 하나의 강조된 다음 행동이 결정 피로를 줄인다.

- Primary: 30초 안에 meaningful action 시작.
- Secondary: 5분 loop 완료.
- Guardrail: multi-system exploration, 추천 dismiss 반복, error rate.

### EXP-RET-001 — 복귀미션 표현

가설: 손실회피/FOMO 대신 진행요약 중심 문구가 복귀 완료를 높인다.

- Primary: 7일 내 comeback mission completion.
- Guardrail: notification opt-out, user-pressure report, returning user당 순발행.

### EXP-MKT-001 — 위험학습 위치

가설: 첫 주문화면 옆의 분산/위험 문맥이 거래횟수를 늘리지 않고 journal/risk lesson 완료를 높인다.

- Primary: risk lesson completion.
- Secondary: journal review, diversified behavior.
- Guardrail: orders/user, loss-chasing proxy, support/report.

`더 많은 거래횟수` 자체를 단독 성공지표로 사용하지 않는다.

## 19. 조사 기록 — 2026-09-13

### Google Tag Platform / Consent Mode

**출처 유형:** 공식 개발자 문서, 2026-04-17 갱신.

**핵심 시사점:** 동의 상태에 맞춰 측정 동작을 조정해야 하며 분석/광고 storage를 하나의 권한으로 취급하면 안 된다.

**적용:** consent snapshot과 destination gating에 직접 채택. Google Analytics 단독 사업자 결정은 아님.

### LaunchDarkly Metrics / Experimentation

**출처 유형:** 최신 공식 제품/개발자 문서, 2026-09-13 확인.

**핵심 시사점:** 실행 중 experiment에 연결된 metric 정의는 안정적으로 유지되어야 하고 명시적인 metric 계약이 필요하다.

**적용:** metric version 및 registry 구조에 직접 채택. 사업자 선정은 아님.

### LaunchDarkly Holdouts

**출처 유형:** 최신 공식 제품 문서.

**핵심 시사점:** 1–5% 안정 holdout을 약 1–3개월 유지해 전체 실험 프로그램 누적효과를 볼 수 있다.

**적용:** 향후 규모확대용 참고 기본값. 출시 필수값 아님.

### 개인정보보호위원회 2026 집행 사례

**출처 유형:** 정부 집행/정책 자료.

**핵심 시사점:** 맞춤형 광고 및 행태정보에서 투명성, 실질적 선택권, 광고 파트너 관리가 계속 집행 이슈다.

**적용:** product analytics, advertising measurement, personalized advertising 목적 분리와 vendor register에 직접 반영.

## 20. 수익·법규·SEO 영향

### 수익

구독·꾸미기·광고의 attribution 품질을 높이되 현금매출을 WLD faucet/sink와 섞지 않는다. 측정 품질은 수익 결정을 개선할 수 있지만 게임경제·랭킹 우위를 판매하는 실험은 금지한다.

### 법규/개인정보

실제 analytics 사업자, 국외이전, 보유기간, 아동·청소년 트래픽, 광고 목적이 확정되면 관할별 검토가 필요하다. 해당 항목은 `legal review required`로 유지한다.

### SEO

공개유입은 Search Console/Naver/landing analytics로 집계할 수 있지만 로그인 계정·잔액·billing·private portfolio 정보를 SEO attribution 때문에 공개하거나 색인해서는 안 된다. Test는 `noindex`이며 Production과 분석 데이터를 분리한다.

## 21. 완료 조건

P0 완료 조건:

- 이벤트 taxonomy/schema registry;
- 영문/한국어 동기화;
- consent snapshot/destination gate;
- 금지필드 intake 차단/redaction;
- 권위 경제 이벤트의 server/DB source;
- event dedup/idempotency 검증;
- Test/Production analytics 분리;
- experiment registry와 안정 배정;
- exposure 검증;
- iteration별 metric version 고정;
- SRM/data-quality check;
- kill switch와 audit decision;
- retention/deletion 정책;
- 보안·개인정보·접근성·금융게임화 안전·기본무제한 정책을 약화시키지 않음;
- 런타임은 격리 Test exact-SHA 검증 후 Production.

## 22. 현재 런타임 상태

이번 기획 회차에서 `easy-scraping.com` 외부 런타임 검증을 완료할 수 없었다.

현재 상태:

`runtime verification unavailable`

이 문서만으로 구현 완료를 추정하지 않는다. 코드/런타임에서 증명되지 않은 항목은 `planned / not implemented`로 취급한다.
