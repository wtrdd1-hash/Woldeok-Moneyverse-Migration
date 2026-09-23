# 월덕 머니버스 — 작업·직업 숙련도 기획 명세서

> 버전: v2026.09.23.399
> 상태: 구현 지향형 Living 제품 기획 명세
> 기준일: 2026-09-23
> 상위 문서: `PROJECT_PLAN.md`, `PRODUCT_GROWTH_PLAN.md`, `PRODUCT_DESIGN_SPEC.md`, `SEASON_SYSTEM_SPEC.md`, `DEFAULT_LIMIT_POLICY.md`, `ECONOMY_SINKS_SPEC.md`, `LIMIT_CONSISTENCY_IMPLEMENTATION_SPEC.md`, `BUSINESS_OPERATIONS_SUPPLY_CHAIN_SPEC.md`
> 영문 기준 문서: [JOBS_PROFESSION_MASTERY_SPEC.md](JOBS_PROFESSION_MASTERY_SPEC.md)

## 0. 목적

작업 기능을 단순 보상 버튼이 아니라 `직업 선택 → 과제 수락 → 수행/검증 → 정산 → 숙련도 성장 → 전문화 → 자격/꾸미기/명예 소비 → 더 다양한 작업 → 성과 복기`의 장기 성장 시스템으로 만든다. 일반 작업 수행 횟수와 숙련도 성장에는 임의 일일 하드캡을 두지 않는다.

WLD와 직업 보상은 서비스 내부 가상게임 데이터이며 실제 고용·임금·자격증·직업훈련·수익보장을 의미하지 않는다.

## 1. 핵심 원칙

1. 일반 작업 수락/완료, 숙련도 성장, 직업 전환, 장기 전문화는 기본 `null = unlimited`다.
2. 보상은 검증 가능한 작업상태를 통해 지급하며 단순 버튼 반복으로 지급하지 않는다.
3. 반복행동은 플레이 자체를 막지 않고 동일 저난도 작업의 한계 WLD 보상만 감소시킬 수 있다.
4. 직업레벨은 콘텐츠·선택·정체성 중심이며 무한 복리 WLD 배율을 만들지 않는다.
5. 자격심사·전문화 변경·유니폼·배지·작업공간·커리어 아카이브·명예관을 반복 소비처로 사용한다.
6. 가격·보상·난이도·검증·감소곡선은 서버 정책버전으로 관리한다.
7. 완료/보상/XP/재료변경은 원자적·멱등 정산으로 처리한다.

## 2. 초기 직업군

| 코드 | 직업 | 핵심 활동 | 초반 작업 | 상위 정체성 | 연계 |
|---|---|---|---|---|---|
| `COURIER` | 도시 배달원 | 경로 수행 | City Delivery | 물류 전문가 | 사업/물류 |
| `RETAIL` | 소매 운영원 | 주문/재고 | Shelf Restock | 매장 운영 리드 | 사업 |
| `TECH` | 디지털 기술자 | 진단/수리 | Device Check | 시스템 전문가 | 제작 |
| `CREATOR` | 미디어 크리에이터 | 브리프 작업 | Poster Brief | 크리에이티브 디렉터 | 커뮤니티/시즌 |
| `ANALYST` | 시장 분석가 | 학습/복기 | Watchlist Review | 리스크 분석가 | WDX/리플레이 |
| `CRAFT` | 공방 장인 | 제작/품질 | Basic Assembly | 마스터 장인 | 제작/거래소 |
| `FARM` | 도시 생산자 | 생산계획 | Seed Batch | 생산 전문가 | 사업/공급망 |
| `LOGISTICS` | 물류 운영자 | 배송계획 | Route Plan | 네트워크 플래너 | 사업/클럽 |
| `CIVIC` | 도시 코디네이터 | 공공과제 | Public Notice | 도시 스튜어드 | 도시 프로젝트 |

## 3. 작업 상태머신

`AVAILABLE -> ACCEPTED -> IN_PROGRESS -> SUBMITTED -> VERIFYING -> COMPLETED -> SETTLED`

예외: `ABANDONED`, `REJECTED`, `REVIEW_HOLD`.

