# Moneyverse App Core / Site Core / Economy Core 보안 설계

> 버전: v2026.10.01.497
> 상태: DRAFT / 작성된 설계 사용자 검토 게이트
> 브랜치: `docs/api-security-economy-core-v2026.10.01.497`
> 상위 설계: v2026.10.01.496 통합 거시경제 시스템
> 상위 국고방향: v2026.10.01.495 단일국고 및 세금 재순환
> 기준 설계 커밋: `96620ea610e0a39841965010307797993f1566a2`
> 최신 확인 `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`
> 조사 검토: `docs/findings/MONEYVERSE_APP_SITE_ECONOMY_CORE_SECURITY_RESEARCH_REVIEW_v2026.10.01.497.ko.md`
> 범위: 아키텍처/기획 전용. 런타임·DB·Test·Production 완료를 주장하지 않는다.

## 1. 목표와 채택 결정

Moneyverse는 네 개의 명시적 계층을 채택한다.

1. **App Core** — Android/native BFF 및 모바일 신뢰경계.
2. **Site Core** — browser/web BFF 및 웹 신뢰경계.
3. **Economy Core** — 단일 권위 경제도메인 및 금융변경 경계.
4. **Economy Intelligence Layer** — 등록된 한도 안에서 관측·시뮬레이션·제안하는 classical model, econometrics, ABM, LLM, RL, council.

App Core와 Site Core는 분리된 client-facing core지만 **별도의 돈·세금·은행·시장규칙을 소유하지 않는다.**

권위 경제는 하나이고 최종 금융 ledger/DB 권위도 하나다.

보안목표는 기능분리보다 강하다.

> App Core, Site Core 또는 AI model 하나가 완전히 탈취되어도 그것만으로 무제한 ledger·통화정책·국고·관리자·DB owner 권한을 얻지 못해야 한다.

## 2. 아키텍처 결정

### 2.1 권고 topology

```text
 Android App                         Browser / Web
     |                                   |
     v                                   v
 /app-api/v2                         /site-api/v1
     |                                   |
  APP CORE                            SITE CORE
     \                                   /
      \                                 /
       +------ typed internal API ------+
                     |
                     v
               ECONOMY CORE
      +--------------------------------+
      | Ledger / Settlement            |
      | Wallet / Banking / Credit      |
      | Tax / Treasury / Fiscal        |
      | Jobs / Labour                  |
      | Firms / Production             |
      | Stocks / Markets / Property    |
      | Macro Accounting               |
      | Policy Registry                |
      | Scenario Lab                   |
      | Deterministic Validator        |
      | Policy Executor                |
      | Reconciliation                 |
      +--------------------------------+
                     |
                     v
            PostgreSQL authority

 ECONOMY INTELLIGENCE
 classical / econometrics / ABM / LLM / RL
                     |
                proposals only
                     |
                     v
               ECONOMY CORE
```

### 2.2 물리 마이크로서비스보다 논리 권위경계를 먼저

v497은 **논리적 권위경계 우선**을 요구한다. Economy Core는 초기에는 현재 private backend 안의 강하게 격리된 module + DB role/function 경계로 남을 수 있다.

scale, 독립배포, blast-radius 근거가 생긴 뒤 물리 서비스분리를 허용한다.

이렇게 해야 가치가 증명되기 전에 network credential, certificate, service discovery, 장애지점을 불필요하게 늘리지 않는다.

### 2.3 BFF 규칙

App Core와 Site Core가 소유할 수 있는 것:

- client-specific auth orchestration;
- response aggregation;
- request/response adaptation;
- API-version compatibility;
- client-specific rate/resource policy;
- channel-specific caching;
- mobile integrity evidence 또는 browser CSRF context.

각 BFF가 독립적으로 최종권위를 가져서는 안 되는 것:

- WLD 잔액산식;
- 세금 계산권위;
- 은행 신용창조;
- 국고 정산;
- 주식/부동산 정산;
- 직업보상 재원;
- 기업수입 생성;
- 통화발행/회수;
- AI 정책집행.

## 3. 신뢰구역과 탈취 격리

| 구역 | Public reachable | member session context 보유 | 경제변경 실행 | 보호경제 테이블 write | policy apply | AI model 보유 |
|---|---:|---:|---:|---:|---:|---:|
| Android client | yes | client cookie/session material | no | no | no | no |
| Browser | yes | HttpOnly cookie 간접 | no | no | no | no |
| App Core | gateway 통해 yes | yes | Economy Core를 통해서만 | no | no | no |
| Site Core | gateway 통해 yes | yes | Economy Core를 통해서만 | no | no | no |
| Economy Core | direct public route 없음 | 검증된 actor context | yes | reviewed DB function/role로만 | registry 한도 내 yes | no |
| Economy Intelligence | direct public route 없음 | raw member session 없음 | no | no | direct apply 없음 | yes |
| Policy Executor | internal only | automation/admin authority context | policy 제한 | direct table write 없음 | yes | no |
| PostgreSQL | internal only | 필요한 server-authoritative session/actor data | 최종권위 | owner/function에 한해 yes | 최종 invariant gate | no |

