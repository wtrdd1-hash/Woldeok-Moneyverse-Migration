# 월덕 머니버스 — AI 경제 컨트롤러 명세

> 버전: v2026.09.17.184
> 상태: Living 구현 지향 기획 명세
> 날짜: 2026-09-17
> 상위 명세: `PROJECT_PLAN.md`, `ECONOMY_SIMULATION_TUNING_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `ECONOMY_SINK_CATALOG.md`, `SEASON_SYSTEM_SPEC.md`
> 영문 기준본: [AI_ECONOMY_CONTROLLER_SPEC.md](AI_ECONOMY_CONTROLLER_SPEC.md)

## 0. 목적

이 문서는 Moneyverse 가상경제를 자동으로 관측하고 조정할 수 있는 **범위 제한형·감사 가능·되돌릴 수 있는 AI 경제 컨트롤러**를 정의한다. 목표는 임의의 플레이 횟수 제한에 의존하지 않고 WLD 발행, hard sink, 구매력, 자산집중, 소비처 다양성, 사용자 경험을 건강한 운영 범위 안에 유지하는 것이다.

컨트롤러는 다음 폐루프 구조를 따른다.

`텔레메트리 -> 데이터 품질 게이트 -> 이상/상태 탐지 -> 시즌·이벤트 기준선 -> 후보 생성 -> Scenario Lab 예측 -> 결정론적 가드레일 검증 -> 승인/모드 게이트 -> 버전형 배포 -> 관찰 -> 유지/롤백`

AI는 상태 진단, 원인 설명, 정책 후보 생성을 담당할 수 있지만 **최종 집행 권한을 갖지 않는다**. 결정론적 정책 제약, 권한검사, 버전검사, 감사규칙, 롤백 조건이 최종 권한을 가진다.

## 1. 절대 안전 경계

컨트롤러는 다음을 하면 안 된다.

- 유저 WLD 잔액을 직접 지급·회수·몰수·재작성
- 유저 인벤토리, 주식, 아이템, 대출 등 계정별 경제상태 직접 변경
- append-only 원장 기록 삭제·재작성·소급 수정
- 사람 승인 없이 신규 화폐, SKU, 소비처 또는 유료 경제우위 생성
- 개별 유저에게 필수 가격을 차별 적용하거나 벌칙성 경제조건 부과
- 운영자도 모르게 모더레이션·악용제재·인증·보안정책 변경
- 광고비·결제·후원 여부를 시장/랭크상 이익과 연결
- 법률·컴플라이언스·보안·시장무결성 통제를 우회

컨트롤러가 변경할 수 있는 것은 **정책 레지스트리에 명시적으로 허용된 버전형 경제 config**뿐이며, 모든 변경은 min/max/step/cooldown 등의 결정론적 범위 안에 있어야 한다.

## 2. 운영 모드

### `OBSERVE_ONLY`
경제 데이터를 읽고 feature를 만들며 이상과 상태를 탐지한다. 추천도 쓰기도 하지 않는다.

### `RECOMMEND`
진단, 정책 후보, 30/90/180일 예측을 만든다. 모든 변경은 사람 승인이 필요하다.

### `SHADOW`
실제 변경한다고 가정해 전체 의사결정 루프를 실행하지만 운영 정책은 쓰지 않는다. 예측과 실제 관측값을 비교해 오탐과 예측오차를 측정한다.

### `BOUNDED_AUTO`
정책·데이터품질·시뮬레이션·불확실성·배포 게이트를 모두 통과한 저위험 allowlist config만 자동 적용한다. 범위를 벗어나면 자동으로 `RECOMMEND`로 강등한다.

### `EMERGENCY_FREEZE`
경제 자동조정을 즉시 중지한다. 읽기/진단은 유지하되, 별도 권한 있는 롤백이 없으면 현재 운영 정책은 그대로 둔다.

초기 설계에는 무제한 완전자율 모드가 없다.

## 3. 제어 아키텍처

### 3.1 텔레메트리와 feature 파이프라인

최소 입력은 다음과 같다.

- WLD faucet, hard sink, transfer, converter 흐름
- 유통/M2 성격 WLD 공급량
- 1시간/24시간/7일/30일 흐름
- 평균/중앙/P90/P95/P99 유동잔액
- 상위 1%/10% WLD 점유율
- 소비처군별 소각 및 상위 3개 소비처 집중도
- 코호트별 소비일수와 소비처 폭
- 신규유저 D7/D30 구매가능성 및 유동잔액
- 고자산 유저 잔액증가율
- 사업 마진 및 유지비 부담
- 거래소·주식·서비스 수수료 소각
- 시즌·이벤트 발행/소각
- 한계보상 감소 적용률
- 보호한도 발동률 및 오탐률
- 리텐션·세션·문의 가드레일
- 이미 확인된 악용/익스플로잇 라벨
- 시즌·이벤트·캠페인·점검 일정 라벨

매 controller run에는 의사결정에 사용한 정확한 feature snapshot, policy version, config hash, model version, 관찰구간을 저장한다.

### 3.2 데이터 품질 및 reconciliation 게이트

아래 조건을 모두 만족하지 않으면 자동 정책 변경을 허용하지 않는다.

- 필수 지표가 최신 상태
- 원장/경제 reconciliation 통과
- 시즌/이벤트 라벨 사용 가능
- 최소 관측/표본 기준 통과
- 실행 중 정책 레지스트리 버전이 바뀌지 않음
- 해결되지 않은 중대 경제무결성 사고가 없음

실패하면 fail-closed 한다. 즉 쓰기를 멈추고 진단만 유지한다.

### 3.3 이상탐지기

하나의 불투명한 점수 대신 여러 탐지기를 사용한다.

- 1h/24h 흐름 급등·급락 탐지
- 요일/시즌 기준선 대비 이탈
- 지속적 구조변화를 찾는 change-point 탐지
- 신규/중간/고자산/명예자산 코호트별 이상치 탐지
- 악용 트래픽 때문에 일반유저 가격을 올리지 않도록 악용군 분리/태깅

확정 또는 강하게 의심되는 익스플로잇은 보안/시장무결성 incident 경로로 보낸다. 일반유저 가격을 올리는 방식으로 상쇄하지 않는다.

### 3.4 경제 상태 추정기

단일 health score만 만들지 않고 최소 다음 상태를 구조화한다.

- `net_issuance_state`
- `hard_sink_ratio_state`
- `purchasing_power_state`
- `new_user_affordability_state`
- `wealth_concentration_state`
- `high_wealth_acceleration_state`
- `sink_diversity_state`
- `sink_concentration_state`
- `retention_guardrail_state`
- `integrity_state`
- `data_confidence_state`

GREEN/AMBER/RED 요약은 가능하지만 세부 상태와 근거를 항상 확인할 수 있어야 한다.

### 3.5 정책 후보 생성기

AI는 소수의 우선순위 후보를 만들 수 있다.

- 문제 진단
- 인과근거와 대안 설명
- 영향 코호트
- 변경할 policy key
- 현재값/제안값
- 예상효과
- 하방위험
- confidence/uncertainty
- 필요한 관찰기간
- 롤백 조건

AI가 존재하지 않는 config key를 임의 생성해 운영에 적용할 수는 없다. 정책 레지스트리에 있는 키만 선택한다.

### 3.6 Scenario Lab / digital twin 게이트

모든 후보는 최소 다음 시나리오로 검토한다.

- baseline
- growth
- sink expansion
- reward pressure
- high-wealth acceleration
- low-engagement contraction
- abuse shock

표준 기간은 30/90/180일이다. M2와 최근 24시간 흐름만 사용한 단순예측은 반드시 `simple_projection`으로 표시하고 행동예측처럼 취급하면 안 된다.

### 3.7 결정론적 정책 검증기

후보를 실제로 진행시킬지 결정하는 최종 권한은 validator에 있다. 최소 확인사항은 다음과 같다.

- allowlist 및 policy class
- min/max value
- 회당 최대 변경폭
- 마지막 사람 승인 baseline 대비 최대 drift
- cooldown
- 최소 관측수
- 필수 time window
- 허용 운영모드
- 사람 승인 필요 여부
- 구매가능성 가드레일
- P2W/경쟁무결성 분류
- 시즌 전환 lock
- 롤백 준비상태
- policy/config hash 버전충돌

AI 출력이 validator 실패를 우회할 수 없다.

## 4. 다중 시간창·시즌 인식 의사결정

한 시간 또는 하루 변화 하나만 보고 평상시 경제를 자동 재조정하면 안 된다.

- **1시간:** 급격한 이상/익스플로잇 탐지. 일반적으로 진단용
- **24시간:** 운영방향과 라이브옵스 영향
- **7일:** 요일/주기 효과를 고려한 추세확인
- **30일:** 충분한 데이터가 있을 때 시즌·이벤트 및 구조적 기준선

일상 자동조정은 설정된 복수 시간창의 합의, 최소 표본수, 허용 가능한 불확실성을 만족해야 한다. 이벤트, 시즌 시작/종료, 프로모션, 점검, 마이그레이션 구간에는 라벨을 붙여 예상 가능한 일시적 변화를 구조적 인플레이션/디플레이션으로 오판하지 않게 한다.

## 5. 목표 벡터

하나의 불투명 점수가 아니라 다목적 벡터로 본다.

1. 순발행량 및 변화율
2. hard-sink ratio
3. 중앙값 구매력
4. 신규유저 구매가능성
5. P95/P99 잔액증가율
6. 상위 1%/10% 점유율 및 변화율
7. 소비처 폭과 집중도
8. 실제 구매일수
9. 리텐션/세션 가드레일
10. 문의·불만 비율
11. 보호한도 발동률
12. 악용탐지 오탐률
13. 모델 uncertainty/calibration

어떤 목표도 잔액 직접몰수나 일반 플레이의 임의 하드캡을 정당화할 수 없다.

## 6. 초기 자동조정 허용 범위

`BOUNDED_AUTO` 초기 저위험 allowlist 후보:

- 선택형 소비처 노출/rotation weight
- 선택형 명예·꾸미기·주거·사업·도시·박물관·HQ 가격 multiplier
- 필수가 아닌 제작·복구·물류·유지·서비스 수수료 multiplier
- 반복 저가치 파밍의 한계보상 감소계수
- 승인된 소비처 노출/배치 일정

충분한 shadow 실적이 쌓인 뒤에는 매우 좁은 범위의 이벤트 faucet/reward multiplier를 검토할 수 있지만 초기 자동쓰기 allowlist에는 포함하지 않는다.

AI는 런타임에서 새 소비처 콘텐츠를 만들어낼 수 없다. 현재 소비처가 부족하면 운영자에게 신규 소비처를 제안할 수만 있다.

## 7. 반드시 사람 승인이 필요한 항목

- 초기 지급 WLD 및 튜토리얼 경제
- 신규유저 필수 진행 가격
- 대출/신용 금리·노출·자격정책
- 시즌 보상풀·랭크 지급·변환율
- WDX 가격형성과 시장보호 메커니즘
- 화폐/자원 변환율
- 유료 결제와 연결된 경제설정
- 화폐 생성/삭제
- 신규 소비처/SKU 정의
- 현재 `BOUNDED_AUTO` 범위를 벗어나는 변경
- 컨트롤러 일시정지 이외의 대규모 긴급 경제개입

## 8. 소비처 우선 조정 순서

인플레이션/자산집중 압력이 감지되면 다음 순서를 지킨다.

1. 기존 자발적 소비처 노출·채택 개선
2. 선택형 고가 명예·수집·공간·도시 가격곡선 조정
3. 활동량에 대응하는 사업·물류·제작·유지비 조정
4. 공개 범위 안의 제한적 시장/등록/서비스 수수료 조정
5. 반복 저가치 파밍의 한계보상 감소 강화
6. 더 넓은 이벤트/보상 faucet 조정을 사람에게 제안
7. 실제 보안·시스템·시장무결성 이유가 있을 때만 보호한도 사용

일괄 몰수성 세금, 숨은 상한, 임의 일일 행동캡은 기본 균형수단으로 금지한다.

## 9. 초기 `BOUNDED_AUTO` 가드레일

아래는 `wdmv-test`와 과거데이터 검증 후 조정 가능한 초기 기획 기본값이다. 운영자 변경폭 제한이지 유저 플레이 제한이 아니다.

- controller 관찰주기: 매시간
- 일반 자동적용 빈도: policy family별 24시간에 최대 1회
- 저위험 자동변경폭: 현재값 대비 일반적으로 ±2% 이내
- 자동 누적 drift: 마지막 사람 승인 baseline 대비 7일간 일반적으로 ±5% 이내
- 운영값은 항상 policy registry min/max 안에 있어야 함
- 표본 부족 또는 불확실성 높음 => 추천만 수행
- 변경 후 관찰: 약 6시간, 24시간, 그리고 7일 회고
- 전체 공유가격은 테스트/Shadow 검증을 우선하고, 유저별 불투명한 가격차별을 canary로 사용하지 않음
- 필수 가격차별이나 공유시장 왜곡이 없는 기능이면 약 5~10% 제한배포부터 검토 가능

위 비율과 시간은 모두 설정 가능한 초기값이며 절대규칙이 아니다.

## 10. 자동정지 및 fail-closed 조건

다음 중 설정상 critical 조건이 하나라도 참이면 자동조정을 즉시 정지한다.

- 필수 지표 stale/missing
- 원장/경제 reconciliation 실패
- 모델/feature pipeline 장애
- uncertainty가 정책 임계값 초과
- 진행 중인 exploit/security/economy-integrity incident
- 설정된 시즌 settlement/closing/transition lock
- 정책 레지스트리 버전 충돌
- 중복/동시 apply 충돌
- 권한 있는 운영자의 emergency freeze
- 최근 변경 후 rollback health trigger

회계 데이터가 없거나 서로 모순되면 추측해서 변경하면 안 된다.

## 11. 버전형 배포 및 롤백

적용된 모든 정책변경은 immutable policy version과 config hash를 만든다. 롤백은 이전 config 버전을 복구하는 것이며 **원장 과거기록을 고치거나 정상 유저거래를 과거기록 수정으로 되돌리는 것이 아니다**.

필수 속성:

- apply/rollback 멱등성
- 변경 전 optimistic version/concurrency check
- 변경 전/후 config snapshot
- actor/controller/model identity
- 사유와 근거
- 배포환경 및 비율
- 평가기간
- rollback threshold
- 감사기록

구매가능성, 리텐션, 무결성, reconciliation 등 critical guardrail이 깨지면 circuit breaker가 추가 쓰기를 정지하고 마지막 안전 policy version으로 복귀할 수 있어야 한다.

## 12. 정책 레지스트리

최소 필드:

```text
policy_key
policy_class
current_value
min_value
max_value
max_step_bps
max_drift_bps_window
cooldown_minutes
min_observation_count
required_windows
allowed_modes
requires_human_approval
rollback_thresholds
owner
reason_code
effective_from
version
config_hash
```

일반 유저 행동횟수 제한에 실제 보호사유가 없으면 `null/unlimited`가 기본이다. 구현 편의 때문에 AI가 게임플레이 캡을 만들어서는 안 된다.

## 13. 후보/제안 레코드

최소 필드:

```text
proposal_id
controller_run_id
baseline_snapshot_id
issue_class
affected_cohorts
current_values
proposed_values
predicted_30d
predicted_90d
predicted_180d
confidence
uncertainty
anomaly_state
guardrail_results
rationale
model_name
model_version
evidence_hashes
approval_state
rollout_environment
rollout_percentage
rollback_policy
created_at
```

중요한 모든 의사결정은 저장된 근거로 재현 가능해야 한다.

## 14. 권장 DB 모델

기존 economy snapshot/scenario/policy 테이블을 재사용하고 다음을 추가한다.

- `economy_ai_controller_runs`
- `economy_ai_policy_registry`
- `economy_ai_policy_candidates`
- `economy_ai_decisions`
- `economy_ai_rollouts`
- `economy_ai_observations`
- `economy_ai_model_registry`
- `economy_ai_guardrail_violations`
- `economy_ai_rollback_events`
- `economy_ai_feature_snapshots`

decision/audit/rollback 근거는 가능한 append-only로 유지한다.

## 15. API 계약

권장 관리자 API:

- `GET /admin/economy/controller/status`
- `GET /admin/economy/controller/runs`
- `GET /admin/economy/controller/proposals`
- `POST /admin/economy/controller/proposals/:id/simulate`
- `POST /admin/economy/controller/proposals/:id/approve`
- `POST /admin/economy/controller/proposals/:id/reject`
- `POST /admin/economy/controller/pause`
- `POST /admin/economy/controller/resume`
- `POST /admin/economy/controller/rollback`
- `GET /admin/economy/controller/policies`
- `PUT /admin/economy/controller/policies/:key`

변경 API는 관리자 권한, 필요 시 최근 재인증/2차인증, 변경사유, idempotency key, optimistic policy version, 감사 metadata, rollback metadata가 필요하다.

## 16. 관리자 콘솔 UX

최소 화면:

- 현재 controller mode와 write enabled 상태
- 데이터 freshness/reconciliation 상태
- 경제 목표 지표판
- 시즌/이벤트 overlay가 있는 anomaly timeline
- 현재 정책값 vs 후보값
- 30/90/180일 예측
- guardrail pass/fail 사유
- confidence/uncertainty
- 승인/거절
- rollout/canary 상태
- pause/freeze
- 사유+재인증이 필요한 rollback
- model version, feature snapshot, evidence 연결
- immutable decision history

운영자가 입력 중일 때 관리자 화면이 자동 새로고침되어 입력내용을 잃으면 안 된다. 새 baseline이 들어오면 비파괴적인 “새 기준 데이터 사용 가능” 알림을 표시한다.

## 17. AI 조정 가능 소비처 metadata

AI 조정 대상 소비처에는 최소 다음을 둔다.

```text
auto_tunable
min_multiplier
max_multiplier
max_step_bps
cooldown_minutes
elasticity_estimate
elasticity_confidence
affordability_floor
prestige_only
p2w_class
ledger_transaction_type
analytics_event
value_flow_class        # hard_sink / transfer / converter / hold
target_wealth_band
season_availability
```

이 구조로 AI가 승인된 콘텐츠만 조정하고 transfer를 실제 burn으로 잘못 계산하지 않게 한다.

## 18. 동작 예시

### 18.1 익스플로잇 없는 인플레이션 압력

관측:

- 이벤트 보정 baseline 대비 최근 24h 발행량 +20%
- hard sink 거의 동일
- P99 잔액증가 가속
- 중앙값 구매력 안정
- 무결성 사고 없음

처리:

1. 24h/7d 및 시즌·이벤트 라벨로 신호 재확인
2. 기존 소비처 채택/발견성 조정부터 검토
3. 레지스트리 범위가 허용하면 예를 들어 선택형 고가 sink multiplier +2% 같은 작은 후보 생성
4. Scenario Lab에서 30/90/180일 검증
5. uncertainty 높으면 `RECOMMEND` 유지
6. `BOUNDED_AUTO` 허용 + 모든 guardrail 통과 시 versioned config 적용
7. 6h/24h 관찰 + 7일 회고
8. 지표 악화 시 config rollback

### 18.2 익스플로잇 기반 faucet 급등

관측:

- 갑작스러운 faucet 증가
- duplicate/replay 보상 악용 신호
- reconciliation 또는 integrity confidence 악화

처리:

- 경제 자동조정 정지
- 일반유저 가격을 올리지 않음
- abuse/security incident 경로로 전환
- reconciliation이 깨끗해지고 안전상태 기준을 통과한 뒤에만 재개

### 18.3 고자산층 소비처 고갈

관측:

- 중앙값 안정
- P95/P99가 여러 주 상승
- 고자산층 소비처 사용폭 감소
- 기존 고가 카탈로그 소진

처리:

- 승인된 명예 소비처의 노출/rotation 개선
- 범위 안에서 명예 가격곡선 조정
- 박물관/아카이브/랜드마크/HQ/도시 프로젝트 등 신규 콘텐츠를 사람에게 제안
- 잔액몰수나 보유량 하드캡으로 해결하지 않음

## 19. 모델 거버넌스

첫 구현은 다음 조합을 권장한다.

- 결정론적 회계/guardrail rule
- 통계·시계열 이상탐지
- scenario simulation
- 진단·설명·후보생성용 AI/LLM 계층

운영 경제에서 유저를 대상으로 바로 online reinforcement learning을 시작하면 안 된다. 역사데이터 replay/backtest -> Shadow -> 엄격히 제한된 정책 자동적용 순으로 확장한다.

최소 모델 metadata:

- model/provider/name/version
- feature schema version
- 해당되는 경우 training/evaluation 기간
- calibration/error metric
- 허용 policy class
- last validation date
- owner
- rollback/fallback model
- deprecation state

## 20. 2026-09-13 조사 기반 설계 근거

### Unity Remote Config / Game Overrides
환경별 설정, 조건/대상 기반 override, 일정, percentage rollout 패턴은 Test와 Production을 분리하고 라이브옵스 config를 단계적으로 배포하는 데 적합하다. Moneyverse는 경제 상수를 프론트에 하드코딩하기보다 환경별 버전 config와 되돌릴 수 있는 override 구조를 채택한다.

### Microsoft PlayFab Economy V2
idempotent transaction ID와 optimistic concurrency/ETag 방식은 재시도 중 중복변경과 stale write를 막는 참고 패턴이다. Moneyverse는 정책 적용/롤백에 멱등성과 optimistic version check를 적용한다.

### 시계열 이상탐지 시스템
현대적 이상탐지는 단순 임계값만이 아니라 이상여부와 probability 또는 예상범위를 함께 제공할 수 있다. Moneyverse도 confidence/uncertainty를 저장하고 결정론적 가드레일을 통과해야만 자동변경을 허용한다.

### EVE Online Monthly Economic Reporting
대규모 가상경제에는 이벤트와 계절성이 존재한다. Moneyverse는 단기 급등/급락을 구조적 문제로 단정하지 않고 여러 시간창과 시즌/이벤트 라벨을 함께 비교한다.

## 21. 구현 단계

### Phase 0 — 회계/데이터품질
reconciliation, feature snapshot, 시즌/이벤트 라벨, controller read model을 완성한다. 정책 write 없음.

### Phase 1 — `RECOMMEND`
versioned proposal과 사람이 이해할 수 있는 근거를 생성한다. 전부 사람 승인.

### Phase 2 — `SHADOW`
운영정책을 쓰지 않고 전체 controller loop를 실행해 예측오차, 오탐률, rollback 예상치를 측정한다.

### Phase 3 — 저위험 `BOUNDED_AUTO`
명시적으로 허용된 선택형 소비처/노출/비필수 서비스 parameter만 작은 변경범위에서 자동화한다. 자동정지/롤백 포함.

### Phase 4 — 통제된 allowlist 확대
과거증거상 오탐/롤백 위험이 낮다고 입증된 policy family만 확대한다. 고영향 경제정책은 사람 승인을 유지한다.

모든 런타임 단계는 별도 개발 브랜치에서 `@미니pc홍` 환경으로 구현하고, 분리된 `wdmv-test`에 배포하여 backend/DB/API/admin UI/rollback을 확인한 뒤에만 Production 승격 대상이 된다.

## 22. Controller 분석 및 KPI

최소 측정:

- mode별 controller run 수
- 추천 승인/거절률
- guardrail 거절률과 사유
- Shadow 예측 vs 실제 오차(기간별)
- 자동 apply 횟수
- rollback rate
- detect/recover 시간
- policy family cooldown 사용률
- model uncertainty/calibration
- 순발행 안정성
- hard-sink ratio
- 신규유저 구매가능성
- P95/P99 및 상위1% 집중도 추세
- 소비처 다양성/집중도
- 리텐션/세션 가드레일
- abuse/protection false-positive rate

인플레이션을 줄였다는 이유만으로 controller 성공으로 판단하지 않는다. 사용자 가치, 구매가능성, 리텐션, 공정성, 감사가능성도 함께 유지해야 한다.

## 23. 실패/QA 시나리오

자동 write를 활성화하기 전에 최소 다음을 검증한다.

1. stale metric -> 정책 write 없음
2. reconciliation mismatch -> freeze
3. duplicate apply -> 멱등/1회 결과
4. concurrent policy edit -> stale version 거부
5. model unavailable -> deterministic fallback/no write
6. season transition lock -> 설정된 policy family 차단
7. exploit label -> 일반유저 재가격 금지
8. uncertainty 초과 -> `RECOMMEND`만
9. step/drift/cooldown 위반 -> 후보 거부
10. 강제 rollback -> 이전 config 복구, ledger 무변경
11. 관리자 입력 중 -> 비파괴 새로고침
12. 무권한 mutation -> 거부 및 감사기록


## 25. 적대적 다중 에이전트 경제 위원회

Moneyverse는 하나의 거대한 경제 모델 대신 서로 독립 학습 또는 독립 적응된 전문 에이전트를 사용한다. 목적은 의도적인 불일치다. 각 에이전트는 서로 다른 관점에서 최적화하고 다른 에이전트의 가정을 공격해 운영 정책 적용 전에 숨은 실패를 찾는다.

### 25.1 필수 전문 에이전트

초기 역할은 다음을 포함한다.

- `MACRO_AGENT`: WLD 공급, 인플레이션, 구매력, 자산집중, 장기 안정성
- `PLAYER_WELFARE_AGENT`: 신규유저 구매력, 리텐션, 공정성, 회복경로
- `SINK_COMMERCE_AGENT`: 상점 수요, sink 사용, 가격탄력성, 카탈로그 공백, 상품수명주기
- `STOCK_FUNDAMENTAL_AGENT`: 가상기업 펀더멘털, 섹터 상태, 장기 가치 기준
- `STOCK_FLOW_AGENT`: 주문흐름, 유동성, 거래량, 단기 수급
- `STOCK_MOMENTUM_AGENT`: 모멘텀/반전과 변동성 국면
- `MARKET_INTEGRITY_AGENT`: 시세조작, wash/self-trading, 순환거래, stale market, 비정상 변동
- `BUSINESS_AGENT`: 사업 수익성, 유지비 부담, 재고/수요, 확장경제
- `CASINO_RISK_AGENT`: 게임 전용 카지노의 발행/소각·악용·집중위험. 실제 돈 도박 최적화는 금지
- `ABUSE_AGENT`: 파밍, 자동화, 다계정, exploit 왜곡
- `CAUSAL_AGENT`: 관측 변화가 정책 때문인지 이벤트/교란변수 때문인지 반박
- `RED_TEAM_AGENT`: 2차 효과, Goodhart식 KPI 악용, 최악조건 탐색
- `AUDITOR_AGENT`: 증거, 모델/버전, 재현성, policy registry 준수 확인
- `JUDGE_AGENT`: 불일치를 요약하고 허용 가능한 후보집합을 만들지만 결정론적 guardrail은 우회할 수 없음

가능하면 에이전트별 prompt, adapter/checkpoint, 학습데이터 slice, 평가 suite를 분리한다. 같은 prompt/context에 이름만 여러 개 붙이는 것은 독립 분석으로 인정하지 않는다.

### 25.2 토론 프로토콜

중요 의사결정은 최소 3단계를 거친다.

1. **독립 제안:** 다른 에이전트 답을 보지 않고 결론 작성
2. **적대적 비판:** 모든 제안에 반대 비판 1개 이상, 안전/무결성 비판 1개 이상
3. **반론·수정:** 원래 증거와 변경 delta를 남긴 채 추정치를 수정 가능

vote/disagreement matrix, 근거, 기각된 논리, 최종 rationale을 저장한다. 높은 불일치는 자동화를 줄이는 신호이지 단순 평균할 이유가 아니다.

`MODEL_DISAGREEMENT_HIGH`, 증거부족, 상관된 실패, 에이전트 담합 의심 시 `RECOMMEND` 또는 `SHADOW`만 허용한다.

### 25.3 개별 학습과 담합 방지

에이전트 레지스트리는 최소 다음을 기록한다.

```text
agent_id
role
base_model
adapter_or_checkpoint
training_dataset_version
feature_allowlist
tool_allowlist
objective_vector
forbidden_objectives
evaluation_suite_version
calibration_version
last_validation_at
artifact_hash
```

가능한 데이터는 시간 기준으로 분리해 leakage를 줄인다. 서로 토론하는 모든 에이전트를 동일 preference label로만 fine-tuning하지 않는다. 평가에는 상충 시나리오, 조작 시도, 오염 telemetry, regime shift, 미관측 카탈로그/시장 상태를 포함한다.

Production에서 어떤 에이전트도 다른 에이전트의 weight를 직접 수정할 수 없다. 학습과 모델 승격은 별도의 버전형 release 절차다.

## 26. 가상주식 자동 가격형성

주식시장은 자동으로 동작할 수 있지만 AI 에이전트가 임의의 절대 WDX 가격을 직접 쓰면 안 된다.

### 26.1 가격 위원회

종목/tick마다 주식 전문 에이전트들이 다음과 같은 제한형 component를 독립 추정한다.

- fundamental anchor return
- demand/order-flow pressure
- liquidity spread/impact
- momentum/reversal contribution
- sector/common-factor contribution
- event shock contribution
- volatility regime
- manipulation/integrity penalty
- uncertainty interval

결정론적 `StockPriceFormationEngine`이 버전형 공식과 hard bound 안에서 allowlist component만 결합한다. rounding, 정수정밀도, 최소/최대가격, tick당 최대수익률, volatility clamp, circuit breaker, stale-data 동작, idempotent tick identity는 이 엔진이 소유한다.

### 26.2 자동화 단계

- `SHADOW`: 권위 ticker 옆에서 가상 tick 계산
- `BOUNDED_AUTO`: 검증 후 agent component가 권위 결정론적 가격 엔진 입력으로 사용 가능
- `FREEZE`: 무결성/stale/reconciliation 문제 시 AI-derived component를 중지하고 안전 pause/fallback 계약 사용

자동시장 운영은 종목 freshness, replay 방어, 조작감시, 저장된 component 입력으로부터의 결정론적 재현, 전체 tick audit trail을 요구한다.

### 26.3 시장무결성 제한

다음은 금지한다.

- 특정 사용자 보유주식의 이익/손실을 만들기 위한 가격 설정
- 유료지출·광고·스폰서십·사용자 identity를 유리한 가격입력으로 사용
- private holdings를 본 뒤 특정 사용자/cohort에 불리하게 가격을 의도 이동
- circuit breaker/stale-market 제한 우회
- 과거 가격/ledger trade 사후 재작성

## 27. 상점 자동 가격조절

명시적으로 eligible한 SKU는 제한형 자동 가격최적화를 사용할 수 있다.

```text
auto_price_enabled
base_price
min_price
max_price
max_step_bps
max_drift_bps_7d
cooldown_minutes
minimum_sample_size
elasticity_estimate
elasticity_uncertainty
affordability_floor
protected_new_user
prestige_only
requires_human_approval
```

commerce, welfare, macro, causal, red-team agent가 중요한 가격변경을 토론하고 최종 범위는 deterministic validator가 결정한다. 필수 progression, starter item, 유료연계 혜택, 경쟁/P2W 민감 상품은 사람 승인 전용이다.

conversion, WLD burn, purchase days, retention, complaint rate, cohort affordability를 함께 평가한다. burn만 좋아지고 보호된 affordability/welfare 제약을 위반하는 가격인상은 거부한다.

## 28. 자동 상품 및 SKU 생성

Moneyverse는 콘텐츠와 경제행동이 모두 사전 승인된 템플릿 family에서 오는 경우 **저위험 카탈로그 변형**을 자동 생성·게시할 수 있다.

### 28.1 자동 게시 가능 예시

shadow 근거와 운영자 enable 이후 다음을 허용할 수 있다.

- cosmetic 색상/theme 변형
- profile frame/background 변형
- display case, 가구, 장식 변형
- 시즌 visual 변형
- power가 없는 collectible 변형
- vanity engraving/restoration service 변형
- 새 경제효과가 없는 prestige visual bundle

### 28.2 제안 전용 예시

다음은 사람 승인이 필수다.

- 신규 통화/환전규칙
- gameplay/reward multiplier
- 주식결과·rank·경쟁력·수입 compounding에 영향을 주는 상품
- 대출/credit/interest 상품
- 유료 random/chance mechanic
- 신규 sink family/transaction semantic
- 신규 real-money linkage
- 법적/compliance 분류가 불명확한 SKU

### 28.3 Product Factory

`CatalogGapAgent -> ProductDesignerAgent -> EconomyPricingAgent -> PlayerWelfareAgent -> RedTeamAgent -> Content/Schema Validator -> Scenario Lab -> Judge -> deterministic ProductPolicyGate -> Test -> limited rollout -> observe -> keep/rollback`

생성 상품마다 template ID, 생성 입력, 다국어 copy version, price policy version, asset reference, value-flow class, P2W 분류, target cohort, simulation 근거, rollout 결정, rollback 상태를 저장한다.

자동 상품은 존재하지 않는 asset을 발명해서는 안 된다. 이후 asset 생성 pipeline이 생겨도 생성 asset은 별도 artifact로 취급하며 저작권/콘텐츠/접근성 검증을 통과해야 catalog에 활성화할 수 있다.

## 29. 다중 에이전트 의사결정 정족수

제한형 자동화 후보가 되려면 다음을 모두 만족해야 한다.

- 필수 safety/integrity agent PASS
- deterministic guard PASS
- veto-class 제약 위반 없음
- calibration된 uncertainty가 threshold 이하
- model disagreement가 threshold 이하이거나 근거로 명시 해결
- Scenario Lab과 counterfactual 대안 평가 완료
- 저장된 snapshot/model artifact로 재현 가능
- 적용 전 rollback 실행 가능

judge agent는 hard constraint에 대한 tie-break 권한이 없다. safety veto는 더 많은 commerce agent 표로 뒤집을 수 없다.

## 30. 다중 에이전트 추가 QA

필수 테스트:

- agent 순서를 바꾼 동일 scenario로 anchoring/order effect 검사
- 고의로 잘못되거나 손상된 agent 1개 주입
- 같은 잘못된 가정을 공유하는 correlated-agent failure
- 조작된 shop-demand telemetry
- stock pump/dump와 wash-trading simulation
- 갑작스러운 liquidity 소멸/stale ticker
- Product Generator의 P2W 상품 생성 시도
- protected cohort 과금 과도화 시도
- judge가 존재하지 않는 policy key hallucination
- 자동 게시 SKU 이후 rollback
- 저장 run의 deterministic replay에서 같은 admissibility 결과 확인

에이전트가 서로 동의했다는 이유만으로 production-ready로 간주하지 않는다. 독립 증거 없는 합의는 상관위험 신호다.

## 24. Definition of Done

이 기획 단위는 다음을 만족하면 완료다.

- 영문 기준본과 한국어 대응본 존재
- 운영모드와 안전경계 명시
- AI가 잔액·인벤토리·원장 직접변경 불가
- 다중시간창/시즌 인식 탐지 필수화
- 결정론적 가드레일이 AI 출력보다 우선
- 무제한 기본/소비처 우선 정책 유지
- bounded-auto 기본값, fail-closed, rollback 의미 정의
- policy registry, DB, API, 관리자화면 계약 정의
- 모델 거버넌스, 분석, QA 시나리오 정의
- 런타임은 개발 브랜치 -> `wdmv-test` 검증 -> Production 순서 강제
- 과거 기획 baseline v2026.09.13.24는 이력으로 보존하고 실제 런타임 구현 단위는 자체 버전 changelog/worklog 증거 기록
- v2026.09.17.184에서 32절의 직업별 작업횟수 제한 호환 계층과 AI 고위험 검토 경로를 실제 구현

전체 controller는 계속 living specification이다. v2026.09.17.184는 실제 런타임 기능을 추가하지만 **문서나 로컬 테스트만으로 Production 활성화를 주장하지 않는다**. exact-SHA 격리 Test, 배포 증거, Production smoke가 반드시 필요하다.

## 31. 2026-09-16 연구 재평가

이번 재평가는 LLM 경제 에이전트를 단독 정책결정자로 두는 접근을 채택하지 않는다. EconGym, EconAgent, AI Economist, MALLES, Market-Bench, MMO 생성형 ABM, StockAgent/StockSim 계열, LLM 경제행동 검증 연구와 전통 ABM·인과추론·강건제어 문헌을 함께 근거로 삼는다.

### 31.1 최종 아키텍처 결정

Moneyverse 경제 AI의 중심은 `LLM`이 아니라 **데이터로 보정된 경제 디지털트윈**이다. 디지털트윈은 결정론적 회계/시장 규칙, econometric/causal 모델, 전통 ABM, 학습형 agent, 제한된 LLM agent를 ensemble로 사용한다. 어느 한 모델도 truth source가 아니다.

- LLM agent는 소비·저축·상점 선택·거래 의사결정의 행동 가설과 stress scenario 생성에 사용한다.
- RL/MARL은 simulator 안의 policy search 및 adversarial behavior 탐색에 사용한다.
- 실제 정책 효과는 A/B, switchback, interrupted time series, synthetic control/SDID 등 실측 인과추정으로 재검증한다.
- disagreement가 큰 경우 자동 집행을 금지한다.
- Judge LLM의 결론 자체는 집행 권한이 없으며 deterministic validator와 실험 evidence가 최종 gate다.

### 31.2 에이전트 학습 전략 수정

모든 역할을 처음부터 별도 foundation model로 학습하지 않는다. 공통 base model 위에 역할별 prompt/tool policy로 시작하고, Moneyverse 행동 로그가 충분해지면 역할별 SFT/LoRA adapter를 분리한다. 이후 offline RL 또는 preference optimization은 replayable simulator와 holdout 평가를 통과한 역할에만 적용한다. 에이전트 독립성은 단순 이름 차이가 아니라 서로 다른 데이터 split, adapter/checkpoint, objective, seed, tool/feature allowlist 중 둘 이상으로 확보한다.

### 31.3 적대적 토론의 제한

다중 에이전트 토론은 오류 탐지와 대안 생성 수단이지 정확성 보증이 아니다. shared-base correlation, majority cascade, persuasive-but-wrong judge, context dilution을 별도 QA한다. 토론 결과가 독립 deterministic/econometric baseline보다 나쁘면 자동으로 baseline을 우선한다.

### 31.4 주가·상점가격·상품 자동화 재확정

- **가상주식:** LLM이 가격을 직접 쓰지 않는다. 주문장/수급/펀더멘털/이벤트 입력을 deterministic price-formation engine이 결합하고, LLM agent는 scenario와 behavioral flow를 제공한다. circuit breaker, tick bounds, stale-market lock이 우선한다.
- **상점가격:** 승인된 SKU의 좁은 min/max/step/cooldown 안에서만 자동 조정한다. 가격탄력성은 실제 실험으로 갱신하고, 신규유저 affordability·retention·불만·sink diversity가 악화되면 자동 rollback한다.
- **상품추가:** cosmetic/non-power 승인 템플릿은 생성→lint→simulation→Test→limited rollout→rollback-ready 절차를 통과하면 bounded auto-publish를 허용할 수 있다. 신규 경제 메커니즘, earning multiplier, P2W, currency/conversion, loan/interest, paid random chance는 human approval을 유지한다.

### 31.5 레퍼런스 검증 상태

`EconGym`, `MALLES`, `EconAgent`, `AI Economist`, `Generative Agents`, MMO generative ABM, `Market-Bench`, `StockAgent`, `StockSim`, `Tokenomics-AI/Tokenomics`는 확인된 연구/공개 프로젝트로 분류한다. `EconGrowthAgent (ICLR 2024)`라는 정확한 명칭은 이번 검증에서 신뢰할 수 있는 원문을 확인하지 못했으므로 근거 목록에서 제외한다. Tokenomics-AI는 경제모델이 아니라 inference cost/routing 참고 구현으로만 취급한다.

## 32. 직업·일일 제한 적응형 컨트롤러

직업/숙련도 정책도 동일한 다중 모델 경제 제어 루프에 포함한다. 제한값은 프론트 상수가 아니라 버전 관리되는 정책이다.

자동조절 후보 정책 키는 다음을 포함한다.

- `jobs.primary_profession_slots`: 동시에 주직업으로 지정할 수 있는 정체성 슬롯 수. 운영자가 승인한 범위 안에서만 바꿀 수 있으며 기존 사용자의 주직업을 몰래 교체·강등하지 않는다.
- `jobs.concurrent_active_professions`: 동시에 성장시킬 수 있는 활성 직업 수.
- `jobs.assignment_daily_limit`: 일반 작업 완료 횟수의 목표 의미 정책. 장기 기본값은 `null = 무제한`이지만 현재 P0 런타임은 작업별 유한 `work_task_catalog.daily_limit`를 강제한다.
- `jobs.assignment_daily_limit_delta.<profession>`: **v2026.09.17.184에서 구현된 호환 계층**. 8개 허용 직업에 대해 캡처된 작업별 참조 기준값에 정수 delta를 더하며 범위는 `[-1,+2]`, 한 정책 주기 최대 변화는 1이다. 모델이 임의 키를 만드는 것이 아니라 이 등록된 키 family만 현재 작업횟수 bounded-auto 권한을 가진다.
- `jobs.rewarded_assignment_daily_limit`: 별도 보상정책 전까지 정상 WLD 보상을 받을 수 있는 작업 수의 계획된 의미 정책. 목표 기본값은 `null = 무제한`이며 v184에서는 구현하지 않는다.
- `jobs.daily_wld_budget_per_cohort`: 선택적 cohort/시스템 발행 보호 예산. 개인별 숨은 몰수 규칙으로 사용하지 않는다.
- `jobs.repeat_reward_floor_multiplier`, `jobs.repeat_curve_k` 등 반복 보상 체감 정책.
- 정책 레지스트리에 명시적으로 등록된 직업별 동시성·보상·정산·보호 제한 키.

우선순위는 악용/데이터오류 탐지 -> 반복 보상과 작업 구성 조정 -> 선택적 sink/reward 조정 -> 직업 수요 재균형 -> 마지막으로 한시적 유한 일일 보호 제한 검토 순서다. 더 부드러운 조절수단이 가능한데 단순 인플레이션만을 이유로 플레이 hard cap을 만들면 안 된다.

**v184 런타임 계약.** 호환 컨트롤러는 기존 7일 직업선택 telemetry를 읽는다. assignment가 최소 40건일 때 점유율 3% 미만 직업은 `+1` 완화할 수 있고, 60% 초과 직업은 작업 발행비중 50% 초과와 `work.repeat_decay_percent >= 25`를 모두 만족해야 `-1` 강화할 수 있어 반복보상 완화책이 먼저 적용된다. 편중이 해소되거나 근거량이 낮아지면 non-zero delta는 기준 `0` 쪽으로 한 단계 복원한다. 기존 표본충분성·원장대사·정책 cooldown·feature switch·동일 proposal AI 검토·rollback gate가 최종 권한이다.

non-null 일일 제한이 `BOUNDED_AUTO`에 들어가려면 정책 레지스트리가 auto-tunable로 허용하고 다중 시간창 근거, 최소 표본, 시나리오/반사실 비교, 구매력·성장성 검증, 무결성 검토, 공개 가능한 reason code, 최대 지속기간, 자동 완화 시험, 롤백 준비를 모두 통과해야 한다. 컨트롤러는 강화뿐 아니라 완화도 평가하며 조건이 해소되면 오래된 제한을 유지하지 않고 `null = 무제한` 방향으로 자동 완화한다.

주직업 슬롯은 정체성에 영향을 준다. 자동화는 슬롯 확대 또는 미래 정책 축소 제안은 가능하지만 기존 선택 직업 박탈, 숙련도 삭제, 임의 재배정, 이미 획득한 성장 접근 차단은 할 수 없다. 넓은 슬롯 정책에서 좁은 정책으로 이동할 때는 grandfathering 또는 사람 승인 transition rule이 필요하다.

필수 telemetry는 직업별 활성 사용자, 완료/보상 발행량, 반복 집중도, 일일 완료 median/P95, 숙련 성장, 전환율, 포기율, 봇/악용 confidence, 신규 사용자 성장시간, 직업 과부족, 제한 도달/완화율을 포함한다. 모든 제한 결정은 전후 값, 영향 인구, 근거 시간창, 모델 불일치, 사유, 만료/재평가 시각, 롤백 기준을 기록한다.

## 33. 전통 + AI 이중 연속 제어 — v2026.09.16.139

Moneyverse는 동일한 불변 경제 snapshot을 보는 두 개의 독립 감사가능 제어 lane을 병렬 운영한다. 목표는 기존 경제방법을 AI로 대체하는 것이 아니라 결정론/전통 기준선을 항상 살려 두고 학습시스템이 더 넓은 행동·정책 공간을 탐색하게 하는 것이다.

### 33.1 Lane A — 전통/결정론 기준선

권위 회계 항등식, 원장 대사, rule-based ABM, 계량/탄력성 모델, 인과추론, 결정론 시장 매칭·주가형성, 공개 정책식, 필요한 경우 제약 optimization/MPC, hard safety/integrity 범위를 포함한다. 모든 학습모델이 unavailable/stale/quarantine 상태여도 Lane A는 비상 fallback으로 계속 운영 가능해야 한다.

### 33.2 Lane B — AI/학습 탐색

LLM 행동 에이전트, 근거가 충분할 때 역할별 SFT/LoRA adapter, 재현 가능한 simulator 안의 RL/MARL 정책탐색, 이상·원인 설명, 적대 stress agent, 반사실 정책생성, 수요가설, 상품/SKU 아이디어, 다중 에이전트 비판을 포함한다. 탐색범위를 넓히지만 원장 진실, 잔액 직접변경, 과거기록 수정, 주가 직접쓰기, hard constraint 권한은 갖지 않는다.

### 33.3 병렬 실행 계약

각 의사결정 cycle은 하나의 `economy_snapshot_id`를 저장하고 두 lane이 정확히 그 snapshot만 사용한다. 각 lane은 예측 horizon/outcome vector, 정책후보와 no-op, 보정된 불확실성/모델위험, 가정과 모델/feature version, 구매력·집중도·발행·리텐션·무결성 영향, rollback trigger/관찰기간을 출력한다.

### 33.4 자동 중재

- 안전 교집합 안에서 방향·크기가 일치하면 저위험 bounded action을 Scenario Lab/결정론 검증으로 보낸다.
- 방향은 같지만 크기차가 크면 보수적 안전 교집합 또는 더 낮은 위험 후보를 택한다.
- 방향이 크게 충돌하거나 model disagreement/불확실성이 높으면 `SHADOW`, `NO_OP`, 사람검토로 내린다.
- Lane B 장애/stale이면 Lane A만으로 계속 운영한다.
- Lane A가 새 행동을 모델링하지 못하고 Lane B가 탐지해도 AI는 shadow 가설까지만 만들며 실측 검증을 우회할 수 없다.
- 무결성·보안·회계 hard constraint는 두 lane과 judge 투표보다 우선한다.

### 33.5 연속 자동 루프

`telemetry -> 대사 -> 불변 snapshot -> Lane A || Lane B -> 불일치/calibration gate -> Scenario Lab -> 결정론 policy validator -> shadow/canary/bounded apply -> 인과효과 평가 -> keep/rollback -> 두 lane 재보정`

관측은 매시간 가능하지만 일반 경제 정책변경은 기존 cooldown/step 범위를 지킨다. exploit, stale market, ledger mismatch 같은 무결성 사고는 별도 빠른 결정론 containment 경로로 처리하며 AI 설명 때문에 차단이 지연되면 안 된다.

### 33.6 도메인 권한

원장/WLD는 회계·대사·atomic settlement가 결정론 권위이고 AI는 이상해석/시나리오만 만든다. WDX는 주문장·매칭·tick bound·주가형성·circuit breaker가 권위이고 AI는 trader behavior/event/manipulation stress를 만든다. 상점가격은 min/max/step/cooldown·탄력성 기준·구매력 floor가 권위이며 AI는 수요가설과 가격후보를 만든다. 상품은 schema/entitlement/economy class/P2W-abuse validator가 권위이고 AI는 승인 template variant를 제안한다. 직업/일일제한은 발행 envelope·무결성 threshold·grandfather/reset 규칙이 권위이고 AI는 행동분석과 bounded 후보를 만든다.

### 33.7 조사 근거

v2026.09.16.139 연구 회차에서 OpenAlex와 Crossref를 합쳐 중복 제거된 11,749건 후보군을 만들고 `docs/findings/`에 목록을 커밋한다. 이 목록은 발견용 색인이며 모든 원문 정독을 의미하지 않는다. 운영판단은 직접 관련 핵심 원문, 최신 Moneyverse 증거, 재현 가능한 테스트, 적용 후 인과효과 측정을 근거로 한다.
## 34. 분야별 2중 전문 AI 위원회 런타임 — v2026.09.16.141

AI lane은 `macro`, `shop`, `stock`, `jobs`, `welfare`, `integrity` 6개 분야와 분야별 A/B 두 좌석으로 구성한다. 각 좌석은 먼저 독립 판단하고 같은 분야의 상대 좌석 결과만 받아 반박/수정하는 2차 판단을 수행한다. 한 분야에서 A/B가 충돌하면 평균내지 않고 abstain한다. `integrity` 또는 `welfare` 두 좌석이 함께 veto하면 안전 중요 veto로 처리하며, 그 외에도 두 개 이상 분야가 pair-veto이면 전체 위원회가 veto한다. 최종 12개 좌석 증거는 append-only review에 저장한다.

각 분야/좌석은 서로 다른 OpenAI-compatible endpoint/model/adapter를 지정할 수 있다. 공통 기본값은 운영 편의일 뿐 독립 증거로 인정하지 않는다. 운영 독립성은 서로 다른 모델 계열, checkpoint/adapter, 학습 split, 목적함수 또는 tool/feature 정책 중 실질적 차이를 요구한다. AI 위원회가 비활성·불완전·장애·abstain 상태여도 기존 classical lane은 계속 동작한다.

로컬 AI 저장소는 앱 시스템 디스크와 분리하며 `/srv/moneyverse-data/ai/{models,adapters,cache,datasets,evals,logs}`를 기본 root로 사용한다. 12개 모델을 동시에 상주시킬 필요는 없고 로컬 추론은 제한된 동시성으로 실행한다.