정산은 한 번만 가능하며 클라이언트 타이머를 신뢰하지 않는다. 수락 시 정책버전을 저장하고, 재시도는 canonical 상태를 반환한다. 권장 정산키는 `job_settlement:{assignment_instance_id}:{user_id}:{policy_version}`이다.

## 4. 무제한 플레이와 한계보상

일반 작업 횟수 기본값은 무제한이다. 경제를 망가뜨리는 단일 저난도 작업 무한반복은 횟수를 막는 대신 다음과 같은 한계보상 곡선으로 제어한다.

`effective_wld = base_wld * max(floor_multiplier, 1 / sqrt(1 + repeat_index * k))`

튜닝 예시: `k=0.08`, WLD 최저 배율 `0.35`, 숙련 XP 최저 배율 `0.70`. 수집/업적 진척은 부정행위 신호가 없는 한 유지한다. 감소 적용 시 UI에 실제 정산액과 대체 작업을 명확히 보여준다.

## 5. 보상 모델

`gross_reward = base_reward * difficulty_factor * quality_factor * context_factor`

`net_reward = gross_reward * marginal_repeat_factor`

난이도 0.8~2.5, 품질 0.7~1.3, 정상 이벤트/상황계수 0.8~1.2, 반복계수 0.35~1.0을 튜닝 시작범위로 둔다. 영구 보너스를 무제한 곱연산하지 않는다.

## 6. 숙련도와 전문화

직업별 `mastery_xp`는 장기 누적값이며 일반 최종 레벨 하드캡을 두지 않는다. 표시레벨 예시는 `다음 레벨 XP = round(250 * level^1.35)`로 계산한다. 단계는 견습 → 숙련 → 프로 → 전문가 → 엑스퍼트 → 마스터 → 레거시로 묶어 표현할 수 있다.

전문화는 콘텐츠 선택을 넓히되 계정을 영구 잠그지 않는다. 재전문화 비용 예시는 `1,000 + 500 × 해금 전문노드 수` WLD이며 `HARD_SINK`다. 직접 WLD 배율을 구매하는 기능은 아니다.

## 7. 소비처

| 소비처 | 가격 예시 | 반복 | 분류 | 가치 |
|---|---:|---|---|---|
| 기본 자격심사 | 750 WLD | 직업별 | HARD_SINK | 작업군 해금 |
| 전문 자격시험 | 5,000 WLD | 전문화별 | HARD_SINK | 칭호/고급과제 |
| 마스터 포트폴리오 심사 | 25,000 WLD | 프레스티지 주기 | HARD_SINK | 기록/명예 |
| 재전문화 | 공식 | 반복 | HARD_SINK | 선택변경 |
| 유니폼 색상변경 | 500 WLD | 반복 | HARD_SINK | 외형 |
| 직업배지 각인 | 1,500 WLD | 반복 | HARD_SINK | 프로필 전시 |
| 작업공간 테마 | 4,000 WLD | 반복 | HARD_SINK | 공간 외형 |
| 커리어 아카이브 권 | 50,000 WLD | 반복 | HARD_SINK | 영구 기록 |
| 레거시 홀 윙 | `100,000×1.45^n` | 기본 무제한 | HARD_SINK | 전시공간 |
| 도시 직업 후원 | 250,000+ WLD | 반복 | HARD_SINK | 공개 명예기록 |

검증된 숙련요건은 돈으로 우회할 수 없다.

## 8. 경제 분류

시스템 작업보상은 `FAUCET`, 미래 유저 의뢰 원금은 `TRANSFER`, 플랫폼 의뢰수수료·자격·재전문화·꾸미기·아카이브 비용은 `HARD_SINK`, 재료 변환은 `CONVERTER`, 예약 보증금은 정산 전 `HOLD`로 구분한다.

## 9. 악용방지

불가능한 완료시간, 동일 결과 반복, 연계계정 의뢰순환, 변경된 payload의 idempotency 재사용, 비정상 burst, 단일 템플릿 집중, 클라이언트 타이머/점수 조작을 탐지한다. 보호조치는 상태전이 거부 → 중복 canonical 반환 → 영향 보상만 보류/감액 → 필요 시 특정 작업/계정 `REVIEW_HOLD` 순으로 적용하고 무관한 영구자산은 자동 몰수하지 않는다.

## 10. 연계