각 component는 자기 책임범위에 대해서만 신뢰한다. 네트워크 위치 자체는 권한이 아니다.

## 4. Public endpoint topology

### 4.1 App 계약

신규 canonical native contract:

`/app-api/v2/**`

기존 `/app-api/v1/**`은 migration 동안 compatibility surface로 유지한다.

App Core는 native payload shape, minimum app version, capability negotiation, mobile OAuth handoff, Play Integrity, native sync, app-specific performance shaping을 소유한다.

### 4.2 Site 계약

신규 browser/server-rendered contract:

`/site-api/v1/**`

웹 페이지, browser JavaScript, server action은 native `/app-api/v1` compatibility contract 의존을 종료한다.

Site Core는 browser session orchestration, CSRF, SSR/server-action composition, web realtime aggregation, 관리자 웹 presentation을 소유한다.

### 4.3 Private internal 계약

Economy Core는 public URL namespace로 노출하지 않는다.

`/economy-core/**` 같은 edge prefix를 인터넷에서 forward하지 않는다.

internal call은 private interface + workload identity를 사용한다. 초기 in-process면 typed module interface + DB privilege boundary가 경계이고, 추후 물리분리 시 동일 contract가 authenticated internal service API가 된다.

### 4.4 client에 direct backend 주소 금지

Android/browser bundle에 다음을 넣지 않는다.

- private backend host/port;
- Economy Core 주소;
- DB 주소;
- service credential;
- internal API signing key.

## 5. Identity model

v497은 **user identity**와 **service identity**를 분리한다.

고가치 Economy Core command는 항상 다음을 모두 요구한다.

1. 인증된 caller service identity;
2. 검증된 end-user/admin/automation actor context;
3. 정확한 command/object에 대한 authorization;
4. command integrity와 idempotency evidence.

service credential 하나만으로 어떤 member가 행동하는지 증명할 수 없다.

caller가 보낸 `X-User-Id` 같은 actor field만으로 identity를 인정하지 않는다.

### 5.1 Actor context

권위 auth/session 계층은 Economy Core용 단기 actor context에 필요한 claim만 담는다.

- `actor_id`;
- `session_id_hash` 또는 opaque session reference;
- `actor_type` = member/admin/automation;
- 현재 role/permission claim;
- `auth_time`;
- 필요한 경우 `step_up_at`;
- `issued_at`;
- `expires_at`;
- audience = Economy Core;
- unique assertion id.

BFF가 actor id만 가지고 privileged actor context를 임의 mint할 수 없다.

### 5.2 Workload identity

내부 caller는 각각 별도 identity를 가진다.

- `app-core`;
- `site-core`;
- `policy-executor`;
- `scheduler`;
- reconciliation worker;
- 명시적으로 등록된 기타 worker.

Production/Test identity와 key는 상호교환되지 않는다.

## 6. App Core 보안계약

App Core는 유일한 public native-app BFF다.

요구사항:

- configured HTTPS host는 deployment config로 고정하고 user input으로 결정하지 않는다;
- authenticated API call은 redirect를 자동추적하지 않는다;
- APK에 server secret을 넣지 않는다;
- persistent secure cookie 처리는 canonical native contract를 따른다;
- cookie session model이 요구하는 state-changing request는 CSRF를 가진다;
- deep link와 OAuth handoff destination은 exact allowlist다;
- one-time handoff code는 log에 남기지 않는다;
- 경제 request schema는 exact decimal/integer string을 쓴다;
- 모든 value-changing request는 idempotency key를 가진다;
- high-value write에는 Play Integrity request binding을 요구할 수 있다;
- dynamic/universal transport가 generated method/path/scope inventory를 우회하지 못한다.

### 6.1 Universal transport 제한

Android universal `@Url` transport는 compatibility plumbing이며 권위가 아니다.

경제/admin write는 장기적으로 다음을 가진 generated client route manifest에 resolve되어야 한다.

- method;
- path template;
- auth requirement;
- command family;
- minimum app version;
- request schema version;
- integrity requirement;
- idempotency requirement.

허용 host와 같더라도 manifest에 없는 route는 generic economic write helper에서 사용하지 못한다.

## 7. Site Core 보안계약

Site Core는 web/browser BFF다.

요구사항:

- same-origin HttpOnly session;
- 승인된 auth flow와 호환되는 Secure/SameSite cookie;
- state-changing browser action의 CSRF;
- strict Host/public-origin 처리;
- browser에 internal service credential 미노출;
- CSP 및 browser security header 중앙관리;
- Next server action/route handler가 Economy Core business rule을 복제하지 않음;
- web realtime subscription마다 auth+room/topic authorization;
- admin route는 별도 server-side role/step-up 검사;
- browser UI state를 authorization으로 신뢰하지 않음.

웹 코드는 native `/app-api/v1/**` 호출을 `/site-api/v1/**` 또는 server-side Site Core interface로 이동한다.

## 8. Economy Core interface

Economy Core는 arbitrary SQL/table access가 아니라 typed domain command와 read model을 노출한다.

초기 command family:

- wallet transfer;
- bank movement;
- loan origination/repayment;
- job/work settlement;
- business purchase/investment/settlement;
- tax posting/reversal;
- treasury commitment/disbursement;
- marketplace settlement;
- stock order/settlement/corporate action;
- property/land settlement;
- public debt/bond operations;
- monetary-policy operation;
- registered policy-value application.

각 command는 reviewed DB function 또는 transaction contract에 mapping한다.

App/Site Core는 DB ownership이 아니라 domain result/receipt를 받는다.

## 9. Economy command envelope

모든 economic write는 실행 전에 immutable command envelope로 정규화한다.

필수 field:

```text
command_id
command_type
contract_version
channel                 APP | SITE | ADMIN | AUTOMATION
caller_service
actor_context_id
business_event_id
idempotency_key
request_hash
policy_version
expected_entity_version   where applicable
created_at
expires_at
payload
risk_evidence
```

### 9.1 Request hash

`request_hash`는 amount/quantity, target entity, operation type, client idempotency identity 등 경제효과를 결정하는 canonical serialized field를 포함한다.

BFF normalization 이후 다시 계산한다.

Play Integrity가 적용된 모바일 작업은 관련 request digest를 integrity request에도 bind하고, 서버는 verified integrity 값과 canonical Economy Core command digest를 비교한다.

### 9.2 Replay 처리

replay 방어는 여러 층이다.

- business idempotency key;
- command id unique constraint;
- actor/session validity;
- 짧은 command expiry;
- high-risk command의 workload-token `jti`;
- expected policy/entity version;
- 기존 DB advisory-lock/idempotency pattern.

정상적인 동일 idempotent request 재시도는 경제가치를 두 번 적용하지 않고 기존 logical result를 반환한다.

## 10. Database role과 SQL 경계

### 10.1 기존 강한 패턴 유지

ledger는 append-only이고 `economy_post_transaction`은 canonical WLD mover로 유지한다.

보호테이블은 일반 runtime identity의 direct mutation을 계속 거부한다.

`SECURITY DEFINER` function은:

- trusted explicit `search_path` 설정;
- untrusted writable schema 제외;
- default `PUBLIC EXECUTE` revoke;
- 필요한 runtime role에만 `EXECUTE` grant;
- 필요 시 actor/service/policy context 검증;
- client-controlled dynamic SQL identifier 금지.

### 10.2 목표 role 분리

장기목표는 하나의 `moneyverse_app` role을 계속 확장하는 대신 책임을 나눈다.

- auth/session runtime role;
- Economy Core execution role;
- Economy read-model role;
- reconciler role;
- migration owner;
- 필요한 special integration worker.

App Core와 Site Core에는 protected economy table direct-write 권한을 주지 않는다.

AI/model process에는 보호경제 DB credential을 주지 않는다.

### 10.3 BFF DB 권위 금지

현재 architecture상 필요한 범위에서 BFF는 scoped auth/session infrastructure를 사용할 수 있지만, 경제상태 read/write는 broad BFF grant 추가가 아니라 Economy Core read/command function 뒤로 이동한다.

## 11. Read model과 data classification

Economy Core는 least-privilege read model을 제공한다.

분류:

- **PUBLIC:** 가격/public aggregate statistic/catalog;
- **MEMBER:** caller 소유 wallet, loan, portfolio, work/business state;
- **SENSITIVE FINANCIAL:** 상세 history, credit/risk data, private counterparty 정보;
- **ADMIN/REGULATORY:** abuse, reconciliation, treasury control, model/policy evidence;
- **SECRET:** credential, raw token, key — economy read model이 아님.

App/Site response adapter는 채널별 최소 field만 전달한다.

Macro/AI snapshot은 개인 identity가 필요 없으면 de-identified/aggregated data를 사용한다.

## 12. API inventory와 versioning

generated API inventory는 public routing의 보안권위다.

endpoint entry는 다음을 가진다.

- method/path;
- App/Site ownership;
- authentication;
- authorization scope;
- object-authorization rule;
- request/response schema;
- size/rate/resource limit;
- idempotency;
- 필요한 경우 Play Integrity;
- 필요한 경우 CSRF;
- mutation인 경우 Economy Core command mapping;
- version/deprecation status.

OWASP API inventory drift는 보안결함으로 본다.

compatibility adapter가 미등록 privileged route를 만들 수 없다.

### 12.1 Version 전환

- `/app-api/v1`: compatibility, usage 측정, explicit retirement.
- `/app-api/v2`: canonical App Core.
- `/site-api/v1`: canonical Site Core.
- private Nest/Economy interface: public compatibility surface가 아님.

지원중 native version이 이행하고 usage evidence가 retirement rule을 만족하기 전에는 old API를 삭제하지 않는다.

## 13. Authentication 및 session 보안

### 13.1 Web

Web은 same-origin cookie session을 유지한다.

session authority는 deployment/restart를 넘어 durable해야 한다. CSRF, expiry/revocation, recent reauth, privileged role check는 server-authoritative다.

### 13.2 Native

Native는 추후 승인된 auth redesign이 대체하기 전까지 public BFF + persistent cookie/session contract를 유지한다.

