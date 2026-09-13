# 월덕 머니버스 — AI 경제 컨트롤러 명세

> 버전: v2026.09.13.24
> 상태: Living 구현 지향 기획 명세
> 날짜: 2026-09-13
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
- changelog/worklog에 v2026.09.13.24 기록

이번 변경은 문서 전용 기획 변경이며 이것만으로 운영 자동조정 기능이 활성화되지는 않는다.