사업: 직업 숙련은 운영 선택지·분석UI를 열 수 있지만 무위험 수익배율은 금지한다.

제작/거래소: 직업 레시피 산출품은 기존 제작/거래소 원장 규칙을 따른다.

클럽: 동일 작업 반복은 일일 참여금지 대신 기여가중치 감소를 사용할 수 있다.

도시: Civic 작업은 비화폐 프로젝트 진행도를 줄 수 있고 WLD 기부는 별도 hard sink다.

WDX: Analyst 작업은 거래횟수/수익보다 저널·분산·복기를 보상한다.

## 11. 시즌

Season 1: 서로 다른 직업군 3개 경험, 기본 자격심사 1개, 커리어 저널, 비파워 직업 소비처 1회, 주간 수입/지출 복기.

Season 2: 제조/물류 작업, 사업 공급망 지원, 클럽 생산 캠페인, 전문화 1개, 물류 분석/리플레이.

시즌 종료 후 숙련도·자격·프레스티지·저널·코스메틱은 유지하고 시즌 전용 작업진척/랭킹만 아카이브·리셋한다.

## 12. UX

`/earn`은 추천 작업, 직업카드/현재랭크/다음해금, 작업브라우저, 진행중 작업, 숙련/전문화 지도, 자격심사, 커리어 아카이브, 반복계수 포함 실제 정산 설명을 제공한다. `loading`, `empty`, `prerequisite locked`, `protection throttled`, `review hold`, `idempotent replay`, `rejected`, `completed-unsettled`, `settled` 상태가 필요하다.

## 13. 데이터 모델

권장 테이블: `profession_definitions`, `job_templates`, `job_assignment_instances`, `profession_progress`, `profession_certifications`, `job_settlements`.

중요 제약: `job_settlements.assignment_instance_id UNIQUE`, 원장 `transaction_id UNIQUE`, `idempotency_key UNIQUE(user_id,idempotency_key)`, `(user_id,profession_code)` 숙련도 유일성.

## 14. API

P0: `GET /api/jobs/catalog`, `POST /api/jobs/{templateId}/accept`, `GET /api/jobs/assignments/{id}`, `POST .../submit`, `POST .../complete`, `GET /api/professions`, `GET /api/professions/{code}/progress`, 자격구매, 재전문화 API.

가치변경 API는 idempotency key가 필수이며 정책버전·canonical 상태·정확한 WLD/숙련도 정산결과를 반환한다.

## 15. 원장 transaction type

`FAUCET_JOB_REWARD`, `SINK_PROFESSION_CERTIFICATION`, `SINK_PROFESSION_RESPEC`, `SINK_PROFESSION_COSMETIC`, `SINK_PROFESSION_ARCHIVE`, `SINK_PROFESSION_PRESTIGE_SPACE`, 향후 `TRANSFER_JOB_COMMISSION`, `SINK_JOB_COMMISSION_FEE`.

## 16. 분석/관리자

발행량, 사용자/코호트별 일수익, P50/P90/P99 수익, 작업 템플릿 집중도, 직업 다양성, 반복계수 분포, 검증실패/보류율, 소비처별 소각량, job faucet 대비 sink 비율, P50/P90/P95/P99 유동자산, 상위 1%/10% 자산집중, 고자산 명예소비율을 본다.

관리자는 템플릿 활성화, 기본보상/XP, 난이도·품질계수, 한계보상곡선, 검증방식, 자격요건/가격, 소비처, 시즌태그, 보호임계값을 버전관리·미리보기·예약할 수 있다. 과거 정산은 정책변경으로 재작성하지 않는다.

## 17. 완료 조건

P0 완료에는 서버 권위 상태머신, 중복지급 방지, 일반 작업횟수 무제한, 반복계수 서버계산/표시, 시즌비리셋 숙련도, 5개 이상 완성 직업군, 자격/4종 이상 소비처, faucet/sink/transfer 대사, 감사가능 review-hold, 경제분석, 영문/한국어 UX parity, exact-SHA 격리 Test 검증이 필요하다.

이 문서는 계속 living 제품 명세다. 22절의 v184 호환 계층은 별도 개발 브랜치와 forward-only migration으로 구현됐으며, Production 전 exact-SHA 격리 Test 검증은 여전히 필수다.