OAuth/browser handoff는 single-use다. 미래 public-client OAuth 변경은 exact redirect와 필요한 PKCE 등 현행 security BCP를 따른다.

### 13.3 Session에서 Economy Core까지

Economy Core는 BFF가 보낸 member id 하나만 신뢰하지 않는다.

actor context는 현재 유효한 server-authoritative session/automation identity에서 파생하고 짧은 유효기간을 가진다.

revocation/account disable은 이후 command authorization을 무효화한다.

## 14. Mobile app integrity

Play Integrity는 가치가 높거나 abuse 위험이 있는 작업에 선택적으로 적용한다.

예시:

- large wallet transfer;
- high-value purchase;
- 설정 threshold 이상 loan origination;
- 민감 market order;
- risk engine이 표시한 reward/work pattern;
- 필요한 account-security mutation.

verdict는 보호작업 시점에 가깝게 평가한다.

검증항목:

- request details/request hash;
- 예상 package/application identity;
- acceptable app-recognition state;
- server-side actor/session authorization;
- command freshness.

integrity failure를 영구 계정판단으로 바로 사용하지 않는다. allow, additional verification, delay/review, concrete high-risk deny의 tiered abuse policy에 넣는다.

## 15. Service-to-service 보안

현재 shared static `INTERNAL_API_TOKEN`은 multi-core 구조에서 교체할 legacy boundary다.

### 15.1 목표 service credential

workload credential은:

- short-lived;
- audience-bound;
- environment-bound;
- scoped;
- uniquely identifiable;
- rotatable/revocable;
- public client에서는 수용되지 않음.

signed workload token 최소 claim:

`iss, sub, aud, scope, iat, exp, jti, kid`.

privileged internal call의 초기 target lifetime은 **5분 이하**다.

### 15.2 Proof of possession

App/Site/Economy가 별도 network service가 되면 최고가치 internal path는 일반 TLS에 더해 mTLS 또는 승인된 proof-of-possession mechanism을 우선해 stolen bearer token 단독으로 충분하지 않게 한다.

### 15.3 Header hygiene

public request에서 internal identity/authorization header와 유사한 것은 edge/BFF에서 제거한다.

trusted server만 internal caller/actor metadata를 구성한다.

## 16. Authorization model

authorization은 세 단계로 평가한다.

1. **service authorization** — 이 workload가 해당 Economy Core command family를 호출할 수 있는가?
2. **actor authorization** — 이 member/admin/automation actor가 operation을 할 수 있는가?
3. **object/business authorization** — 이 actor가 현재상태의 정확한 account, loan, business, order, budget, policy object에 행동할 수 있는가?

어느 하나도 다른 검사를 대체하지 않는다.

App/Site route에서 BOLA/BFLA negative test를 하고, 고가치 operation은 Economy Core/function boundary에서 다시 검증한다.

## 17. 관리자와 정책승인 보안

Admin UI 접근 자체는 policy authority가 아니다.

고영향 policy action은 다음을 요구한다.

- 현재 privileged role;
- recent step-up authentication;
- 정확한 proposal/config hash;
- reason;
- expected current policy version;
- immutable audit;
- rollback target.

초기 security default:

- P0 금융정책 step-up freshness: **10분**;
- approval artifact lifetime: **15분**;
- approval은 정확한 parameter set에 bind하며 값이 바뀌면 재사용하지 못함;
- AI automatic bound 확대는 절대 AI-automatic operation이 아님.

통화발행/회수, emergency treasury exception, AI guardrail 확대, Production policy-mode 변경은 가능한 가장 강한 approval policy를 쓴다. 실제 second approver가 있으면 four-eyes를 우선하지만 second approver가 없다는 이유로 AI 자동집행을 허용하지 않는다.

## 18. Economy Intelligence 보안경계

Economy Intelligence는 immutable/versioned Economy Snapshot을 받고 typed proposal, forecast, explanation, anomaly evidence를 반환한다.

다음을 받지 않는다.

- Economy Core policy-executor credential;
- DB owner/migrator credential;
- `economy_post_transaction` execute authority;
- administrator session cookie;
- unrestricted internal network access.

model output은 항상 untrusted data다.

### 18.1 Prompt/context 격리

user/community/news/web content가 model context에 들어오면 untrusted content로 표시한다.

retrieved content는 다음을 재정의할 수 없다.

- tool permission;
- policy bound;
- actor identity;
- Economy Core instruction;
- approval state.

model이 생성한 SQL을 direct execution하지 않는다.

### 18.2 Tool/egress allowlist

AI tool은 기본 read-only다.

허용가능 class:

- macro snapshot query;
- scenario simulation;
- controlled outbound gateway를 통한 research retrieval;
- proposal storage.

direct money movement, policy apply, admin role change, secret retrieval, arbitrary URL fetch는 model tool set에 넣지 않는다.

outbound retrieval은 scheme/domain policy, private-address rejection, redirect revalidation, byte/time limit, internal auth header 제거를 강제한다.

prompt content가 신규 network destination을 승인할 수 없다.

### 18.3 Model/provider 탈취 가정