## 22. AI 관리 직업·일일 보호 정책

직업 시스템은 Moneyverse Economy AI 정책 레지스트리에 참여한다. 장기 제품 목표는 무제한 기본 계약이지만, v184는 그 목표가 이미 구현된 것처럼 쓰지 않고 현재 서버가 강제하는 유한 `work_task_catalog.daily_limit` 계약과 명시적으로 정합시킨다.

`주직업`은 사용자 정체성 지정이며 AI가 회원의 직업 선택을 다시 쓰는 권한이 아니다. `primary_profession_slots`, `concurrent_active_professions`는 승인 범위 안에서 버전 관리·조정할 수 있지만 축소 시 기존 선택 직업을 밀어내거나 숙련도를 삭제할 수 없다. 더 좁은 미래 정책에는 grandfathering 또는 명시적 migration 승인이 필요하다.

일일 제어는 별도 정책이다. 목표 의미의 `assignment_daily_limit`, `rewarded_assignment_daily_limit`는 계속 `null = 무제한` 기본을 지향하지만 현재 런타임 호환 계약은 명확하다. 각 활성 작업에는 이미 유한 `daily_limit`이 있으며, v184는 8개 지원 직업에 대해서만 `jobs.assignment_daily_limit_delta.<profession>`를 등록한다. 각 작업의 캡처된 참조 기준 `baseline_daily_limit`에 `-1..+2` 정수 delta를 더하고 정책 주기당 최대 1만 움직인다. AI는 임의 직업 키를 만들거나 직업 정체성/숙련도를 수정하거나 기존 서버 reset/quota 계약을 우회할 수 없다. 향후 의미 정책을 실제 `null = 무제한`으로 전환하는 것은 별도 migration으로 설계해야 한다.

AI 위원회는 결정론적 검증 뒤에만 정책을 강화하거나 완화할 수 있다. 일반 인플레이션 압력에는 먼저 작업 구성, diminishing reward, sink/reward, 직업 수요 균형을 사용한다. 유한 일일 제한은 지속적 발행/무결성 위험에 쓰는 후순위 보호수단이지 기본 경제도구가 아니다.

자동 완화는 필수다. v184 호환 계층에서는 제한 강화 상태인 음수 delta가 직업 점유율 45% 이하, 작업 발행비중 50% 이하 또는 근거 작업량 40건 미만이면 기준 `0` 쪽으로 한 단계 복원된다. 부족 직업에 적용된 양수 delta도 점유율이 8% 이상으로 회복되면 `0` 쪽으로 돌아간다. 60% 초과 편중 직업의 제한 강화는 작업 발행비중 50% 초과와 `work.repeat_decay_percent >= 25`를 동시에 요구해 반복보상 완화책을 먼저 적용한다. 장기 의미 정책은 여전히 `expires_at`/`reevaluate_at`, 완화 step, 최대 지속기간, 무제한 복귀조건을 요구한다.

권장 정책 metadata:

```text
policy_key
profession_code | null
current_value | null
min_value | null
max_value | null
max_step
cooldown_minutes
reason_class
required_windows
min_observation_count
max_duration_minutes
reevaluate_at
auto_relax_step
return_to_unlimited_condition
grandfather_existing
requires_human_approval
version
config_hash
```

QA는 무제한 -> 유한 -> 완화 -> 무제한 전환, 자정/reset 경계, 게임 day clock 변경, 동시 완료, 중복정산, stale policy read, 서버 재시작, grandfathered 주직업, abuse shock 제한강화, false-positive 복구, exact-SHA Test 검증을 포함한다.


## 23. 보상 윈도우 대시보드 계약

직업 대시보드는 현재 배포된 호환 정책에 따라 일일/주간 **WLD 발행 윈도우**를 표시할 수 있지만, 이는 1·4·22절의 기본 무제한 참여 원칙을 덮어쓰지 않는다.

1. 대시보드는 정산 정책의 서버 read model이며 클라이언트 제한기가 아니다.
2. 일일·주간 사용량은 보상 정산과 동일한 권위 game-day/game-week key로 계산한다.
3. `day_ends_at`, `week_ends_at`이 canonical 초기화 경계다. 활성 게임 시계가 가속되었거나 다르면 클라이언트 문구에 UTC/현지 자정을 하드코딩하지 않는다.
4. 유한 `daily_cap`/`weekly_cap`에는 reward-policy 버전, 사유 분류, 재평가 metadata가 필요하다. 없으면 기획/런타임 gap으로 판정한다.
5. WLD 잔여 발행량이 0이 되어도 작업 이력이나 숙련도를 지우지 않는다. UI는 "WLD 보상 여유 소진"과 "작업 불가"를 구분한다.
6. 무제한 정책은 임의의 거대 숫자가 아니라 `null`로 표현하며, 클라이언트는 오해를 주는 퍼센트 바 없이 무제한으로 표시한다.
7. API 정합은 필수다. 웹/모바일은 같은 work-summary 계약과 서버 시계 의미를 사용한다.
8. 필수 요약 필드: `daily_paid`, `daily_cap|null`, `weekly_paid`, `weekly_cap|null`, `game_day_key`, `game_week_key`, `day_ends_at`, `week_ends_at`, `clock_policy_version`, `reward_policy_version`, 유한 한도 사유/재평가 metadata.

### 23.1 현재 대시보드 불일치 수용조건
화면 설명문, 일일 초기화 시각, 주간 초기화 시각, 정산 엔진이 동일한 활성 시계 정책을 설명해야 한다. 문구는 "자정/UTC 00:00"이라고 하면서 서버의 `day_ends_at` 또는 `week_ends_at`이 다른 상태는 P1 UX/계약 결함이다. Production 수용 전 exact-SHA에서 다음을 증명한다.
- DB 정산·backend API·UI의 일일/주간 경계 정합
- reset 전후 중복 보상 0
- 재시작/배포 뒤 로그인 유지 상태에서 올바른 표시
- 영/한 문구 정합
- 데스크톱/모바일 반응형에서 남은 금액·초기화 문맥 잘림 없음


## 24. 시간 기반 직업 보상·인플레이션 제어 모델

> 일반 유료 작업이 의미 있는 실제 경과시간 없이 즉시 정산돼도 된다는 해석을 이 절이 대체한다.

### 24.1 핵심 경제 규칙
WLD를 지급하는 직업은 서버 권위의 **시간 기반 과제**다. 화폐 발행량은 버튼 클릭 횟수가 아니라 검증된 실제 경과 작업시간과 작업 가치에 연결한다.

기획 공식:

`net_wld = 시간당 발행 밴드 × 인정 작업분/60 × 난이도 × 품질 × 수요 × 반복계수`

모든 계수에는 상·하한을 둔다. 수락 시 예상 보상을 범위 또는 확정값으로 고지하고 정산 때 서버가 다시 검증한다.

### 24.2 작업시간 구간
초기 튜닝 범위이며 시뮬레이션/실측으로 조정한다.
- 초단기 작업: 실제 3–5분
- 일반 작업: 실제 10–20분
- 고급 작업: 실제 30–60분
- 프로젝트 작업: 실제 2–8시간, 비동기/오프라인 경과 허용 가능

최소 작업시간은 수락 시 서버에 저장한다. 클라이언트 타이머는 표시용이며 서버 시간이 권위다. 로컬 시계 조작으로 완료를 앞당길 수 없다.

### 24.3 WLD 지급 작업 슬롯 1개
계정당 일반 시스템 지급형 WLD 작업 슬롯은 기본 1개다. 유료 작업 진행 중에도 탐색·준비·채팅·거래·제작·학습·비WLD 성장 활동은 가능하지만, 시스템이 돈을 찍어내는 작업을 여러 개 동시에 쌓을 수는 없다.

이는 일일 플레이 금지가 아니라 **발행 동시성 불변조건**이다. 지속 참여는 허용하면서 실제 시간당 최대 화폐 생성량을 제한한다.

### 24.4 즉시 반복 발행 금지
- 같은 템플릿을 즉시 수락→완료 반복해 돈을 찍는 루프를 금지한다.
- 완료에는 실제 경과시간 + 작업별 결정론적/서버 검증 상태가 필요하다.
- 동일 저난도 반복은 WLD `repeat_factor`를 단계적으로 낮추되 숙련도/수집 진척은 더 높은 하한을 유지할 수 있다.
- 경제적으로 같은 행동이면 직업을 바꿔 반복 이력을 초기화할 수 없게 한다.