어떤 model/provider도 hallucination, prompt injection, unavailable이 될 수 있다고 가정한다.

따라서 model compromise가 direct economic mutation을 주면 안 된다.

policy family에 따라 safe fallback은 deterministic/classical operation, automatic policy freeze, human review다.

## 19. Economy Policy Registry

모든 tunable parameter는 server-side canonical registry entry 하나를 가진다.

필수 field:

```text
policy_key
domain
unit
current_value
human_baseline
hard_min
hard_max
auto_min
auto_max
max_auto_step
max_auto_drift_7d
max_auto_drift_30d
cooldown
risk_tier
ownership_mode
required_evidence
required_approval
policy_version
updated_at
```

client는 min/max/step을 자체생성하지 않는다.

AI는 자기 registry entry, bound, cooldown, risk tier를 변경할 수 없다.

### 19.1 Ownership mode

- `OBSERVE_ONLY`
- `PROPOSE_ONLY`
- `BOUNDED_AUTO`
- `MANUAL_OVERRIDE`
- `FROZEN`

model 위험신호는 `BOUNDED_AUTO`를 review/frozen으로 낮출 수 있다.

model 제안이 proposal-only를 automatic으로 올릴 수는 없다.

## 20. 초기 AI 수치 guardrail

다음 값은 **v497 초기 기획 default**다. 범용 경제 최적값이 아니라 보수적인 seed이며 Production 적용은 simulation, historical replay, exact-SHA Test를 추가로 요구한다.

| Policy family | 1회 최대 automatic/proposed step | human baseline 대비 7일 최대 drift | 30일 최대 drift | 집행 mode |
|---|---:|---:|---:|---|
| UI/discoverability/optional sink rotation weight | ±5% | ±10% | ±20% | BOUNDED_AUTO |
| optional cosmetic/prestige price multiplier | ±1% | ±3% | ±5% | BOUNDED_AUTO |
| non-essential service-fee multiplier | ±0.5% | ±1.5% | ±3% | BOUNDED_AUTO |
| firm logistics/maintenance/input-cost multiplier | ±0.5% | ±1.5% | ±3% | BOUNDED_AUTO |
| job reward multiplier | ±0.5% | ±1.5% | ±3% | shadow qualification 후 BOUNDED_AUTO |
| job availability/cap | ±1 slot 또는 ±5% 중 작은 값 | ±10% | ±15% | BOUNDED_AUTO |
| shop restock quantity | ±2% | ±5% | ±10% | BOUNDED_AUTO |
| external/NPC demand multiplier | ±0.5% | ±2% | ±5% | BOUNDED_AUTO + net-injection budget |
| new-loan/new-deposit spread | ±5 bp | ±15 bp | ±25 bp | 신규계약만 BOUNDED_AUTO |
| discretionary treasury envelope weight | ±1 percentage point | ±2 pp | ±3 pp | 총예산 불변 BOUNDED_AUTO |
| TRR target-center 관측 parameter | ±2 pp | ±3 pp | ±5 pp | 강제지출이 아닌 BOUNDED_AUTO |
| tax rate | ±10 bp proposal | n/a | ±25 bp proposal budget | HUMAN APPROVAL |
| central policy/reference rate | ±25 bp proposal | n/a | 별도 policy review | HUMAN APPROVAL |
| macro credit/capital buffer | ±25 bp proposal | n/a | 별도 risk review | HUMAN APPROVAL |
| protected treasury reserve ratio | n/a | n/a | ±1 pp | HUMAN APPROVAL |
| explicit base-WLD issuance/retirement | 1회 measured private M1의 <=0.10% | n/a | private M1의 <=0.25% | STRONG HUMAN APPROVAL |
| AI-sourced stock-event impact proposal | <=±2% bounded event effect | event aggregation limit 적용 | n/a | HUMAN/CORE APPROVAL |
| direct absolute stock-price write | 0 | 0 | 0 | PROHIBITED |
| direct member balance write | 0 | 0 | 0 | PROHIBITED |
| historical ledger mutation | 0 | 0 | 0 | PROHIBITED |
| issued contract에 반하는 existing fixed contract 조건변경 | 0 | 0 | 0 | PROHIBITED |
| AI 자기 limit/risk tier 확대 | 0 | 0 | 0 | PROHIBITED |
| 신규 leverage/derivatives authority 활성화 | 0 automatic | 0 automatic | 0 automatic | SEPARATE HIGH-RISK APPROVAL |

1 basis point(bp)는 0.01 percentage point다.

### 20.1 추가 제외

automatic treasury envelope 이동에서 다음은 제외한다.

- protected reserve;
- 이미 발생한 refund/recovery liability;
- constitutional tax conservation;
- emergency incident obligation;
- committed contractual payout.

automatic loan/deposit spread 변경은 신규계약에만 적용하며 기존 fixed term을 다시 쓰지 않는다.

automatic NPC demand는 explicit net-injection budget 안에서만 허용해 unlimited hidden faucet이 되지 않게 한다.

## 21. Guardrail 산식, cooldown, baseline

실제 적용 delta:

```text
effective_delta =
min_by_magnitude(
  requested_delta,
  remaining_per_step_limit,
  remaining_7d_drift_budget,
  remaining_30d_drift_budget,
  hard_range_remaining,
  risk_budget_remaining
)
```

cumulative drift는 전날 auto value가 아니라 **마지막 human-approved baseline**에서 계산한다. 작은 변경을 반복해 사람 의도에서 계속 멀어지는 것을 막는다.

초기 routine automatic cooldown:

- policy family당 **24시간**에 1회 이하 apply;
- observation은 hourly 가능;
- change 후 약 **6h**, **24h**, **7d** checkpoint.

automatic apply 조건:

- fresh required metric;
- ledger/economy reconciliation PASS;
- 해당 domain의 active integrity/security incident 없음;
- sample sufficiency;
- acceptable uncertainty/calibration;
- policy/config version 일치;
- cooldown 완료;
- rollback target 존재;
- concurrent policy apply 없음.

필수조건 하나라도 실패하면 proposal-only 또는 frozen이며 “best guess apply”하지 않는다.

## 22. Market/Stock AI

현재의 model-generated scenario -> auto publish -> 실제 market event를 일반 권위경로로 쓰는 방향은 supersede한다.

신규경로:

```text
model scenario
 -> MarketEventProposal
 -> registered-stock validation
 -> manipulation/integrity tests
 -> deterministic effect clamp
 -> approval/eligibility gate
 -> signed MarketEventCommand
 -> deterministic stock engine
```

model은 absolute price를 쓰지 않는다.

model text가 authoritative registry에 없는 symbol을 임의선택할 수 없다.

AI-sourced event는 source/model/proposal id, snapshot id, approved max effect, expiry, approval evidence를 가진다.

## 23. Jobs/Work AI

Work auto-tuning을 Economy Policy Registry로 흡수한다.

경로:

```text
labour telemetry
 -> Economy Snapshot
 -> labour analyzer/model
 -> PolicyProposal
 -> Scenario Lab
 -> deterministic guardrail
 -> registered Work Policy Command
```

work module은 별도 hidden economy policy를 유지하지 않는다.

job reward tuning은 재원과 거시 issuance classification이 v496과 맞기 전 비활성이다.

## 24. Treasury/Fiscal AI

AI가 forecast할 수 있는 것:

- tax receipt;
- obligation;
- output/employment gap;
- programme demand;
- reserve stress;
- distribution effect.

AI 자동변경은 total approved budget, protected reserve, existing obligation을 바꾸지 않는 범위에서 **discretionary envelope weight**의 등록된 작은 폭만 허용한다.

AI가 할 수 없는 것:

- tax burn;
- new tax 생성;
- tax rate 자동변경;
- available treasury 초과지출;
- commitment approval 우회;
- treasury deficit 보전을 위한 mint.

## 25. Banking/Credit AI

AI는 default risk, credit demand, stress scenario를 추정할 수 있다.

초기 bounded automation은 등록범위 안의 작은 **신규계약 spread** 이동으로 제한한다.

human approval 필요:

- credit-eligibility model 변경;
- macro capital/credit buffer 변경;
- collateral-rule 변경;
- systemic resolution support;
- emergency liquidity term.

기존 fixed contract는 routine AI가 repricing하지 않는다.

## 26. Abuse/Bot/Sybil 격리

자동화/관련계정이 가짜 노동·수요·기업매출·신용도·시장활동을 만들면 경제현실성이 무너진다.

Economy Core는 abuse-risk evidence를 사용하되 정상 ledger history를 지우지 않는다.

통제:

- account/device/network 관계 graph signal;
- related-account transfer/circular flow 탐지;
- wash trade/self-dealing 탐지;
- job/reward automation pattern;
- synthetic business revenue pattern;
- loan farming/rapid-default pattern;
- referral/welfare multi-account farming;
- stock/market manipulation;
- inventory/crafting duplication pattern.

enforcement는 tiered하고 설명가능해야 한다.

- 의심흐름을 clean macro index에서 제외;
- additional verification;
- high-value mutation 지연/review;
- 악용된 flow 제한;
- concrete integrity risk가 있을 때만 freeze.

device integrity나 anomaly score 하나만으로 유죄판단하지 않는다.

## 27. Network/Egress/SSRF 경계

App Core, Site Core, Economy Core, AI는 서로 다른 outbound-network policy를 가진다.

### 27.1 App/Site Core

outbound call은 등록된 internal dependency와 명시적으로 승인된 external identity/integrity provider로 제한한다.

### 27.2 Economy Core

Economy Core는 가능한 가장 좁은 egress를 가진다. 경제정산에는 arbitrary internet access가 필요하지 않다.

### 27.3 Economy Intelligence

research/model tool은 dedicated controlled egress path를 사용한다.

URL-fetch capability는:

- 승인 scheme 허용;
- localhost/link-local/private/metadata range를 명시적 필요 없이는 차단;
- redirect 후 destination 재해석/재검증;
- response byte/time/redirect count 제한;
- internal credential 제거;
- 민감 URL data 없이 policy decision log.

prompt content가 신규 network destination을 승인할 수 없다.