### 24.5 임의 자산상한 대신 발행예산 관리
Economy Controller는 개인 보유자산 상한을 두는 대신 실측 경제건전성으로 전체 직업 WLD 발행을 조정한다.

필수 지표:
- DAU 및 실제 활동시간당 job WLD faucet;
- 전체 faucet / hard-sink 비율;
- 순 화폐공급 변화;
- 보유 WLD P50/P90/P99;
- currency-on-hand 일수;
- 화폐 유통속도;
- 거래시장이 있으면 시장 바스켓/CPI 유사 가격지수;
- 상위 1%/10% 자산집중도;
- 봇/자동화 집중도와 단일 작업 집중도.

조정 우선순위:
1. 직업 수요·과제 구성 조정
2. 반복감소 조정
3. sink 가격/종류 조정
4. 제한된 범위 안의 시간당 발행 밴드 조정
5. 실제 경제/무결성 위험이 입증될 때만 임시 유한 보호 윈도우

모든 변경은 버전·감사·롤백 가능해야 하며 민감속성이나 숨은 지불의사를 사용한 개인화는 금지한다.

### 24.6 초기 캘리브레이션
영구 WLD/시간 값을 감으로 정하지 않는다. Production 전 실제 sink 가격과 현재 지갑분포를 넣어 경제 시뮬레이션한다.

Test 시뮬레이션용 시작값:
- 일반 작업: 검증된 실제 1시간당 300–600 WLD
- 고급/고품질 작업: 기준 밴드의 최대 1.5배
- 저난도 반복 WLD 하한: 기준 시간당 보상의 25–40%
- 숙련 XP 하한: 70–100% 유지 가능

이는 운영 고정값이 아니다. 7/30/90일 faucet/sink 균형과 지갑 성장곡선이 승인 범위에 들어와야 한다.

### 24.7 Sink 구조
시간제어만으로는 부족하므로 코어 플레이를 괴롭히지 않는 반복형 hard sink를 함께 둔다.
- 자격심사/재전문화
- 제작/서비스 수수료
- 마켓 거래수수료
- 부동산/사업 유지비
- 코스메틱/작업공간 꾸미기
- 프레스티지/아카이브/기부
- 검증을 우회하거나 pay-to-win을 만들지 않는 선택형 편의

유저 간 원금 이동은 sink가 아니다. 실제 화폐공급을 줄이는 것은 수수료/소각분뿐이다.

### 24.8 UX 계약
작업 수락 전에 다음을 표시한다.
- 예상 작업시간
- 예상 WLD 범위/확정액
- 필요한 경우 시간당 WLD 환산값
- 난이도/품질/반복계수
- 오프라인 경과시간 인정 여부
- 서버 기준 가장 빠른 완료 가능 시각

진행 중에는 서버 권위 잔여시간을 표시한다. 시간이 끝나도 필요한 검증/수령 단계는 수행한다. 새로고침·로컬 시계 변경·클라이언트 조작으로 건너뛸 수 있는 가짜 타이머를 만들지 않는다.

### 24.9 QA·악용방지
필수 검증:
- 수락 직후 완료 시도 = 거절/0 WLD
- 로컬 시계 앞/뒤 조작 = 영향 없음
- 서버 재시작/배포 = 타이머 연속성 유지
- 여러 기기/동시 완료 = 1회 정산
- 멱등 재시도 = 동일 canonical 결과
- WLD 지급 슬롯 1개 원자적 강제
- 시간 경계 -1초/정각/+1초
- 로그아웃/기기/직업전환 후 반복계수 연속성
- 오프라인 프로젝트 완료
- Economy Controller 정책 버전 전환
- 원장 대사 및 중복 faucet 0

### 24.10 성공 기준
정상 유저는 의미 있는 성장을 체감하되 즉시 화폐가 넘쳐나지 않아야 한다. 동시에 7/30/90일 화폐공급 증가율, sink 커버리지, 시장가격, 자산집중도가 승인 범위에 있어야 한다. 일일 cap에 걸리기 전까지 빠른 버튼 반복으로 부자가 되는 구조라면 실패로 판정한다.