## 28. Secret/Key 관리와 환경분리

secret은 repository, screenshot, model prompt, client bundle에 넣지 않는다.

분리 요구:

- Production != Test service credential;
- App Core != Site Core workload identity;
- policy executor != AI/model identity;
- DB migrator != runtime role;
- admin/session encryption key != workload-signing key.

key/token은 다음을 지원한다.

- rotation;
- continuity 필요 시 overlap;
- revocation;
- `kid`/version 식별;
- secret value 없는 rotation audit.

static secret 하나가 모든 internal service를 열면 안 된다.

## 29. Audit와 Observability

모든 Economy Core command는 privacy-safe trace를 만든다.

- public request id;
- caller service;
- actor/automation identity;
- command id;
- business event;
- idempotency key hash;
- policy version;
- 해당 시 approval/proposal id;
- ledger transaction/receipt;
- result/error class.

AI policy evidence는 추가로 기록한다.

- model/provider/version;
- prompt/template version;
- snapshot id;
- input-data window;
- validation/calibration evidence;
- proposed/current/applied value;
- deterministic clamp result;
- 필요 시 human approval;
- rollback evaluation.

raw cookie, password, API key, Play Integrity token, model-provider secret은 audit payload에 넣지 않는다.

## 30. Availability와 Resource Exhaustion 보안

App/Site Core 분리는 채널별 rate limit과 failure containment를 가능하게 하지만 critical write는 둘 다 Economy Core에 의존한다.

통제:

- per-IP, per-account, 가능한 경우 per-device, per-service, per-command-family quota;
- body/response size limit;
- expensive-query cap;
- idempotency를 보존하는 bounded retry;
- noninteractive work의 queue/backpressure;
- model/provider circuit breaker;
- AI budget/concurrency limit;
- AI가 없어도 Economy Core deterministic 기능은 동작.

AI outage가 일반 wallet, tax, settlement, banking을 막으면 안 된다.

Economy Core overload 시 fallback writer로 invariant를 우회하지 말고 신규 high-value mutation을 fail-closed한다.

## 31. 무중단 migration 경로

이는 추후 구현방향이며 이번 설계커밋에서 실행하지 않는다.

### Phase 1 — contract inventory와 shadow boundary

- 현재 web/app endpoint inventory 생성;
- 각 route를 App, Site, shared-read, internal로 분류;
- Economy Core command/read contract 정의;
- legacy route가 어떤 command에 mapping되는지 observability 추가.

user-visible route는 삭제하지 않는다.

### Phase 2 — Site Core namespace 생성

- `/site-api/v1` 도입;
- browser/server-action을 `/app-api/v1`에서 이동;
- native `/app-api/v1`은 유지;
- auth/session/CSRF parity 입증.

### Phase 3 — App Core v2 도입

- `/app-api/v2` publish;
- v1 compatibility 유지;
- generated route manifest/capability negotiation 추가;
- request-integrity policy metadata 추가.

### Phase 4 — Economy Core command boundary

- value-changing App/Site call을 typed Economy Core adapter 하나로 통일;
- 기존 SQL function/ledger authority 유지;
- switch 전 legacy/new 계산결과 shadow compare.

### Phase 5 — workload identity 분리

- shared internal bearer boundary를 점진교체;
- App/Site/executor identity 분리;
- audience/scope/expiry/revocation 검증;
- 물리분리 시 필요에 따라 mTLS/proof-of-possession 추가.

### Phase 6 — AI/automation 통합

- economy auto-policy, work tuning, stock scenario path를 proposal/registered command로 전환;
- shadow parity 후 independent direct apply path 제거;
- 초기 low-risk bounded-auto family만 활성화.

### Phase 7 — compatibility retirement

- web의 legacy App API 사용을 먼저 종료;
- App API v1은 supported native client와 usage evidence가 허용할 때만 retirement;
- 모든 caller 이행 후 legacy internal token contract.

모든 phase는 expand -> observe/shadow -> switch -> reconcile -> contract + rollback이다.

## 32. Security test matrix

### App Core

- wrong host/redirect refusal;
- malformed/deprecated app version;
- missing/invalid session;
- CSRF failure;
- replayed economic request;
- mismatched Play Integrity `requestHash`;
- unregistered dynamic route;
- BOLA/BFLA;
- oversized request;
- rate-limit exhaustion;
- deep-link/OAuth handoff replay.

### Site Core

- CSRF;
- Host/origin confusion;
- session continuity;
- cross-user BOLA;
- admin BFLA;
- stale step-up;
- browser service token 미노출;
- App-only route가 Site 권한을 획득하지 못함;
- WebSocket room authorization.

### Economy Core

- forged actor context;
- wrong service audience/scope;
- expired/revoked service credential;
- replayed `jti`/command/idempotency;
- direct protected-table mutation denied;
- concurrent double-spend;
- policy version conflict;
- insufficient funds/available treasury;
- ledger imbalance rejection;
- negative/overflow/rounding input;
- reconciliation failure 시 fail-closed.

### Economy Intelligence

- direct prompt injection;
- community/web content indirect prompt injection;
- model out-of-range value;
- model 자기 bound 확대 시도;
- forbidden tool 요청;
- compromised provider malformed output;
- model outage/timeout;
- poisoned/stale snapshot;
- policy-executor credential 부재;
- AI direct stock publish 불가.

### Policy executor

- approval 후 proposal hash 변경;
- stale approval;
- wrong baseline;
- cumulative drift 초과;
- cooldown 위반;
- active security incident;
- low sample/high uncertainty;
- rollback trigger;
- concurrent apply conflict.

## 33. Release gate

이 설계의 runtime 구현은 다음을 모두 통과하기 전 Production에 올리지 않는다.

1. 최신 권위문서/사용자지시 재확인;
2. exact candidate SHA 기록;
3. App/Site/API inventory diff 생성;
4. threat model/abuse case 갱신;
5. service identity/audience/scope negative test;
6. DB grant/function/`search_path` review;
7. 모든 money command real-DB idempotency/concurrency test;
8. 적용작업의 App mobile-integrity positive/negative test;
9. Site session/CSRF/step-up continuity;
10. AI prompt-injection/excessive-agency test로 direct mutation 불가 입증;
11. policy-registry bound/cooldown/drift test;
12. exact-SHA isolated Test에서 backend/API/DB 행동 입증;
13. 기존 로그인 session restart/cutover 보존;
14. rollback target 검증;
15. zero-downtime promotion;
16. post-promotion auth/API/ledger/admin/AI telemetry에 신규 P0/P1 signal 없음.

문서완료는 이 runtime gate 통과를 의미하지 않는다.

## 34. P0 수용기준

미래 아키텍처는 다음이 모두 true일 때만 수용한다.

1. App Core와 Site Core가 distinct public contract를 가진다.
2. Web canonical behavior가 App compatibility route에 의존하지 않는다.
3. Economy Core가 경제변경의 유일 domain authority다.
4. public client가 Economy Core에 direct route하지 못한다.
5. App/Site 탈취로 DB owner/migrator 또는 policy-executor 권한을 얻지 못한다.
6. workload와 actor identity를 독립검증한다.
7. protected financial command가 caller-authored actor id만 신뢰하지 않는다.
8. 모든 money write가 balanced, append-only, idempotent, ledger-backed다.
9. App/Site에 protected-table direct-write grant가 없다.
10. AI/model runtime에 ledger/policy-executor credential이 없다.
11. AI가 자기 limit을 변경할 수 없다.
12. automatic numeric change가 per-step/7d/30d/hard bound를 넘지 않는다.
13. high-impact tax/rate/credit/issuance 변경은 human approval이 필요하다.
14. existing contract가 조용히 repricing되지 않는다.
15. 세금은 explicit reversal 제외 100% Treasury inflow다.
16. 필요한 mobile integrity는 economic request에 bind되고 server-side 검증된다.
17. API method/path/scope inventory가 generated/release-gated다.
18. legacy compatibility에 usage measurement/retirement 기준이 있다.
19. real-DB concurrency/replay/security test가 통과한다.
20. exact release SHA의 zero-downtime Test/Production evidence가 있다.

## 35. 기존 권위 처리

v497이 유지/강화:

- v496 통합 거시경제 ledger/sector 설계;
- v495 단일국고 및 tax burn 금지;
- 기존 append-only Economy Core ledger;
- actor-checking `SECURITY DEFINER`;
- same-origin web session/CSRF;
- native App BFF;
- AI scenario/shadow 분석.

v497이 향후 방향으로 supersede:

- web canonical의 native `/app-api/v1` 의존;
- shared static internal bearer token을 multi-core 최종 service identity로 사용하는 설계;
- independent economy/work/stock automation policy authority;
- AI auto stock-scenario publication의 일반 경제권위경로;
- client-invented economy control bound;
- method/path/scope inventory 없는 generic dynamic economic write routing.

applied migration과 historical release 문서는 immutable evidence로 유지한다.

## 36. 근거와 수치정책 해석

149,691-record discovery corpus는 후보근거를 넓히고 관련 문헌군을 찾는 용도다.

AI numeric bound는 다음을 종합한 보수적 seed다.

- safe/constrained-control 원칙;
- 작은 trust-region형 policy movement;
- 기존 Moneyverse guardrail history;
- operational reversibility;
- 현실 정책변경 granularity를 contextual evidence로 사용;
- Moneyverse는 국가경제 복제품이 아니라 game economy라는 조건.

수치는 초기 simulation/security seed이며 replay/simulation/Test 근거가 있는 versioned human policy update로만 바뀐다.

## 37. 다음 게이트

이 문서는 사용자가 승인한 아키텍처 방향에서 작성한 v497 정식 설계다.

canonical 기획통합 또는 runtime 구현 전에:

1. 사용자가 이 written specification을 검토/승인;
2. 승인 spec 기반 implementation/integration plan 작성;
3. 사용자가 plan 검토 및 execution method 선택;
4. 그 다음에만 canonical authority 문서와 추후 runtime code 수정.

아키텍처 방향에 대한 대화상 승인이 written-spec review와 implementation-plan gate를 건너뛰지는 않는다.
